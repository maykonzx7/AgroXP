#!/bin/bash
# scripts/start-user-service.sh

echo "🚀 Iniciando User Service..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor instale o Docker."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor instale o Docker Compose."
    exit 1
fi

# Navegar para o diretório do serviço
cd /home/maycolaz/AgroXP/services/user-service

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Construir o serviço
echo "🔨 Construindo serviço..."
npm run build

# Voltar para o diretório principal
cd /home/maycolaz/AgroXP

# Iniciar com Docker Compose
echo "▶️ Iniciando serviço com Docker Compose..."
docker-compose up -d postgres redis

# Aguardar banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 10

# Iniciar o serviço
echo "サービ Iniciando User Service..."
npm run dev &

echo "✅ User Service iniciado com sucesso!"
echo "🌐 Acesse em: http://localhost:3001"