# Guia de Teste - OpenTelemetry com Jaeger

## 1. Verificar se o Jaeger está rodando

```bash
# Verificar se o container está rodando
docker ps | grep jaeger

# Ou verificar diretamente
curl http://localhost:16686
```

## 2. Verificar logs da aplicação

Procure por estas mensagens nos logs da sua API:

```
OpenTelemetry inicializado - Enviando traces e métricas para: http://localhost:4318
```

Se você não ver essa mensagem, verifique:

- A variável `ENABLE_TELEMETRY` está definida como `true`?
- O endpoint `OTLP_ENDPOINT` está correto?

## 3. Fazer requisições à API

### Teste 1: Endpoint público (Swagger)

```bash
curl http://localhost:3000/api/docs
```

### Teste 2: Endpoint de autenticação

```bash
# Registrar usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "name": "Usuário Teste",
    "password": "senha123"
  }'

# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### Teste 3: Endpoint protegido (após login)

```bash
# Substitua <TOKEN> pelo token retornado no login
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <TOKEN>"
```

## 4. Verificar traces no Jaeger UI

1. Abra o navegador e acesse: **http://localhost:16686**

2. No menu lateral, selecione:
   - **Service**: `desafio-watch-backend` (ou o valor de `SERVICE_NAME`)
   - **Operation**: Deixe em branco ou selecione uma operação específica
   - **Lookback**: Últimas 15 minutos (ou o período desejado)

3. Clique em **Find Traces**

4. Você deve ver traces aparecendo para cada requisição feita à API

## 5. Verificar detalhes de um trace

1. Clique em um trace na lista
2. Você verá:
   - **Timeline**: Tempo de cada operação
   - **Tags**: Informações sobre a requisição (HTTP method, status code, etc.)
   - **Logs**: Logs correlacionados com o trace
   - **Spans**: Operações individuais (HTTP request, database query, etc.)

## 6. Verificar se há erros

Se não aparecerem traces:

1. **Verifique os logs da aplicação**:

   ```bash
   # Se estiver rodando com pnpm
   # Os logs devem mostrar erros de conexão com o Jaeger
   ```

2. **Verifique a conectividade**:

   ```bash
   # Testar se o endpoint OTLP está acessível
   curl -X POST http://localhost:4318/v1/traces \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

3. **Verifique variáveis de ambiente**:
   ```bash
   # No terminal onde a API está rodando
   echo $ENABLE_TELEMETRY
   echo $OTLP_ENDPOINT
   echo $SERVICE_NAME
   ```

## 7. Teste rápido com script

Crie um arquivo `test-api.sh`:

```bash
#!/bin/bash

echo "=== Testando OpenTelemetry ==="
echo ""

echo "1. Testando endpoint público..."
curl -s http://localhost:3000/api/docs > /dev/null
echo "✓ Requisição enviada"

echo ""
echo "2. Aguardando 2 segundos para traces serem enviados..."
sleep 2

echo ""
echo "3. Verifique o Jaeger UI em: http://localhost:16686"
echo "   - Service: desafio-watch-backend"
echo "   - Lookback: Last 15 minutes"
```

Execute:

```bash
chmod +x test-api.sh
./test-api.sh
```

## Troubleshooting

### Problema: Nenhum trace aparece no Jaeger

**Soluções:**

1. Verifique se `ENABLE_TELEMETRY=true` está definido
2. Verifique se o endpoint está correto: `OTLP_ENDPOINT=http://localhost:4318`
3. Verifique se o container do Jaeger está rodando: `docker ps | grep jaeger`
4. Verifique os logs da aplicação para erros de conexão

### Problema: Erro de conexão com Jaeger

**Soluções:**

1. Verifique se o Jaeger está acessível: `curl http://localhost:16686`
2. Verifique se a porta 4318 está aberta
3. Se estiver usando Docker, verifique se a rede está configurada corretamente

### Problema: Traces aparecem mas sem detalhes

**Soluções:**

1. Verifique se as instrumentações estão registradas corretamente
2. Verifique se o `FastifyOtelInstrumentation` está sendo usado
3. Verifique os logs para ver se há erros de instrumentação
