#!/bin/bash
# scripts/start-all-services.sh

echo "🚀 Iniciando todos os serviços AgroXP..."

# Navegar para o diretório raiz
cd /home/maycolaz/AgroXP

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

# Iniciar infraestrutura (banco de dados, redis)
echo "🚀 Iniciando infraestrutura..."
docker-compose up -d postgres redis

# Aguardar infraestrutura estar pronta
echo "⏳ Aguardando infraestrutura..."
sleep 15

# Iniciar serviços individuais
echo "🚀 Iniciando microsserviços..."
docker-compose up -d user-service farm-service parcel-service livestock-service

# Iniciar gateway API
echo "🚀 Iniciando API Gateway..."
docker-compose up -d api-gateway

# Iniciar dashboards
echo "🚀 Iniciando dashboards..."
docker-compose up -d admin-dashboard

echo "✅ Todos os serviços iniciados com sucesso!"
echo ""
echo "Serviços disponíveis:"
echo "🌐 API Gateway: http://localhost:3000"
echo "👤 User Service: http://localhost:3001"
echo "🚜 Farm Service: http://localhost:3002"
echo "🗺️  Parcel Service: http://localhost:3003"
echo "🐄 Livestock Service: http://localhost:3004"
echo "📊 Admin Dashboard: http://localhost:5174"
echo ""
echo "Para parar todos os serviços, execute: ./stop-dev.sh"