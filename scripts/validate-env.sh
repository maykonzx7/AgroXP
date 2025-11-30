#!/bin/bash
# Script de Validação de Variáveis de Ambiente
# Uso: ./scripts/validate-env.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Validação de Variáveis de Ambiente${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Função para verificar variável
check_var() {
    local file=$1
    local var=$2
    local required=$3
    local description=$4
    
    if [ -f "$file" ]; then
        source "$file" 2>/dev/null || true
        value=$(eval echo \$$var)
        
        if [ -z "$value" ]; then
            if [ "$required" = "true" ]; then
                echo -e "${RED}❌ $var não configurado em $file${NC}"
                echo -e "   $description"
                ((ERRORS++))
            else
                echo -e "${YELLOW}⚠️  $var não configurado em $file (opcional)${NC}"
                ((WARNINGS++))
            fi
        else
            # Verificar valores inseguros
            case $var in
                POSTGRES_PASSWORD)
                    if [ "$value" = "postgres" ] || [ "$value" = "123456" ]; then
                        echo -e "${RED}❌ $var usa valor padrão inseguro em $file${NC}"
                        echo -e "   Configure uma senha segura!"
                        ((ERRORS++))
                    else
                        echo -e "${GREEN}✓ $var configurado${NC}"
                    fi
                    ;;
                JWT_SECRET|REFRESH_TOKEN_SECRET)
                    if [[ "$value" == *"change-in-production"* ]] || [[ "$value" == *"your-super-secret"* ]]; then
                        echo -e "${RED}❌ $var usa valor padrão em $file${NC}"
                        echo -e "   Gere um secret seguro: openssl rand -base64 32"
                        ((ERRORS++))
                    else
                        if [ ${#value} -lt 32 ]; then
                            echo -e "${YELLOW}⚠️  $var parece muito curto (recomendado: 32+ caracteres)${NC}"
                            ((WARNINGS++))
                        else
                            echo -e "${GREEN}✓ $var configurado${NC}"
                        fi
                    fi
                    ;;
                *)
                    echo -e "${GREEN}✓ $var configurado${NC}"
                    ;;
            esac
        fi
    else
        echo -e "${RED}❌ Arquivo $file não encontrado${NC}"
        ((ERRORS++))
    fi
}

# Verificar arquivos .env
echo -e "${YELLOW}Verificando arquivos .env...${NC}"
echo ""

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env não encontrado${NC}"
    if [ -f "backend/.env.example" ]; then
        echo -e "${YELLOW}   Execute: cp backend/.env.example backend/.env${NC}"
    fi
    ((ERRORS++))
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}❌ frontend/.env não encontrado${NC}"
    if [ -f "frontend/.env.example" ]; then
        echo -e "${YELLOW}   Execute: cp frontend/.env.example frontend/.env${NC}"
    fi
    ((ERRORS++))
fi

if [ ! -f "api-gateway/.env" ]; then
    echo -e "${RED}❌ api-gateway/.env não encontrado${NC}"
    if [ -f "api-gateway/.env.example" ]; then
        echo -e "${YELLOW}   Execute: cp api-gateway/.env.example api-gateway/.env${NC}"
    fi
    ((ERRORS++))
fi

echo ""

# Validar variáveis do backend
if [ -f "backend/.env" ]; then
    echo -e "${BLUE}Backend (.env):${NC}"
    check_var "backend/.env" "NODE_ENV" "false" "Ambiente de execução"
    check_var "backend/.env" "PORT" "false" "Porta do servidor"
    check_var "backend/.env" "DATABASE_URL" "true" "URL de conexão com PostgreSQL"
    check_var "backend/.env" "POSTGRES_PASSWORD" "true" "Senha do PostgreSQL (deve ser segura!)"
    check_var "backend/.env" "JWT_SECRET" "true" "Secret para JWT (gere com: openssl rand -base64 32)"
    check_var "backend/.env" "REFRESH_TOKEN_SECRET" "true" "Secret para refresh token (gere com: openssl rand -base64 32)"
    check_var "backend/.env" "FRONTEND_URL" "false" "URL do frontend"
    check_var "backend/.env" "ALLOWED_ORIGINS" "false" "Origens permitidas para CORS (separadas por vírgula)"
    echo ""
fi

# Validar variáveis do frontend
if [ -f "frontend/.env" ]; then
    echo -e "${BLUE}Frontend (.env):${NC}"
    check_var "frontend/.env" "VITE_API_BASE_URL" "true" "URL base da API"
    check_var "frontend/.env" "VITE_NODE_ENV" "false" "Ambiente de execução"
    echo ""
fi

# Validar variáveis do API Gateway
if [ -f "api-gateway/.env" ]; then
    echo -e "${BLUE}API Gateway (.env):${NC}"
    check_var "api-gateway/.env" "NODE_ENV" "false" "Ambiente de execução"
    check_var "api-gateway/.env" "PORT" "false" "Porta do servidor"
    check_var "api-gateway/.env" "BACKEND_URL" "true" "URL do backend"
    check_var "api-gateway/.env" "ALLOWED_ORIGINS" "false" "Origens permitidas para CORS"
    echo ""
fi

# Resumo
echo -e "${BLUE}========================================${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as validações passaram!${NC}"
    echo -e "${GREEN}   Sistema pronto para deploy${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Validação concluída com $WARNINGS aviso(s)${NC}"
    echo -e "${YELLOW}   Sistema pode ser deployado, mas recomenda-se corrigir os avisos${NC}"
    exit 0
else
    echo -e "${RED}❌ Validação falhou com $ERRORS erro(s) e $WARNINGS aviso(s)${NC}"
    echo -e "${RED}   Corrija os erros antes de fazer deploy${NC}"
    exit 1
fi

