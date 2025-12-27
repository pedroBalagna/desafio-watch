# Guia de Deploy - Vercel Functions

Este guia explica como configurar o CI/CD com GitHub Actions para deploy automático no Vercel Functions.

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub
3. Projeto NestJS configurado

## Configuração do Vercel

### 1. Criar Projeto no Vercel

1. Acesse o [dashboard do Vercel](https://vercel.com/dashboard)
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure o projeto:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `pnpm build`
   - **Output Directory**: (deixe vazio, não é necessário para serverless functions)
   - **Install Command**: `pnpm install`

### 2. Obter Credenciais do Vercel

Você precisará das seguintes informações do Vercel:

1. **VERCEL_TOKEN**: 
   - Acesse [Settings > Tokens](https://vercel.com/account/tokens)
   - Crie um novo token com escopo completo
   - Copie o token gerado

2. **VERCEL_ORG_ID**:
   - Acesse [Settings > General](https://vercel.com/account/general)
   - Copie o "Team ID" ou "Personal Account ID"

3. **VERCEL_PROJECT_ID**:
   - No dashboard do projeto, acesse Settings > General
   - Copie o "Project ID"

## Configuração do GitHub Actions

### 1. Configurar Secrets no GitHub

No seu repositório GitHub, vá em **Settings > Secrets and variables > Actions** e adicione os seguintes secrets:

- `VERCEL_TOKEN`: Token do Vercel obtido acima
- `VERCEL_ORG_ID`: ID da organização/conta do Vercel
- `VERCEL_PROJECT_ID`: ID do projeto no Vercel
- `DATABASE_URL`: URL de conexão do banco de dados PostgreSQL
- `JWT_SECRET`: Secret para assinatura de tokens JWT

### 2. Variáveis de Ambiente no Vercel

No dashboard do Vercel, vá em **Settings > Environment Variables** e configure:

- `DATABASE_URL`: URL de conexão do banco de dados
- `JWT_SECRET`: Secret para JWT
- `JWT_EXPIRES_IN`: Tempo de expiração do token (opcional, padrão: 1d)
- `FRONTEND_URL`: URL do frontend (opcional, para CORS)
- `NODE_ENV`: `production`

## Estrutura de Arquivos

Os seguintes arquivos foram criados para o deploy:

- `backend/api/index.ts`: Handler serverless para o Vercel
- `backend/vercel.json`: Configuração do Vercel
- `.github/workflows/deploy.yml`: Workflow do GitHub Actions

## Como Funciona

### Workflow do GitHub Actions

O workflow executa as seguintes etapas:

1. **Test Job**: 
   - Instala dependências
   - Gera Prisma Client
   - Executa linter
   - Executa testes
   - Faz build do projeto

2. **Deploy Job** (apenas em push para main/master):
   - Instala Vercel CLI
   - Faz pull das variáveis de ambiente do Vercel
   - Faz build do projeto
   - Faz deploy para produção

### Handler Serverless

O arquivo `backend/api/index.ts` cria uma instância do NestJS adaptada para funcionar como uma função serverless no Vercel. A aplicação é cacheada para melhor performance.

## Deploy Manual

Se precisar fazer deploy manual:

```bash
cd backend
pnpm install
vercel --prod
```

## Migrações do Banco de Dados

As migrações do Prisma devem ser executadas manualmente ou através de um script separado. Você pode adicionar um step no workflow para executar migrações:

```yaml
- name: Run Prisma Migrations
  run: pnpm prisma:migrate:deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Troubleshooting

### Erro: "Cannot find module"

Certifique-se de que todas as dependências estão no `package.json` e que o Prisma Client foi gerado.

### Erro: "Database connection failed"

Verifique se a `DATABASE_URL` está configurada corretamente no Vercel e nos secrets do GitHub.

### Erro: "Build failed"

Verifique os logs do build no GitHub Actions para identificar o problema específico.

## Recursos Adicionais

- [Documentação do Vercel](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [NestJS Serverless](https://docs.nestjs.com/faq/serverless)

