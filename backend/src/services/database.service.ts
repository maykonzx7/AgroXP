// Import Prisma Client gerado localmente para compatibilidade com build gerado em `src/generated/prisma`
import { PrismaClient } from "../generated/prisma/index.js";

// Create a single instance of Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;
