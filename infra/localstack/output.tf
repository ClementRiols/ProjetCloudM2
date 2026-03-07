output "bucket" {
  value = aws_s3_bucket.lostfound_images.bucket
}

output "table" {
  value = aws_dynamodb_table.annonces.name
}

output "queue_url" {
  value = aws_sqs_queue.annonce_events.url
}