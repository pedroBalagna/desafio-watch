# Infraestrutura - Terraform

Este diretório contém a configuração do Terraform para provisionar toda a infraestrutura do projeto Desafio Watch.

## 🏗️ Recursos Provisionados

### Neon Database

- Projeto Neon
- Database PostgreSQL
- Role de aplicação
- Configuração de autoscaling

### Vercel

- Projeto Vercel conectado ao GitHub
- Variáveis de ambiente (DATABASE_URL, JWT_SECRET, Kafka, Redis, Elasticsearch, etc.)
- Configuração de deploy automático

### GitHub

- Secrets para GitHub Actions (VERCEL_TOKEN, VERCEL_ORG_ID, etc.)
- Integração com CI/CD

### Kafka (Opcional)

- Configuração de variáveis de ambiente para Kafka
- Suporte para Upstash Kafka, Confluent Cloud, AWS MSK
- Variáveis: KAFKA*BROKERS, KAFKA_CLIENT_ID, KAFKA_SSL, KAFKA_SASL*\*

**Nota:** O cluster Kafka precisa ser criado manualmente. Para desenvolvimento local, use `docker-compose.yml`.

### Redis (Opcional)

- Configuração de variáveis de ambiente para Redis
- Suporte para Upstash Redis, AWS ElastiCache, Redis Cloud
- Variável: REDIS_URL

**Nota:** O banco Redis precisa ser criado manualmente. Para desenvolvimento local, use `docker-compose.yml`.

### Elasticsearch (Opcional)

- Configuração de variáveis de ambiente para Elasticsearch
- Suporte para AWS Elasticsearch Service, Elastic Cloud
- Variáveis: ELASTICSEARCH_NODE, ELASTICSEARCH_INDEX, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD

**Nota:** O cluster Elasticsearch precisa ser criado manualmente. Para desenvolvimento local, use `docker-compose.yml`.

## 📋 Pré-requisitos

1. [Terraform](https://www.terraform.io/downloads) >= 1.0.0
2. Conta no [Neon](https://neon.tech)
3. Conta no [Vercel](https://vercel.com)
4. Conta no [GitHub](https://github.com)
5. (Opcional) Conta no [Upstash](https://upstash.com) para Kafka e Redis
6. (Opcional) Conta no [AWS](https://aws.amazon.com) ou [Elastic Cloud](https://www.elastic.co/cloud) para Elasticsearch

## 🔑 Obter API Keys

### Neon API Key

1. Acesse https://console.neon.tech/app/settings/api-keys
2. Clique em "Create new API Key"
3. Copie a chave gerada

### Vercel API Token

1. Acesse https://vercel.com/account/tokens
2. Clique em "Create"
3. Dê um nome ao token e copie

### GitHub Personal Access Token

1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione os escopos: `repo`, `admin:repo_hook`
4. Copie o token gerado

### Upstash Kafka (Opcional)

1. Acesse https://console.upstash.com
2. Crie um novo cluster Kafka
3. Copie o endpoint (KAFKA_BROKERS)
4. Copie as credenciais SASL (KAFKA_USERNAME, KAFKA_PASSWORD)

### Upstash Redis (Opcional)

1. Acesse https://console.upstash.com
2. Crie um novo banco Redis
3. Copie a URL de conexão (REDIS_URL)

### Elasticsearch (Opcional)

1. Para AWS: Crie um domínio Elasticsearch no AWS Console
2. Para Elastic Cloud: Crie um deployment em https://cloud.elastic.co
3. Copie o endpoint e credenciais

## 🚀 Como Usar

### 1. Configurar Variáveis

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
```

Edite `terraform.tfvars` com suas credenciais:

```hcl
# Provider API Keys
neon_api_key     = "sua-neon-api-key"
vercel_api_token = "seu-vercel-token"
github_token     = "seu-github-token"
github_owner     = "seu-username"

# Application Secrets
jwt_secret       = "um-secret-seguro-e-aleatorio"

# Serviços Opcionais (deixe vazio para desabilitar)
kafka_brokers       = "" # Para produção: "seu-cluster.upstash.io:9092"
kafka_username      = ""
kafka_password      = ""
redis_url           = "" # Para produção: "redis://default:password@seu-redis.upstash.io:6379"
elasticsearch_node  = "" # Para produção: "https://seu-cluster.es.amazonaws.com:443"
```

**Nota:** Para desenvolvimento local, deixe os serviços opcionais vazios e use o `docker-compose.yml` do backend.

### 2. Inicializar Terraform

```bash
terraform init
```

### 3. Visualizar Plano

```bash
terraform plan
```

### 4. Aplicar Infraestrutura

```bash
terraform apply
```

### 5. Ver Outputs

```bash
terraform output
```

Para ver valores sensíveis:

```bash
terraform output -json
```

## 📁 Estrutura de Arquivos

```
infra/
├── main.tf                    # Configuração dos providers
├── variables.tf               # Definição das variáveis
├── outputs.tf                 # Outputs da infraestrutura
├── neon.tf                    # Recursos do Neon Database
├── vercel.tf                  # Recursos do Vercel
├── github.tf                  # Recursos do GitHub
├── kafka.tf                   # Configuração Kafka (variáveis e outputs)
├── redis.tf                   # Configuração Redis (variáveis e outputs)
├── elasticsearch.tf           # Configuração Elasticsearch (variáveis e outputs)
├── terraform.tfvars.example   # Exemplo de variáveis
├── .gitignore                 # Arquivos ignorados
└── README.md                  # Esta documentação
```

## 🔄 Atualizar Infraestrutura

Após modificar os arquivos `.tf`:

```bash
terraform plan   # Visualizar mudanças
terraform apply  # Aplicar mudanças
```

## 🗑️ Destruir Infraestrutura

⚠️ **CUIDADO**: Isso vai deletar todos os recursos, incluindo o banco de dados!

```bash
terraform destroy
```

## 🔧 Troubleshooting

### Erro: "Provider not found"

```bash
terraform init -upgrade
```

### Erro: "Invalid API key"

Verifique se as API keys estão corretas no `terraform.tfvars`

### Erro: "Resource already exists"

O recurso já foi criado manualmente. Você pode:

1. Importar o recurso: `terraform import <resource> <id>`
2. Ou deletar manualmente e rodar `terraform apply`

## 📊 Custos

| Serviço       | Plano                        | Custo                         |
| ------------- | ---------------------------- | ----------------------------- |
| Neon          | Free Tier                    | $0/mês                        |
| Vercel        | Hobby                        | $0/mês                        |
| GitHub        | Free                         | $0/mês                        |
| Upstash Kafka | Free Tier                    | $0/mês (até 10k mensagens)    |
| Upstash Redis | Free Tier                    | $0/mês (até 10k comandos/dia) |
| Elasticsearch | Self-hosted (docker-compose) | $0/mês (local)                |

**Total estimado: $0/mês** (para projetos pequenos)

**Nota:** Para desenvolvimento local, todos os serviços podem ser executados via `docker-compose.yml` sem custo adicional.

## 🔐 Segurança

- **NUNCA** commite o arquivo `terraform.tfvars`
- Use variáveis de ambiente para CI/CD
- Rotacione as API keys periodicamente
- O state do Terraform contém dados sensíveis - considere usar remote backend (S3, Terraform Cloud)

## 📚 Recursos

- [Neon Terraform Provider](https://registry.terraform.io/providers/kislerdm/neon/latest/docs)
- [Vercel Terraform Provider](https://registry.terraform.io/providers/vercel/vercel/latest/docs)
- [GitHub Terraform Provider](https://registry.terraform.io/providers/integrations/github/latest/docs)
