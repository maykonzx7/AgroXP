import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
// PostgreSQL connection
const sequelize = new Sequelize(process.env.POSTGRES_DB || 'agroxp', process.env.POSTGRES_USER || 'postgres', process.env.POSTGRES_PASSWORD || 'postgres', {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
export default sequelize;
