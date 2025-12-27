# =============================================================================
# GitHub Repository Secrets for CI/CD
# =============================================================================

data "github_repository" "main" {
  full_name = "${var.github_owner}/${var.github_repo}"
}

# Vercel secrets for deployment
resource "github_actions_secret" "vercel_token" {
  repository      = data.github_repository.main.name
  secret_name     = "VERCEL_TOKEN"
  plaintext_value = var.vercel_api_token
}

resource "github_actions_secret" "vercel_org_id" {
  repository      = data.github_repository.main.name
  secret_name     = "VERCEL_ORG_ID"
  plaintext_value = var.vercel_team_id != null ? var.vercel_team_id : vercel_project.backend.team_id
}

resource "github_actions_secret" "vercel_project_id" {
  repository      = data.github_repository.main.name
  secret_name     = "VERCEL_PROJECT_ID"
  plaintext_value = vercel_project.backend.id
}

# Database secret for migrations
resource "github_actions_secret" "database_url" {
  repository      = data.github_repository.main.name
  secret_name     = "DATABASE_URL"
  plaintext_value = local.database_url
}

# JWT secret for tests
resource "github_actions_secret" "jwt_secret" {
  repository      = data.github_repository.main.name
  secret_name     = "JWT_SECRET"
  plaintext_value = var.jwt_secret
}

