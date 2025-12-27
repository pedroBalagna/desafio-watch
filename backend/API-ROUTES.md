# 📦 API de Gerenciamento de Estoque - Rotas

## Autenticação

Todas as rotas (exceto login e registro) requerem autenticação JWT.

```
Authorization: Bearer <token>
```

---

## 🔐 Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Registrar novo usuário |
| POST | `/auth/login` | Fazer login e obter token JWT |
| GET | `/auth/profile` | Obter perfil do usuário autenticado |

---

## 👥 Users

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users` | Listar todos os usuários |
| GET | `/users/:id` | Obter usuário por ID |
| POST | `/users` | Criar novo usuário |
| PATCH | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Remover usuário |

---

## 📁 Categories

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/categories` | Listar categorias |
| GET | `/categories/:id` | Obter categoria por ID |
| POST | `/categories` | Criar nova categoria |
| PATCH | `/categories/:id` | Atualizar categoria |
| DELETE | `/categories/:id` | Remover categoria |

**Query Params:**
- `includeInactive=true` - Incluir categorias inativas

---

## 🏭 Suppliers

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/suppliers` | Listar fornecedores |
| GET | `/suppliers/:id` | Obter fornecedor por ID |
| POST | `/suppliers` | Criar novo fornecedor |
| PATCH | `/suppliers/:id` | Atualizar fornecedor |
| DELETE | `/suppliers/:id` | Remover fornecedor |

**Query Params:**
- `includeInactive=true` - Incluir fornecedores inativos

---

## 📦 Products

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/products` | Listar produtos com filtros e paginação |
| GET | `/products/low-stock` | Listar produtos com estoque baixo/zerado |
| GET | `/products/sku/:sku` | Buscar produto por SKU |
| GET | `/products/barcode/:barcode` | Buscar produto por código de barras |
| GET | `/products/:id` | Obter produto por ID |
| POST | `/products` | Criar novo produto |
| PATCH | `/products/:id` | Atualizar produto |
| DELETE | `/products/:id` | Remover/desativar produto |

**Query Params para GET /products:**
- `search` - Busca por nome, SKU ou código de barras
- `categoryId` - Filtrar por categoria
- `supplierId` - Filtrar por fornecedor
- `includeInactive=true` - Incluir produtos inativos
- `stockStatus` - Filtrar por status: `all`, `low`, `out`, `normal`
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 20)

---

## 🏢 Warehouses

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/warehouses` | Listar armazéns |
| GET | `/warehouses/:id` | Obter armazém por ID |
| GET | `/warehouses/:id/inventory` | Obter inventário do armazém |
| POST | `/warehouses` | Criar novo armazém |
| PATCH | `/warehouses/:id` | Atualizar armazém |
| DELETE | `/warehouses/:id` | Remover/desativar armazém |

**Query Params:**
- `includeInactive=true` - Incluir armazéns inativos

---

## 📊 Stock (Movimentações)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/stock/dashboard` | Dashboard com resumo de estoque |
| GET | `/stock/movements` | Listar movimentações com filtros |
| GET | `/stock/movements/:id` | Obter detalhes de uma movimentação |
| POST | `/stock/movement` | Registrar movimentação (entrada/saída) |
| POST | `/stock/transfer` | Transferir estoque entre armazéns |
| POST | `/stock/adjust` | Ajustar estoque (inventário) |

**Query Params para GET /stock/movements:**
- `productId` - Filtrar por produto
- `warehouseId` - Filtrar por armazém
- `type` - Tipo: `IN`, `OUT`, `ADJUST`, `TRANSFER`, `RETURN`, `DAMAGE`
- `startDate` - Data inicial (YYYY-MM-DD)
- `endDate` - Data final (YYYY-MM-DD)
- `page` - Número da página
- `limit` - Itens por página

### Tipos de Movimentação

| Tipo | Descrição |
|------|-----------|
| `IN` | Entrada de estoque (compra, recebimento) |
| `OUT` | Saída de estoque (venda, consumo) |
| `ADJUST` | Ajuste de inventário |
| `TRANSFER` | Transferência entre armazéns |
| `RETURN` | Devolução de mercadoria |
| `DAMAGE` | Avaria ou perda |

---

## 🔌 Kafka

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/kafka/status` | Verificar status da conexão Kafka |

---

## 📝 Exemplos de Requisições

### Criar Produto

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "name": "Produto Exemplo",
    "description": "Descrição do produto",
    "barcode": "7891234567890",
    "unitPrice": 99.99,
    "costPrice": 79.99,
    "minStock": 10,
    "maxStock": 100,
    "currentStock": 50,
    "categoryId": "uuid-da-categoria",
    "supplierId": "uuid-do-fornecedor"
  }'
```

### Registrar Entrada de Estoque

```bash
curl -X POST http://localhost:3000/stock/movement \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "IN",
    "productId": "uuid-do-produto",
    "warehouseId": "uuid-do-armazem",
    "quantity": 50,
    "unitPrice": 79.99,
    "reference": "NF-12345",
    "notes": "Entrada de mercadoria"
  }'
```

### Transferir Estoque

```bash
curl -X POST http://localhost:3000/stock/transfer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-do-produto",
    "fromWarehouseId": "uuid-origem",
    "toWarehouseId": "uuid-destino",
    "quantity": 10,
    "reference": "TRANSF-001",
    "notes": "Transferência para reposição"
  }'
```

### Ajustar Estoque (Inventário)

```bash
curl -X POST http://localhost:3000/stock/adjust \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-do-produto",
    "warehouseId": "uuid-do-armazem",
    "newQuantity": 45,
    "reason": "Inventário físico - divergência identificada",
    "reference": "INV-2024-001"
  }'
```

---

## 🔄 Eventos Kafka

A API publica os seguintes eventos:

| Tópico | Descrição | Trigger |
|--------|-----------|---------|
| `stock.movement` | Todas as movimentações | POST /stock/movement |
| `stock.low-alert` | Alertas de estoque baixo | Quando estoque <= minStock |
| `stock.transfer` | Transferências | POST /stock/transfer |
| `product.created` | Produto criado | POST /products |
| `product.updated` | Produto atualizado | PATCH /products/:id |

---

## 📚 Swagger/OpenAPI

A documentação interativa está disponível em:

```
http://localhost:3000/api/docs
```

