# 🎯 Desafio Watch - Sistema de Gerenciamento de Estoque

Sistema completo de gerenciamento de estoque desenvolvido como desafio técnico, composto por uma API REST robusta (backend), uma interface web moderna (frontend) e infraestrutura como código (IaC).

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como parte de um desafio técnico para demonstrar habilidades em desenvolvimento fullstack. O sistema oferece uma solução completa para gerenciamento de estoque, incluindo:

- **Gestão de Produtos**: CRUD completo com controle de SKU, código de barras, preços e estoque
- **Categorias e Fornecedores**: Organização e rastreabilidade de produtos
- **Armazéns**: Múltiplos locais de armazenamento com controle individual de estoque
- **Movimentações de Estoque**: Entradas, saídas, transferências entre armazéns e ajustes de inventário
- **Dashboard**: Visão geral com estatísticas e alertas de estoque baixo
- **Autenticação e Autorização**: Sistema seguro com JWT e controle de acesso
- **Observabilidade**: Logs estruturados e tracing distribuído com OpenTelemetry

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular e escalável:

```
desafio-watch/
├── backend/          # API REST com NestJS
├── frontend/         # Interface web com Vue 3
└── infra/            # Infraestrutura como código (Terraform)
```

### Backend

API REST desenvolvida com **NestJS**, oferecendo:

- Arquitetura modular e escalável
- Autenticação JWT
- ORM Prisma com PostgreSQL
- Logs estruturados com Winston
- Observabilidade com OpenTelemetry e Jaeger
- Integração com Kafka para eventos
- Documentação Swagger/OpenAPI
- Suporte para deploy serverless (Vercel) e tradicional

### Frontend

Interface web moderna desenvolvida com **Vue 3**:

- Design responsivo e intuitivo
- Componentes reutilizáveis
- Sidebar de navegação colapsável
- Dashboard com estatísticas em tempo real
- CRUD completo para todos os módulos
- Autenticação e proteção de rotas
- Integração com API via Axios

### Infraestrutura

Infraestrutura provisionada com **Terraform**:

- Banco de dados PostgreSQL (Neon)
- Deploy automático (Vercel)
- Integração CI/CD (GitHub Actions)
- Configuração de serviços opcionais (Kafka, Redis, Elasticsearch)

## 🚀 Tecnologias Principais

### Backend

- **NestJS** - Framework Node.js
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Winston** - Sistema de logs
- **OpenTelemetry** - Observabilidade
- **Kafka** - Mensageria e eventos

### Frontend

- **Vue 3** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Vuetify** - Componentes Material Design
- **Tailwind CSS** - Estilização
- **Vue Router** - Roteamento
- **Axios** - Cliente HTTP

### Infraestrutura

- **Terraform** - IaC
- **Neon** - PostgreSQL gerenciado
- **Vercel** - Deploy e hosting
- **GitHub Actions** - CI/CD

## 📁 Estrutura do Projeto

```
desafio-watch/
├── backend/              # API REST
│   ├── src/             # Código fonte
│   │   ├── auth/        # Módulo de autenticação
│   │   ├── products/    # Módulo de produtos
│   │   ├── categories/  # Módulo de categorias
│   │   ├── suppliers/   # Módulo de fornecedores
│   │   ├── warehouses/  # Módulo de armazéns
│   │   ├── stock/       # Módulo de movimentações
│   │   └── users/       # Módulo de usuários
│   ├── prisma/          # Schema e migrations
│   └── README.md        # Documentação do backend
│
├── frontend/             # Interface web
│   ├── src/
│   │   ├── components/  # Componentes Vue
│   │   ├── views/       # Páginas/Views
│   │   ├── services/    # Serviços de API
│   │   └── router/      # Configuração de rotas
│   └── README.md        # Documentação do frontend
│
├── infra/               # Infraestrutura
│   ├── *.tf            # Arquivos Terraform
│   └── README.md        # Documentação da infraestrutura
│
└── README.md            # Este arquivo
```

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** (v18 ou superior)
- **pnpm** (recomendado) ou npm/yarn
- **PostgreSQL** (v14 ou superior) ou use Neon
- **Docker** e **Docker Compose** (opcional, para serviços locais)

### Instalação

