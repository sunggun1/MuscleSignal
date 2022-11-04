resource "aws_s3_bucket" "files" {
  bucket = "files-pythonweb"
  acl    = "public-read-write"
  force_destroy = true
}
resource "aws_s3_bucket_policy" "files" {
  bucket = aws_s3_bucket.files.id

  # Terraform's "jsonencode" function converts a
  # Terraform expression's result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "MYBUCKETPOLICY"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    =  [
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObject"
            ]
        Resource = [
          aws_s3_bucket.files.arn,
          "${aws_s3_bucket.files.arn}/*",
        ]
      },
    ]
  })
}