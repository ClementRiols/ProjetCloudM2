import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

/**
 * FR: Dans LocalStack, la Lambda tourne dans un conteneur.
 *     "host.docker.internal" permet d'accéder à LocalStack sur la machine hôte.
 * CN: LocalStack 的 Lambda 在容器里跑，用 host.docker.internal 访问宿主机的 4566。
 */
const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || "http://host.docker.internal:4566";

const clientDynamo = new DynamoDBClient({
  endpoint: LOCALSTACK_ENDPOINT,
  region: "us-east-1",
});

const clientSQS = new SQSClient({
  endpoint: LOCALSTACK_ENDPOINT,
  region: "us-east-1",
});

export const handler = async (event) => {
  console.log("EVENT:", event);

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON invalide dans le body." }),
    };
  }

  /**
   * FR: On exige annonceId venant du frontend pour garder la cohérence (imageKey / pk).
   * CN: 强制使用前端传来的 annonceId，确保图片 key 和 pk 对齐。
   */
  const annonceId = body.annonceId;
  if (!annonceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "annonceId est requis." }),
    };
  }

  if (!body.title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Le titre est requis." }),
    };
  }

  const createdAt = new Date().toISOString();

  try {
    await clientDynamo.send(
      new PutItemCommand({
        TableName: "Annonces",
        Item: {
          pk: { S: `ANNONCE#${annonceId}` },
          sk: { S: "META" },
          title: { S: body.title || "" },
          description: { S: body.description || "" },
          location: { S: body.location || "" },
          type: { S: body.type || "PERDU" },
          eventDate: { S: body.eventDate || "" },
          imageKey: { S: body.imageKey || "" },
          status: { S: "OPEN" },
          createdAt: { S: createdAt },
        },
      })
    );

    await clientSQS.send(
      new SendMessageCommand({
        QueueUrl: `${LOCALSTACK_ENDPOINT}/000000000000/annonce-events`,
        MessageBody: JSON.stringify({
          eventType: "ANNONCE_CREATED",
          annonceId,
          createdAt,
        }),
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Annonce créée.",
        id: annonceId,
      }),
    };
  } catch (err) {
    console.error("Erreur Lambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Impossible de créer l'annonce." }),
    };
  }
};