1. **Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd desafio-watch
```

2. **Configure o Backend:**

```bash
cd backend
pnpm install
cp .env.example .env
# Edite o .env com suas configurações
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run start:dev
```

3. **Configure o Frontend:**

```bash
cd frontend
pnpm install
# Configure VITE_API_URL no .env
pnpm run dev
```

4. **Acesse a aplicação:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

Para instruções detalhadas, consulte os READMEs específicos de cada módulo.

## 📚 Documentação

### Documentação por Módulo

- **[Backend README](./backend/README.md)** - Documentação completa da API

  - Instalação e configuração
  - Endpoints disponíveis
  - Autenticação
  - Banco de dados
  - Logs e observabilidade
  - Deploy

- **[Frontend README](./frontend/README.md)** - Documentação da interface web

  - Instalação e configuração
  - Estrutura de componentes
  - Rotas e navegação
  - Integração com API

- **[Infraestrutura README](./infra/README.md)** - Documentação do Terraform
  - Provisionamento de recursos
  - Configuração de serviços
  - Deploy de infraestrutura

### Documentação Adicional

- **[API Routes](./backend/API-ROUTES.md)** - Lista completa de endpoints
- **[Deploy Guide](./backend/DEPLOY.md)** - Guia de deploy
- **[Environment Variables](./backend/ENV.md)** - Variáveis de ambiente

## 🎯 Funcionalidades Principais

### Gestão de Produtos

- ✅ CRUD completo de produtos
- ✅ Controle de SKU e código de barras
- ✅ Gestão de preços (venda e custo)
- ✅ Controle de estoque (atual, mínimo, máximo)
- ✅ Alertas de estoque baixo
- ✅ Associação com categorias e fornecedores

### Movimentações de Estoque

- ✅ Entrada de estoque (compras, recebimentos)
- ✅ Saída de estoque (vendas, consumo)
- ✅ Transferências entre armazéns
- ✅ Ajustes de inventário
- ✅ Histórico completo de movimentações
- ✅ Rastreabilidade com referências e notas

### Dashboard

- ✅ Estatísticas em tempo real
- ✅ Produtos com estoque baixo
- ✅ Produtos sem estoque
- ✅ Resumo de armazéns
- ✅ Ações rápidas

### Autenticação e Segurança

- ✅ Registro e login de usuários
- ✅ Autenticação JWT
- ✅ Proteção de rotas
- ✅ Controle de acesso por função
- ✅ Senhas criptografadas

## 🧪 Testes

### Backend

```bash
cd backend
pnpm run test          # Testes unitários
pnpm run test:cov      # Com coverage
pnpm run test:e2e      # Testes end-to-end
```

### Frontend

```bash
cd frontend
pnpm run lint          # Verificar código
pnpm run type-check    # Verificar tipos
```

## 🚀 Deploy

### Backend

O backend pode ser deployado no **Vercel** (serverless) ou em servidores tradicionais. Veja [DEPLOY.md](./backend/DEPLOY.md) para detalhes.

### Frontend

O frontend pode ser deployado no **Vercel** ou qualquer serviço de hosting estático. Configure a variável `VITE_API_URL` apontando para a URL da API.

### Infraestrutura

Use **Terraform** para provisionar toda a infraestrutura. Veja [infra/README.md](./infra/README.md) para instruções.

## 📊 Observabilidade

O sistema inclui:

- **Logs estruturados** com Winston
- **Tracing distribuído** com OpenTelemetry
- **Visualização de traces** no Jaeger
- **Correlação de logs** com traces

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Tokens JWT com expiração
- Validação de dados de entrada
- Proteção CORS configurável
- Guards de autenticação em endpoints protegidos

## 📝 Scripts Úteis

### Backend

```bash
pnpm run start:dev      # Desenvolvimento
pnpm run build          # Build para produção
pnpm run prisma:studio # Interface gráfica do banco
pnpm run lint           # Verificar código
```

### Frontend

```bash
pnpm run dev            # Desenvolvimento
pnpm run build          # Build para produção
pnpm run lint           # Verificar código
```

## 🤝 Contribuindo

Este é um projeto de desafio técnico. Para sugestões ou melhorias:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

MIT

## 👥 Autor

Pedro Porphírio

Desenvolvido para o desafio técnico **Watch - Fullstack PL/SR**

---

**📖 Para mais detalhes, consulte os READMEs específicos de cada módulo:**

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)
- [Infraestrutura](./infra/README.md)
