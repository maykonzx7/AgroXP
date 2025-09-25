import prisma from './database.service.js';
import bcrypt from 'bcrypt';
// User creation
export const createUser = async (email, password, name, farmName, phone) => {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the user in the database
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            farmName,
            phone,
        },
    });
    return user;
};
// User authentication
export const authenticateUser = async (email, password) => {
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
    // Return the user without the password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
// Get user by ID
export const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
// Get user by email
export const getUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
// Update user
export const updateUser = async (id, data) => {
    const user = await prisma.user.update({
        where: { id },
        data,
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
export default {
    createUser,
    authenticateUser,
    getUserById,
    getUserByEmail,
    updateUser,
};
