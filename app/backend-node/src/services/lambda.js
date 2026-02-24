import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566",
  region: "us-east-1",
});

export const createAnnonce = async (annonce) => {
  // annonce = { title, description, location, type, eventDate, imageKey }
  const payload = { body: JSON.stringify(annonce) };

  const command = new InvokeCommand({
    FunctionName: "create-annonce",
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  const response = await lambdaClient.send(command);
  const data = JSON.parse(Buffer.from(response.Payload).toString());
  return data;
};