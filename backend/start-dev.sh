#!/usr/bin/env bash
# Script para iniciar o backend em desenvolvimento (use bash/zsh)
# Garante cwd, gera prisma client e executa nodemon com variáveis de ambiente corretas
set -euo pipefail
cd "$(dirname "$0")"

# Gerar prisma client se necessário
if [ ! -d "src/generated/prisma" ]; then
  echo "Gerando Prisma Client..."
  npx prisma generate
fi

# Porta e flags padrão
PORT=${PORT:-3002}
export PORT
export SKIP_DB_SYNC=${SKIP_DB_SYNC:-true}

echo "Iniciando backend em dev: PORT=$PORT SKIP_DB_SYNC=$SKIP_DB_SYNC"

# Executa nodemon (usa package.json dev script internamente)
npm run dev
