import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

/**
 * FR: Client Lambda vers LocalStack.
 * CN: 指向 LocalStack 的 Lambda 客户端。
 */
const lambdaClient = new LambdaClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566",
  region: process.env.AWS_REGION || "us-east-1",
});

export const createAnnonce = async (annonce) => {
  /**
   * FR: On simule un event API Gateway: { body: "..." }
   * CN: 模拟 API Gateway 的 event 结构：{ body: "..." }
   */
  const payload = { body: JSON.stringify(annonce) };

  const command = new InvokeCommand({
    FunctionName: "create-annonce",
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  const response = await lambdaClient.send(command);
  const data = JSON.parse(Buffer.from(response.Payload).toString());
  return data;
};