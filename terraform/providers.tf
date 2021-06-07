terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.42.0"
    }

    local = {
      source  = "hashicorp/local"
      version = "~> 2.1.0"
    }
  }
}

provider "aws" {
  profile = var.aws_profile
  region = var.aws_region
}
