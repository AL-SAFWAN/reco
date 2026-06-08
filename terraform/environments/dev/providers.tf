terraform {
  backend "s3" {
    bucket         = "tf-state-aws-backend-legion-app"
    key            = "terraform/aws-backend/terraform.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "terraform-state-locking-legion-app"
    encrypt        = true
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.53"
    }
  }
}

provider "aws" {
  region = local.region
}
