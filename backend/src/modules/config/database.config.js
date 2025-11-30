// Re-export do arquivo de configuração Sequelize (legado)
// O projeto usa Prisma através de server-main.ts
import sequelize from '../../config/database.config.js';
export default sequelize;
export * from '../../config/database.config.js';
