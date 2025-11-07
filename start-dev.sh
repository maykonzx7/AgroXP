#!/bin/bash
# start-dev.sh

echo "🚀 Iniciando ambiente de desenvolvimento AgroXP..."

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

# Navegar para o diretório raiz
cd /home/maycolaz/AgroXP

# Verificar se o banco de dados já está em execução
if docker-compose ps | grep -q "postgres.*Up"; then
    echo "⚠️  Banco de dados já está em execução"
else
    echo "🚀 Iniciando banco de dados e serviços..."
    docker-compose up -d postgres redis
    echo "⏳ Aguardando inicialização do banco de dados..."
    sleep 15
fi

# Iniciar todos os serviços em segundo plano
echo "🚀 Iniciando serviços..."
npm run dev &

# Aguardar alguns segundos para os serviços iniciarem
sleep 5

echo "✅ Ambiente de desenvolvimento iniciado!"
echo "🌐 Frontend: http://localhost:5173"
echo "📊 Admin Dashboard: http://localhost:5174"
echo "🗄️  Banco de dados: localhost:5432"
echo ""
echo "Para parar o ambiente, execute: ./stop-dev.sh"