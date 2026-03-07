import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import dotenv from "dotenv";

dotenv.config();

/**
 * FR: Configuration commune pour LocalStack.
 */
const region = process.env.AWS_REGION || "us-east-1";
const endpoint = process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566";

const config = {
  region,
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
};

export const s3 = new S3Client({
  ...config,
  forcePathStyle: true, // FR: nécessaire pour LocalStack 
});

const ddbClient = new DynamoDBClient(config);
export const ddb = DynamoDBDocumentClient.from(ddbClient);

export const sqs = new SQSClient(config);

export const RESOURCE = {
  region,
  endpoint,
  bucket: process.env.S3_BUCKET || "lostfound-images",
  table: process.env.DDB_TABLE || "Annonces",
  queueName: process.env.SQS_QUEUE_NAME || "annonce-events",
  usersTable: process.env.USERS_TABLE || "Users",
};