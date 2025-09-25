// test-db-connection.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test the connection by running a simple query
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    // Try to fetch the database version
    const result = await prisma.$queryRaw`SELECT version();`;
    console.log('Database version:', result[0]);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}

testConnection();