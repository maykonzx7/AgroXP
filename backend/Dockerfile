FROM node:18

WORKDIR /app

# Copiar arquivos de dependências primeiro (cache layer)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install build tools and dependencies
RUN apt-get update && apt-get install -y python3 make g++ && \
    (npm ci --production=false || npm install --production=false) && \
    npm rebuild bcrypt --build-from-source && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Generate Prisma Client (use dummy DATABASE_URL during build - not needed for generation)
# Prisma generate doesn't need a real connection, just validates the schema
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copiar código fonte
COPY . .

# Criar script de inicialização que executa migrations
RUN cat > /app/docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e
echo "Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "================================================"
  echo "ERROR: DATABASE_URL environment variable is not set!"
  echo "================================================"
  echo ""
  echo "To fix this, configure DATABASE_URL in Railway:"
  echo ""
  echo "QUICK FIX - Try this first (most common):"
  echo "   Name: DATABASE_URL"
  echo "   Value: Postgres.DATABASE_URL (wrap with dollar and double braces)"
  echo ""
  echo "STEP BY STEP:"
  echo "1. Go to Railway dashboard: https://railway.app"
  echo "2. Open your project and find the BACKEND service"
  echo "3. Click 'Variables' tab"
  echo "4. Add variable:"
  echo "   Name: DATABASE_URL"
  echo "   Value: Try one of these (in order):"
  echo "     - Postgres.DATABASE_URL (most common)"
  echo "     - PostgreSQL.DATABASE_URL"
  echo "     - postgres.DATABASE_URL"
  echo ""
  echo "   Format: dollar-sign + double-open-brace + ServiceName + .DATABASE_URL + double-close-brace"
  echo ""
  echo "⚠️  To find the exact service name:"
  echo "   1. In Railway dashboard, look at your services list"
  echo "   2. Find the PostgreSQL service (has database icon)"
  echo "   3. Note the EXACT name shown on the service card"
  echo "   4. Use that name (case-sensitive!)"
  echo ""
  echo "📖 Full guide: docs/COMO_DESCOBRIR_NOME_POSTGRES.md"
  echo "================================================"
  exit 1
fi
echo "✅ DATABASE_URL is configured (hidden for security)"
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or already applied"
echo "Starting server..."
exec npm start
EOF
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

# Usar script de entrada que executa migrations antes de iniciar
ENTRYPOINT ["/app/docker-entrypoint.sh"]
