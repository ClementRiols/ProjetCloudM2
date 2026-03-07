import express from "express";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { GetQueueUrlCommand } from "@aws-sdk/client-sqs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ddb, s3, sqs, RESOURCE } from "../awsClients.js";
import { createAnnonce } from "../services/lambda.js";

const router = express.Router();

/**
 * FR: GET /annonces -> liste toutes les annonces (scan DynamoDB)
 */
router.get("/", async (_req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: RESOURCE.table }));
    // FR: On retourne un tableau JSON simple. 
    res.json(data.Items || []);
  } catch (err) {
    console.error("ERREUR GET /annonces:", err);
    res.status(500).json({ error: "Échec de la récupération des annonces." });
  }
});

/**
 * FR: GET /annonces/:id/image/upload-url
 *     -> génère une URL pré-signée pour uploader une image dans S3.
 */
router.get("/:id/image/upload-url", async (req, res) => {
  const annonceId = req.params.id;

  try {
    const key = `annonces/${annonceId}/cover.jpg`;

    const command = new PutObjectCommand({
      Bucket: RESOURCE.bucket,
      Key: key,
      ContentType: "image/jpeg", // FR: simple 
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // FR: On renvoie aussi la clé S3 pour l'enregistrer dans DynamoDB.
    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("ERREUR GET upload-url:", err);
    res.status(500).json({ error: "Impossible de générer l'URL d'upload." });
  }
});

/**
 * FR: POST /annonces -> crée une annonce via Lambda.
 */
router.post("/", async (req, res) => {
  const { annonceId, title, description, location, type, eventDate, imageKey, mail, tel, ownerEmail } = req.body;

  // FR: Validation minimale 
  if (!annonceId) return res.status(400).json({ error: "annonceId est requis." });
  if (!title) return res.status(400).json({ error: "Le titre est requis." });
  if (!type) return res.status(400).json({ error: "Le type est requis." });
  if (!mail) return res.status(400).json({ error: "L'email est requis." });
  if (!tel) return res.status(400).json({ error: "Le téléphone est requis." });

  try {
    // FR: Appel Lambda
    const result = await createAnnonce({
      annonceId,
      title,
      description,
      location,
      type,
      eventDate,
      imageKey,
      mail,
      tel,
      ownerEmail,
    });

    const status = result?.statusCode || 500;
    const body = result?.body ? JSON.parse(result.body) : { error: "Erreur Lambda." };

    res.status(status).json(body);
  } catch (err) {
    console.error("ERREUR POST /annonces:", err);
    res.status(500).json({ error: "Impossible de créer l'annonce." });
  }
});

/**
 * FR: PATCH /annonces/:id/resolve -> clôture une annonce (status=RESOLVED)
 */
router.patch("/:id/resolve", async (req, res) => {
  const annonceId = req.params.id;

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: RESOURCE.table,
        Key: { pk: `ANNONCE#${annonceId}`, sk: "META" },
        UpdateExpression: "SET #s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": "RESOLVED" },
      })
    );

    res.json({ message: "Annonce clôturée." });
  } catch (err) {
    console.error("ERREUR PATCH resolve:", err);
    res.status(500).json({ error: "Impossible de clôturer l'annonce." });
  }
});

export default router;