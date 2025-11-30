#!/bin/bash
# Script de Preparação para Deploy
# Cria arquivos .env a partir dos exemplos e valida configuração
# Uso: ./scripts/prepare-deploy.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Preparação para Deploy - AgroXP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Navegar para o diretório raiz
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Criar arquivos .env a partir dos exemplos
echo -e "${YELLOW}[1/3] Criando arquivos .env a partir dos exemplos...${NC}"

create_env_file() {
    local service=$1
    local example_file="$service/.env.example"
    local env_file="$service/.env"
    
    if [ ! -f "$env_file" ]; then
        if [ -f "$example_file" ]; then
            cp "$example_file" "$env_file"
            echo -e "${GREEN}✓ Criado $env_file${NC}"
            echo -e "${YELLOW}   ⚠️  Configure os valores em $env_file antes do deploy!${NC}"
        else
            echo -e "${RED}❌ $example_file não encontrado${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  $env_file já existe, pulando...${NC}"
    fi
}

create_env_file "backend" || exit 1
create_env_file "frontend" || exit 1
create_env_file "api-gateway" || exit 1

echo ""

# Gerar secrets se necessário
echo -e "${YELLOW}[2/3] Verificando secrets...${NC}"

generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32 | tr -d '\n'
    else
        # Fallback: usar /dev/urandom
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
    fi
}

if [ -f "backend/.env" ]; then
    source backend/.env 2>/dev/null || true
    
    if [ -z "$JWT_SECRET" ] || [[ "$JWT_SECRET" == *"change-in-production"* ]]; then
        NEW_SECRET=$(generate_secret)
        echo -e "${YELLOW}   Gerando JWT_SECRET...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$NEW_SECRET|" backend/.env
        else
            # Linux
            sed -i "s|JWT_SECRET=.*|JWT_SECRET=$NEW_SECRET|" backend/.env
        fi
        echo -e "${GREEN}✓ JWT_SECRET gerado e configurado${NC}"
    fi
    
    if [ -z "$REFRESH_TOKEN_SECRET" ] || [[ "$REFRESH_TOKEN_SECRET" == *"change-in-production"* ]]; then
        NEW_SECRET=$(generate_secret)
        echo -e "${YELLOW}   Gerando REFRESH_TOKEN_SECRET...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=$NEW_SECRET|" backend/.env
        else
            # Linux
            sed -i "s|REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=$NEW_SECRET|" backend/.env
        fi
        echo -e "${GREEN}✓ REFRESH_TOKEN_SECRET gerado e configurado${NC}"
    fi
fi

echo ""

# Validar configuração
echo -e "${YELLOW}[3/3] Validando configuração...${NC}"
echo ""

if [ -f "scripts/validate-env.sh" ]; then
    ./scripts/validate-env.sh
    VALIDATION_EXIT=$?
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
    if [ $VALIDATION_EXIT -eq 0 ]; then
        echo -e "${GREEN}✅ Preparação concluída!${NC}"
        echo ""
        echo "Próximos passos:"
        echo "  1. Revise e configure os arquivos .env com valores de produção"
        echo "  2. Configure URLs e domínios apropriados"
        echo "  3. Execute: ./scripts/deploy.sh"
    else
        echo -e "${YELLOW}⚠️  Preparação concluída com avisos${NC}"
        echo ""
        echo "Revise os avisos acima e configure os arquivos .env antes de fazer deploy"
    fi
else
    echo -e "${YELLOW}⚠️  Script de validação não encontrado${NC}"
    echo -e "${GREEN}✓ Arquivos .env criados${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Configure os arquivos .env com valores de produção"
    echo "  2. Execute: ./scripts/validate-env.sh para validar"
    echo "  3. Execute: ./scripts/deploy.sh para fazer deploy"
fi

