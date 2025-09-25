// create-database.ts
import { PrismaClient } from '@prisma/client';

// Create a Prisma client without specifying a database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:123456@localhost:5432/postgres?schema=public'
    }
  }
});

async function createDatabase() {
  try {
    // Connect to the default postgres database
    await prisma.$connect();
    console.log('Connected to PostgreSQL server');
    
    // Check if the agroxp database exists
    const result = await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datname = 'agroxp';`;
    
    if (result.length === 0) {
      // Create the database if it doesn't exist
      await prisma.$executeRaw`CREATE DATABASE agroxp;`;
      console.log('Database "agroxp" created successfully');
    } else {
      console.log('Database "agroxp" already exists');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating database:', error);
  }
}

createDatabase();