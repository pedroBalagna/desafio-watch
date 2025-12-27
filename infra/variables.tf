# =============================================================================
# Provider API Keys
# =============================================================================

variable "neon_api_key" {
  description = "Neon API Key - Get from https://console.neon.tech/app/settings/api-keys"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Vercel API Token - Get from https://vercel.com/account/tokens"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel Team ID (optional for personal accounts)"
  type        = string
  default     = null
}

variable "github_token" {
  description = "GitHub Personal Access Token with repo and admin:repo_hook permissions"
  type        = string
  sensitive   = true
}

variable "github_owner" {
  description = "GitHub username or organization name"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "desafio-watch"
}

# =============================================================================
# Project Configuration
# =============================================================================

variable "project_name" {
  description = "Project name used for resources"
  type        = string
  default     = "desafio-watch"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# =============================================================================
# Neon Configuration
# =============================================================================

variable "neon_org_id" {
  description = "Neon Organization ID - Get from https://console.neon.tech/app/settings/organizations"
  type        = string
}

variable "neon_region" {
  description = "Neon region for the database"
  type        = string
  default     = "aws-us-east-1"
}

# =============================================================================
# Application Secrets
# =============================================================================

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "JWT token expiration time"
  type        = string
  default     = "1d"
}

# =============================================================================
# Kafka Configuration (Optional)
# =============================================================================

variable "kafka_brokers" {
  description = "Kafka brokers endpoint (e.g., localhost:9094 or upstash-kafka-endpoint:9092)"
  type        = string
  default     = ""
}

variable "kafka_username" {
  description = "Kafka SASL username (required for Upstash/Confluent Cloud)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "kafka_password" {
  description = "Kafka SASL password (required for Upstash/Confluent Cloud)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "kafka_ssl" {
  description = "Enable SSL for Kafka connection"
  type        = bool
  default     = false
}

variable "kafka_sasl_mechanism" {
  description = "Kafka SASL mechanism (plain, scram-sha-256, scram-sha-512)"
  type        = string
  default     = ""
}

# =============================================================================
# Redis Configuration (Optional)
# =============================================================================

variable "redis_url" {
  description = "Redis connection URL (e.g., redis://localhost:6379 or upstash-redis-url)"
  type        = string
  default     = ""
  sensitive   = true
}

# =============================================================================
# Elasticsearch Configuration (Optional)
# =============================================================================

variable "elasticsearch_node" {
  description = "Elasticsearch node URL (e.g., http://localhost:9200)"
  type        = string
  default     = ""
}

variable "elasticsearch_index" {
  description = "Elasticsearch index name"
  type        = string
  default     = "desafio-watch-logs"
}

variable "elasticsearch_username" {
  description = "Elasticsearch username (optional)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "elasticsearch_password" {
  description = "Elasticsearch password (optional)"
  type        = string
  default     = ""
  sensitive   = true
}

