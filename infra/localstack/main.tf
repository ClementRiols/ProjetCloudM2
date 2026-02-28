terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  access_key                  = "test"
  secret_key                  = "test"
  region                      = "us-east-1"

  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3       = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    sqs      = "http://localhost:4566"
    lambda   = "http://localhost:4566"
  }

  s3_use_path_style = true
}

resource "aws_s3_bucket" "images" {
  bucket = "lostfound-images"
}

resource "aws_dynamodb_table" "annonces" {
  name         = "Annonces"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

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

resource "aws_lambda_function" "create_annonce" {
  function_name = "create-annonce"
  role          = "arn:aws:iam::000000000000:role/lambda-role" # juste un ARN bidon
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = "../../lambdas/create-annonce.zip"
  source_code_hash = filebase64sha256("../../lambdas/create-annonce.zip")
}
