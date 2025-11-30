FROM node:18

WORKDIR /app

# Copiar arquivos de dependências primeiro (cache layer)
COPY package*.json ./
COPY prisma ./prisma/

# Install build tools and dependencies
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm ci --production=false && \
    npm rebuild bcrypt --build-from-source && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Generate Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Criar script de inicialização que executa migrations
RUN echo '#!/bin/sh\n\
set -e\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy || echo "Migration failed or already applied"\n\
echo "Starting server..."\n\
exec npm start\n\
' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

# Usar script de entrada que executa migrations antes de iniciar
ENTRYPOINT ["/app/docker-entrypoint.sh"]
