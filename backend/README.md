# AgroXP Backend API

Esta é a documentação da API do backend do AgroXP, um sistema de gestão agrícola.

## Sumário

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints da API](#endpoints-da-api)
   - [Autenticação](#autenticação-1)
   - [Fazendas](#fazendas)
   - [Parcelas](#parcelas)
   - [Culturas](#culturas)
   - [Pecuária](#pecuária)
   - [Inventário](#inventário)
   - [Finanças](#finanças)
   - [Alimentação do Gado](#alimentação-do-gado)
   - [Vacinação do Gado](#vacinação-do-gado)
   - [Reprodução do Gado](#reprodução-do-gado)
   - [Suprimentos Veterinários](#suprimentos-veterinários)
   - [Uso de Suprimentos](#uso-de-suprimentos)
4. [Códigos de Status](#códigos-de-status)
5. [Tratamento de Erros](#tratamento-de-erros)

## Visão Geral

A API do AgroXP é uma RESTful API que permite gerenciar fazendas, culturas, pecuária, inventário e finanças. A API usa autenticação baseada em tokens para proteger os endpoints.

### URL Base

```
http://localhost:3001/api
```

## Rodando em desenvolvimento (rápido)

Se quiser subir rapidamente o backend em modo desenvolvimento sem que o processo trave em caso de mismatch de schema, use o script helper:

```bash
cd backend
./start-dev.sh
```

O script faz:

- Gera o Prisma Client se necessário (`npx prisma generate`).
- Executa `npm run dev` com `PORT=3002` e `SKIP_DB_SYNC=true` por padrão.

Você pode ajustar as variáveis antes de chamar o script:

```bash
PORT=3001 SKIP_DB_SYNC=false ./start-dev.sh
```

Obs: `SKIP_DB_SYNC=true` é uma medida temporária de desenvolvimento; o ideal é corrigir modelos e usar migrations em produção.

### Formato das Respostas

Todas as respostas da API são em formato JSON.

### Cabeçalhos Padrão

```
Content-Type: application/json
Authorization: Bearer <token>
```

## Autenticação

A maioria dos endpoints da API requer autenticação. Para autenticar, você precisa obter um token de acesso fazendo login.

### Registro de Usuário

**POST** `/auth/register`

Registra um novo usuário no sistema.

**Corpo da Requisição:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "farmName": "Nome da Fazenda",
  "phone": "(11) 99999-9999"
}
```

**Resposta de Sucesso:**

```json
{
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "farmName": "Nome da Fazenda",
    "phone": "(11) 99999-9999"
  },
  "token": "token_de_acesso"
}
```

### Login

**POST** `/auth/login`

Autentica um usuário e retorna um token de acesso.

**Corpo da Requisição:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**

```json
{
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "farmName": "Nome da Fazenda",
    "phone": "(11) 99999-9999"
  },
  "token": "token_de_acesso"
}
```

### Logout

**POST** `/auth/logout`

Invalida o token de acesso do usuário.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Logged out successfully"
}
```

### Usuário Atual

**GET** `/auth/me`

Obtém informações do usuário autenticado.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "farmName": "Nome da Fazenda",
  "phone": "(11) 99999-9999"
}
```

## Endpoints da API

### Fazendas

#### Listar Fazendas

**GET** `/farms`

Obtém todas as fazendas do usuário autenticado.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "name": "Fazenda Exemplo",
    "description": "Descrição da fazenda",
    "location": "São Paulo, Brasil",
    "size": 50.5,
    "sizeUnit": "hectares",
    "ownerId": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "owner": {
      "id": 1,
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com"
    },
    "parcels": []
  }
]
```

#### Obter Fazenda por ID

**GET** `/farms/:id`

Obtém uma fazenda específica pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "name": "Fazenda Exemplo",
  "description": "Descrição da fazenda",
  "location": "São Paulo, Brasil",
  "size": 50.5,
  "sizeUnit": "hectares",
  "ownerId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "owner": {
    "id": 1,
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com"
  },
  "parcels": [
    {
      "id": 1,
      "name": "Parcela Norte",
      "description": "Descrição da parcela",
      "size": 20.0,
      "sizeUnit": "hectares",
      "farmId": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "crops": [],
      "livestock": []
    }
  ]
}
```

#### Criar Fazenda

**POST** `/farms`

Cria uma nova fazenda.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Nova Fazenda",
  "description": "Descrição da fazenda",
  "location": "Localização da fazenda",
  "size": 30.0,
  "sizeUnit": "hectares",
  "ownerId": 1
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Nova Fazenda",
  "description": "Descrição da fazenda",
  "location": "Localização da fazenda",
  "size": 30.0,
  "sizeUnit": "hectares",
  "ownerId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Fazenda

**PUT** `/farms/:id`

Atualiza uma fazenda existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Fazenda Atualizada",
  "description": "Descrição atualizada",
  "location": "Nova localização",
  "size": 35.0,
  "sizeUnit": "hectares"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Fazenda Atualizada",
  "description": "Descrição atualizada",
  "location": "Nova localização",
  "size": 35.0,
  "sizeUnit": "hectares",
  "ownerId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Fazenda

**DELETE** `/farms/:id`

Remove uma fazenda existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Farm deleted successfully"
}
```

### Parcelas

#### Listar Parcelas

**GET** `/parcels`

Obtém todas as parcelas.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "name": "Parcela Norte",
    "size": 20.0,
    "location": "Norte da fazenda",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "crops": [],
    "livestocks": []
  }
]
```

#### Obter Parcela por ID

**GET** `/parcels/:id`

Obtém uma parcela específica pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "name": "Parcela Norte",
  "size": 20.0,
  "location": "Norte da fazenda",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "crops": [],
  "livestocks": []
}
```

#### Criar Parcela

**POST** `/parcels`

Cria uma nova parcela.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Nova Parcela",
  "size": 15.0,
  "location": "Localização da parcela"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Nova Parcela",
  "size": 15.0,
  "location": "Localização da parcela",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Parcela

**PUT** `/parcels/:id`

Atualiza uma parcela existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Parcela Atualizada",
  "size": 18.0,
  "location": "Nova localização"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Parcela Atualizada",
  "size": 18.0,
  "location": "Nova localização",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Parcela

**DELETE** `/parcels/:id`

Remove uma parcela existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Parcel deleted successfully"
}
```

### Culturas

#### Listar Culturas

**GET** `/crops`

Obtém todas as culturas.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "name": "Milho",
    "variety": "Milho Doce",
    "plantingDate": "2023-09-01T00:00:00.000Z",
    "harvestDate": "2023-12-01T00:00:00.000Z",
    "status": "growing",
    "parcelId": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Obter Cultura por ID

**GET** `/crops/:id`

Obtém uma cultura específica pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "name": "Milho",
  "variety": "Milho Doce",
  "plantingDate": "2023-09-01T00:00:00.000Z",
  "harvestDate": "2023-12-01T00:00:00.000Z",
  "status": "growing",
  "parcelId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Criar Cultura

**POST** `/crops`

Cria uma nova cultura.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Soja",
  "variety": "Soja BRS",
  "plantingDate": "2023-10-01T00:00:00.000Z",
  "status": "planted",
  "parcelId": 1
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Soja",
  "variety": "Soja BRS",
  "plantingDate": "2023-10-01T00:00:00.000Z",
  "status": "planted",
  "parcelId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Cultura

**PUT** `/crops/:id`

Atualiza uma cultura existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Soja",
  "variety": "Soja BRS 2023",
  "plantingDate": "2023-10-01T00:00:00.000Z",
  "harvestDate": "2024-02-01T00:00:00.000Z",
  "status": "growing",
  "parcelId": 1
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Soja",
  "variety": "Soja BRS 2023",
  "plantingDate": "2023-10-01T00:00:00.000Z",
  "harvestDate": "2024-02-01T00:00:00.000Z",
  "status": "growing",
  "parcelId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Cultura

**DELETE** `/crops/:id`

Remove uma cultura existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Crop deleted successfully"
}
```

### Pecuária

#### Listar Animais

**GET** `/livestock`

Obtém todos os animais.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "name": "Gado",
    "breed": "Angus",
    "quantity": 50,
    "age": 3,
    "weight": 600.5,
    "category": "bovino",
    "status": "ativo",
    "parcelId": 2,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Obter Animal por ID

**GET** `/livestock/:id`

Obtém um animal específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "name": "Gado",
  "breed": "Angus",
  "quantity": 50,
  "age": 3,
  "weight": 600.5,
  "category": "bovino",
  "status": "ativo",
  "parcelId": 2,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Criar Animal

**POST** `/livestock`

Cria um novo registro de animal.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Ovelhas",
  "breed": "Suffolk",
  "quantity": 30,
  "age": 2,
  "weight": 70.0,
  "category": "ovino",
  "status": "ativo",
  "parcelId": 2
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Ovelhas",
  "breed": "Suffolk",
  "quantity": 30,
  "age": 2,
  "weight": 70.0,
  "category": "ovino",
  "status": "ativo",
  "parcelId": 2,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Animal

**PUT** `/livestock/:id`

Atualiza um registro de animal existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Ovelhas",
  "breed": "Suffolk",
  "quantity": 35,
  "age": 2,
  "weight": 75.0,
  "category": "ovino",
  "status": "ativo",
  "parcelId": 2
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Ovelhas",
  "breed": "Suffolk",
  "quantity": 35,
  "age": 2,
  "weight": 75.0,
  "category": "ovino",
  "status": "ativo",
  "parcelId": 2,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Animal

**DELETE** `/livestock/:id`

Remove um registro de animal existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Livestock deleted successfully"
}
```

### Inventário

#### Listar Itens do Inventário

**GET** `/inventory`

Obtém todos os itens do inventário.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "itemName": "Fertilizante",
    "category": "Suprimentos",
    "quantity": 100,
    "unit": "kg",
    "cost": 500.0,
    "supplier": "AgroFertil",
    "purchaseDate": "2023-01-01T00:00:00.000Z",
    "expiryDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Obter Item do Inventário por ID

**GET** `/inventory/:id`

Obtém um item do inventário específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "itemName": "Fertilizante",
  "category": "Suprimentos",
  "quantity": 100,
  "unit": "kg",
  "cost": 500.0,
  "supplier": "AgroFertil",
  "purchaseDate": "2023-01-01T00:00:00.000Z",
  "expiryDate": "2024-01-01T00:00:00.000Z",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Criar Item do Inventário

**POST** `/inventory`

Cria um novo item no inventário.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "itemName": "Semente de Milho",
  "category": "Sementes",
  "quantity": 500,
  "unit": "kg",
  "cost": 1500.0,
  "supplier": "AgroSementes",
  "purchaseDate": "2023-01-01T00:00:00.000Z"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "itemName": "Semente de Milho",
  "category": "Sementes",
  "quantity": 500,
  "unit": "kg",
  "cost": 1500.0,
  "supplier": "AgroSementes",
  "purchaseDate": "2023-01-01T00:00:00.000Z",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Item do Inventário

**PUT** `/inventory/:id`

Atualiza um item do inventário existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "itemName": "Semente de Milho",
  "category": "Sementes",
  "quantity": 450,
  "unit": "kg",
  "cost": 1500.0,
  "supplier": "AgroSementes",
  "purchaseDate": "2023-01-01T00:00:00.000Z"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "itemName": "Semente de Milho",
  "category": "Sementes",
  "quantity": 450,
  "unit": "kg",
  "cost": 1500.0,
  "supplier": "AgroSementes",
  "purchaseDate": "2023-01-01T00:00:00.000Z",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Item do Inventário

**DELETE** `/inventory/:id`

Remove um item do inventário existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Inventory item deleted successfully"
}
```

### Finanças

#### Listar Registros Financeiros

**GET** `/finance`

Obtém todos os registros financeiros.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "type": "expense",
    "category": "Suprimentos",
    "amount": 500.0,
    "description": "Compra de fertilizante",
    "date": "2023-01-01T00:00:00.000Z",
    "parcelId": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Obter Registro Financeiro por ID

**GET** `/finance/:id`

Obtém um registro financeiro específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "type": "expense",
  "category": "Suprimentos",
  "amount": 500.0,
  "description": "Compra de fertilizante",
  "date": "2023-01-01T00:00:00.000Z",
  "parcelId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Criar Registro Financeiro

**POST** `/finance`

Cria um novo registro financeiro.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "type": "income",
  "category": "Venda de Produtos",
  "amount": 2000.0,
  "description": "Venda de milho",
  "date": "2023-01-01T00:00:00.000Z",
  "parcelId": 1
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "type": "income",
  "category": "Venda de Produtos",
  "amount": 2000.0,
  "description": "Venda de milho",
  "date": "2023-01-01T00:00:00.000Z",
  "parcelId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Registro Financeiro

**PUT** `/finance/:id`

Atualiza um registro financeiro existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "type": "income",
  "category": "Venda de Produtos",
  "amount": 2500.0,
  "description": "Venda de milho premium",
  "date": "2023-01-01T00:00:00.000Z",
  "parcelId": 1
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "type": "income",
  "category": "Venda de Produtos",
  "amount": 2500.0,
  "description": "Venda de milho premium",
  "date": "2023-01-01T00:00:00.000Z",
  "parcelId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Registro Financeiro

**DELETE** `/finance/:id`

Remove um registro financeiro existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Financial record deleted successfully"
}
```

### Alimentação do Gado

#### Listar Registros de Alimentação

**GET** `/livestock/feeding`

Obtém todos os registros de alimentação.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "feedType": "Ração",
    "quantity": 100.0,
    "unit": "kg",
    "feedingDate": "2023-01-01T00:00:00.000Z",
    "notes": "Alimentação matutina",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Registros de Alimentação por Animal

**GET** `/livestock/feeding/livestock/:livestockId`

Obtém todos os registros de alimentação para um animal específico.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "feedType": "Ração",
    "quantity": 100.0,
    "unit": "kg",
    "feedingDate": "2023-01-01T00:00:00.000Z",
    "notes": "Alimentação matutina",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Registro de Alimentação por ID

**GET** `/livestock/feeding/:id`

Obtém um registro de alimentação específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "livestockId": 1,
  "feedType": "Ração",
  "quantity": 100.0,
  "unit": "kg",
  "feedingDate": "2023-01-01T00:00:00.000Z",
  "notes": "Alimentação matutina",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "livestock": {
    "id": 1,
    "name": "Gado",
    "breed": "Angus",
    "quantity": 50,
    "category": "bovino",
    "status": "ativo",
    "parcelId": 2,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Registro de Alimentação

**POST** `/livestock/feeding`

Cria um novo registro de alimentação.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "feedType": "Silagem",
  "quantity": 150.0,
  "unit": "kg",
  "feedingDate": "2023-01-01T00:00:00.000Z",
  "notes": "Alimentação vespertina"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "feedType": "Silagem",
  "quantity": 150.0,
  "unit": "kg",
  "feedingDate": "2023-01-01T00:00:00.000Z",
  "notes": "Alimentação vespertina",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Registro de Alimentação

**PUT** `/livestock/feeding/:id`

Atualiza um registro de alimentação existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "feedType": "Silagem",
  "quantity": 160.0,
  "unit": "kg",
  "feedingDate": "2023-01-01T00:00:00.000Z",
  "notes": "Alimentação vespertina aumentada"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "feedType": "Silagem",
  "quantity": 160.0,
  "unit": "kg",
  "feedingDate": "2023-01-01T00:00:00.000Z",
  "notes": "Alimentação vespertina aumentada",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Registro de Alimentação

**DELETE** `/livestock/feeding/:id`

Remove um registro de alimentação existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Feeding record deleted successfully"
}
```

### Vacinação do Gado

#### Listar Registros de Vacinação

**GET** `/livestock/vaccination`

Obtém todos os registros de vacinação.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "vaccineName": "Vacina A",
    "vaccinationDate": "2023-01-01T00:00:00.000Z",
    "nextVaccinationDate": "2023-07-01T00:00:00.000Z",
    "veterinarian": "Dr. Silva",
    "notes": "Primeira dose",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Registros de Vacinação por Animal

**GET** `/livestock/vaccination/livestock/:livestockId`

Obtém todos os registros de vacinação para um animal específico.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "vaccineName": "Vacina A",
    "vaccinationDate": "2023-01-01T00:00:00.000Z",
    "nextVaccinationDate": "2023-07-01T00:00:00.000Z",
    "veterinarian": "Dr. Silva",
    "notes": "Primeira dose",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Registro de Vacinação por ID

**GET** `/livestock/vaccination/:id`

Obtém um registro de vacinação específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "livestockId": 1,
  "vaccineName": "Vacina A",
  "vaccinationDate": "2023-01-01T00:00:00.000Z",
  "nextVaccinationDate": "2023-07-01T00:00:00.000Z",
  "veterinarian": "Dr. Silva",
  "notes": "Primeira dose",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "livestock": {
    "id": 1,
    "name": "Gado",
    "breed": "Angus",
    "quantity": 50,
    "category": "bovino",
    "status": "ativo",
    "parcelId": 2,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Registro de Vacinação

**POST** `/livestock/vaccination`

Cria um novo registro de vacinação.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "vaccineName": "Vacina B",
  "vaccinationDate": "2023-01-01T00:00:00.000Z",
  "nextVaccinationDate": "2023-04-01T00:00:00.000Z",
  "veterinarian": "Dr. Souza",
  "notes": "Segunda dose"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "vaccineName": "Vacina B",
  "vaccinationDate": "2023-01-01T00:00:00.000Z",
  "nextVaccinationDate": "2023-04-01T00:00:00.000Z",
  "veterinarian": "Dr. Souza",
  "notes": "Segunda dose",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Registro de Vacinação

**PUT** `/livestock/vaccination/:id`

Atualiza um registro de vacinação existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "vaccineName": "Vacina B",
  "vaccinationDate": "2023-01-01T00:00:00.000Z",
  "nextVaccinationDate": "2023-04-05T00:00:00.000Z",
  "veterinarian": "Dr. Souza",
  "notes": "Segunda dose reagendada"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "vaccineName": "Vacina B",
  "vaccinationDate": "2023-01-01T00:00:00.000Z",
  "nextVaccinationDate": "2023-04-05T00:00:00.000Z",
  "veterinarian": "Dr. Souza",
  "notes": "Segunda dose reagendada",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Registro de Vacinação

**DELETE** `/livestock/vaccination/:id`

Remove um registro de vacinação existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Vaccination record deleted successfully"
}
```

### Reprodução do Gado

#### Listar Registros de Reprodução

**GET** `/livestock/reproduction`

Obtém todos os registros de reprodução.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "matingDate": "2023-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2023-10-01T00:00:00.000Z",
    "actualDeliveryDate": null,
    "offspringCount": null,
    "notes": "Cobertura natural",
    "status": "gestando",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Registros de Reprodução por Animal

**GET** `/livestock/reproduction/livestock/:livestockId`

Obtém todos os registros de reprodução para um animal específico.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "matingDate": "2023-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2023-10-01T00:00:00.000Z",
    "actualDeliveryDate": null,
    "offspringCount": null,
    "notes": "Cobertura natural",
    "status": "gestando",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Registro de Reprodução por ID

**GET** `/livestock/reproduction/:id`

Obtém um registro de reprodução específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "livestockId": 1,
  "matingDate": "2023-01-01T00:00:00.000Z",
  "expectedDeliveryDate": "2023-10-01T00:00:00.000Z",
  "actualDeliveryDate": null,
  "offspringCount": null,
  "notes": "Cobertura natural",
  "status": "gestando",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "livestock": {
    "id": 1,
    "name": "Gado",
    "breed": "Angus",
    "quantity": 50,
    "category": "bovino",
    "status": "ativo",
    "parcelId": 2,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Registro de Reprodução

**POST** `/livestock/reproduction`

Cria um novo registro de reprodução.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "matingDate": "2023-01-01T00:00:00.000Z",
  "expectedDeliveryDate": "2023-10-01T00:00:00.000Z",
  "notes": "Inseminação artificial",
  "status": "gestando"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "matingDate": "2023-01-01T00:00:00.000Z",
  "expectedDeliveryDate": "2023-10-01T00:00:00.000Z",
  "actualDeliveryDate": null,
  "offspringCount": null,
  "notes": "Inseminação artificial",
  "status": "gestando",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Registro de Reprodução

**PUT** `/livestock/reproduction/:id`

Atualiza um registro de reprodução existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "matingDate": "2023-01-01T00:00:00.000Z",
  "expectedDeliveryDate": "2023-10-05T00:00:00.000Z",
  "actualDeliveryDate": "2023-10-03T00:00:00.000Z",
  "offspringCount": 1,
  "notes": "Inseminação artificial - parto normal",
  "status": "pariu"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "matingDate": "2023-01-01T00:00:00.000Z",
  "expectedDeliveryDate": "2023-10-05T00:00:00.000Z",
  "actualDeliveryDate": "2023-10-03T00:00:00.000Z",
  "offspringCount": 1,
  "notes": "Inseminação artificial - parto normal",
  "status": "pariu",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Registro de Reprodução

**DELETE** `/livestock/reproduction/:id`

Remove um registro de reprodução existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Reproduction record deleted successfully"
}
```

### Suprimentos Veterinários

#### Listar Suprimentos Veterinários

**GET** `/livestock/supplies`

Obtém todos os suprimentos veterinários.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "name": "Vacina A",
    "description": "Vacina para prevenção de doenças",
    "quantity": 50.0,
    "unit": "doses",
    "supplier": "Lab Veterinário",
    "expirationDate": "2024-01-01T00:00:00.000Z",
    "batchNumber": "VA2023001",
    "category": "vacina",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Obter Suprimento Veterinário por ID

**GET** `/livestock/supplies/:id`

Obtém um suprimento veterinário específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "name": "Vacina A",
  "description": "Vacina para prevenção de doenças",
  "quantity": 50.0,
  "unit": "doses",
  "supplier": "Lab Veterinário",
  "expirationDate": "2024-01-01T00:00:00.000Z",
  "batchNumber": "VA2023001",
  "category": "vacina",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Criar Suprimento Veterinário

**POST** `/livestock/supplies`

Cria um novo suprimento veterinário.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Antibiótico B",
  "description": "Antibiótico para tratamento de infecções",
  "quantity": 30.0,
  "unit": "frascos",
  "supplier": "Farmacêutica XYZ",
  "expirationDate": "2024-06-01T00:00:00.000Z",
  "batchNumber": "AB2023002",
  "category": "medicamento"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Antibiótico B",
  "description": "Antibiótico para tratamento de infecções",
  "quantity": 30.0,
  "unit": "frascos",
  "supplier": "Farmacêutica XYZ",
  "expirationDate": "2024-06-01T00:00:00.000Z",
  "batchNumber": "AB2023002",
  "category": "medicamento",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Suprimento Veterinário

**PUT** `/livestock/supplies/:id`

Atualiza um suprimento veterinário existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "name": "Antibiótico B",
  "description": "Antibiótico para tratamento de infecções respiratórias",
  "quantity": 25.0,
  "unit": "frascos",
  "supplier": "Farmacêutica XYZ",
  "expirationDate": "2024-06-01T00:00:00.000Z",
  "batchNumber": "AB2023002",
  "category": "medicamento"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "name": "Antibiótico B",
  "description": "Antibiótico para tratamento de infecções respiratórias",
  "quantity": 25.0,
  "unit": "frascos",
  "supplier": "Farmacêutica XYZ",
  "expirationDate": "2024-06-01T00:00:00.000Z",
  "batchNumber": "AB2023002",
  "category": "medicamento",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Suprimento Veterinário

**DELETE** `/livestock/supplies/:id`

Remove um suprimento veterinário existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Veterinary supply deleted successfully"
}
```

### Uso de Suprimentos

#### Listar Usos de Suprimentos

**GET** `/livestock/supply-usage`

Obtém todos os usos de suprimentos.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "supplyId": 1,
    "quantityUsed": 5.0,
    "unit": "doses",
    "usageDate": "2023-01-01T00:00:00.000Z",
    "notes": "Vacinação de rebanho",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "supply": {
      "id": 1,
      "name": "Vacina A",
      "description": "Vacina para prevenção de doenças",
      "quantity": 50.0,
      "unit": "doses",
      "supplier": "Lab Veterinário",
      "expirationDate": "2024-01-01T00:00:00.000Z",
      "batchNumber": "VA2023001",
      "category": "vacina",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Usos de Suprimentos por Animal

**GET** `/livestock/supply-usage/livestock/:livestockId`

Obtém todos os usos de suprimentos para um animal específico.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "supplyId": 1,
    "quantityUsed": 5.0,
    "unit": "doses",
    "usageDate": "2023-01-01T00:00:00.000Z",
    "notes": "Vacinação de rebanho",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "supply": {
      "id": 1,
      "name": "Vacina A",
      "description": "Vacina para prevenção de doenças",
      "quantity": 50.0,
      "unit": "doses",
      "supplier": "Lab Veterinário",
      "expirationDate": "2024-01-01T00:00:00.000Z",
      "batchNumber": "VA2023001",
      "category": "vacina",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Usos de Suprimentos por Suprimento

**GET** `/livestock/supply-usage/supply/:supplyId`

Obtém todos os usos de um suprimento específico.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
[
  {
    "id": 1,
    "livestockId": 1,
    "supplyId": 1,
    "quantityUsed": 5.0,
    "unit": "doses",
    "usageDate": "2023-01-01T00:00:00.000Z",
    "notes": "Vacinação de rebanho",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "livestock": {
      "id": 1,
      "name": "Gado",
      "breed": "Angus",
      "quantity": 50,
      "category": "bovino",
      "status": "ativo",
      "parcelId": 2,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "supply": {
      "id": 1,
      "name": "Vacina A",
      "description": "Vacina para prevenção de doenças",
      "quantity": 50.0,
      "unit": "doses",
      "supplier": "Lab Veterinário",
      "expirationDate": "2024-01-01T00:00:00.000Z",
      "batchNumber": "VA2023001",
      "category": "vacina",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
]
```

#### Obter Uso de Suprimento por ID

**GET** `/livestock/supply-usage/:id`

Obtém um uso de suprimento específico pelo ID.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "id": 1,
  "livestockId": 1,
  "supplyId": 1,
  "quantityUsed": 5.0,
  "unit": "doses",
  "usageDate": "2023-01-01T00:00:00.000Z",
  "notes": "Vacinação de rebanho",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "livestock": {
    "id": 1,
    "name": "Gado",
    "breed": "Angus",
    "quantity": 50,
    "category": "bovino",
    "status": "ativo",
    "parcelId": 2,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "supply": {
    "id": 1,
    "name": "Vacina A",
    "description": "Vacina para prevenção de doenças",
    "quantity": 50.0,
    "unit": "doses",
    "supplier": "Lab Veterinário",
    "expirationDate": "2024-01-01T00:00:00.000Z",
    "batchNumber": "VA2023001",
    "category": "vacina",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Uso de Suprimento

**POST** `/livestock/supply-usage`

Cria um novo uso de suprimento.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "supplyId": 1,
  "quantityUsed": 3.0,
  "unit": "doses",
  "usageDate": "2023-01-01T00:00:00.000Z",
  "notes": "Vacinação de novos animais"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "supplyId": 1,
  "quantityUsed": 3.0,
  "unit": "doses",
  "usageDate": "2023-01-01T00:00:00.000Z",
  "notes": "Vacinação de novos animais",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Atualizar Uso de Suprimento

**PUT** `/livestock/supply-usage/:id`

Atualiza um uso de suprimento existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Corpo da Requisição:**

```json
{
  "livestockId": 1,
  "supplyId": 1,
  "quantityUsed": 4.0,
  "unit": "doses",
  "usageDate": "2023-01-01T00:00:00.000Z",
  "notes": "Vacinação de novos animais - dose adicional"
}
```

**Resposta de Sucesso:**

```json
{
  "id": 2,
  "livestockId": 1,
  "supplyId": 1,
  "quantityUsed": 4.0,
  "unit": "doses",
  "usageDate": "2023-01-01T00:00:00.000Z",
  "notes": "Vacinação de novos animais - dose adicional",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Deletar Uso de Suprimento

**DELETE** `/livestock/supply-usage/:id`

Remove um uso de suprimento existente.

**Cabeçalhos:**

```
Authorization: Bearer <token>
```

**Resposta de Sucesso:**

```json
{
  "message": "Supply usage record deleted successfully"
}
```

## Códigos de Status

A API retorna os seguintes códigos de status HTTP:

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `204 No Content` - Requisição bem-sucedida, sem conteúdo para retornar
- `400 Bad Request` - Requisição inválida
- `401 Unauthorized` - Não autorizado (token inválido ou ausente)
- `403 Forbidden` - Acesso proibido (usuário não tem permissão)
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro interno do servidor

## Tratamento de Erros

Todos os erros da API retornam um objeto JSON com uma mensagem de erro:

```json
{
  "error": "Mensagem de erro descritiva"
}
```

Exemplos de erros comuns:

- `{"error": "Authentication required"}` - Token não fornecido
- `{"error": "Invalid or expired session"}` - Token inválido ou expirado
- `{"error": "Farm not found"}` - Fazenda não encontrada
- `{"error": "Access denied: You do not have permission to access this farm"}` - Permissão negada
- `{"error": "Internal server error"}` - Erro interno do servidor
