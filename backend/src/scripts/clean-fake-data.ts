/**
 * Script para limpar dados fake do banco de dados
 * Remove todos os dados que não pertencem a usuários reais
 */

import prisma from '../services/database.service.js';

async function cleanFakeData() {
  try {
    console.log('🧹 Iniciando limpeza de dados fake...\n');

    // 1. Remover dados de livestock sem field válido
    console.log('1. Limpando livestock sem field válido...');
    const livestockWithoutField = await prisma.livestock.findMany({
      where: {
        field: null,
      },
    });

    let livestockDeleted = 0;
    for (const livestock of livestockWithoutField) {
      try {
        await prisma.livestock.delete({ where: { id: livestock.id } });
        livestockDeleted++;
      } catch (e) {
        console.warn(`   ⚠️  Erro ao deletar livestock ${livestock.id}:`, e);
      }
    }
    console.log(`   ✅ ${livestockDeleted} registros de livestock removidos\n`);

    // 2. Remover dados de crops sem field válido
    console.log('2. Limpando crops sem field válido...');
    const cropsWithoutField = await prisma.crop.findMany({
      where: {
        field: null,
      },
    });

    let cropsDeleted = 0;
    for (const crop of cropsWithoutField) {
      try {
        await prisma.crop.delete({ where: { id: crop.id } });
        cropsDeleted++;
      } catch (e) {
        console.warn(`   ⚠️  Erro ao deletar crop ${crop.id}:`, e);
      }
    }
    console.log(`   ✅ ${cropsDeleted} registros de crops removidos\n`);

    // 3. Remover fields sem farm válido
    console.log('3. Limpando fields sem farm válido...');
    const fieldsWithoutFarm = await prisma.field.findMany({
      where: {
        farm: null,
      },
    });

    let fieldsDeleted = 0;
    for (const field of fieldsWithoutFarm) {
      try {
        await prisma.field.delete({ where: { id: field.id } });
        fieldsDeleted++;
      } catch (e) {
        console.warn(`   ⚠️  Erro ao deletar field ${field.id}:`, e);
      }
    }
    console.log(`   ✅ ${fieldsDeleted} registros de fields removidos\n`);

    // 4. Remover farms sem owner válido
    console.log('4. Limpando farms sem owner válido...');
    const farmsWithoutOwner = await prisma.farm.findMany({
      where: {
        owner: null,
      },
    });

    let farmsDeleted = 0;
    for (const farm of farmsWithoutOwner) {
      try {
        await prisma.farm.delete({ where: { id: farm.id } });
        farmsDeleted++;
      } catch (e) {
        console.warn(`   ⚠️  Erro ao deletar farm ${farm.id}:`, e);
      }
    }
    console.log(`   ✅ ${farmsDeleted} registros de farms removidos\n`);

    // 5. Remover dados órfãos de outras tabelas
    console.log('5. Limpando dados órfãos...');
    
    // Finance com fieldId que não existe
    const financeWithInvalidField = await prisma.finance.findMany({
      where: {
        fieldId: { not: null },
      },
      select: { id: true, fieldId: true },
    });

    let financeDeleted = 0;
    for (const finance of financeWithInvalidField) {
      if (finance.fieldId) {
        const fieldExists = await prisma.field.findUnique({
          where: { id: finance.fieldId },
        });
        if (!fieldExists) {
          try {
            await prisma.finance.update({
              where: { id: finance.id },
              data: { fieldId: null },
            });
            financeDeleted++;
          } catch (e) {
            console.warn(`   ⚠️  Erro ao limpar finance ${finance.id}:`, e);
          }
        }
      }
    }
    console.log(`   ✅ ${financeDeleted} registros de finance limpos`);

    // Harvest com cropId que não existe
    const harvestWithInvalidCrop = await prisma.harvest.findMany({
      where: {
        cropId: { not: null },
      },
      select: { id: true, cropId: true },
    });

    let harvestDeleted = 0;
    for (const harvest of harvestWithInvalidCrop) {
      if (harvest.cropId) {
        const cropExists = await prisma.crop.findUnique({
          where: { id: harvest.cropId },
        });
        if (!cropExists) {
          try {
            await prisma.harvest.update({
              where: { id: harvest.id },
              data: { cropId: null },
            });
            harvestDeleted++;
          } catch (e) {
            console.warn(`   ⚠️  Erro ao limpar harvest ${harvest.id}:`, e);
          }
        }
      }
    }
    console.log(`   ✅ ${harvestDeleted} registros de harvest limpos`);

    // Feeding, Vaccination, Reproduction, SupplyUsage com livestockId que não existe
    const feedingWithInvalidLivestock = await prisma.feeding.findMany({
      select: { id: true, livestockId: true },
    });

    let feedingDeleted = 0;
    for (const feeding of feedingWithInvalidLivestock) {
      const livestockExists = await prisma.livestock.findUnique({
        where: { id: feeding.livestockId },
      });
      if (!livestockExists) {
        try {
          await prisma.feeding.delete({ where: { id: feeding.id } });
          feedingDeleted++;
        } catch (e) {
          console.warn(`   ⚠️  Erro ao deletar feeding ${feeding.id}:`, e);
        }
      }
    }
    console.log(`   ✅ ${feedingDeleted} registros de feeding removidos`);

    const vaccinationWithInvalidLivestock = await prisma.vaccination.findMany({
      select: { id: true, livestockId: true },
    });

    let vaccinationDeleted = 0;
    for (const vaccination of vaccinationWithInvalidLivestock) {
      const livestockExists = await prisma.livestock.findUnique({
        where: { id: vaccination.livestockId },
      });
      if (!livestockExists) {
        try {
          await prisma.vaccination.delete({ where: { id: vaccination.id } });
          vaccinationDeleted++;
        } catch (e) {
          console.warn(`   ⚠️  Erro ao deletar vaccination ${vaccination.id}:`, e);
        }
      }
    }
    console.log(`   ✅ ${vaccinationDeleted} registros de vaccination removidos`);

    const reproductionWithInvalidLivestock = await prisma.reproduction.findMany({
      select: { id: true, livestockId: true },
    });

    let reproductionDeleted = 0;
    for (const reproduction of reproductionWithInvalidLivestock) {
      const livestockExists = await prisma.livestock.findUnique({
        where: { id: reproduction.livestockId },
      });
      if (!livestockExists) {
        try {
          await prisma.reproduction.delete({ where: { id: reproduction.id } });
          reproductionDeleted++;
        } catch (e) {
          console.warn(`   ⚠️  Erro ao deletar reproduction ${reproduction.id}:`, e);
        }
      }
    }
    console.log(`   ✅ ${reproductionDeleted} registros de reproduction removidos`);

    const supplyUsageWithInvalidLivestock = await prisma.livestockSupplyUsage.findMany({
      select: { id: true, livestockId: true },
    });

    let supplyUsageDeleted = 0;
    for (const usage of supplyUsageWithInvalidLivestock) {
      const livestockExists = await prisma.livestock.findUnique({
        where: { id: usage.livestockId },
      });
      if (!livestockExists) {
        try {
          await prisma.livestockSupplyUsage.delete({ where: { id: usage.id } });
          supplyUsageDeleted++;
        } catch (e) {
          console.warn(`   ⚠️  Erro ao deletar supply usage ${usage.id}:`, e);
        }
      }
    }
    console.log(`   ✅ ${supplyUsageDeleted} registros de supply usage removidos\n`);

    console.log('✨ Limpeza de dados fake concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Livestock: ${livestockDeleted}`);
    console.log(`   - Crops: ${cropsDeleted}`);
    console.log(`   - Fields: ${fieldsDeleted}`);
    console.log(`   - Farms: ${farmsDeleted}`);
    console.log(`   - Finance: ${financeDeleted}`);
    console.log(`   - Harvest: ${harvestDeleted}`);
    console.log(`   - Feeding: ${feedingDeleted}`);
    console.log(`   - Vaccination: ${vaccinationDeleted}`);
    console.log(`   - Reproduction: ${reproductionDeleted}`);
    console.log(`   - Supply Usage: ${supplyUsageDeleted}`);

  } catch (error: any) {
    console.error('❌ Erro ao limpar dados fake:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanFakeData()
  .then(() => {
    console.log('\n✅ Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro ao executar script:', error);
    process.exit(1);
  });

