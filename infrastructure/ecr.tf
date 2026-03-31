# ------------------------------------------------------------------------------
# ECR Repositories — Docker image storage for frontend and backend services.
# ECS Fargate (Day 17) pulls images from these repos.
# GitHub Actions (Day 17) pushes images here after building.
# ------------------------------------------------------------------------------

resource "aws_ecr_repository" "frontend" {
  name = "${local.name_prefix}-frontend"

  # Staging tradeoff: MUTABLE allows re-tagging (e.g., moving "latest" to a
  # new image). Convenient for fast iteration. In production, use IMMUTABLE to
  # guarantee that a tag like "abc123" always points to the exact same image —
  # critical for reproducible deployments and safe rollbacks.
  image_tag_mutability = "MUTABLE"

  # Staging tradeoff: allows `terraform destroy` to delete this repo even if it
  # contains images. Without this, you'd have to manually empty the repo first.
  # In production, set to false to prevent accidental image loss.
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "backend" {
  name = "${local.name_prefix}-backend"

  image_tag_mutability = "MUTABLE" # See frontend comment — same staging tradeoff
  force_delete         = true      # See frontend comment — same staging tradeoff

  image_scanning_configuration {
    scan_on_push = true
  }
}

# ------------------------------------------------------------------------------
# Lifecycle Policies — automatic cleanup to control storage costs.
#
# One rule per repo:
#   Keep the last 10 images (tagged or untagged) — rollback window for deployments.
#   Everything beyond 10 is automatically expired to control storage costs.
#
# ECR lifecycle policies use JSON (AWS API requirement), not HCL.
# ------------------------------------------------------------------------------

resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images (tagged or untagged)"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images (tagged or untagged)"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
