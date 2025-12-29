# Desafio Watch - Backend API

API REST desenvolvida com NestJS para o desafio técnico Watch - Fullstack PL/SR.

## 🚀 Tecnologias

- **Node.js** com **NestJS** - Framework para construção de APIs
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **Winston** - Sistema de logs estruturados
- **OpenTelemetry** + **Jaeger** - Observabilidade e tracing distribuído
- **Swagger/OpenAPI** - Documentação da API
- **TypeScript** - Linguagem de programação

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (v14 ou superior)
- pnpm, npm ou yarn (recomendado: pnpm)
- Docker e Docker Compose (opcional, para serviços como Jaeger)

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd backend
```

2. Instale o pnpm (se ainda não tiver):

```bash
npm install -g pnpm
```

3. Instale as dependências:

```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/desafio_watch?schema=public"

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Application
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# OpenTelemetry / Jaeger (opcional)
ENABLE_TELEMETRY=true
OTLP_ENDPOINT=http://localhost:4318/v1/traces
SERVICE_NAME=desafio-watch-backend
```

4. Configure o banco de dados:

```bash
# Gerar o cliente Prisma
pnpm run prisma:generate
# ou: npm run prisma:generate

# Executar migrations
pnpm run prisma:migrate
# ou: npm run prisma:migrate
```

5. (Opcional) Popular o banco com dados de exemplo:

```bash
pnpm run prisma:seed
# ou: npm run prisma:seed
```

## 🏃 Executando a aplicação

### Desenvolvimento

```bash
pnpm run start:dev
# ou: npm run start:dev
```

### Produção

```bash
pnpm run build
pnpm run start:prod
# ou: npm run build && npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`

## 📚 Documentação da API

A documentação Swagger está disponível em:

- **Swagger UI**: http://localhost:3000/api/docs

## 🔐 Autenticação

A API utiliza autenticação JWT. Para acessar endpoints protegidos:

1. Registre um novo usuário:

```bash
POST /auth/register
{
  "email": "usuario@example.com",
  "name": "João Silva",
  "password": "senha123"
}
```

2. Faça login:

```bash
POST /auth/login
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

3. Use o token retornado no header das requisições:

```
Authorization: Bearer <seu-token-jwt>
```

## 📡 Endpoints

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `GET /auth/profile` - Obter perfil do usuário autenticado (protegido)

### Usuários (todos protegidos)

- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Obter usuário por ID
- `POST /users` - Criar novo usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário

## 🗄️ Banco de Dados

### Schema

O schema do banco de dados está definido em `prisma/schema.prisma`.

#### Modelo User

- `id` (UUID) - Identificador único
- `email` (String, único) - Email do usuário
- `name` (String) - Nome do usuário
- `password` (String) - Senha criptografada
- `createdAt` (DateTime) - Data de criação
- `updatedAt` (DateTime) - Data de atualização

### Migrations

Para criar uma nova migration:

```bash
pnpm run prisma:migrate
# ou: npm run prisma:migrate
```

Para aplicar migrations em produção:

```bash
pnpm run prisma:migrate:deploy
# ou: npm run prisma:migrate:deploy
```

### Prisma Studio

Para visualizar e gerenciar dados através de uma interface gráfica:

```bash
pnpm run prisma:studio
# ou: npm run prisma:studio
```

## 📊 Logs e Observabilidade

A aplicação utiliza **Winston** para logging estruturado e **OpenTelemetry** com **Jaeger** para tracing e monitoramento distribuído.

### Configuração de Logs

Os logs são enviados para:

- **Console** - Sempre habilitado (formato colorido e estruturado)
- **OpenTelemetry/Jaeger** - Habilitado quando `ENABLE_TELEMETRY` não está definido como `false`

### Estrutura dos Logs

Os logs incluem:

- Timestamp
- Nível (info, warn, error, debug, verbose)
- Mensagem
- Contexto (módulo/serviço)
- Trace ID e Span ID (quando disponível via OpenTelemetry)
- Metadados adicionais

### Visualização no Jaeger

1. Acesse a interface do Jaeger em: `http://localhost:16686`
2. Selecione o serviço `desafio-watch-backend` (ou o valor de `SERVICE_NAME`)
3. Visualize traces, spans e logs correlacionados
4. Analise performance, latência e dependências entre serviços

### Configuração OpenTelemetry

O OpenTelemetry está configurado para:

- **Tracing automático** de requisições HTTP, chamadas de banco de dados, e outras operações
- **Correlação de logs** com traces através de Trace ID e Span ID
- **Exportação para Jaeger** via OTLP (OpenTelemetry Protocol)

## 🧪 Testes

### Testes Unitários

```bash
pnpm run test
# ou: npm run test
```

### Testes com Coverage

```bash
pnpm run test:cov
# ou: npm run test:cov
```

### Testes em Modo Watch

```bash
pnpm run test:watch
# ou: npm run test:watch
```

### Testes E2E

```bash
pnpm run test:e2e
# ou: npm run test:e2e
```

## 🏗️ Estrutura do Projeto

```
backend/
├── api/
│   └── index.ts                # Handler serverless para Vercel Functions
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                 # Script de seed
├── src/
│   ├── auth/                   # Módulo de autenticação
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── guards/             # Guards de autenticação
│   │   ├── strategies/         # Estratégias Passport
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                  # Módulo de usuários
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── common/
│   │   └── logger/             # Serviço de logging
│   ├── prisma/                 # Módulo Prisma
│   ├── app.module.ts           # Módulo raiz
│   └── main.ts                 # Ponto de entrada (desenvolvimento local)
├── .env.example                # Exemplo de variáveis de ambiente
├── vercel.json                 # Configuração do Vercel
├── package.json
├── tsconfig.json
└── README.md
```

