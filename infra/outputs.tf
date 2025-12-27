# =============================================================================
# Neon Outputs
# =============================================================================

output "neon_project_id" {
  description = "Neon project ID"
  value       = neon_project.main.id
}

output "neon_database_name" {
  description = "Neon database name"
  value       = neon_database.main.name
}

output "neon_connection_uri" {
  description = "Neon connection URI (sensitive)"
  value       = neon_project.main.connection_uri
  sensitive   = true
}

# =============================================================================
# Vercel Outputs
# =============================================================================

output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.backend.id
}

output "vercel_deployment_url" {
  description = "Vercel deployment URL"
  value       = "https://${var.project_name}.vercel.app"
}

# =============================================================================
# Summary
# =============================================================================

output "summary" {
  description = "Infrastructure summary"
  value = {
    neon_project          = neon_project.main.name
    neon_database         = neon_database.main.name
    vercel_project        = vercel_project.backend.name
    github_repo           = "${var.github_owner}/${var.github_repo}"
    deployment_url        = "https://${var.project_name}.vercel.app"
    kafka_enabled         = var.kafka_brokers != ""
    redis_enabled         = var.redis_url != ""
    elasticsearch_enabled = var.elasticsearch_node != ""
  }
}

