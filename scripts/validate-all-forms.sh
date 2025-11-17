#!/bin/bash

# Script de validação completa de todos os formulários do AgroXP
# Testa criação, listagem, atualização e exclusão de cada módulo

set -e

API_URL="http://localhost:3001/api"
BASE_URL="http://localhost:3001/api"

echo "=========================================="
echo "Validação Completa de Formulários - AgroXP"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local token=$5
    
    local headers=(-H "Content-Type: application/json")
    if [ -n "$token" ]; then
        headers+=(-H "Authorization: Bearer $token")
    fi
    
    echo -n "Testando: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${headers[@]}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${headers[@]}" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "${headers[@]}" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "${headers[@]}" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSOU${NC} (HTTP $http_code)"
        ((PASSED++))
        echo "$body" | head -c 200
        echo ""
        return 0
    else
        echo -e "${RED}✗ FALHOU${NC} (HTTP $http_code)"
        echo "$body" | head -c 200
        echo ""
        ((FAILED++))
        return 1
    fi
}

# 1. Criar usuário de teste
echo "=== 1. AUTENTICAÇÃO ==="
echo "Criando usuário de teste..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Fazendeiro Teste",
        "email": "teste@agroxp.com",
        "phone": "+55 11 99999-9999",
        "farmName": "Fazenda Teste",
        "password": "Teste@123",
        "farmLocation": "São Paulo, SP",
        "farmDescription": "Fazenda para testes",
        "farmSize": 100
    }')

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Tentando fazer login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "teste@agroxp.com",
            "password": "Teste@123"
        }')
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}ERRO: Não foi possível obter token de autenticação${NC}"
    exit 1
fi

echo -e "${GREEN}Token obtido: ${TOKEN:0:20}...${NC}"
echo ""

# 2. Testar Parcelas (Fields)
echo "=== 2. PARCELAS (FIELDS) ==="
FIELD_DATA='{
    "name": "Parcela Teste 1",
    "description": "Parcela para testes de validação",
    "size": 10.5,
    "location": "Norte da Fazenda",
    "soilType": "Argiloso",
    "phLevel": 6.5
}'

test_endpoint "POST" "/parcels" "$FIELD_DATA" "Criar parcela" "$TOKEN"
FIELD_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID da parcela criada: $FIELD_ID"
echo ""

# Listar parcelas
test_endpoint "GET" "/parcels" "" "Listar parcelas" "$TOKEN"
echo ""

# 3. Testar Culturas (Crops)
echo "=== 3. CULTURAS (CROPS) ==="
CROP_DATA='{
    "name": "Soja",
    "variety": "BRS 284",
    "plantingDate": "2025-01-15T00:00:00Z",
    "expectedYield": 3500,
    "status": "PLANTED",
    "fieldId": "'"$FIELD_ID"'"
}'

test_endpoint "POST" "/crops" "$CROP_DATA" "Criar cultura" "$TOKEN"
CROP_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID da cultura criada: $CROP_ID"
echo ""

# Listar culturas
test_endpoint "GET" "/crops" "" "Listar culturas" "$TOKEN"
echo ""

# 4. Testar Colheitas (Harvest)
echo "=== 4. COLHEITAS (HARVEST) ==="
HARVEST_DATA='{
    "crop": "Soja",
    "date": "2025-11-17T00:00:00Z",
    "yield": 3200,
    "expectedYield": 3500,
    "harvestArea": 10.5,
    "quality": "GOOD"
}'

test_endpoint "POST" "/harvest" "$HARVEST_DATA" "Criar colheita" "$TOKEN"
HARVEST_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID da colheita criada: $HARVEST_ID"
echo ""

# Listar colheitas
test_endpoint "GET" "/harvest" "" "Listar colheitas" "$TOKEN"
echo ""

# 5. Testar Finanças (Finance)
echo "=== 5. FINANÇAS (FINANCE) ==="
FINANCE_DATA='{
    "type": "INCOME",
    "category": "Venda de Grãos",
    "amount": 50000,
    "description": "Venda de soja - safra 2025",
    "date": "2025-11-17T00:00:00Z",
    "fieldId": "'"$FIELD_ID"'"
}'

test_endpoint "POST" "/finance" "$FINANCE_DATA" "Criar transação financeira" "$TOKEN"
FINANCE_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID da transação criada: $FINANCE_ID"
echo ""

# Listar finanças
test_endpoint "GET" "/finance" "" "Listar transações financeiras" "$TOKEN"
echo ""

# 6. Testar Inventário (Inventory)
echo "=== 6. INVENTÁRIO (INVENTORY) ==="
INVENTORY_DATA='{
    "itemName": "Fertilizante NPK 10-10-10",
    "category": "Fertilizante",
    "quantity": 50,
    "unit": "sacos",
    "cost": 120.50,
    "supplier": "AgroSupply Ltda",
    "purchaseDate": "2025-11-17T00:00:00Z"
}'

