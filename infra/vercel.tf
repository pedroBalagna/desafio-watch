# =============================================================================
# Vercel Project
# =============================================================================

resource "vercel_project" "backend" {
  name = var.project_name

  git_repository = {
    type = "github"
    repo = "${var.github_owner}/${var.github_repo}"
  }

  root_directory = "backend"

  build_command   = "pnpm build"
  install_command = "pnpm install"

  serverless_function_region = "iad1" # US East (N. Virginia)
}

# =============================================================================
# Environment Variables
# =============================================================================

resource "vercel_project_environment_variable" "database_url" {
  project_id = vercel_project.backend.id
  key        = "DATABASE_URL"
  value      = local.database_url
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "jwt_secret" {
  project_id = vercel_project.backend.id
  key        = "JWT_SECRET"
  value      = var.jwt_secret
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "jwt_expires_in" {
  project_id = vercel_project.backend.id
  key        = "JWT_EXPIRES_IN"
  value      = var.jwt_expires_in
  target     = ["production", "preview", "development"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "node_env" {
  project_id = vercel_project.backend.id
  key        = "NODE_ENV"
  value      = "production"
  target     = ["production"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "node_env_preview" {
  project_id = vercel_project.backend.id
  key        = "NODE_ENV"
  value      = "development"
  target     = ["preview", "development"]
  sensitive  = false
}

