# =============================================================================
# Elasticsearch (Opicional)
# =============================================================================
# 
# Elasticsearch para logs e observabilidade
# 
# Alternativas:
# - AWS Elasticsearch Service
# - Elastic Cloud
# - Self-hosted (não recomendado para produção)
# - Usar serviços alternativos como DataDog, New Relic, etc.

# Nota: Para produção, recomenda-se usar serviços gerenciados
# Como o setup varia muito entre providers, aqui temos apenas variáveis
# para configurar via environment variables

# Variáveis locais para Elasticsearch
locals {
  elasticsearch_enabled = var.elasticsearch_node != ""
}

# Outputs para referência (valores vêm das variáveis)
output "elasticsearch_node" {
  description = "Elasticsearch node URL"
  value       = var.elasticsearch_node != "" ? var.elasticsearch_node : null
  sensitive   = false
}

output "elasticsearch_index" {
  description = "Elasticsearch index name"
  value       = var.elasticsearch_index
  sensitive   = false
}

output "elasticsearch_enabled" {
  description = "Whether Elasticsearch is configured"
  value       = local.elasticsearch_enabled
}

