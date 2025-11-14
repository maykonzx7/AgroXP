import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "../services/database.service.js";
import {
  sequelize,
  Parcel,
  Livestock,
  Feeding,
  Vaccination,
  Reproduction,
  VeterinarySupply,
  LivestockSupplyUsage,
} from "../associations.js";

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

async function wipeSequelizeAndRecreate() {
  console.log("Dropping and recreating Sequelize tables...");
  try {
    // Calling `sequelize.drop()` can trigger dialect-specific code paths that
    // fail in some environments. Use force sync to recreate tables instead.
    await sequelize.sync({ force: true });
  } catch (e) {
    console.warn("Sequelize recreate warning:", String(e));
    // Try a fallback sync without force so we don't block seeding completely
    await sequelize.sync();
  }
}

async function createSeeds() {
  console.log("Creating Sequelize seeds...");
  const parcel = await Parcel.create({
    name: "Seed Parcel",
    size: 10.5,
    location: "Seed Farm",
  });
  const livestock = await Livestock.create({
    name: "Bella",
    breed: "Angus",
    quantity: 1,
    age: 4,
    weight: 420,
    category: "bovino",
    status: "ativo",
    parcelId: parcel.id,
  });
  await Feeding.create({
    livestockId: livestock.id,
    feedType: "Hay",
    quantity: 5.5,
    unit: "kg",
    feedingDate: new Date(),
  });

  console.log("Creating Prisma user...");
  const hashed = await bcrypt.hash("password", 10);
  const user = await prisma.user.create({
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

  // Create a refresh token for convenience
  const token = uuidv4();
  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  console.log("Seed created:", {
    parcelId: parcel.id,
    livestockId: livestock.id,
    userId: user.id,
    token,
  });
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
