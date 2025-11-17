/**
 * Script de teste automatizado do sistema
 * Testa as principais funcionalidades do sistema multi-tenant
 */

import prisma from '../services/database.service.js';
import bcrypt from 'bcryptjs';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
}

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    addResult('Conexão com Banco de Dados', true, `Conectado. ${userCount} usuários no banco.`);
    return true;
  } catch (error: any) {
    addResult('Conexão com Banco de Dados', false, `Erro: ${error.message}`);
    return false;
  }
}

async function testUserCreation() {
  try {
    const testEmail = `test-${Date.now()}@test.com`;
    const hashed = await bcrypt.hash('test123', 10);
    
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: testEmail,
          password: hashed,
          firstName: 'Test',
          lastName: 'User',
          role: 'FARMER',
        },
      });

      const farm = await tx.farm.create({
        data: {
          name: 'Fazenda de Teste',
          description: 'Fazenda criada para testes',
          location: 'Localização de Teste',
          ownerId: user.id,
        },
      });

      return { user, farm };
    });

    // Cleanup
    await prisma.farm.delete({ where: { id: result.farm.id } });
    await prisma.user.delete({ where: { id: result.user.id } });

    addResult('Criação de Usuário e Fazenda', true, 'Usuário e fazenda criados com sucesso');
    return true;
  } catch (error: any) {
    addResult('Criação de Usuário e Fazenda', false, `Erro: ${error.message}`);
    return false;
  }
}

async function testMultiTenancy() {
  try {
    const hashed = await bcrypt.hash('test123', 10);
    
    // Criar dois usuários
    const user1 = await prisma.user.create({
      data: {
        email: `user1-${Date.now()}@test.com`,
        password: hashed,
        firstName: 'User',
        lastName: 'One',
        role: 'FARMER',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: `user2-${Date.now()}@test.com`,
        password: hashed,
        firstName: 'User',
        lastName: 'Two',
        role: 'FARMER',
      },
    });

    // Criar fazendas
    const farm1 = await prisma.farm.create({
      data: {
        name: 'Fazenda User 1',
        location: 'Localização 1',
        ownerId: user1.id,
      },
    });

    const farm2 = await prisma.farm.create({
      data: {
        name: 'Fazenda User 2',
        location: 'Localização 2',
        ownerId: user2.id,
      },
    });

    // Criar fields
    const field1 = await prisma.field.create({
      data: {
        name: 'Campo User 1',
        size: 10,
        farmId: farm1.id,
      },
    });

    const field2 = await prisma.field.create({
      data: {
        name: 'Campo User 2',
        size: 20,
        farmId: farm2.id,
      },
    });

    // Verificar isolamento - User 1 só deve ver seus fields
    const user1Fields = await prisma.field.findMany({
      where: {
        farm: {
          ownerId: user1.id,
        },
      },
    });

    const user2Fields = await prisma.field.findMany({
      where: {
        farm: {
          ownerId: user2.id,
        },
      },
    });

    const isolationWorks = 
      user1Fields.length === 1 && 
      user1Fields[0].id === field1.id &&
      user2Fields.length === 1 && 
      user2Fields[0].id === field2.id;

    // Cleanup
    await prisma.field.delete({ where: { id: field1.id } });
    await prisma.field.delete({ where: { id: field2.id } });
    await prisma.farm.delete({ where: { id: farm1.id } });
    await prisma.farm.delete({ where: { id: farm2.id } });
    await prisma.user.delete({ where: { id: user1.id } });
    await prisma.user.delete({ where: { id: user2.id } });

    if (isolationWorks) {
      addResult('Multi-Tenancy (Isolamento de Dados)', true, 'Cada usuário vê apenas seus próprios dados');
      return true;
    } else {
      addResult('Multi-Tenancy (Isolamento de Dados)', false, 'Falha no isolamento de dados');
      return false;
    }
  } catch (error: any) {
    addResult('Multi-Tenancy (Isolamento de Dados)', false, `Erro: ${error.message}`);
    return false;
  }
}

