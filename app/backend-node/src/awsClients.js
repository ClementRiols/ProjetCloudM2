import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import dotenv from "dotenv";

dotenv.config();

const config = {
  region: process.env.AWS_REGION,
  endpoint: process.env.LOCALSTACK_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

export const s3 = new S3Client({
  ...config,
  forcePathStyle: true,
});

const ddbClient = new DynamoDBClient(config);
export const ddb = DynamoDBDocumentClient.from(ddbClient);

export const sqs = new SQSClient(config);
