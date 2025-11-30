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
  echo "1. Go to your backend service in Railway dashboard"
  echo "2. Click on 'Variables' tab"
  echo "3. Add new variable:"
  echo "   Name: DATABASE_URL"
  echo "   Value: Use Railway service reference format"
  echo "   Examples (try these in order):"
  echo "   1. Postgres.DATABASE_URL"
  echo "   2. PostgreSQL.DATABASE_URL"
  echo "   3. postgres.DATABASE_URL"
  echo ""
  echo "   Note: Wrap with dollar sign and double curly braces"
  echo "   Example format: dollar-sign + double-open-brace + ServiceName + .DATABASE_URL + double-close-brace"
  echo ""
  echo "⚠️  IMPORTANT: The service name is case-sensitive!"
  echo "   To find your PostgreSQL service name:"
  echo "   1. Go to Railway dashboard"
  echo "   2. Look at your services list"
  echo "   3. Find the PostgreSQL service and note its exact name"
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
