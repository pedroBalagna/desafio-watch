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
- Variáveis de ambiente (DATABASE_URL, JWT_SECRET, etc.)
- Configuração de deploy automático

### GitHub
- Secrets para GitHub Actions (VERCEL_TOKEN, VERCEL_ORG_ID, etc.)
- Integração com CI/CD

## 📋 Pré-requisitos

1. [Terraform](https://www.terraform.io/downloads) >= 1.0.0
2. Conta no [Neon](https://neon.tech)
3. Conta no [Vercel](https://vercel.com)
4. Conta no [GitHub](https://github.com)

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

## 🚀 Como Usar

### 1. Configurar Variáveis

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
```

Edite `terraform.tfvars` com suas credenciais:

```hcl
neon_api_key     = "sua-neon-api-key"
vercel_api_token = "seu-vercel-token"
github_token     = "seu-github-token"
github_owner     = "seu-username"
jwt_secret       = "um-secret-seguro-e-aleatorio"
```

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

| Serviço | Plano | Custo |
|---------|-------|-------|
| Neon | Free Tier | $0/mês |
| Vercel | Hobby | $0/mês |
| GitHub | Free | $0/mês |

**Total estimado: $0/mês** (para projetos pequenos)

## 🔐 Segurança

- **NUNCA** commite o arquivo `terraform.tfvars`
- Use variáveis de ambiente para CI/CD
- Rotacione as API keys periodicamente
- O state do Terraform contém dados sensíveis - considere usar remote backend (S3, Terraform Cloud)

## 📚 Recursos

- [Neon Terraform Provider](https://registry.terraform.io/providers/kislerdm/neon/latest/docs)
- [Vercel Terraform Provider](https://registry.terraform.io/providers/vercel/vercel/latest/docs)
- [GitHub Terraform Provider](https://registry.terraform.io/providers/integrations/github/latest/docs)

