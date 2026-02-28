#!/bin/sh
set -e

# FR: Script d'initialisation LocalStack (S3/DynamoDB/SQS + CORS).
# CN: LocalStack 初始化脚本（创建 S3/DynamoDB/SQS + 配置 CORS）。

AWS="aws --endpoint-url=http://localstack:4566 --region us-east-1"

echo "==> Attente de LocalStack..."
# FR: On attend que LocalStack réponde.
# CN: 等 LocalStack 可用。
until $AWS s3api list-buckets >/dev/null 2>&1; do
  sleep 2
done
echo "==> LocalStack OK"

# -------------------
# S3 Bucket
# -------------------
BUCKET="lostfound-images"

echo "==> Création bucket S3: $BUCKET (si absent)"
# FR: create-bucket renvoie une erreur si existe déjà; on ignore.
# CN: 已存在会报错，忽略即可。
$AWS s3api create-bucket --bucket "$BUCKET" >/dev/null 2>&1 || true

echo "==> Configuration CORS bucket S3"
cat > /tmp/cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3001", "http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

$AWS s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration file:///tmp/cors.json

# -------------------
# DynamoDB Table
# -------------------
TABLE="Annonces"
echo "==> Création table DynamoDB: $TABLE (si absente)"

$AWS dynamodb create-table \
  --table-name "$TABLE" \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
  >/dev/null 2>&1 || true

# -------------------
# SQS Queue
# -------------------
QUEUE="annonce-events"
echo "==> Création queue SQS: $QUEUE (si absente)"
$AWS sqs create-queue --queue-name "$QUEUE" >/dev/null 2>&1 || true

echo "==> Init terminé!"