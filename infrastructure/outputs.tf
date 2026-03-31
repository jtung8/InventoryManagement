output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets (for ALB and ECS services)"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets (for RDS)"
  value       = aws_subnet.private[*].id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC (used in security group rules)"
  value       = aws_vpc.main.cidr_block
}

# --- Day 16: ECR + IAM outputs -----------------------------------------------

output "ecr_frontend_url" {
  description = "ECR repository URL for the frontend image (used in ECS task defs and GitHub Actions)"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  description = "ECR repository URL for the backend image (used in ECS task defs and GitHub Actions)"
  value       = aws_ecr_repository.backend.repository_url
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions to assume via OIDC (used in deploy workflow)"
  value       = aws_iam_role.github_actions.arn
}
