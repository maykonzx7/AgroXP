#!/bin/bash

# Script simplificado de validação de formulários

set -e

BASE_URL="http://localhost:3001/api"

echo "=========================================="
echo "Validação de Formulários - AgroXP"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Autenticação
echo "=== 1. AUTENTICAÇÃO ==="
echo "Criando/autenticando usuário..."

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
    }' 2>&1)

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$TOKEN" ]; then
    echo "Tentando login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "teste@agroxp.com",
            "password": "Teste@123"
        }' 2>&1)
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}ERRO: Não foi possível obter token${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Autenticado${NC}"
echo ""

# 2. Parcelas
echo "=== 2. PARCELAS ==="
FIELD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/parcels" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name": "Parcela Teste",
        "description": "Parcela para testes",
        "size": 10.5,
        "location": "Norte",
        "soilType": "Argiloso",
        "phLevel": 6.5
    }')

HTTP_CODE=$(echo "$FIELD_RESPONSE" | tail -n1)
BODY=$(echo "$FIELD_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Criar parcela: PASSOU (HTTP $HTTP_CODE)${NC}"
    FIELD_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "  ID: $FIELD_ID"
else
    echo -e "${RED}✗ Criar parcela: FALHOU (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Listar parcelas
LIST_FIELDS=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/parcels" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_FIELDS" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar parcelas: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar parcelas: FALHOU${NC}"
fi
echo ""

# 3. Culturas
echo "=== 3. CULTURAS ==="
if [ -n "$FIELD_ID" ]; then
    CROP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/crops" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "Soja",
            "variety": "BRS 284",
            "plantingDate": "2025-01-15T00:00:00Z",
            "expectedYield": 3500,
            "status": "PLANTED",
            "fieldId": "'"$FIELD_ID"'"
        }')
    
    HTTP_CODE=$(echo "$CROP_RESPONSE" | tail -n1)
    BODY=$(echo "$CROP_RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        echo -e "${GREEN}✓ Criar cultura: PASSOU (HTTP $HTTP_CODE)${NC}"
        CROP_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
        echo "  ID: $CROP_ID"
    else
        echo -e "${RED}✗ Criar cultura: FALHOU (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
    fi
else
    echo -e "${YELLOW}⚠ Pulando (sem FIELD_ID)${NC}"
fi

# Listar culturas
LIST_CROPS=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/crops" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_CROPS" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar culturas: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar culturas: FALHOU${NC}"
fi
echo ""

# 4. Colheitas
echo "=== 4. COLHEITAS ==="
HARVEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/harvest" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "crop": "Soja",
        "date": "2025-11-17T00:00:00Z",
        "yield": 3200,
        "expectedYield": 3500,
        "harvestArea": 10.5,
        "quality": "GOOD"
    }')

HTTP_CODE=$(echo "$HARVEST_RESPONSE" | tail -n1)
BODY=$(echo "$HARVEST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Criar colheita: PASSOU (HTTP $HTTP_CODE)${NC}"
    HARVEST_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "  ID: $HARVEST_ID"
else
    echo -e "${RED}✗ Criar colheita: FALHOU (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Listar colheitas
LIST_HARVEST=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/harvest" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_HARVEST" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar colheitas: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar colheitas: FALHOU${NC}"
fi
echo ""

# 5. Finanças
echo "=== 5. FINANÇAS ==="
FINANCE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "type": "INCOME",
        "category": "Venda de Grãos",
        "amount": 50000,
        "description": "Venda de soja",
        "date": "2025-11-17T00:00:00Z",
        "fieldId": "'"$FIELD_ID"'"
    }')

