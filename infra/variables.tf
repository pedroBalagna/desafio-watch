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

