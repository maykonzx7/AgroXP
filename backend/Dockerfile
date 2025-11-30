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
RUN echo '#!/bin/sh\n\
set -e\n\
echo "Checking DATABASE_URL..."\n\
if [ -z "$DATABASE_URL" ]; then\n\
  echo "================================================"\n\
  echo "ERROR: DATABASE_URL environment variable is not set!"\n\
  echo "================================================"\n\
  echo ""\n\
  echo "To fix this, configure DATABASE_URL in Railway:"\n\
  echo "1. Go to your backend service in Railway dashboard"\n\
  echo "2. Click on \"Variables\" tab"\n\
  echo "3. Add new variable:"\n\
  echo "   Name: DATABASE_URL"\n\
  echo "   Value: ${{Postgres.DATABASE_URL}}"\n\
  echo ""\n\
  echo "⚠️  IMPORTANT: Replace \"Postgres\" with your actual PostgreSQL service name!"\n\
  echo "   Common names: Postgres, PostgreSQL, postgres"\n\
  echo "   The name is case-sensitive!"\n\
  echo ""\n\
  echo "To find your PostgreSQL service name:"\n\
  echo "1. Go to Railway dashboard"\n\
  echo "2. Look at your services list"\n\
  echo "3. Find the PostgreSQL service and note its exact name"\n\
  echo "4. Use that name in: ${{YourServiceName.DATABASE_URL}}"\n\
  echo "================================================"\n\
  exit 1\n\
fi\n\
echo "✅ DATABASE_URL is configured (hidden for security)"\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy || echo "Migration failed or already applied"\n\
echo "Starting server..."\n\
exec npm start\n\
' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

# Usar script de entrada que executa migrations antes de iniciar
ENTRYPOINT ["/app/docker-entrypoint.sh"]
