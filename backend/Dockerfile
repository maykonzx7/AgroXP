FROM node:18

WORKDIR /app

COPY package*.json ./

# Install build tools and rebuild bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm ci --production=false && \
    npm rebuild bcrypt --build-from-source

# Generate Prisma Client
RUN npx prisma generate

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