HTTP_CODE=$(echo "$FINANCE_RESPONSE" | tail -n1)
BODY=$(echo "$FINANCE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Criar transação: PASSOU (HTTP $HTTP_CODE)${NC}"
    FINANCE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "  ID: $FINANCE_ID"
else
    echo -e "${RED}✗ Criar transação: FALHOU (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Listar finanças
LIST_FINANCE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_FINANCE" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar finanças: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar finanças: FALHOU${NC}"
fi
echo ""

# 6. Inventário
echo "=== 6. INVENTÁRIO ==="
INVENTORY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "itemName": "Fertilizante NPK",
        "category": "Fertilizante",
        "quantity": 50,
        "unit": "sacos",
        "cost": 120.50,
        "supplier": "AgroSupply",
        "purchaseDate": "2025-11-17T00:00:00Z"
    }')

HTTP_CODE=$(echo "$INVENTORY_RESPONSE" | tail -n1)
BODY=$(echo "$INVENTORY_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Criar item: PASSOU (HTTP $HTTP_CODE)${NC}"
    INVENTORY_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "  ID: $INVENTORY_ID"
else
    echo -e "${RED}✗ Criar item: FALHOU (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Listar inventário
LIST_INVENTORY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/inventory" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_INVENTORY" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar inventário: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar inventário: FALHOU${NC}"
fi
echo ""

# 7. Pecuária
echo "=== 7. PECUÁRIA ==="
LIVESTOCK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/livestock" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name": "Gado Nelore",
        "breed": "Nelore",
        "quantity": 25,
        "age": 24,
        "weight": 450,
        "category": "BOVINO",
        "status": "ACTIVE",
        "fieldId": "'"$FIELD_ID"'"
    }')

HTTP_CODE=$(echo "$LIVESTOCK_RESPONSE" | tail -n1)
BODY=$(echo "$LIVESTOCK_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Criar gado: PASSOU (HTTP $HTTP_CODE)${NC}"
    LIVESTOCK_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "  ID: $LIVESTOCK_ID"
else
    echo -e "${RED}✗ Criar gado: FALHOU (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Listar pecuária
LIST_LIVESTOCK=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/livestock" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_LIVESTOCK" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar pecuária: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar pecuária: FALHOU${NC}"
fi
echo ""

# 8. Tarefas
echo "=== 8. TAREFAS ==="
TASK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "title": "Preparar solo",
        "description": "Aplicar calcário",
        "dueDate": "2025-11-20T00:00:00Z",
        "priority": "HIGH",
        "status": "TODO",
        "fieldId": "'"$FIELD_ID"'"
    }')

HTTP_CODE=$(echo "$TASK_RESPONSE" | tail -n1)
BODY=$(echo "$TASK_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Criar tarefa: PASSOU (HTTP $HTTP_CODE)${NC}"
    TASK_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "  ID: $TASK_ID"
else
    echo -e "${RED}✗ Criar tarefa: FALHOU (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Listar tarefas
LIST_TASKS=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/tasks" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_TASKS" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar tarefas: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar tarefas: FALHOU${NC}"
fi
echo ""

# 9. Alertas Meteorológicos
echo "=== 9. ALERTAS METEOROLÓGICOS ==="
WEATHER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/weather" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "type": "HEAVY_RAIN",
        "severity": "HIGH",
        "title": "Chuva Intensa",
        "description": "Previsão de chuvas intensas",
        "startDate": "2025-11-18T00:00:00Z",
        "endDate": "2025-11-21T00:00:00Z",
        "region": "Região Sul",
        "isActive": true
    }')

HTTP_CODE=$(echo "$WEATHER_RESPONSE" | tail -n1)
BODY=$(echo "$WEATHER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Criar alerta: PASSOU (HTTP $HTTP_CODE)${NC}"
    WEATHER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    echo "  ID: $WEATHER_ID"
else
    echo -e "${RED}✗ Criar alerta: FALHOU (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Listar alertas
LIST_WEATHER=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/weather" \
    -H "Authorization: Bearer $TOKEN")
LIST_CODE=$(echo "$LIST_WEATHER" | tail -n1)
if [ "$LIST_CODE" -ge 200 ] && [ "$LIST_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ Listar alertas: PASSOU${NC}"
else
    echo -e "${RED}✗ Listar alertas: FALHOU${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Validação concluída!${NC}"
echo "=========================================="

