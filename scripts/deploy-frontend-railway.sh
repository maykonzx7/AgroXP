#!/bin/bash
# Script de Deploy Automatizado do Frontend no Railway
# Este script automatiza a criação e configuração do serviço de frontend no Railway
#
# Uso: ./scripts/deploy-frontend-railway.sh [--project-id PROJECT_ID] [--backend-url BACKEND_URL]
#
# Exemplo:
#   ./scripts/deploy-frontend-railway.sh --project-id de9a981c-db86-45b4-9c4f-4b0f00276c19 --backend-url https://agroxp-production.up.railway.app

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variáveis padrão
PROJECT_ID=""
BACKEND_URL=""
SERVICE_NAME="agroxp-frontend"
ROOT_DIRECTORY="frontend"
BRANCH="main"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --project-id)
      PROJECT_ID="$2"
      shift 2
      ;;
    --backend-url)
      BACKEND_URL="$2"
      shift 2
      ;;
    --service-name)
      SERVICE_NAME="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --help)
      echo "Uso: $0 [OPÇÕES]"
      echo ""
      echo "Opções:"
      echo "  --project-id ID       ID do projeto Railway (obrigatório)"
      echo "  --backend-url URL     URL do backend (obrigatório, sem /api)"
      echo "  --service-name NAME   Nome do serviço (padrão: agroxp-frontend)"
      echo "  --branch BRANCH       Branch do GitHub (padrão: main)"
      echo "  --help                Mostra esta ajuda"
      echo ""
      echo "Exemplo:"
      echo "  $0 --project-id de9a981c-db86-45b4-9c4f-4b0f00276c19 --backend-url https://agroxp-production.up.railway.app"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Opção desconhecida: $1${NC}"
      echo "Use --help para ver as opções disponíveis"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deploy Automatizado do Frontend${NC}"
echo -e "${GREEN}  AgroXP - Railway${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Navegar para o diretório raiz
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Verificar pré-requisitos
echo -e "${YELLOW}[1/6] Verificando pré-requisitos...${NC}"

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI não encontrado!${NC}"
    echo ""
    echo -e "${YELLOW}Instale o Railway CLI com um dos comandos abaixo:${NC}"
    echo ""
    echo -e "${CYAN}# Via npm:${NC}"
    echo "npm i -g @railway/cli"
    echo ""
    echo -e "${CYAN}# Via Homebrew (macOS):${NC}"
    echo "brew install railway"
    echo ""
    echo -e "${CYAN}# Via script de instalação:${NC}"
    echo "curl -fsSL https://railway.app/install.sh | sh"
    echo ""
    echo -e "${YELLOW}Após instalar, execute:${NC}"
    echo "railway login"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI encontrado${NC}"

# Verificar se está logado
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Você não está logado no Railway!${NC}"
    echo ""
    echo -e "${YELLOW}Execute o comando abaixo para fazer login:${NC}"
    echo "railway login"
    exit 1
fi

echo -e "${GREEN}✓ Autenticado no Railway${NC}"

# Validar argumentos obrigatórios
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  Project ID não fornecido${NC}"
    echo ""
    echo -e "${CYAN}Listando seus projetos Railway...${NC}"
    railway projects
    echo ""
    read -p "Digite o ID do projeto Railway: " PROJECT_ID
fi

if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠️  Backend URL não fornecida${NC}"
    echo ""
    read -p "Digite a URL do backend (sem /api): " BACKEND_URL
fi

# Remover /api se fornecido
BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|/api$||')
BACKEND_API_URL="${BACKEND_URL}/api"

echo ""
echo -e "${BLUE}Configurações:${NC}"
echo -e "  Project ID: ${CYAN}$PROJECT_ID${NC}"
echo -e "  Service Name: ${CYAN}$SERVICE_NAME${NC}"
echo -e "  Root Directory: ${CYAN}$ROOT_DIRECTORY${NC}"
echo -e "  Branch: ${CYAN}$BRANCH${NC}"
echo -e "  Backend URL: ${CYAN}$BACKEND_URL${NC}"
echo -e "  Backend API URL: ${CYAN}$BACKEND_API_URL${NC}"
echo ""

read -p "Continuar com essas configurações? (s/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}Operação cancelada${NC}"
    exit 0
fi

# Verificar se o projeto existe e selecioná-lo
echo -e "${YELLOW}[2/6] Selecionando projeto Railway...${NC}"
if railway link "$PROJECT_ID" &> /dev/null; then
    echo -e "${GREEN}✓ Projeto selecionado${NC}"
else
    echo -e "${RED}❌ Erro ao selecionar projeto. Verifique se o ID está correto.${NC}"
    exit 1
fi

# Verificar se o serviço já existe
echo -e "${YELLOW}[3/6] Verificando serviço existente...${NC}"
SERVICE_EXISTS=false

# Listar serviços e verificar se existe
if railway service list 2>/dev/null | grep -q "$SERVICE_NAME"; then
    SERVICE_EXISTS=true
    echo -e "${GREEN}✓ Serviço '$SERVICE_NAME' já existe${NC}"
    read -p "Usar serviço existente? (S/n): " USE_EXISTING
    if [[ "$USE_EXISTING" =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}Operação cancelada. Renomeie o serviço existente ou use --service-name para outro nome.${NC}"
        exit 0
    fi
    
    # Vincular ao serviço existente
    railway service "$SERVICE_NAME" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Serviço existe mas não foi possível vincular. Continuando...${NC}"
    }
