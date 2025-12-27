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

# Kafka (opcional)
# Porta 9094 é a porta externa mapeada no docker-compose.yml para acesso do host
KAFKA_BROKERS=localhost:9094
KAFKA_CLIENT_ID=inventory-api
KAFKA_SSL=false
KAFKA_SASL_MECHANISM=
KAFKA_SASL_USERNAME=
KAFKA_SASL_PASSWORD=
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

### Kafka

#### KAFKA_BROKERS

Lista de brokers Kafka separados por vírgula. Exemplo: `localhost:9092,localhost:9093`
**Se não configurado, o Kafka será desabilitado automaticamente.**

#### KAFKA_CLIENT_ID

ID do cliente Kafka. Padrão: `inventory-api`

#### KAFKA_SSL

Habilitar SSL para conexão Kafka. Valores: `true` ou `false`

#### KAFKA_SASL_MECHANISM

Mecanismo de autenticação SASL. Valores: `plain`, `scram-sha-256`, `scram-sha-512`

#### KAFKA_SASL_USERNAME e KAFKA_SASL_PASSWORD

Credenciais para autenticação SASL no Kafka.

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
KAFKA_BROKERS=localhost:9094
KAFKA_CLIENT_ID=inventory-api
KAFKA_SSL=false
```

**Nota sobre Kafka:** A porta `9094` é a porta externa configurada no `docker-compose.yml` para acesso do host. A porta `9092` é usada apenas para comunicação interna entre containers Docker.

## Exemplo para Produção com Kafka Cloud (Upstash, Confluent, etc.)

```env
DATABASE_URL="postgresql://user:pass@neon.tech/db"
JWT_SECRET=super-strong-random-key-here
JWT_EXPIRES_IN=1d
PORT=3000
NODE_ENV=production

# Upstash Kafka
KAFKA_BROKERS=your-cluster.upstash.io:9092
KAFKA_CLIENT_ID=inventory-api-prod
KAFKA_SSL=true
KAFKA_SASL_MECHANISM=scram-sha-256
KAFKA_SASL_USERNAME=your-username
KAFKA_SASL_PASSWORD=your-password
```

## Tópicos Kafka Utilizados

A aplicação utiliza os seguintes tópicos Kafka:

| Tópico            | Descrição                                         |
| ----------------- | ------------------------------------------------- |
| `stock.movement`  | Todas as movimentações de estoque (entrada/saída) |
| `stock.low-alert` | Alertas de estoque baixo ou zerado                |
| `stock.transfer`  | Transferências de estoque entre armazéns          |
| `product.created` | Evento quando um produto é criado                 |
| `product.updated` | Evento quando um produto é atualizado             |

### Exemplos de Payloads

**stock.movement:**

```json
{
  "type": "IN",
  "productId": "uuid",
  "productSku": "PROD-001",
  "productName": "Produto X",
  "warehouseId": "uuid",
  "quantity": 10,
  "previousStock": 5,
  "newStock": 15,
  "userId": "uuid",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**stock.low-alert:**

```json
{
  "productId": "uuid",
  "productSku": "PROD-001",
  "productName": "Produto X",
  "warehouseId": "uuid",
  "warehouseName": "Armazém Central",
  "currentStock": 3,
  "minStock": 5,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
