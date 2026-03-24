variable "aws_region" {
  type        = string
  description = "AWS region for all resources"
  default     = "us-west-2"
}

variable "project_name" {
  type        = string
  description = "Project name used for resource naming and tagging"
  default     = "forestock"
}

variable "environment" {
  type        = string
  description = "Deployment environment (staging, production)"
  default     = "staging"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets (one per AZ, used by ALB and ECS)"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private subnets (one per AZ, used by RDS)"
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}
