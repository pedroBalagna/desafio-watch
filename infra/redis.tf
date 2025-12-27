# =============================================================================
# Redis (Upstash)
# =============================================================================
# 
# Upstash Redis é uma solução serverless e gerenciada para Redis
# Ideal para cache e sessions: escalável, serverless, com tier gratuito
#
# Alternativas:
# - AWS ElastiCache (Amazon Managed Redis)
# - Redis Cloud
# - Self-hosted (não recomendado para produção)

# Nota: Upstash não tem provider oficial do Terraform
# Você precisará criar o banco Redis manualmente via console ou usar a API
# 
# Passos manuais:
# 1. Acesse https://console.upstash.com
# 2. Crie um banco Redis
# 3. Copie a URL de conexão para as variáveis abaixo
#
# Ou use o provider não-oficial:
# terraform {
#   required_providers {
#     upstash = {
#       source = "upstash/upstash"
#       version = "~> 1.0"
#     }
#   }
# }

# Variáveis locais para Redis
locals {
  redis_enabled = var.redis_url != ""
}

# Outputs para referência (valores vêm das variáveis)
output "redis_url" {
  description = "Redis connection URL"
  value       = var.redis_url != "" ? var.redis_url : null
  sensitive   = true
}

output "redis_enabled" {
  description = "Whether Redis is configured"
  value       = local.redis_enabled
}

