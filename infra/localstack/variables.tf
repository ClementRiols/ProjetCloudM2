variable "region" {
  description = "AWS region used by LocalStack"
  type        = string
  default     = "us-east-1"
}

variable "localstack_endpoint" {
  description = "LocalStack edge endpoint"
  type        = string
  default     = "http://localhost:4566"
}

variable "bucket_name" {
  description = "S3 bucket name for images"
  type        = string
  default     = "lostfound-images"
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for annonces"
  type        = string
  default     = "Annonces"
}

variable "sqs_queue_name" {
  description = "SQS queue name for annonce events"
  type        = string
  default     = "annonce-events"
}

variable "cors_allowed_origins" {
  description = "Allowed origins for S3 CORS"
  type        = list(string)
  default     = ["http://localhost:3000", "http://localhost:3001"]
}