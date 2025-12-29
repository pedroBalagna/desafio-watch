# Script de teste para OpenTelemetry com Jaeger

Write-Host "=== Testando OpenTelemetry ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se o Jaeger esta acessivel
Write-Host "1. Verificando se o Jaeger esta acessivel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:16686" -UseBasicParsing -TimeoutSec 5
    Write-Host "   OK - Jaeger UI esta acessivel em http://localhost:16686" -ForegroundColor Green
} catch {
    Write-Host "   ERRO - Jaeger UI nao esta acessivel. Verifique se o container esta rodando." -ForegroundColor Red
    Write-Host "   Execute: docker ps | Select-String jaeger" -ForegroundColor Yellow
}

Write-Host ""

# 2. Verificar endpoint OTLP
Write-Host "2. Verificando endpoint OTLP..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4318/v1/traces" -Method POST -ContentType "application/json" -Body "{}" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "   OK - Endpoint OTLP esta acessivel" -ForegroundColor Green
} catch {
    Write-Host "   AVISO - Endpoint OTLP pode nao estar respondendo" -ForegroundColor Yellow
}

Write-Host ""

# 3. Fazer requisicoes a API
Write-Host "3. Fazendo requisicoes a API para gerar traces..." -ForegroundColor Yellow

# Teste 1: Swagger docs
Write-Host "   - Testando GET /api/docs..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/docs" -UseBasicParsing -TimeoutSec 5
    Write-Host "     OK - Requisicao enviada - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "     ERRO - Falha na requisicao: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Teste 2: Root endpoint
Write-Host "   - Testando GET / ..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "     OK - Requisicao enviada" -ForegroundColor Green
} catch {
    Write-Host "     AVISO - Endpoint root pode nao existir" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Teste 3: Endpoint de autenticacao
Write-Host "   - Testando POST /auth/register..." -ForegroundColor Gray
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = "{`"email`":`"teste-telemetry-$timestamp@example.com`",`"name`":`"Usuario Teste`",`"password`":`"senha123`"}"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/auth/register" -Method POST -ContentType "application/json" -Body $registerBody -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "     OK - Requisicao enviada - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "     AVISO - Erro ao registrar: email pode estar duplicado" -ForegroundColor Yellow
}

Write-Host ""

# 4. Aguardar traces
Write-Host "4. Aguardando 3 segundos para traces serem enviados ao Jaeger..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""

# 5. Instrucoes finais
Write-Host "=== Proximos passos ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abra o navegador e acesse: http://localhost:16686" -ForegroundColor White
Write-Host ""
Write-Host "2. No Jaeger UI:" -ForegroundColor White
Write-Host "   - Service: desafio-watch-backend" -ForegroundColor Gray
Write-Host "   - Operation: deixe em branco" -ForegroundColor Gray
Write-Host "   - Lookback: Last 15 minutes" -ForegroundColor Gray
Write-Host "   - Clique em Find Traces" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Voce deve ver traces para cada requisicao feita acima" -ForegroundColor White
Write-Host ""
Write-Host "4. Clique em um trace para ver detalhes:" -ForegroundColor White
Write-Host "   - Timeline com duracao de cada operacao" -ForegroundColor Gray
Write-Host "   - Tags com informacoes HTTP" -ForegroundColor Gray
Write-Host "   - Spans para cada operacao" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Verificacao de logs ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifique os logs da sua aplicacao. Voce deve ver:" -ForegroundColor White
Write-Host "  OpenTelemetry inicializado - Enviando traces e metricas para: http://localhost:4318" -ForegroundColor Gray
Write-Host ""
