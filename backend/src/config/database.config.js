import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL connection
// The connection is configured but not established until authenticate() is called
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'agroxp',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'postgres',
  {
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Set dialectOptions for better PostgreSQL compatibility
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds
    },
  }
);

export default sequelize;
