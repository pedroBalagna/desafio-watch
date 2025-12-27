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

# =============================================================================
# Kafka Environment Variables (Optional)
# =============================================================================

resource "vercel_project_environment_variable" "kafka_brokers" {
  count      = var.kafka_brokers != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "KAFKA_BROKERS"
  value      = var.kafka_brokers
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "kafka_client_id" {
  count      = var.kafka_brokers != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "KAFKA_CLIENT_ID"
  value      = "inventory-api"
  target     = ["production", "preview", "development"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "kafka_ssl" {
  count      = var.kafka_brokers != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "KAFKA_SSL"
  value      = tostring(var.kafka_ssl)
  target     = ["production", "preview", "development"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "kafka_sasl_mechanism" {
  count      = var.kafka_brokers != "" && var.kafka_sasl_mechanism != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "KAFKA_SASL_MECHANISM"
  value      = var.kafka_sasl_mechanism
  target     = ["production", "preview", "development"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "kafka_sasl_username" {
  count      = var.kafka_brokers != "" && var.kafka_username != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "KAFKA_SASL_USERNAME"
  value      = var.kafka_username
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "kafka_sasl_password" {
  count      = var.kafka_brokers != "" && var.kafka_password != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "KAFKA_SASL_PASSWORD"
  value      = var.kafka_password
  target     = ["production", "preview", "development"]
  sensitive  = true
}

# =============================================================================
# Redis Environment Variables (Optional)
# =============================================================================

resource "vercel_project_environment_variable" "redis_url" {
  count      = var.redis_url != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "REDIS_URL"
  value      = var.redis_url
  target     = ["production", "preview", "development"]
  sensitive  = true
}

# =============================================================================
# Elasticsearch Environment Variables (Optional)
# =============================================================================

resource "vercel_project_environment_variable" "elasticsearch_node" {
  count      = var.elasticsearch_node != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "ELASTICSEARCH_NODE"
  value      = var.elasticsearch_node
  target     = ["production", "preview", "development"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "elasticsearch_index" {
  count      = var.elasticsearch_node != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "ELASTICSEARCH_INDEX"
  value      = var.elasticsearch_index
  target     = ["production", "preview", "development"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "elasticsearch_username" {
  count      = var.elasticsearch_node != "" && var.elasticsearch_username != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "ELASTICSEARCH_USERNAME"
  value      = var.elasticsearch_username
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "elasticsearch_password" {
  count      = var.elasticsearch_node != "" && var.elasticsearch_password != "" ? 1 : 0
  project_id = vercel_project.backend.id
  key        = "ELASTICSEARCH_PASSWORD"
  value      = var.elasticsearch_password
  target     = ["production", "preview", "development"]
  sensitive  = true
}

