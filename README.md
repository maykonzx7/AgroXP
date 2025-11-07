# AgroXP - Agricultural Management System

## Stack Utilizada: PERN

Este projeto utiliza a stack PERN:

- **PostgreSQL**: Banco de dados relacional
- **Express.js**: Framework para API Node.js
- **React**: Interface do usuário
- **Node.js**: Ambiente de execução do backend

## Estrutura do Projeto

O projeto está dividido em três partes principais:

1. **Frontend** - Aplicação React com Vite
2. **Backend** - API Node.js/Express com PostgreSQL
3. **API Gateway** - Proxy reverso em Node.js/Express

## Execução Local

### Com Docker (Recomendado)

1. **Instale Docker e Docker Compose** se ainda não tiver:
   - Docker: https://docs.docker.com/get-docker/
   - Docker Compose: https://docs.docker.com/compose/install/

2. **Copie os arquivos de exemplo para suas configurações**:
   ```bash
   # Para o frontend
   cd frontend && cp .env.example .env && cd ..
   
   # Para o backend
   cd backend && cp .env.example .env && cd ..
   
   # Para o api-gateway
   cd api-gateway && cp .env.example .env && cd ..
   ```

3. **Atualize as variáveis de ambiente** nos arquivos `.env` conforme necessário.

4. **Execute o sistema completo**:
   ```bash
   docker-compose up --build
   ```

5. **Acesse as aplicações**:
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:3000
   - Backend: http://localhost:3001
   - Banco de dados PostgreSQL: localhost:5432

### Sem Docker

1. **Pré-requisitos**:
   - Node.js (v18 ou superior)
   - PostgreSQL (v15 ou superior)
   - npm ou yarn

2. **Configure o banco de dados PostgreSQL**:
   - Instale e inicie o PostgreSQL
   - Crie um banco de dados chamado `agroxp`
   - Configure o usuário e senha conforme as variáveis de ambiente

3. **Copie os arquivos de exemplo para suas configurações**:
   ```bash
   # Para o frontend
   cd frontend && cp .env.example .env && cd ..
   
   # Para o backend
   cd backend && cp .env.example .env && cd ..
   
   # Para o api-gateway
   cd api-gateway && cp .env.example .env && cd ..
   ```

4. **Atualize as variáveis de ambiente** nos arquivos `.env` conforme necessário.

5. **Inicie os serviços na seguinte ordem**:

   **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev  # ou npm start para produção
   ```
   O backend estará disponível em http://localhost:3001

   **API Gateway**:
   ```bash
   cd api-gateway
   npm install
   npm run dev  # ou npm start para produção
   ```
   O gateway estará disponível em http://localhost:3000

   **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   O frontend estará disponível em http://localhost:5173

6. **Para executar testes** (se disponíveis):
   ```bash
   # No backend
   cd backend && npm test
   
   # No frontend
   cd frontend && npm test
   ```

## Portas Utilizadas

- **Frontend (Vite)**: 5173
- **API Gateway**: 3000
- **Backend**: 3001
- **PostgreSQL**: 5432
- **Adminer (opcional)**: 8080

### Documentação da API

Para informações detalhadas sobre os endpoints da API, consulte a [documentação completa da API](backend/README.md).

## Backup e Recuperação

O sistema inclui um sistema de backup local automático:

### Backup Automático

```bash
# Executar backup manual
./scripts/backup-local.sh

# Configurar backup automático via cron (diário às 2h da manhã)
0 2 * * * /home/maycolaz/AgroXP/scripts/backup-local.sh
```

### Recuperação de Backup

```bash
# Listar backups disponíveis
./scripts/restore-backup.sh -l

# Restaurar backup completo
./scripts/restore-backup.sh backup_completo.sql.gz

# Restaurar schema específico
./scripts/restore-backup.sh -s users backup_users.sql.gz
```

Por padrão, os backups são armazenados em `/home/maycolaz/AgroXP/backups` e mantém histórico dos últimos 30 dias.

## Variáveis de Ambiente

Cada módulo do projeto tem seu próprio arquivo `.env` com variáveis específicas:

### Frontend
Localizado em `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_NODE_ENV=development
```

### Backend
Localizado em `backend/.env`:
```
PORT=3001
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=agroxp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here
REFRESH_TOKEN_EXPIRES_IN=7d
```

### API Gateway
Localizado em `api-gateway/.env`:
```
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## Serviços Adicionais (Opcional)

Para facilitar o desenvolvimento, você pode adicionar um serviço Adminer ao docker-compose.yml para gerenciar o banco de dados:

```yaml
  adminer:
    image: adminer
    ports:
      - 8080:8080
    depends_on:
      - postgres
    environment:
      ADMINER_DEFAULT_DB_HOST: postgres
      ADMINER_DEFAULT_DB_NAME: agroxp
    networks:
      - agro-network
```

## Troubleshooting

- Se encontrar problemas com permissões no Docker, tente executar o comando com `sudo`
- Se o backend não conseguir se conectar ao PostgreSQL, verifique se as variáveis de ambiente estão corretas e se o serviço do PostgreSQL está saudável
- Se o frontend não carregar, verifique se o API Gateway e o Backend estão em execução e acessíveis
