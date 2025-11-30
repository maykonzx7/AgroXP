// Arquivo de configuração Sequelize (legado - projeto migrou para Prisma)
// Mantido apenas para compatibilidade com server.ts (arquivo legado)
// O arquivo principal do servidor é server-main.ts que usa Prisma

// Stub para compatibilidade - este arquivo não é usado em produção
// O projeto usa Prisma através de server-main.ts

const sequelizeStub = {
  authenticate: async () => {
    console.warn('Sequelize stub: authenticate() called - server.ts is legacy, use server-main.ts instead');
  },
  sync: async (options) => {
    console.warn('Sequelize stub: sync() called - server.ts is legacy, use server-main.ts instead');
    return sequelizeStub;
  }
};

export default sequelizeStub;

