#!/bin/bash
# stop-dev.sh


echo "⏹️  Parando ambiente de desenvolvimento AgroXP..."

# Navegar para o diretório raiz
cd /home/maycolaz/AgroXP

# Parar todos os containers Docker em execução
if docker-compose ps | grep -q "Up"; then
    echo "⏹️  Parando containers Docker..."
    docker-compose down
else
    echo "ℹ️  Nenhum container Docker em execução"
fi

# Parar processos Node.js em execução
echo "⏹️  Parando processos Node.js..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

echo "✅ Ambiente de desenvolvimento parado!"
