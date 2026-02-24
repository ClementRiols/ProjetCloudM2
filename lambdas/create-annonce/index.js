import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { randomUUID } from "crypto";

//Util host.docker.internal si ds docker pour que la lambda voie localStack
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
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Body JSON invalide" }),
    };
  }

  const annonceId = randomUUID();
  const createdAt = new Date().toISOString();

  try {
    //stockage complet dans DynamoDB
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

    //notif SQS
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
        message: "Annonce créée",
        id: annonceId,
      }),
    };
  } catch (err) {
    console.error("Erreur Lambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Impossible de créer l'annonce" }),
    };
  }
};