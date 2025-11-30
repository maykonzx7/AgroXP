// Script para diagnosticar e corrigir problemas de login
import prisma from "../services/database.service.js";
import bcrypt from "bcryptjs";
import { authenticateUser } from "../services/user.service.js";

async function main() {
  console.log("🔍 Diagnosticando problemas de login...\n");

  try {
    // 1. Verificar conexão com banco
    console.log("1️⃣ Verificando conexão com banco de dados...");
    await prisma.$connect();
    console.log("✅ Conexão estabelecida\n");

    // 2. Verificar se existem usuários
    console.log("2️⃣ Verificando usuários no banco...");
    const userCount = await prisma.user.count();
    console.log(`   Total de usuários: ${userCount}\n`);

    if (userCount === 0) {
      console.log("⚠️  Nenhum usuário encontrado! Criando conta de admin...\n");
    }

    // 3. Verificar/Atualizar conta de admin
    console.log("3️⃣ Verificando conta de administrador...");
    const adminEmail = "admin@agroxp.com";
    const adminPassword = "Senha@123";
    
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      console.log("   ❌ Conta de admin não encontrada. Criando...");
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: "Administrador",
          lastName: "Sistema",
          phone: "+55 11 99999-0001",
          role: "ADMIN",
          isActive: true,
        },
      });
      console.log("   ✅ Conta de admin criada com sucesso!\n");
    } else {
      console.log("   ✅ Conta de admin encontrada");
      console.log(`   - ID: ${admin.id}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Nome: ${admin.firstName} ${admin.lastName}`);
      console.log(`   - Role: ${admin.role}`);
      console.log(`   - Ativo: ${admin.isActive}\n`);
      
      // Verificar se a senha está correta
      console.log("   🔐 Testando senha atual...");
      const passwordTest = await bcrypt.compare(adminPassword, admin.password);
      
      if (!passwordTest) {
        console.log("   ⚠️  Senha não confere. Atualizando senha...");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        admin = await prisma.user.update({
          where: { id: admin.id },
          data: { password: hashedPassword },
        });
        console.log("   ✅ Senha atualizada com sucesso!\n");
      } else {
        console.log("   ✅ Senha está correta\n");
      }
    }

    // 4. Testar autenticação
    console.log("4️⃣ Testando autenticação...");
    try {
      const authResult = await authenticateUser(adminEmail, adminPassword);
      
      if (authResult) {
        console.log("   ✅ Autenticação bem-sucedida!");
        console.log(`   - ID do usuário: ${authResult.id}`);
        console.log(`   - Nome: ${authResult.name}`);
        console.log(`   - Email: ${authResult.email}\n`);
      } else {
        console.log("   ❌ Autenticação falhou!\n");
      }
    } catch (authError: any) {
      console.log(`   ❌ Erro na autenticação: ${authError.message}\n`);
    }

    // 5. Listar todos os usuários
    console.log("5️⃣ Listando todos os usuários...");
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    
    if (allUsers.length > 0) {
      console.log(`\n   Total: ${allUsers.length} usuário(s)\n`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      Nome: ${user.firstName} ${user.lastName}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Ativo: ${user.isActive ? "Sim" : "Não"}\n`);
      });
    } else {
      console.log("   Nenhum usuário encontrado\n");
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ Diagnóstico concluído!");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log("🔑 Credenciais de acesso:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}\n`);

  } catch (error: any) {
    console.error("❌ Erro durante diagnóstico:", error);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro fatal:", e);
    process.exit(1);
  });