else
    echo -e "${YELLOW}⚠️  Serviço não encontrado. Será criado um novo.${NC}"
    echo -e "${CYAN}Nota: O Railway CLI não suporta criar serviços diretamente.${NC}"
    echo -e "${CYAN}Você precisará criar o serviço manualmente no dashboard do Railway.${NC}"
    echo ""
    echo -e "${YELLOW}Passos manuais necessários:${NC}"
    echo "  1. Acesse: https://railway.app/project/$PROJECT_ID"
    echo "  2. Clique em '+ New' → 'Empty Service'"
    echo "  3. Configure o nome como: $SERVICE_NAME"
    echo "  4. Depois execute este script novamente com --service-name $SERVICE_NAME"
    echo ""
    read -p "Já criou o serviço no dashboard? (s/N): " CREATED
    if [[ ! "$CREATED" =~ ^[SsYy]$ ]]; then
        echo -e "${YELLOW}Operação cancelada. Crie o serviço primeiro e execute o script novamente.${NC}"
        exit 0
    fi
fi

# Configurar Root Directory (via variável de ambiente ou arquivo railway.toml)
echo -e "${YELLOW}[4/6] Configurando Root Directory...${NC}"

# Criar/atualizar railway.toml se não existir
RAILWAY_TOML="$PROJECT_ROOT/railway.toml"
if [ ! -f "$RAILWAY_TOML" ]; then
    cat > "$RAILWAY_TOML" <<EOF
[build]
builder = "DOCKERFILE"

[deploy]
startCommand = ""

[[services]]
name = "$SERVICE_NAME"
source = "$ROOT_DIRECTORY"
EOF
    echo -e "${GREEN}✓ Criado railway.toml${NC}"
else
    echo -e "${YELLOW}⚠️  railway.toml já existe. Verifique se está configurado corretamente.${NC}"
fi

# Configurar variáveis de ambiente
echo -e "${YELLOW}[5/6] Configurando variáveis de ambiente...${NC}"

# Variável 1: VITE_API_BASE_URL
echo -e "${CYAN}  Configurando VITE_API_BASE_URL...${NC}"
if railway variables set VITE_API_BASE_URL="$BACKEND_API_URL" 2>/dev/null; then
    echo -e "${GREEN}  ✓ VITE_API_BASE_URL configurado${NC}"
else
    echo -e "${YELLOW}  ⚠️  Erro ao configurar VITE_API_BASE_URL. Configure manualmente no dashboard.${NC}"
fi

# Variável 2: VITE_NODE_ENV
echo -e "${CYAN}  Configurando VITE_NODE_ENV...${NC}"
if railway variables set VITE_NODE_ENV="production" 2>/dev/null; then
    echo -e "${GREEN}  ✓ VITE_NODE_ENV configurado${NC}"
else
    echo -e "${YELLOW}  ⚠️  Erro ao configurar VITE_NODE_ENV. Configure manualmente no dashboard.${NC}"
fi

# Verificar variáveis configuradas
echo ""
echo -e "${CYAN}Variáveis configuradas:${NC}"
railway variables 2>/dev/null | grep -E "VITE_" || echo -e "${YELLOW}  Nenhuma variável VITE_ encontrada${NC}"

# Fazer deploy
echo -e "${YELLOW}[6/6] Fazendo deploy...${NC}"

# Railway faz deploy automático quando conectado ao GitHub
# Mas podemos forçar um novo deploy
if railway up --detach 2>/dev/null; then
    echo -e "${GREEN}✓ Deploy iniciado${NC}"
else
    echo -e "${YELLOW}⚠️  Deploy não pôde ser iniciado automaticamente.${NC}"
    echo -e "${CYAN}O deploy acontecerá automaticamente no próximo push para o GitHub.${NC}"
fi

# Obter URL do domínio
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Configuração concluída!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${CYAN}Próximos passos:${NC}"
echo ""
echo "1. Gere um domínio no dashboard do Railway:"
echo "   https://railway.app/project/$PROJECT_ID/service/$SERVICE_NAME"
echo "   Settings → Networking → Generate Domain"
echo ""
echo "2. Após gerar o domínio, atualize ALLOWED_ORIGINS no backend:"
echo "   Adicione a URL do frontend na variável ALLOWED_ORIGINS do backend"
echo ""
echo "3. Verifique o deploy em:"
echo "   https://railway.app/project/$PROJECT_ID/service/$SERVICE_NAME/deployments"
echo ""

echo -e "${GREEN}Variáveis configuradas:${NC}"
echo "  • VITE_API_BASE_URL=$BACKEND_API_URL"
echo "  • VITE_NODE_ENV=production"
echo ""

echo -e "${YELLOW}⚠️  LEMBRETE:${NC}"
echo "  • Configure o Root Directory como '$ROOT_DIRECTORY' no dashboard"
echo "  • Gere um domínio para o frontend"
echo "  • Atualize ALLOWED_ORIGINS no backend com a URL do frontend"
echo ""

