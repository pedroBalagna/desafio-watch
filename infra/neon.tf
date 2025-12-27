# =============================================================================
# Neon Database
# =============================================================================

resource "neon_project" "main" {
  name      = var.project_name
  org_id    = var.neon_org_id
  region_id = var.neon_region

  default_endpoint_settings {
    autoscaling_limit_min_cu = 0.25
    autoscaling_limit_max_cu = 1
    suspend_timeout_seconds  = 300
  }
}

resource "neon_database" "main" {
  project_id = neon_project.main.id
  branch_id  = neon_project.main.default_branch_id
  name       = replace(var.project_name, "-", "_")
  owner_name = neon_project.main.database_user
}

resource "neon_role" "app" {
  project_id = neon_project.main.id
  branch_id  = neon_project.main.default_branch_id
  name       = "${replace(var.project_name, "-", "_")}_app"
}

# =============================================================================
# Local values for connection string
# =============================================================================

locals {
  # Build the DATABASE_URL from Neon project
  database_url = neon_project.main.connection_uri
}

