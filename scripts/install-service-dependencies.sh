#!/bin/bash
# install-service-dependencies.sh
# Script para instalar dependências em todos os serviços

echo "📦 Instalando dependências para os novos microsserviços..."

# Instalar dependências para o serviço de culturas
echo "📦 Instalando dependências para crop-service..."
cd /home/maycolaz/AgroXP/services/crop-service
npm install

# Instalar dependências para o serviço de inventário
echo "📦 Instalando dependências para inventory-service..."
cd /home/maycolaz/AgroXP/services/inventory-service
npm install

# Instalar dependências para o serviço financeiro
echo "📦 Instalando dependências para finance-service..."
cd /home/maycolaz/AgroXP/services/finance-service
npm install

# Instalar dependências para o serviço administrativo
echo "📦 Instalando dependências para admin-service..."
cd /home/maycolaz/AgroXP/services/admin-service
npm install

echo "✅ Todas as dependências dos microsserviços foram instaladas com sucesso!"