async function testDataRelationships() {
  try {
    const hashed = await bcrypt.hash('test123', 10);
    
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: `rel-${Date.now()}@test.com`,
          password: hashed,
          firstName: 'Test',
          lastName: 'User',
          role: 'FARMER',
        },
      });

      const farm = await tx.farm.create({
        data: {
          name: 'Fazenda Test',
          location: 'Localização',
          ownerId: user.id,
        },
      });

      const field = await tx.field.create({
        data: {
          name: 'Campo Test',
          size: 10,
          farmId: farm.id,
        },
      });

      const crop = await tx.crop.create({
        data: {
          name: 'Cultura Test',
          variety: 'Variedade Test',
          fieldId: field.id,
          status: 'PLANNED',
        },
      });

      const livestock = await tx.livestock.create({
        data: {
          name: 'Animal Test',
          breed: 'Raça Test',
          quantity: 1,
          category: 'BOVINE',
          status: 'ACTIVE',
          fieldId: field.id,
        },
      });

      return { user, farm, field, crop, livestock };
    });

    // Verificar relacionamentos
    const farmWithFields = await prisma.farm.findUnique({
      where: { id: result.farm.id },
      include: { fields: true },
    });

    const fieldWithCrops = await prisma.field.findUnique({
      where: { id: result.field.id },
      include: { crops: true, livestock: true },
    });

    const relationshipsValid = 
      farmWithFields?.fields.length === 1 &&
      fieldWithCrops?.crops.length === 1 &&
      fieldWithCrops?.livestock.length === 1;

    // Cleanup
    await prisma.crop.delete({ where: { id: result.crop.id } });
    await prisma.livestock.delete({ where: { id: result.livestock.id } });
    await prisma.field.delete({ where: { id: result.field.id } });
    await prisma.farm.delete({ where: { id: result.farm.id } });
    await prisma.user.delete({ where: { id: result.user.id } });

    if (relationshipsValid) {
      addResult('Relacionamentos de Dados', true, 'Todos os relacionamentos estão corretos');
      return true;
    } else {
      addResult('Relacionamentos de Dados', false, 'Alguns relacionamentos estão incorretos');
      return false;
    }
  } catch (error: any) {
    addResult('Relacionamentos de Dados', false, `Erro: ${error.message}`);
    return false;
  }
}

async function testDataPersistence() {
  try {
    const hashed = await bcrypt.hash('test123', 10);
    const testEmail = `persist-${Date.now()}@test.com`;
    
    // Criar dados
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashed,
        firstName: 'Test',
        lastName: 'User',
        role: 'FARMER',
      },
    });

    const farm = await prisma.farm.create({
      data: {
        name: 'Fazenda Persist',
        location: 'Localização',
        ownerId: user.id,
      },
    });

    // Verificar persistência
    const persistedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { farms: true },
    });

    const persisted = persistedUser && persistedUser.farms.length === 1;

    // Cleanup
    await prisma.farm.delete({ where: { id: farm.id } });
    await prisma.user.delete({ where: { id: user.id } });

    if (persisted) {
      addResult('Persistência de Dados', true, 'Dados persistem corretamente no banco');
      return true;
    } else {
      addResult('Persistência de Dados', false, 'Falha na persistência de dados');
      return false;
    }
  } catch (error: any) {
    addResult('Persistência de Dados', false, `Erro: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Iniciando testes do sistema...\n');
  console.log('=' .repeat(50));
  
  await testDatabaseConnection();
  await testUserCreation();
  await testMultiTenancy();
  await testDataRelationships();
  await testDataPersistence();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Resumo dos Testes:\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const failed = total - passed;

  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
  });

  console.log(`\n✅ Passou: ${passed}/${total}`);
  if (failed > 0) {
    console.log(`❌ Falhou: ${failed}/${total}`);
  }

  console.log('\n' + '='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 Todos os testes passaram!');
    return 0;
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os erros acima.');
    return 1;
  }
}

runAllTests()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal durante os testes:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

