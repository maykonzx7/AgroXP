import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco de dados para o schema users
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'agroxp_db',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'postgres',
  {
    host: process.env.POSTGRES_HOST || 'postgres', // Nome do serviço no docker-compose
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    dialect: 'postgres',
    schema: 'users', // Schema específico para este serviço
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;