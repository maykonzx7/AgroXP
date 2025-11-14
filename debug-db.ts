// Debug script to test database connection
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import sequelize from "./backend/src/config/database.config.js";

console.log("Testing database connection...");

const testConnection = async () => {
  try {
    console.log("Attempting to connect to database...");
    console.log("DB Config:", {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
    });
    
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully.");
    
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

testConnection();