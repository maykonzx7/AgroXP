# AgroXP Backend with Prisma ORM

This is the backend implementation for AgroXP using Prisma ORM with PostgreSQL.

## Prerequisites

1. PostgreSQL database (version 12 or higher)
2. Node.js (version 16 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your PostgreSQL database:
   - Install PostgreSQL on your system or use a cloud service
   - Create a database named `agroxp`
   - Update the `.env` file with your database credentials

3. Run the initial migration:
```bash
npx prisma migrate dev --name init
```

4. Generate the Prisma client:
```bash
npx prisma generate
```

## Database Setup Options

### Option 1: Using Docker (Recommended for Development)

If you have Docker installed, you can use the provided Docker Compose file:

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop PostgreSQL container
docker-compose down
```

### Option 2: Install PostgreSQL Locally

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### On macOS (with Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### On Windows:
Download and install PostgreSQL from the official website: https://www.postgresql.org/download/windows/

### Option 3: Using a Cloud PostgreSQL Service

You can use cloud services like:
- Supabase
- Heroku Postgres
- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL

## Database Configuration

Update the `.env` file with your database credentials:

```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=agroxp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456

# Server Configuration
PORT=3001

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Prisma Database URL
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
```

## Running the server

To run the server with Prisma:
```bash
npm run prisma:dev
```

## Database Schema

The database schema includes the following models:
- User: For user authentication
- Session: For user sessions
- Farm: For agricultural properties
- Parcel: For sections of a farm
- Crop: For planted crops
- Livestock: For farm animals
- InventoryItem: For farm supplies and equipment

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user information

### Farm Management
- `POST /api/farms` - Create a new farm
- `GET /api/farms` - Get all farms
- `GET /api/farms/:id` - Get a specific farm
- `PUT /api/farms/:id` - Update a farm
- `DELETE /api/farms/:id` - Delete a farm

## Prisma Studio

To view and manage your database data, you can use Prisma Studio:
```bash
npx prisma studio
```

## Seeding the Database

To populate the database with sample data:
```bash
npm run prisma:seed
```