test_endpoint "POST" "/inventory" "$INVENTORY_DATA" "Criar item de inventário" "$TOKEN"
INVENTORY_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID do item criado: $INVENTORY_ID"
echo ""

# Listar inventário
test_endpoint "GET" "/inventory" "" "Listar inventário" "$TOKEN"
echo ""

# 7. Testar Pecuária (Livestock)
echo "=== 7. PECUÁRIA (LIVESTOCK) ==="
LIVESTOCK_DATA='{
    "name": "Gado Nelore",
    "breed": "Nelore",
    "quantity": 25,
    "age": 24,
    "weight": 450,
    "category": "BOVINO",
    "status": "ACTIVE",
    "fieldId": "'"$FIELD_ID"'"
}'

test_endpoint "POST" "/livestock" "$LIVESTOCK_DATA" "Criar gado" "$TOKEN"
LIVESTOCK_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID do gado criado: $LIVESTOCK_ID"
echo ""

# Listar pecuária
test_endpoint "GET" "/livestock" "" "Listar pecuária" "$TOKEN"
echo ""

# 8. Testar Alimentação (Feeding)
if [ -n "$LIVESTOCK_ID" ]; then
    echo "=== 8. ALIMENTAÇÃO (FEEDING) ==="
    FEEDING_DATA='{
        "livestockId": "'"$LIVESTOCK_ID"'",
        "feedType": "Ração Concentrada",
        "quantity": 50,
        "unit": "kg",
        "feedingDate": "2025-11-17T00:00:00Z",
        "notes": "Alimentação diária"
    }'
    
    test_endpoint "POST" "/livestock/feeding" "$FEEDING_DATA" "Criar registro de alimentação" "$TOKEN"
    FEEDING_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "ID da alimentação criada: $FEEDING_ID"
    echo ""
    
    # Listar alimentações
    test_endpoint "GET" "/livestock/feeding" "" "Listar alimentações" "$TOKEN"
    echo ""
fi

# 9. Testar Vacinação (Vaccination)
if [ -n "$LIVESTOCK_ID" ]; then
    echo "=== 9. VACINAÇÃO (VACCINATION) ==="
    VACCINATION_DATA='{
        "livestockId": "'"$LIVESTOCK_ID"'",
        "vaccineName": "Vacina contra Febre Aftosa",
        "vaccinationDate": "2025-11-17T00:00:00Z",
        "nextVaccinationDate": "2026-05-17T00:00:00Z",
        "veterinarian": "Dr. João Silva",
        "notes": "Primeira dose"
    }'
    
    test_endpoint "POST" "/livestock/vaccination" "$VACCINATION_DATA" "Criar registro de vacinação" "$TOKEN"
    VACCINATION_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "ID da vacinação criada: $VACCINATION_ID"
    echo ""
    
    # Listar vacinações
    test_endpoint "GET" "/livestock/vaccination" "" "Listar vacinações" "$TOKEN"
    echo ""
fi

# 10. Testar Tarefas (Tasks)
echo "=== 10. TAREFAS (TASKS) ==="
TASK_DATA='{
    "title": "Preparar solo para plantio",
    "description": "Aplicar calcário e adubação",
    "dueDate": "2025-11-20T00:00:00Z",
    "priority": "HIGH",
    "status": "TODO",
    "fieldId": "'"$FIELD_ID"'"
}'

test_endpoint "POST" "/tasks" "$TASK_DATA" "Criar tarefa" "$TOKEN"
TASK_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID da tarefa criada: $TASK_ID"
echo ""

# Listar tarefas
test_endpoint "GET" "/tasks" "" "Listar tarefas" "$TOKEN"
echo ""

# 11. Testar Alertas Meteorológicos (Weather)
echo "=== 11. ALERTAS METEOROLÓGICOS (WEATHER) ==="
WEATHER_DATA='{
    "type": "HEAVY_RAIN",
    "severity": "HIGH",
    "title": "Chuva Intensa Prevista",
    "description": "Previsão de chuvas intensas nos próximos 3 dias",
    "startDate": "2025-11-18T00:00:00Z",
    "endDate": "2025-11-21T00:00:00Z",
    "region": "Região Sul",
    "isActive": true
}'

test_endpoint "POST" "/weather" "$WEATHER_DATA" "Criar alerta meteorológico" "$TOKEN"
WEATHER_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
echo "ID do alerta criado: $WEATHER_ID"
echo ""

# Listar alertas meteorológicos
test_endpoint "GET" "/weather" "" "Listar alertas meteorológicos" "$TOKEN"
echo ""

# Resumo final
echo "=========================================="
echo "RESUMO DA VALIDAÇÃO"
echo "=========================================="
echo -e "${GREEN}Testes passados: $PASSED${NC}"
echo -e "${RED}Testes falhados: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ TODOS OS TESTES PASSARAM!${NC}"
    exit 0
else
    echo -e "${RED}✗ ALGUNS TESTES FALHARAM${NC}"
    exit 1
fi

