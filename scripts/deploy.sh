#!/bin/bash
# Script de Deploy Automatizado para AgroXP
# Uso: ./scripts/deploy.sh [--skip-backup] [--skip-migrations]

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Flags
SKIP_BACKUP=false
SKIP_MIGRATIONS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      shift
      ;;
    *)
      echo -e "${RED}Opção desconhecida: $1${NC}"
      echo "Uso: $0 [--skip-backup] [--skip-migrations]"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AgroXP - Script de Deploy${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Navegar para o diretório raiz
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Verificar pré-requisitos
echo -e "${YELLOW}[1/7] Verificando pré-requisitos...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Por favor instale o Docker.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado. Por favor instale o Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker e Docker Compose encontrados${NC}"

# Verificar arquivos .env
echo -e "${YELLOW}[2/7] Verificando arquivos de configuração...${NC}"

MISSING_ENV=false

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env não encontrado${NC}"
    if [ -f "backend/.env.example" ]; then
        echo -e "${YELLOW}   Copiando backend/.env.example para backend/.env${NC}"
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}   ⚠️  ATENÇÃO: Configure backend/.env com valores de produção!${NC}"
    else
        MISSING_ENV=true
    fi
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}❌ frontend/.env não encontrado${NC}"
    if [ -f "frontend/.env.example" ]; then
        echo -e "${YELLOW}   Copiando frontend/.env.example para frontend/.env${NC}"
        cp frontend/.env.example frontend/.env
        echo -e "${YELLOW}   ⚠️  ATENÇÃO: Configure frontend/.env com valores de produção!${NC}"
    else
        MISSING_ENV=true
    fi
fi

if [ ! -f "api-gateway/.env" ]; then
    echo -e "${RED}❌ api-gateway/.env não encontrado${NC}"
    if [ -f "api-gateway/.env.example" ]; then
        echo -e "${YELLOW}   Copiando api-gateway/.env.example para api-gateway/.env${NC}"
        cp api-gateway/.env.example api-gateway/.env
        echo -e "${YELLOW}   ⚠️  ATENÇÃO: Configure api-gateway/.env com valores de produção!${NC}"
    else
        MISSING_ENV=true
    fi
fi

if [ "$MISSING_ENV" = true ]; then
    echo -e "${RED}❌ Arquivos .env.example não encontrados. Crie-os primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Arquivos de configuração verificados${NC}"

# Verificar variáveis críticas
echo -e "${YELLOW}[3/7] Verificando variáveis de ambiente críticas...${NC}"

source backend/.env 2>/dev/null || true

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "postgres" ]; then
    echo -e "${RED}❌ POSTGRES_PASSWORD não configurado ou usando valor padrão inseguro!${NC}"
    echo -e "${YELLOW}   Configure uma senha segura em backend/.env${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [[ "$JWT_SECRET" == *"change-in-production"* ]]; then
    echo -e "${RED}❌ JWT_SECRET não configurado ou usando valor padrão!${NC}"
    echo -e "${YELLOW}   Configure um secret seguro em backend/.env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Variáveis críticas verificadas${NC}"

# Backup do banco de dados
if [ "$SKIP_BACKUP" = false ]; then
    echo -e "${YELLOW}[4/7] Fazendo backup do banco de dados...${NC}"
    
    if [ -f "scripts/backup-local.sh" ]; then
        ./scripts/backup-local.sh
        echo -e "${GREEN}✓ Backup concluído${NC}"
    else
        echo -e "${YELLOW}⚠️  Script de backup não encontrado, pulando...${NC}"
    fi
else
    echo -e "${YELLOW}[4/7] Backup pulado (--skip-backup)${NC}"
fi

# Build das imagens
echo -e "${YELLOW}[5/7] Construindo imagens Docker...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Imagens construídas${NC}"

# Parar containers existentes
echo -e "${YELLOW}[6/7] Parando containers existentes...${NC}"
docker-compose down
echo -e "${GREEN}✓ Containers parados${NC}"

# Iniciar serviços
echo -e "${YELLOW}[7/7] Iniciando serviços...${NC}"

# Iniciar PostgreSQL primeiro
docker-compose up -d postgres

# Aguardar PostgreSQL estar pronto
echo -e "${YELLOW}   Aguardando PostgreSQL estar pronto...${NC}"
sleep 10

# Executar migrations se não foi pulado
if [ "$SKIP_MIGRATIONS" = false ]; then
    echo -e "${YELLOW}   Executando migrations...${NC}"
    docker-compose run --rm backend npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migrations falharam ou já foram aplicadas${NC}"
else
    echo -e "${YELLOW}   Migrations puladas (--skip-migrations)${NC}"
fi

# Iniciar todos os serviços
docker-compose up -d

echo -e "${GREEN}✓ Serviços iniciados${NC}"

# Aguardar serviços estarem prontos
echo -e "${YELLOW}   Aguardando serviços estarem prontos...${NC}"
sleep 15

# Verificar saúde dos serviços
echo ""
echo -e "${YELLOW}Verificando saúde dos serviços...${NC}"

check_health() {
    local service=$1
    local url=$2
    local name=$3
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name está saudável${NC}"
        return 0
    else
        echo -e "${RED}❌ $name não está respondendo${NC}"
        return 1
    fi
}

HEALTH_CHECK_FAILED=false

check_health "backend" "http://localhost:3001/health" "Backend" || HEALTH_CHECK_FAILED=true
check_health "api-gateway" "http://localhost:3000/health" "API Gateway" || HEALTH_CHECK_FAILED=true
check_health "frontend" "http://localhost:5173/health" "Frontend" || HEALTH_CHECK_FAILED=true

echo ""
echo -e "${GREEN}========================================${NC}"
if [ "$HEALTH_CHECK_FAILED" = true ]; then
    echo -e "${YELLOW}⚠️  Deploy concluído com avisos${NC}"
    echo -e "${YELLOW}   Alguns serviços podem não estar prontos ainda${NC}"
    echo -e "${YELLOW}   Verifique os logs: docker-compose logs${NC}"
else
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
fi
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Serviços disponíveis:"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🔌 API Gateway: http://localhost:3000"
echo "  ⚙️  Backend: http://localhost:3001"
echo ""
echo "Comandos úteis:"
echo "  📋 Ver logs: docker-compose logs -f"
echo "  📊 Status: docker-compose ps"
echo "  🛑 Parar: docker-compose down"
echo ""

