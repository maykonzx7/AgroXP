import prisma from "./database.service.js";
import bcrypt from "bcryptjs";

// Helper to split a display name into first and last name
const splitName = (name?: string) => {
  if (!name) return { firstName: "", lastName: "" };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" ") || "",
  };
};

// User creation
export const createUser = async (
  email: string,
  password: string,
  name?: string,
  farmName?: string,
  phone?: string,
  farmLocation?: string,
  farmDescription?: string,
  farmSize?: number
) => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 7); // Reduced cost for better performance

  const { firstName, lastName } = splitName(name);

  // Create the user and farm in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the user in the database
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
    });

    // Create the farm for the user if farmName is provided
    if (farmName && farmName.trim() !== '') {
      const farm = await tx.farm.create({
        data: {
          name: farmName.trim(),
          description: farmDescription || null,
          location: farmLocation || 'Localização não informada',
          size: farmSize || null,
          ownerId: user.id,
        },
      });

      return { user, farm };
    }

    return { user, farm: null };
  });

  return result.user;
};

// User authentication
export const authenticateUser = async (email: string, password: string) => {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // If user doesn't exist, return null
  if (!user) {
    return null;
  }

  // Compare the provided password with the hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  // Return the user without the password and map to expected shape
  const { password: _, ...userData } = user as any;
  return {
    id: userData.id,
    email: userData.email,
    name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
    farmName: undefined,
    phone: userData.phone,
  };
};

// Check if user exists by email
export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userData } = user as any;
  return {
    id: userData.id,
    email: userData.email,
    name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
    farmName: undefined,
    phone: userData.phone,
  };
};

// Get user by ID
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userData } = user as any;
  return {
    id: userData.id,
    email: userData.email,
    name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
    farmName: undefined,
    phone: userData.phone,
  };
};

// Update user
export const updateUser = async (
  id: string,
  data: Partial<{ name: string; farmName: string; phone: string }>
) => {
  const updateData: any = {};
  if (data.name) {
    const { firstName, lastName } = splitName(data.name);
    updateData.firstName = firstName;
    updateData.lastName = lastName;
  }
  if (data.phone) updateData.phone = data.phone;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  const { password: _, ...userData } = user as any;
  return {
    id: userData.id,
    email: userData.email,
    name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
    farmName: undefined,
    phone: userData.phone,
  };
};

export default {
  createUser,
  authenticateUser,
  getUserByEmail,
  getUserById,
  updateUser,
};
