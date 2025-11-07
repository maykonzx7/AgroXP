#!/bin/bash
# check-services.sh
# Script para verificar e iniciar serviços do AgroXP

# Verifica se o PostgreSQL está rodando localmente
echo "🔍 Verificando se o PostgreSQL está rodando localmente..."

if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL está rodando localmente na porta 5432"
else
    echo "❌ PostgreSQL não está acessível localmente"
    echo "💡 Certifique-se de que o PostgreSQL está instalado e rodando:"
    echo "   - Ubuntu/Debian: sudo systemctl start postgresql"
    echo "   - CentOS/RHEL: sudo systemctl start postgresql"
    echo "   - macOS (Homebrew): brew services start postgresql"
    echo "   - Ou inicie o docker-compose com permissões adequadas"
    exit 1
fi

# Teste de conexão com credenciais do .env
echo "🔐 Testando conexão com o banco de dados..."
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d agroxp_db -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conexão com o banco de dados bem-sucedida"
else
    echo "❌ Falha na conexão com o banco de dados"
    echo "💡 Verifique as credenciais no arquivo .env"
    echo "   Certifique-se de que o banco de dados 'agroxp_db' existe"
    echo "   Execute: createdb agroxp_db (para criar o banco de dados)"
    exit 1
fi

echo "✅ Todos os serviços necessários estão disponíveis!"