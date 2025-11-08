"use strict";
async function testConnection() {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        // Test the connection by querying the users table (should be empty initially)
        const userCount = await prisma.user.count();
        console.log(`Conexão bem-sucedida! Número de usuários no banco: ${userCount}`);
        // Test creating a sample user with all required fields
        const sampleUser = await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: 'hashed_password_here',
                firstName: 'Test',
                lastName: 'User',
            },
        });
        console.log('Usuário de teste criado com sucesso:', sampleUser.id);
        // Clean up - delete the test user
        await prisma.user.delete({
            where: { id: sampleUser.id },
        });
        console.log('Usuário de teste removido com sucesso');
        await prisma.$disconnect();
    }
    catch (error) {
        console.error('Erro ao testar a conexão com o banco de dados:', error);
    }
}
testConnection();
