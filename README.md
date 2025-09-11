# AgroXP - Agricultural Management System

## Stack Utilizada: PERN

Este projeto utiliza a stack PERN:

- **PostgreSQL**: Banco de dados relacional
- **Express.js**: Framework para API Node.js
- **React**: Interface do usuário
- **Node.js**: Ambiente de execução do backend

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

1. **Frontend** - Aplicação React com Vite
2. **Backend** - API Node.js/Express com PostgreSQL

## Frontend

O frontend é construído com React, TypeScript e Vite. Principais tecnologias:

- React para componentes de UI
- React Router para navegação
- Tailwind CSS para estilização
- ShadCN UI para componentes
- React Query para requisições

### Como iniciar

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173 para visualizar o frontend.

## Backend

O backend utiliza Node.js, Express e PostgreSQL, fornecendo uma API RESTful para o frontend.

### Como iniciar

```bash
cd backend
npm install
npm run dev
```

A API estará disponível em http://localhost:3001

## Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com sua string de conexão do PostgreSQL:

```
POSTGRES_URI=postgres://usuario:senha@localhost:5432/agroxp
PORT=3001
```

No frontend, defina a URL base da API em um arquivo `.env`:

```
VITE_API_BASE_URL=http://localhost:3001/api
```
