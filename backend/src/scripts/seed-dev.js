import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "../services/database.service.js";
// Removed Sequelize imports - using Prisma only

async function wipePrisma() {
  console.log("Wiping Prisma tables (User, RefreshToken)...");
  try {
    // Some Postgres drivers / prepared statement modes disallow multiple
    // commands in a single raw query. Execute truncates separately.
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "RefreshToken" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');
  } catch (e) {
    console.warn("Prisma truncate warning:", String(e));
  }
}

// Removed Sequelize wipe - we're using Prisma only now
async function wipeSequelizeAndRecreate() {
  console.log("Skipping Sequelize operations (using Prisma only)...");
  // No longer needed - we're using Prisma exclusively
}

async function createSeeds() {
  console.log("Creating Prisma user with farm (for development only)...");
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "dev@local" },
  });

  if (existingUser) {
    console.log("User dev@local already exists. Skipping seed creation.");
    return;
  }

  const hashed = await bcrypt.hash("password", 10);
  
  // Create user with farm in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: "dev@local",
        password: hashed,
        firstName: "Dev",
        lastName: "User",
        phone: "0000-0000",
        role: "FARMER",
        isActive: true,
      },
    });

    // Create a farm for the user
    const farm = await tx.farm.create({
      data: {
        name: "Fazenda de Desenvolvimento",
        description: "Fazenda criada para testes de desenvolvimento",
        location: "Localização não informada",
        size: null,
        ownerId: user.id,
      },
    });

    return { user, farm };
  });

  // Create a refresh token for convenience
  const token = uuidv4();
  await prisma.refreshToken.create({
    data: {
      token,
      userId: result.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  console.log("Seed created (user with farm, no fake data):", {
    userId: result.user.id,
    farmId: result.farm.id,
    email: result.user.email,
    password: "password",
    token,
  });
  console.log("\n⚠️  Note: No fake data created. Users should create their own data through registration.");
}

async function main() {
  try {
    await wipePrisma();
    await wipeSequelizeAndRecreate();
    await createSeeds();
    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
