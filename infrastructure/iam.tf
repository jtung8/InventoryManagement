# ------------------------------------------------------------------------------
# GitHub Actions OIDC — Secure, keyless authentication from GitHub to AWS.
#
# How it works:
#   1. GitHub Actions generates a signed OIDC token for each workflow run
#   2. The workflow presents this token to AWS STS (Security Token Service)
#   3. AWS verifies the token against the OIDC provider registered below
#   4. AWS checks the trust policy: is this repo + branch allowed?
#   5. If yes, AWS returns temporary credentials (expire in 1 hour)
#   6. The workflow uses those credentials to push images to ECR
#
# This eliminates long-lived AWS access keys in GitHub Secrets entirely.
# ------------------------------------------------------------------------------

# --- OIDC Provider -----------------------------------------------------------
# One-time registration: tells AWS to trust tokens signed by GitHub.
# Only ONE of these can exist per AWS account for a given URL.
# If you already have one from another project, import it:
#   terraform import aws_iam_openid_connect_provider.github \
#     arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
#
# thumbprint_list is omitted intentionally:
#   - AWS provider v5.81.0+ made it optional (we're on v5.100.0)
#   - Since July 2023, AWS validates GitHub tokens via root CA trust,
#     not pinned intermediate certificate thumbprints
#   - The old thumbprint approach broke globally when GitHub rotated their
#     intermediate CA — omitting it is now the correct, future-proof approach
# ------------------------------------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# --- IAM Role ----------------------------------------------------------------
# The identity GitHub Actions "becomes" when it needs to interact with AWS.
# The trust policy below is the security boundary — it controls exactly
# who can assume this role.
# ------------------------------------------------------------------------------

resource "aws_iam_role" "github_actions" {
  name = "${local.name_prefix}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          # Audience must be STS (matches client_id_list above)
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"

            # SECURITY: Only the main branch of this specific repo can assume
            # this role. StringEquals = exact match, no wildcards.
            # Format: "repo:OWNER/REPO:ref:refs/heads/BRANCH"
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:ref:refs/heads/main"
          }
        }
      }
    ]
  })
}

# --- ECR Push Policy ---------------------------------------------------------
# Grants the minimum permissions needed to push Docker images to ECR.
# Two statements:
#   1. ecr:GetAuthorizationToken — account-level (cannot be scoped to a repo),
#      required for `docker login` to ECR
#   2. Image push/pull actions — scoped to our two specific repos only
#
# ECS deploy permissions will be added as a separate policy on Day 17.
# ------------------------------------------------------------------------------

resource "aws_iam_role_policy" "github_actions_ecr" {
  name = "ecr-push"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECRAuth"
        Effect = "Allow"
        Action = "ecr:GetAuthorizationToken"
        # This action is account-level — it cannot be scoped to specific repos.
        # It returns a Docker login token valid for all ECR repos in the account.
        Resource = "*"
      },
      {
        Sid    = "AllowECRPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
        ]
        # Scoped to our two repos only — this role cannot touch any other
        # ECR repos that might exist in the account.
        Resource = [
          aws_ecr_repository.frontend.arn,
          aws_ecr_repository.backend.arn,
        ]
      }
    ]
  })
}
