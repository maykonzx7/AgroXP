// Script de teste completo para verificar o fluxo de criação e listagem de harvests
import prisma from '../services/database.service.js';

async function testHarvestFlow() {
  console.log('🧪 Testando fluxo completo de harvests...\n');

  try {
    // 1. Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados\n');

    // 2. Buscar usuário admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!admin) {
      console.error('❌ Nenhum usuário admin encontrado');
      return;
    }

    console.log(`✅ Usuário admin encontrado: ${admin.email} (ID: ${admin.id})\n`);

    // 3. Verificar se o usuário tem fazendas
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: admin.id },
      select: { id: true, name: true },
    });

    console.log(`📊 Fazendas do usuário: ${userFarms.length}`);
    if (userFarms.length > 0) {
      userFarms.forEach(farm => {
        console.log(`   - ${farm.name} (${farm.id})`);
      });
    }
    console.log('');

    // 4. Criar um harvest de teste
    console.log('📝 Criando harvest de teste...');
    const testHarvest = await prisma.harvest.create({
      data: {
        crop: 'Soja Teste',
        date: new Date(),
        yield: 100.5,
        expectedYield: 120.0,
        harvestArea: 10.0,
        quality: 'GOOD',
        cropId: null, // Sem cropId - deve aparecer pela ownerId
        ownerId: admin.id,
      },
    });

    console.log('✅ Harvest criado!');
    console.log('   ID:', testHarvest.id);
    console.log('   Crop:', testHarvest.crop);
    console.log('   OwnerId:', testHarvest.ownerId);
    console.log('   CropId:', testHarvest.cropId);
    console.log('');

    // 5. Aguardar 1 segundo
    console.log('⏳ Aguardando 1 segundo...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');

    // 6. Testar a query que a rota GET usa
    console.log('🔍 Testando query de listagem (simulando rota GET)...');
    
    const userFarmIds = userFarms.map(f => f.id);
    const userFieldIds = userFarms.length > 0
      ? (await prisma.field.findMany({
          where: { farmId: { in: userFarmIds } },
          select: { id: true },
        })).map(f => f.id)
      : [];
    const userCropIds = userFieldIds.length > 0
      ? (await prisma.crop.findMany({
          where: { fieldId: { in: userFieldIds } },
          select: { id: true },
        })).map(c => c.id)
      : [];

    console.log(`   Fazendas: ${userFarmIds.length}`);
    console.log(`   Campos: ${userFieldIds.length}`);
    console.log(`   Culturas: ${userCropIds.length}`);
    console.log('');

    // Construir condições de filtro (mesma lógica da rota)
    const orConditions: any[] = [];
    
    if (userCropIds.length > 0) {
      orConditions.push({
        cropId: { in: userCropIds },
      });
    }
    
    // Sempre incluir harvests com ownerId = userId
    orConditions.push({
      ownerId: admin.id,
    });

    console.log('   Condições de filtro:', JSON.stringify(orConditions, null, 2));
    console.log('');

    // 7. Buscar harvests usando a mesma lógica da rota
    const harvests = await prisma.harvest.findMany({
      where: {
        OR: orConditions,
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log(`✅ Query retornou ${harvests.length} harvest(s)`);
    console.log('');

    // 8. Verificar se o harvest de teste está na lista
    const testHarvestFound = harvests.find(h => h.id === testHarvest.id);
    
    if (testHarvestFound) {
      console.log('✅ SUCESSO: Harvest de teste encontrado na listagem!');
      console.log('   Dados do harvest encontrado:', {
        id: testHarvestFound.id,
        crop: testHarvestFound.crop,
        ownerId: testHarvestFound.ownerId,
        cropId: testHarvestFound.cropId,
      });
    } else {
      console.error('❌ ERRO: Harvest de teste NÃO foi encontrado na listagem!');
      console.error('   Isso indica que o filtro está incorreto.');
    }
    console.log('');

    // 9. Listar todos os harvests do usuário (sem filtro complexo)
    console.log('📋 Listando todos os harvests do usuário (query simples)...');
    const allUserHarvests = await prisma.harvest.findMany({
      where: {
        ownerId: admin.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log(`   Total de harvests do usuário: ${allUserHarvests.length}`);
    if (allUserHarvests.length > 0) {
      console.log('   Últimos 3 harvests:');
      allUserHarvests.slice(0, 3).forEach((h, i) => {
        console.log(`     ${i + 1}. ${h.crop} - ${h.yield}kg (ID: ${h.id})`);
      });
    }
    console.log('');

    // 10. Verificar se há discrepância
    if (allUserHarvests.length !== harvests.length) {
      console.warn('⚠️  AVISO: Há discrepância entre as queries!');
      console.warn(`   Query simples: ${allUserHarvests.length} harvests`);
      console.warn(`   Query com filtro: ${harvests.length} harvests`);
      console.warn('   Isso indica que o filtro está excluindo alguns harvests.');
    } else {
      console.log('✅ As duas queries retornaram o mesmo número de harvests');
    }
    console.log('');

    // 11. Limpar harvest de teste
    console.log('🗑️  Removendo harvest de teste...');
    await prisma.harvest.delete({
      where: { id: testHarvest.id },
    });
    console.log('✅ Harvest de teste removido');
    console.log('');

    // 12. Resumo
    console.log('📊 Resumo do teste:');
    console.log('   - Harvest criado: ✅');
    console.log('   - Harvest encontrado na listagem: ' + (testHarvestFound ? '✅' : '❌'));
    console.log('   - Queries consistentes: ' + (allUserHarvests.length === harvests.length ? '✅' : '❌'));
    
    if (testHarvestFound && allUserHarvests.length === harvests.length) {
      console.log('\n✅ TESTE PASSOU: Tudo funcionando corretamente!');
    } else {
      console.log('\n❌ TESTE FALHOU: Há problemas que precisam ser corrigidos.');
    }

  } catch (error: any) {
    console.error('❌ Erro durante o teste:', error);
    console.error('   Mensagem:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Prisma Client desconectado');
  }
}

testHarvestFlow();

