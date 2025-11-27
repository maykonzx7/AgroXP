// Seed completo para a conta de admin
// Versão ES Modules
import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed completo para conta de admin...\n");

  const hashedPassword = await bcrypt.hash("Senha@123", 10);

  // ============================================
  // 1. USUÁRIO ADMIN
  // ============================================
  console.log("👤 Criando/atualizando conta de admin...");
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@agroxp.com",
    },
    update: {
      password: hashedPassword,
      firstName: "Administrador",
      lastName: "Sistema",
      phone: "+55 11 99999-0001",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: "admin@agroxp.com",
      password: hashedPassword,
      firstName: "Administrador",
      lastName: "Sistema",
      phone: "+55 11 99999-0001",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(
    `✅ Conta de admin ${admin.id ? "atualizada" : "criada"} com sucesso!`
  );
  console.log(`   Email: ${admin.email}`);
  console.log(`   Nome: ${admin.firstName} ${admin.lastName}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Senha padrão: Senha@123\n`);

  // ============================================
  // 2. FAZENDAS - Criar ou atualizar fazendas do admin
  // ============================================
  console.log("🏡 Criando/atualizando fazendas do admin...");

  // Verificar se já existe fazenda do admin
  const existingFarm = await prisma.farm.findFirst({
    where: { ownerId: admin.id },
  });

  let farm;
  if (existingFarm) {
    // Atualizar fazenda existente
    farm = await prisma.farm.update({
      where: { id: existingFarm.id },
      data: {
        name: "Fazenda AgroXP - Administração",
        description:
          "Fazenda modelo do sistema AgroXP com produção diversificada de grãos, pecuária e culturas variadas",
        location: "Ribeirão Preto, SP",
        size: 1000.0,
      },
    });
    console.log(`✅ Fazenda existente atualizada: ${farm.name}`);
  } else {
    // Criar nova fazenda
    farm = await prisma.farm.create({
      data: {
        name: "Fazenda AgroXP - Administração",
        description:
          "Fazenda modelo do sistema AgroXP com produção diversificada de grãos, pecuária e culturas variadas",
        location: "Ribeirão Preto, SP",
        size: 1000.0,
        ownerId: admin.id,
        address: {
          create: {
            street: "Rodovia Anhanguera",
            number: "KM 245",
            complement: "Fazenda AgroXP",
            city: "Ribeirão Preto",
            state: "SP",
            zipCode: "14000-000",
            country: "Brazil",
          },
        },
      },
    });
    console.log(`✅ Nova fazenda criada: ${farm.name}`);
  }
  console.log(`   Tamanho: ${farm.size} hectares\n`);

  // ============================================
  // 3. PARCELAS (FIELDS) - Criar parcelas
  // ============================================
  console.log("🌾 Criando parcelas...");

  // Verificar parcelas existentes
  const existingFields = await prisma.field.findMany({
    where: { farmId: farm.id },
  });

  let fields;
  if (existingFields.length === 0) {
    // Criar novas parcelas
    fields = await prisma.field.createManyAndReturn({
      data: [
        {
          name: "Talhão Norte - Soja",
          description:
            "Parcela principal para plantio de soja - Solo argiloso fértil",
          size: 120.0,
          location: "Norte da fazenda",
          farmId: farm.id,
          soilType: "Argiloso",
          phLevel: 6.2,
        },
        {
          name: "Talhão Sul - Milho",
          description: "Parcela para rotação de culturas - Solo arenoso",
          size: 100.0,
          location: "Sul da fazenda",
          farmId: farm.id,
          soilType: "Arenoso",
          phLevel: 5.8,
        },
        {
          name: "Pastagem Central - Bovinos",
          description: "Área destinada à pecuária bovina - Pastagem natural",
          size: 200.0,
          location: "Centro da fazenda",
          farmId: farm.id,
          soilType: "Argiloso",
          phLevel: 6.0,
        },
        {
          name: "Talhão Leste - Café",
          description: "Área para cultivo de café - Solo vulcânico",
          size: 80.0,
          location: "Leste da fazenda",
          farmId: farm.id,
          soilType: "Vulcânico",
          phLevel: 5.5,
        },
        {
          name: "Pastagem Oeste - Ovinos",
          description: "Pastagem para ovinos e caprinos",
          size: 150.0,
          location: "Oeste da fazenda",
          farmId: farm.id,
          soilType: "Arenoso",
          phLevel: 6.0,
        },
        {
          name: "Talhão Centro-Norte - Algodão",
          description: "Área para cultivo de algodão - Solo fértil",
          size: 90.0,
          location: "Centro-Norte da fazenda",
          farmId: farm.id,
          soilType: "Argiloso",
          phLevel: 6.5,
        },
      ],
    });
    console.log(`✅ ${fields.length} parcelas criadas\n`);
  } else {
    fields = existingFields;
    console.log(`✅ ${fields.length} parcelas já existentes\n`);
  }

  const [field1, field2, field3, field4, field5, field6] = fields;

  // ============================================
  // 4. CULTURAS (CROPS) - Criar culturas
  // ============================================
  console.log("🌱 Criando culturas...");

  const existingCrops = await prisma.crop.findMany({
    where: { fieldId: { in: fields.map((f) => f.id) } },
  });

  let crops;
  if (existingCrops.length === 0) {
    crops = await prisma.crop.createManyAndReturn({
      data: [
        {
          name: "Soja",
          variety: "BRS 284",
          plantingDate: new Date("2025-01-15"),
          harvestDate: new Date("2025-05-20"),
          expectedYield: 4200.0,
          actualYield: 4000.0,
          status: "HARVESTED",
          fieldId: field1.id,
        },
        {
          name: "Milho",
          variety: "BRS 2020",
          plantingDate: new Date("2025-02-01"),
          harvestDate: new Date("2025-06-15"),
          expectedYield: 9500.0,
          actualYield: 9000.0,
          status: "HARVESTED",
          fieldId: field2.id,
        },
        {
          name: "Soja",
          variety: "BRS 284",
          plantingDate: new Date("2025-10-01"),
          expectedYield: 4500.0,
          status: "GROWING",
          fieldId: field1.id,
        },
        {
          name: "Café",
          variety: "Catuai",
          plantingDate: new Date("2024-06-01"),
          expectedYield: 3000.0,
          status: "GROWING",
          fieldId: field4.id,
        },
        {
          name: "Algodão",
          variety: "BRS 286",
          plantingDate: new Date("2025-11-01"),
          expectedYield: 5500.0,
          status: "PLANTED",
          fieldId: field6.id,
        },
        {
          name: "Feijão",
          variety: "BRS Estilo",
          plantingDate: new Date("2025-12-15"),
          expectedYield: 3200.0,
          status: "PLANNED",
          fieldId: field2.id,
        },
      ],
    });
    console.log(
      `✅ ${crops.length} culturas criadas (PLANNED, PLANTED, GROWING, HARVESTED)\n`
    );
  } else {
    crops = existingCrops;
    console.log(`✅ ${crops.length} culturas já existentes\n`);
  }

  const [crop1, crop2, crop3, crop4, crop5, crop6] = crops;

  // ============================================
  // 5. PECUÁRIA (LIVESTOCK) - Criar animais
  // ============================================
  console.log("🐄 Criando animais...");

  const existingLivestock = await prisma.livestock.findMany({
    where: { fieldId: { in: fields.map((f) => f.id) } },
  });

  let livestock;
  if (existingLivestock.length === 0) {
    livestock = await prisma.livestock.createManyAndReturn({
      data: [
        {
          name: "Gado Nelore",
          breed: "Nelore",
          quantity: 80,
          age: 24,
          weight: 450.0,
          category: "BOVINO",
          status: "ACTIVE",
          fieldId: field3.id,
        },
        {
          name: "Gado Angus",
          breed: "Angus",
          quantity: 50,
          age: 18,
          weight: 380.0,
          category: "BOVINO",
          status: "ACTIVE",
          fieldId: field3.id,
        },
        {
          name: "Suínos Large White",
          breed: "Large White",
          quantity: 150,
          age: 6,
          weight: 80.0,
          category: "SUINO",
          status: "ACTIVE",
          fieldId: field3.id,
        },
        {
          name: "Ovinos Dorper",
          breed: "Dorper",
          quantity: 120,
          age: 12,
          weight: 45.0,
          category: "OVINO",
          status: "ACTIVE",
          fieldId: field5.id,
        },
        {
          name: "Caprinos Boer",
          breed: "Boer",
          quantity: 90,
          age: 8,
          weight: 35.0,
          category: "CAPRINO",
          status: "ACTIVE",
          fieldId: field5.id,
        },
        {
          name: "Galinhas Poedeiras",
          breed: "Rhode Island Red",
          quantity: 300,
          age: 3,
          weight: 2.5,
          category: "AVICOLA",
          status: "ACTIVE",
          fieldId: field3.id,
        },
        {
          name: "Cavalos Quarto de Milha",
          breed: "Quarto de Milha",
          quantity: 15,
          age: 48,
          weight: 500.0,
          category: "EQUINO",
          status: "ACTIVE",
          fieldId: field3.id,
        },
      ],
    });
    console.log(
      `✅ ${livestock.length} grupos de animais criados (BOVINO, SUINO, OVINO, CAPRINO, AVICOLA, EQUINO)\n`
    );
  } else {
    livestock = existingLivestock;
    console.log(`✅ ${livestock.length} grupos de animais já existentes\n`);
  }

  const [
    livestock1,
    livestock2,
    livestock3,
    livestock4,
    livestock5,
    livestock6,
    livestock7,
  ] = livestock;

  // ============================================
  // 6. ALIMENTAÇÕES (FEEDINGS)
  // ============================================
  console.log("🌾 Criando registros de alimentação...");

  if (livestock.length > 0) {
    const existingFeedings = await prisma.feeding.findMany({
      where: { livestockId: { in: livestock.map((l) => l.id) } },
      take: 1,
    });

    if (existingFeedings.length === 0) {
      await prisma.feeding.createMany({
        data: [
          {
            livestockId: livestock1.id,
            feedType: "Ração Concentrada",
            quantity: 800.0,
            unit: "kg",
            feedingDate: new Date("2025-11-15"),
            notes: "Alimentação diária matutina",
          },
          {
            livestockId: livestock1.id,
            feedType: "Pasto",
            quantity: 3000.0,
            unit: "kg",
            feedingDate: new Date("2025-11-15"),
            notes: "Pastejo livre",
          },
          {
            livestockId: livestock2.id,
            feedType: "Ração Premium",
            quantity: 500.0,
            unit: "kg",
            feedingDate: new Date("2025-11-15"),
            notes: "Alimentação para engorda",
          },
          {
            livestockId: livestock3.id,
            feedType: "Ração Suína",
            quantity: 300.0,
            unit: "kg",
            feedingDate: new Date("2025-11-15"),
            notes: "Ração balanceada",
          },
          {
            livestockId: livestock4.id,
            feedType: "Pasto + Suplemento",
            quantity: 200.0,
            unit: "kg",
            feedingDate: new Date("2025-11-15"),
            notes: "Pastejo com suplementação",
          },
          {
            livestockId: livestock6.id,
            feedType: "Ração Aviária",
            quantity: 80.0,
            unit: "kg",
            feedingDate: new Date("2025-11-15"),
            notes: "Ração para postura",
          },
        ],
      });
      console.log(`✅ 6 registros de alimentação criados\n`);
    } else {
      console.log(`✅ Registros de alimentação já existentes\n`);
    }
  }

  // ============================================
  // 7. VACINAÇÕES (VACCINATIONS)
  // ============================================
  console.log("💉 Criando registros de vacinação...");

  if (livestock.length > 0) {
    const existingVaccinations = await prisma.vaccination.findMany({
      where: { livestockId: { in: livestock.map((l) => l.id) } },
      take: 1,
    });

    if (existingVaccinations.length === 0) {
      await prisma.vaccination.createMany({
        data: [
          {
            livestockId: livestock1.id,
            vaccineName: "Vacina contra Febre Aftosa",
            vaccinationDate: new Date("2025-05-15"),
            nextVaccinationDate: new Date("2025-11-15"),
            veterinarian: "Dr. João Veterinário",
            notes: "Primeira dose da campanha",
          },
          {
            livestockId: livestock1.id,
            vaccineName: "Vacina contra Brucelose",
            vaccinationDate: new Date("2025-06-01"),
            nextVaccinationDate: new Date("2026-06-01"),
            veterinarian: "Dr. João Veterinário",
            notes: "Vacinação anual",
          },
          {
            livestockId: livestock2.id,
            vaccineName: "Vacina contra Febre Aftosa",
            vaccinationDate: new Date("2025-05-15"),
            nextVaccinationDate: new Date("2025-11-15"),
            veterinarian: "Dr. João Veterinário",
            notes: "Primeira dose",
          },
          {
            livestockId: livestock3.id,
            vaccineName: "Vacina Suína",
            vaccinationDate: new Date("2025-10-01"),
            nextVaccinationDate: new Date("2025-12-01"),
            veterinarian: "Dr. Maria Veterinária",
            notes: "Vacinação preventiva",
          },
          {
            livestockId: livestock4.id,
            vaccineName: "Vacina contra Clostridioses",
            vaccinationDate: new Date("2025-09-01"),
            nextVaccinationDate: new Date("2026-03-01"),
            veterinarian: "Dr. Carlos Veterinário",
            notes: "Vacinação para ovinos",
          },
          {
            livestockId: livestock6.id,
            vaccineName: "Vacina contra Doença de Newcastle",
            vaccinationDate: new Date("2025-08-15"),
            nextVaccinationDate: new Date("2026-02-15"),
            veterinarian: "Dr. Maria Veterinária",
            notes: "Vacinação aviária",
          },
        ],
      });
      console.log(`✅ 6 registros de vacinação criados\n`);
    } else {
      console.log(`✅ Registros de vacinação já existentes\n`);
    }
  }

  // ============================================
  // 8. REPRODUÇÕES (REPRODUCTIONS)
  // ============================================
  console.log("🐣 Criando registros de reprodução...");

  if (livestock.length > 0) {
    const existingReproductions = await prisma.reproduction.findMany({
      where: { livestockId: { in: livestock.map((l) => l.id) } },
      take: 1,
    });

    if (existingReproductions.length === 0) {
      await prisma.reproduction.createMany({
        data: [
          {
            livestockId: livestock1.id,
            matingDate: new Date("2025-08-01"),
            expectedDeliveryDate: new Date("2026-05-15"),
            status: "PREGNANT",
            notes: "Inseminação artificial",
          },
          {
            livestockId: livestock2.id,
            matingDate: new Date("2025-09-15"),
            expectedDeliveryDate: new Date("2026-06-30"),
            status: "PREGNANT",
            notes: "Monta natural",
          },
          {
            livestockId: livestock1.id,
            matingDate: new Date("2025-03-01"),
            expectedDeliveryDate: new Date("2025-12-10"),
            actualDeliveryDate: new Date("2025-12-08"),
            offspringCount: 1,
            status: "DELIVERED",
            notes: "Parto normal, bezerro saudável",
          },
          {
            livestockId: livestock3.id,
            matingDate: new Date("2025-10-01"),
            expectedDeliveryDate: new Date("2026-01-15"),
            status: "PREGNANT",
            notes: "Gestação de suínos",
          },
        ],
      });
      console.log(
        `✅ 4 registros de reprodução criados (PREGNANT, DELIVERED)\n`
      );
    } else {
      console.log(`✅ Registros de reprodução já existentes\n`);
    }
  }

  // ============================================
  // 9. EQUIPAMENTOS (EQUIPMENT)
  // ============================================
  console.log("🚜 Criando equipamentos...");

  const existingEquipment = await prisma.equipment.findMany({
    where: { farmId: farm.id },
  });

  if (existingEquipment.length === 0) {
    await prisma.equipment.createMany({
      data: [
        {
          name: "Trator John Deere 6120",
          type: "Trator",
          brand: "John Deere",
          model: "6120",
          year: 2020,
          status: "AVAILABLE",
          purchaseDate: new Date("2020-03-15"),
          lastMaintenance: new Date("2025-10-15"),
          farmId: farm.id,
        },
        {
          name: "Colheitadeira New Holland",
          type: "Colheitadeira",
          brand: "New Holland",
          model: "CR 8.90",
          year: 2019,
          status: "AVAILABLE",
          purchaseDate: new Date("2019-05-20"),
          lastMaintenance: new Date("2025-09-20"),
          farmId: farm.id,
        },
        {
          name: "Pulverizador Jacto",
          type: "Pulverizador",
          brand: "Jacto",
          model: "Uniport 3030",
          year: 2021,
          status: "IN_USE",
          purchaseDate: new Date("2021-02-10"),
          lastMaintenance: new Date("2025-11-01"),
          farmId: farm.id,
        },
        {
          name: "Plantadeira Semeato",
          type: "Plantadeira",
          brand: "Semeato",
          model: "PD 3060",
          year: 2022,
          status: "AVAILABLE",
          purchaseDate: new Date("2022-01-15"),
          lastMaintenance: new Date("2025-10-30"),
          farmId: farm.id,
        },
        {
          name: "Trator Case IH",
          type: "Trator",
          brand: "Case IH",
          model: "Puma 180",
          year: 2018,
          status: "MAINTENANCE",
          purchaseDate: new Date("2018-06-10"),
          lastMaintenance: new Date("2025-11-10"),
          farmId: farm.id,
        },
      ],
    });
    console.log(`✅ 5 equipamentos criados\n`);
  } else {
    console.log(`✅ ${existingEquipment.length} equipamentos já existentes\n`);
  }

  // ============================================
  // 10. FUNCIONÁRIOS (EMPLOYEES)
  // ============================================
  console.log("👷 Criando funcionários...");

  const existingEmployees = await prisma.employee.findMany({
    where: { farmId: farm.id },
  });

  if (existingEmployees.length === 0) {
    await prisma.employee.createMany({
      data: [
        {
          firstName: "José",
          lastName: "Silva",
          email: "jose.silva@fazenda.com",
          phone: "+55 11 99999-1001",
          position: "Gerente de Produção",
          hireDate: new Date("2020-01-15"),
          salary: 8000.0,
          farmId: farm.id,
        },
        {
          firstName: "Maria",
          lastName: "Santos",
          email: "maria.santos@fazenda.com",
          phone: "+55 11 99999-1002",
          position: "Veterinária",
          hireDate: new Date("2021-03-01"),
          salary: 7500.0,
          farmId: farm.id,
        },
        {
          firstName: "Carlos",
          lastName: "Oliveira",
          email: "carlos.oliveira@fazenda.com",
          phone: "+55 11 99999-1003",
          position: "Operador de Máquinas",
          hireDate: new Date("2019-06-10"),
          salary: 4500.0,
          farmId: farm.id,
        },
        {
          firstName: "Ana",
          lastName: "Costa",
          email: "ana.costa@fazenda.com",
          phone: "+55 11 99999-1004",
          position: "Técnica Agrícola",
          hireDate: new Date("2022-02-20"),
          salary: 5000.0,
          farmId: farm.id,
        },
        {
          firstName: "Pedro",
          lastName: "Ferreira",
          email: "pedro.ferreira@fazenda.com",
          phone: "+55 11 99999-1005",
          position: "Trabalhador Rural",
          hireDate: new Date("2023-01-10"),
          salary: 3000.0,
          farmId: farm.id,
        },
      ],
    });
    console.log(`✅ 5 funcionários criados\n`);
  } else {
    console.log(`✅ ${existingEmployees.length} funcionários já existentes\n`);
  }

  // ============================================
  // 11. INVENTÁRIO (INVENTORY)
  // ============================================
  console.log("📦 Criando itens de inventário...");

  const existingInventory = await prisma.inventory.findMany({
    where: { farmId: farm.id },
  });

  if (existingInventory.length === 0) {
    await prisma.inventory.createMany({
      data: [
        {
          itemName: "Fertilizante NPK 10-10-10",
          category: "Fertilizante",
          quantity: 5000,
          unit: "kg",
          cost: 3.5,
          supplier: "Fertilizantes Brasil",
          purchaseDate: new Date("2025-10-01"),
          expiryDate: new Date("2027-10-01"),
          farmId: farm.id,
        },
        {
          itemName: "Herbicida Glifosato",
          category: "Defensivo",
          quantity: 200,
          unit: "litros",
          cost: 25.0,
          supplier: "Defensivos Agrícolas",
          purchaseDate: new Date("2025-09-15"),
          expiryDate: new Date("2026-09-15"),
          farmId: farm.id,
        },
        {
          itemName: "Sementes de Soja BRS 284",
          category: "Sementes",
          quantity: 1000,
          unit: "kg",
          cost: 8.5,
          supplier: "Sementes Premium",
          purchaseDate: new Date("2025-08-20"),
          expiryDate: new Date("2026-08-20"),
          farmId: farm.id,
        },
        {
          itemName: "Ração Bovina",
          category: "Ração",
          quantity: 2000,
          unit: "kg",
          cost: 2.8,
          supplier: "Nutrição Animal",
          purchaseDate: new Date("2025-11-01"),
          expiryDate: new Date("2026-05-01"),
          farmId: farm.id,
        },
        {
          itemName: "Vacina Febre Aftosa",
          category: "Veterinário",
          quantity: 500,
          unit: "doses",
          cost: 5.0,
          supplier: "Laboratório Veterinário",
          purchaseDate: new Date("2025-04-10"),
          expiryDate: new Date("2026-12-31"),
          farmId: farm.id,
        },
      ],
    });
    console.log(`✅ 5 itens de inventário criados\n`);
  } else {
    console.log(
      `✅ ${existingInventory.length} itens de inventário já existentes\n`
    );
  }

  // ============================================
  // 12. FINANÇAS (FINANCE)
  // ============================================
  console.log("💰 Criando registros financeiros...");

  const existingFinances = await prisma.finance.findMany({
    where: { fieldId: { in: fields.map((f) => f.id) } },
    take: 1,
  });

  if (existingFinances.length === 0 && fields.length > 0) {
    await prisma.finance.createMany({
      data: [
        {
          type: "INCOME",
          category: "Venda de Soja",
          amount: 450000.0,
          description: "Venda de 4000 kg de soja",
          date: new Date("2025-05-25"),
          fieldId: field1.id,
        },
        {
          type: "INCOME",
          category: "Venda de Milho",
          amount: 380000.0,
          description: "Venda de 9000 kg de milho",
          date: new Date("2025-06-20"),
          fieldId: field2.id,
        },
        {
          type: "EXPENSE",
          category: "Compra de Sementes",
          amount: 8500.0,
          description: "Compra de sementes de soja",
          date: new Date("2025-01-10"),
          fieldId: field1.id,
        },
        {
          type: "EXPENSE",
          category: "Fertilizantes",
          amount: 17500.0,
          description: "Compra de fertilizantes NPK",
          date: new Date("2025-01-20"),
          fieldId: field1.id,
        },
        {
          type: "EXPENSE",
          category: "Defensivos",
          amount: 5000.0,
          description: "Compra de herbicidas",
          date: new Date("2025-02-10"),
          fieldId: field1.id,
        },
        {
          type: "INCOME",
          category: "Venda de Gado",
          amount: 120000.0,
          description: "Venda de 10 cabeças de gado",
          date: new Date("2025-10-15"),
          fieldId: field3.id,
        },
        {
          type: "EXPENSE",
          category: "Ração",
          amount: 5600.0,
          description: "Compra de ração para bovinos",
          date: new Date("2025-11-01"),
          fieldId: field3.id,
        },
      ],
    });
    console.log(`✅ 7 registros financeiros criados\n`);
  } else {
    console.log(`✅ Registros financeiros já existentes\n`);
  }

  // ============================================
  // 13. TAREFAS (TASKS)
  // ============================================
  console.log("📋 Criando tarefas...");

  const existingTasks = await prisma.task.findMany({
    where: { farmId: farm.id },
    take: 1,
  });

  if (existingTasks.length === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Plantio de Feijão",
          description: "Realizar plantio de feijão no talhão sul",
          dueDate: new Date("2025-12-20"),
          priority: "HIGH",
          status: "TODO",
          farmId: farm.id,
          fieldId: field2.id,
          cropId: crop6?.id,
        },
        {
          title: "Aplicação de Fertilizante",
          description: "Aplicar fertilizante na cultura de soja",
          dueDate: new Date("2025-12-05"),
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          farmId: farm.id,
          fieldId: field1.id,
          cropId: crop3?.id,
        },
        {
          title: "Vacinação do Rebanho",
          description: "Aplicar vacina contra febre aftosa",
          dueDate: new Date("2025-11-20"),
          priority: "URGENT",
          status: "DONE",
          farmId: farm.id,
          fieldId: field3.id,
        },
        {
          title: "Manutenção do Trator",
          description: "Realizar manutenção preventiva do trator",
          dueDate: new Date("2025-12-10"),
          priority: "MEDIUM",
          status: "TODO",
          farmId: farm.id,
        },
        {
          title: "Colheita de Algodão",
          description: "Iniciar colheita de algodão",
          dueDate: new Date("2026-02-15"),
          priority: "HIGH",
          status: "TODO",
          farmId: farm.id,
          fieldId: field6.id,
          cropId: crop5?.id,
        },
      ],
    });
    console.log(`✅ 5 tarefas criadas\n`);
  } else {
    console.log(`✅ Tarefas já existentes\n`);
  }

  // ============================================
  // 14. COLHEITAS (HARVESTS)
  // ============================================
  console.log("🌾 Criando registros de colheita...");

  if (crops.length > 0) {
    const existingHarvests = await prisma.harvest.findMany({
      where: { ownerId: admin.id },
      take: 1,
    });

    if (existingHarvests.length === 0) {
      await prisma.harvest.createMany({
        data: [
          {
            crop: "Soja",
            date: new Date("2025-05-20"),
            yield: 4000.0,
            expectedYield: 4200.0,
            harvestArea: 120.0,
            quality: "EXCELLENT",
            cropId: crop1?.id,
            ownerId: admin.id,
          },
          {
            crop: "Milho",
            date: new Date("2025-06-15"),
            yield: 9000.0,
            expectedYield: 9500.0,
            harvestArea: 100.0,
            quality: "EXCELLENT",
            cropId: crop2?.id,
            ownerId: admin.id,
          },
        ],
      });
      console.log(`✅ 2 registros de colheita criados\n`);
    } else {
      console.log(`✅ Registros de colheita já existentes\n`);
    }
  }

  // ============================================
  // 15. ALERTAS (ALERTS)
  // ============================================
  console.log("⚠️ Criando alertas...");

  const existingAlerts = await prisma.alert.findMany({
    where: { farmId: farm.id },
    take: 1,
  });

  if (existingAlerts.length === 0) {
    await prisma.alert.createMany({
      data: [
        {
          type: "INVENTORY_LOW",
          severity: "MEDIUM",
          title: "Estoque de Fertilizante Baixo",
          message: "O estoque de fertilizante NPK está abaixo de 1000 kg",
          isRead: false,
          isActive: true,
          farmId: farm.id,
        },
        {
          type: "VACCINATION_DUE",
          severity: "HIGH",
          title: "Vacinação Pendente",
          message: "Vacinação contra febre aftosa deve ser realizada até 20/11",
          isRead: false,
          isActive: true,
          farmId: farm.id,
          fieldId: field3.id,
        },
        {
          type: "HARVEST_TIME",
          severity: "MEDIUM",
          title: "Época de Colheita",
          message: "A cultura de algodão está pronta para colheita",
          isRead: false,
          isActive: true,
          farmId: farm.id,
          fieldId: field6.id,
          cropId: crop5?.id,
        },
        {
          type: "MAINTENANCE_DUE",
          severity: "LOW",
          title: "Manutenção Preventiva",
          message: "Trator Case IH precisa de manutenção preventiva",
          isRead: false,
          isActive: true,
          farmId: farm.id,
        },
      ],
    });
    console.log(`✅ 4 alertas criados\n`);
  } else {
    console.log(`✅ Alertas já existentes\n`);
  }

  // ============================================
  // 16. ALERTAS DE CLIMA (WEATHER ALERTS)
  // ============================================
  console.log("🌦️ Criando alertas de clima...");

  const existingWeatherAlerts = await prisma.weatherAlert.findMany({
    where: { farmId: farm.id },
    take: 1,
  });

  if (existingWeatherAlerts.length === 0) {
    await prisma.weatherAlert.createMany({
      data: [
        {
          type: "HEAVY_RAIN",
          severity: "MEDIUM",
          title: "Previsão de Chuva Forte",
          description: "Previsão de chuva forte para os próximos 3 dias",
          startDate: new Date("2025-12-20"),
          endDate: new Date("2025-12-23"),
          region: "Ribeirão Preto, SP",
          farmId: farm.id,
          isActive: true,
        },
        {
          type: "DROUGHT",
          severity: "HIGH",
          title: "Período de Seca",
          description: "Período prolongado sem chuva previsto",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-01-15"),
          region: "Ribeirão Preto, SP",
          farmId: farm.id,
          isActive: true,
        },
      ],
    });
    console.log(`✅ 2 alertas de clima criados\n`);
  } else {
    console.log(`✅ Alertas de clima já existentes\n`);
  }

  console.log("✅ Seed completo concluído com sucesso!");
  console.log("\n📊 Resumo dos dados criados:");
  console.log(`   - 1 Fazenda`);
  console.log(`   - ${fields.length} Parcelas`);
  console.log(`   - ${crops.length} Culturas`);
  console.log(`   - ${livestock.length} Grupos de Animais`);
  console.log(`   - 5 Equipamentos`);
  console.log(`   - 5 Funcionários`);
  console.log(`   - 5 Itens de Inventário`);
  console.log(`   - 7 Registros Financeiros`);
  console.log(`   - 5 Tarefas`);
  console.log(`   - 2 Colheitas`);
  console.log(`   - 4 Alertas`);
  console.log(`   - 2 Alertas de Clima`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
