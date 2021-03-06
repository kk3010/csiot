variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "aws_account" {
  type        = string
  description = "Your 12-digit account ID. Find it by running aws sts get-caller-identity --query Account --output text"
}
