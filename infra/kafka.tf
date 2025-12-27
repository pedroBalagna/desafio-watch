# =============================================================================
# Kafka (Upstash)
# =============================================================================
# 
# Upstash Kafka é uma solução serverless e gerenciada para Kafka
# Ideal para produção: escalável, serverless, com tier gratuito
#
# Alternativas:
# - Confluent Cloud (mais robusto, mas pago)
# - AWS MSK (Amazon Managed Streaming for Kafka)
# - Self-hosted (não recomendado para produção)

# Nota: Upstash não tem provider oficial do Terraform
# Você precisará criar o cluster manualmente via console ou usar a API
# 
# Passos manuais:
# 1. Acesse https://console.upstash.com
# 2. Crie um cluster Kafka
# 3. Copie as credenciais para as variáveis abaixo
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

# Variáveis locais para Kafka
locals {
  kafka_enabled = var.kafka_brokers != ""
}

# Outputs para referência (valores vêm das variáveis)
output "kafka_brokers" {
  description = "Kafka brokers endpoint"
  value       = var.kafka_brokers != "" ? var.kafka_brokers : null
  sensitive   = true
}

output "kafka_sasl_username" {
  description = "Kafka SASL username"
  value       = var.kafka_username != "" ? var.kafka_username : null
  sensitive   = true
}

output "kafka_enabled" {
  description = "Whether Kafka is configured"
  value       = local.kafka_enabled
}

