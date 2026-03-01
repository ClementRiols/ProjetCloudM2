terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = "test"
  secret_key = "test"

  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  skip_region_validation      = true

  endpoints {
  s3       = "http://localhost:4566"
  dynamodb = "http://localhost:4566"
  sqs      = "http://localhost:4566"
  lambda   = "http://localhost:4566"
  iam      = "http://localhost:4566"
  sts      = "http://localhost:4566"
  } 
}

resource "aws_s3_bucket" "lostfound_images" {
  bucket = "lostfound-images"
}

resource "aws_s3_bucket_cors_configuration" "lostfound_images_cors" {
  bucket = aws_s3_bucket.lostfound_images.id

  cors_rule {
    allowed_origins = ["http://localhost:3000", "http://localhost:3001"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_dynamodb_table" "annonces" {
  name         = "Annonces"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }
}

resource "aws_sqs_queue" "annonce_events" {
  name = "annonce-events"
}