### 📂 Por que temos dois arquivos de entrada?

Este projeto possui dois arquivos de entrada para suportar diferentes ambientes de execução:

#### `src/main.ts` - Desenvolvimento Local

- **Propósito**: Inicia um servidor HTTP tradicional que fica sempre ativo
- **Quando é usado**: Durante desenvolvimento local (`pnpm start:dev`) ou em produção tradicional
- **Como funciona**:
  - Cria a aplicação NestJS com Fastify
  - Inicia um servidor que escuta em uma porta específica (`app.listen(port)`)
  - O servidor fica rodando continuamente, processando múltiplas requisições
- **Vantagens**:
  - Melhor para desenvolvimento (hot reload, debug)
  - Ideal para ambientes tradicionais (servidores dedicados, containers)

#### `api/index.ts` - Deploy no Vercel (Serverless)

- **Propósito**: Handler serverless para o Vercel Functions
- **Quando é usado**: Apenas durante o deploy no Vercel
- **Como funciona**:
  - Exporta uma função `handler` que recebe `VercelRequest` e `VercelResponse`
  - Não inicia um servidor; processa requisições individuais sob demanda
  - Converte requests/responses do Vercel para o formato Fastify
  - Cacheia a aplicação NestJS para melhor performance (evita recriar a cada request)
- **Vantagens**:
  - Compatível com o modelo serverless do Vercel
  - Escala automaticamente (cada request pode executar em uma função separada)
  - Paga apenas pelo tempo de execução
  - Cold start otimizado com cache da aplicação

#### Resumo

| Aspecto     | `main.ts`                            | `api/index.ts`                     |
| ----------- | ------------------------------------ | ---------------------------------- |
| Ambiente    | Desenvolvimento/Produção tradicional | Vercel Functions (Serverless)      |
| Execução    | Servidor sempre ativo                | Função executada sob demanda       |
| Interface   | `app.listen(port)`                   | `export default handler(req, res)` |
| Quando usar | `pnpm start:dev`, `pnpm start:prod`  | Deploy automático no Vercel        |
| Cache       | Não necessário                       | Sim (melhora performance)          |

**Nota**: Ambos os arquivos compartilham a mesma configuração da aplicação (CORS, validação, Swagger, etc.), garantindo comportamento consistente entre ambientes.

## 🔒 Segurança

- Senhas são criptografadas usando **bcrypt** (10 rounds)
- Tokens JWT com expiração configurável
- Validação de dados com **class-validator**
- Proteção de endpoints com guards JWT
- CORS habilitado (configurável)

## 📝 Scripts Disponíveis

Todos os scripts podem ser executados com `pnpm` ou `npm`:

- `pnpm run build` / `npm run build` - Compilar o projeto
- `pnpm run start` / `npm run start` - Iniciar em modo produção
- `pnpm run start:dev` / `npm run start:dev` - Iniciar em modo desenvolvimento
- `pnpm run start:debug` / `npm run start:debug` - Iniciar em modo debug
- `pnpm run lint` / `npm run lint` - Executar linter
- `pnpm run format` / `npm run format` - Formatar código
- `pnpm run test` / `npm run test` - Executar testes
- `pnpm run prisma:generate` / `npm run prisma:generate` - Gerar cliente Prisma
- `pnpm run prisma:migrate` / `npm run prisma:migrate` - Executar migrations
- `pnpm run prisma:studio` / `npm run prisma:studio` - Abrir Prisma Studio

## 🚀 Deploy

### Deploy no Vercel (Recomendado)

Este projeto está configurado para deploy automático no Vercel Functions através do GitHub Actions.

**Arquivo usado**: `api/index.ts` (handler serverless)

Para mais detalhes sobre a configuração de CI/CD e deploy, consulte o arquivo [`DEPLOY.md`](./DEPLOY.md).

### Deploy Tradicional (Servidor Dedicado/Container)

Para ambientes tradicionais, use o arquivo `src/main.ts`.

**Arquivo usado**: `src/main.ts` (servidor HTTP tradicional)

### Variáveis de Ambiente Necessárias

Certifique-se de configurar todas as variáveis de ambiente no ambiente de produção:

- `DATABASE_URL`
- `JWT_SECRET` (use um valor seguro e aleatório)
- `JWT_EXPIRES_IN`
- `PORT` (apenas para deploy tradicional)
- `NODE_ENV=production`
- `LOG_LEVEL` (opcional, padrão: `info`)
- `ENABLE_TELEMETRY` (opcional, padrão: `true`)
- `OTLP_ENDPOINT` (opcional, padrão: `http://localhost:4318/v1/traces`)
- `SERVICE_NAME` (opcional, padrão: `desafio-watch-backend`)

### Build para Produção (Deploy Tradicional)

```bash
# Usando pnpm
pnpm run build
pnpm run prisma:generate
pnpm run prisma:migrate:deploy
pnpm run start:prod

# Ou usando npm
npm run build
npm run prisma:generate
npm run prisma:migrate:deploy
npm run start:prod
```

## 📄 Licença

MIT

## 👥 Autor

Desenvolvido para o desafio técnico Watch - Fullstack PL/SR
