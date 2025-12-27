# Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/desafio_watch?schema=public"

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Application
PORT=3000
NODE_ENV=development

# Elasticsearch (opcional)
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=desafio-watch-logs
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=
```

## Descrição das Variáveis

### DATABASE_URL
URL de conexão com o banco de dados PostgreSQL.
Formato: `postgresql://usuario:senha@host:porta/nome_do_banco?schema=public`

### JWT_SECRET
Chave secreta para assinatura dos tokens JWT. **IMPORTANTE**: Use uma chave forte e aleatória em produção.

### JWT_EXPIRES_IN
Tempo de expiração do token JWT. Exemplos: `1d`, `2h`, `30m`

### PORT
Porta em que a aplicação será executada. Padrão: `3000`

### NODE_ENV
Ambiente de execução: `development`, `production`, `test`

### ELASTICSEARCH_NODE
URL do nó Elasticsearch. Deixe vazio se não usar Elasticsearch.

### ELASTICSEARCH_INDEX
Nome do índice no Elasticsearch onde os logs serão armazenados.

### ELASTICSEARCH_USERNAME e ELASTICSEARCH_PASSWORD
Credenciais para autenticação no Elasticsearch (opcional, apenas se necessário).

## Exemplo para Desenvolvimento Local

Se estiver usando o `docker-compose.yml` fornecido:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/desafio_watch?schema=public"
JWT_SECRET=development-secret-key
JWT_EXPIRES_IN=1d
PORT=3000
NODE_ENV=development
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=desafio-watch-logs
```

