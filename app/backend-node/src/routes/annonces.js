import express from "express";
import { createAnnonce } from "../services/lambda.js";
import { ddb } from "../awsClients.js";
import pkg from "@aws-sdk/lib-dynamodb";  
const { ScanCommand, UpdateCommand } = pkg;

const router = express.Router();

/* POST /annonces */
router.post("/", async (req, res) => {
  const { title, description, location, type, eventDate, imageKey } = req.body;

  if (!title || !type) return res.status(400).json({ error: "Title et type requis" });

  try {
    const result = await createAnnonce({ title, description, location, type, eventDate, imageKey });
    
    // Sécurité si Lambda échoue
    const status = result?.statusCode || 500;
    const body = result?.body ? JSON.parse(result.body) : { error: "Erreur Lambda" };

    res.status(status).json(body);

  } catch (err) {
    console.error("Erreur POST /annonces:", err);
    res.status(500).json({ error: "Erreur lors de la création de l'annonce" });
  }
});

/* GET /annonces */
router.get("/", async (req, res) => {
  try {
    const command = new ScanCommand({ TableName: "Annonces" });
    const data = await ddb.send(command);
    res.json(data.Items);
  } catch (err) {
    console.error("Erreur GET /annonces:", err);
    res.status(500).json({ error: "Échec de la récupération des annonces" });
  }
});

/* PATCH /annonces/:id/resolve */
router.patch("/:id/resolve", async (req, res) => {
  const annonceId = req.params.id;

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: "Annonces",
        Key: {
          pk: `ANNONCE#${annonceId}`,
          sk: "META",
        },
        UpdateExpression: "SET #s = :status",
        ExpressionAttributeNames: {
          "#s": "status",
        },
        ExpressionAttributeValues: {
          ":status": "RESOLVED",
        },
      })
    );

    res.json({ message: "Annonce résolue" });
  } catch (err) {
    console.error("ERREUR PATCH /annonces/:id/resolve:", err);
    res.status(500).json({ error: "Impossible de clôturer l'annonce" });
  }
});

export default router;