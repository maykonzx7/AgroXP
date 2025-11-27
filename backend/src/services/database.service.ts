// Import Prisma Client gerado localmente para compatibilidade com build gerado em `src/generated/prisma`
import { PrismaClient } from "../generated/prisma/index.js";

// Singleton pattern para garantir uma única instância do Prisma Client
let prismaInstance: PrismaClient | null = null;

const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === "development" 
        ? ["error", "warn", "query"] 
        : ["error"],
    });
  }

  return prismaInstance;
};

// Função helper para verificar persistência após operações
export const verifyPersistence = async <T extends { id: string }>(
  model: any,
  id: string,
  retries: number = 3,
  delay: number = 100
): Promise<T | null> => {
  for (let i = 0; i < retries; i++) {
    try {
      const record = await model.findUnique({ where: { id } });
      if (record) {
        return record as T;
      }
      // Aguardar um pouco antes de tentar novamente
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Erro ao verificar persistência (tentativa ${i + 1}):`, error);
    }
  }
  return null;
};

const prisma = getPrismaClient();

// Graceful shutdown
process.on("beforeExit", async () => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
});

export default prisma;
