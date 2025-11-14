FROM node:18

WORKDIR /app

COPY package*.json ./

# Install build tools and rebuild bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm install --production=false && \
    npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
