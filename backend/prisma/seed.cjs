// prisma/seed-completo.ts
// Seed completo utilizando TODAS as funcionalidades do sistema AgroXP
// Usando o mesmo padrão de import do database.service.ts
const { PrismaClient } = require("../src/generated/prisma/index.js");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed completo do banco de dados AgroXP...\n");

  // Limpar dados existentes
  console.log("🧹 Limpando dados existentes...");
  await prisma.alert.deleteMany();
  await prisma.weatherAlert.deleteMany();
  await prisma.task.deleteMany();
  await prisma.harvest.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.livestockSupplyUsage.deleteMany();
  await prisma.veterinarySupply.deleteMany();
  await prisma.reproduction.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.feeding.deleteMany();
  await prisma.livestock.deleteMany();
  await prisma.finance.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.field.deleteMany();
  await prisma.address.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Dados limpos\n");

  const hashedPassword = await bcrypt.hash("Senha@123", 10);

  // ============================================
  // 1. USUÁRIOS - Todos os tipos de roles
  // ============================================
  console.log("👤 Criando usuários (todos os roles)...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@agroxp.com",
      password: hashedPassword,
      firstName: "Administrador",
      lastName: "Sistema",
      phone: "+55 11 99999-0001",
      role: "ADMIN",
      isActive: true,
    },
  });

  const farmer1 = await prisma.user.create({
    data: {
      email: "joao.silva@fazenda.com",
      password: hashedPassword,
      firstName: "João",
      lastName: "Silva",
      phone: "+55 11 99999-0002",
      role: "FARMER",
      isActive: true,
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      email: "maria.santos@fazenda.com",
      password: hashedPassword,
      firstName: "Maria",
      lastName: "Santos",
      phone: "+55 11 99999-0003",
      role: "FARMER",
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "carlos.oliveira@fazenda.com",
      password: hashedPassword,
      firstName: "Carlos",
      lastName: "Oliveira",
      phone: "+55 11 99999-0004",
      role: "MANAGER",
      isActive: true,
    },
  });

  const worker = await prisma.user.create({
    data: {
      email: "pedro.worker@fazenda.com",
      password: hashedPassword,
      firstName: "Pedro",
      lastName: "Trabalhador",
      phone: "+55 11 99999-0005",
      role: "WORKER",
      isActive: true,
    },
  });

  console.log(`✅ ${5} usuários criados (ADMIN, FARMER x2, MANAGER, WORKER)\n`);

  // ============================================
  // 2. FAZENDAS - Com endereços completos
  // ============================================
  console.log("🏡 Criando fazendas...");
  const farm1 = await prisma.farm.create({
    data: {
      name: "Fazenda São João",
      description:
        "Fazenda especializada em produção de soja, milho e pecuária de corte",
      location: "Ribeirão Preto, SP",
      size: 500.0,
      ownerId: farmer1.id,
      address: {
        create: {
          street: "Rodovia Anhanguera",
          number: "KM 245",
          complement: "Sítio São João",
          city: "Ribeirão Preto",
          state: "SP",
          zipCode: "14000-000",
          country: "Brazil",
        },
      },
    },
  });

  const farm2 = await prisma.farm.create({
    data: {
      name: "Fazenda Esperança",
      description:
        "Fazenda com produção diversificada, pecuária leiteira e avicultura",
      location: "Campinas, SP",
      size: 300.0,
      ownerId: farmer2.id,
      address: {
        create: {
          street: "Estrada Municipal",
          number: "S/N",
          complement: "Chácara Esperança",
          city: "Campinas",
          state: "SP",
          zipCode: "13000-000",
          country: "Brazil",
        },
      },
    },
  });

  const farm3 = await prisma.farm.create({
    data: {
      name: "Fazenda Verde Vale",
      description: "Fazenda focada em agricultura orgânica e sustentável",
      location: "Piracicaba, SP",
      size: 200.0,
      ownerId: farmer1.id,
      address: {
        create: {
          street: "Rodovia Luiz de Queiroz",
          number: "KM 12",
          complement: "Fazenda Verde Vale",
          city: "Piracicaba",
          state: "SP",
          zipCode: "13400-000",
          country: "Brazil",
        },
      },
    },
  });

  console.log(`✅ ${3} fazendas criadas\n`);

  // ============================================
  // 3. PARCELAS (FIELDS) - Diferentes tipos de solo
  // ============================================
  console.log("🌾 Criando parcelas...");
  const fields = await prisma.field.createManyAndReturn({
    data: [
      {
        name: "Talhão Norte",
        description:
          "Parcela principal para plantio de soja - Solo argiloso fértil",
        size: 50.0,
        location: "Norte da fazenda",
        farmId: farm1.id,
        soilType: "Argiloso",
        phLevel: 6.2,
      },
      {
        name: "Talhão Sul",
        description: "Parcela para rotação de culturas - Solo arenoso",
        size: 45.0,
        location: "Sul da fazenda",
        farmId: farm1.id,
        soilType: "Arenoso",
        phLevel: 5.8,
      },
      {
        name: "Pastagem Central",
        description: "Área destinada à pecuária bovina - Pastagem natural",
        size: 80.0,
        location: "Centro da fazenda",
        farmId: farm2.id,
        soilType: "Argiloso",
        phLevel: 6.0,
      },
      {
        name: "Talhão Leste",
        description: "Área para cultivo de milho e soja - Solo fértil",
        size: 60.0,
        location: "Leste da fazenda",
        farmId: farm2.id,
        soilType: "Argiloso",
        phLevel: 6.5,
      },
      {
        name: "Talhão Oeste",
        description: "Área para cultivo de café - Solo vulcânico",
        size: 40.0,
        location: "Oeste da fazenda",
        farmId: farm2.id,
        soilType: "Vulcânico",
        phLevel: 5.5,
      },
      {
        name: "Pastagem Norte",
        description: "Pastagem para ovinos e caprinos",
        size: 35.0,
        location: "Norte da fazenda",
        farmId: farm3.id,
        soilType: "Arenoso",
        phLevel: 6.0,
      },
    ],
  });

  const [field1, field2, field3, field4, field5, field6] = fields;
  console.log(`✅ ${6} parcelas criadas\n`);

  // ============================================
  // 4. CULTURAS (CROPS) - Todos os status
  // ============================================
  console.log("🌱 Criando culturas (todos os status)...");
  const crops = await prisma.crop.createManyAndReturn({
    data: [
      {
        name: "Soja",
        variety: "BRS 284",
        plantingDate: new Date("2025-01-15"),
        harvestDate: new Date("2025-05-20"),
        expectedYield: 3500.0,
        actualYield: 3200.0,
        status: "HARVESTED",
        fieldId: field1.id,
      },
      {
        name: "Milho",
        variety: "BRS 2020",
        plantingDate: new Date("2025-02-01"),
        harvestDate: new Date("2025-06-15"),
        expectedYield: 8000.0,
        actualYield: 7500.0,
        status: "HARVESTED",
        fieldId: field2.id,
      },
      {
        name: "Soja",
        variety: "BRS 284",
        plantingDate: new Date("2025-10-01"),
        expectedYield: 3800.0,
        status: "GROWING",
        fieldId: field4.id,
      },
      {
        name: "Café",
        variety: "Catuai",
        plantingDate: new Date("2024-06-01"),
        expectedYield: 2500.0,
        status: "GROWING",
        fieldId: field5.id,
      },
      {
        name: "Algodão",
        variety: "BRS 286",
        plantingDate: new Date("2025-11-01"),
        expectedYield: 4500.0,
        status: "PLANTED",
        fieldId: field1.id,
      },
      {
        name: "Feijão",
        variety: "BRS Estilo",
        plantingDate: new Date("2025-12-15"),
        expectedYield: 2800.0,
        status: "PLANNED",
        fieldId: field2.id,
      },
      {
        name: "Trigo",
        variety: "BRS 264",
        plantingDate: new Date("2025-05-01"),
        harvestDate: new Date("2025-09-15"),
        expectedYield: 4200.0,
        actualYield: 4000.0,
        status: "SOLD",
        fieldId: field4.id,
      },
    ],
  });

  const [crop1, crop2, crop3, crop4, crop5, crop6, crop7] = crops;
  console.log(
    `✅ ${7} culturas criadas (PLANNED, PLANTED, GROWING, HARVESTED, SOLD)\n`
  );

  // ============================================
  // 5. TRATAMENTOS (TREATMENTS) - Variados
  // ============================================
  console.log("💊 Criando tratamentos...");
  await prisma.treatment.createMany({
    data: [
      {
        type: "Fertilização",
        description: "Aplicação de NPK 10-10-10 na base",
        date: new Date("2025-01-20"),
        productUsed: "Fertilizante NPK 10-10-10",
        quantity: 500.0,
        cropId: crop1.id,
      },
      {
        type: "Pulverização",
        description: "Aplicação de herbicida pré-emergente",
        date: new Date("2025-02-10"),
        productUsed: "Glifosato",
        quantity: 20.0,
        cropId: crop1.id,
      },
      {
        type: "Fertilização",
        description: "Adubação de cobertura com nitrogênio",
        date: new Date("2025-02-05"),
        productUsed: "Ureia",
        quantity: 300.0,
        cropId: crop2.id,
      },
      {
        type: "Pulverização",
        description: "Aplicação de fungicida preventivo",
        date: new Date("2025-10-15"),
        productUsed: "Fungicida Triazol",
        quantity: 15.0,
        cropId: crop3.id,
      },
      {
        type: "Adubação",
        description: "Aplicação de adubo orgânico",
        date: new Date("2024-06-15"),
        productUsed: "Composto Orgânico",
        quantity: 1000.0,
        cropId: crop4.id,
      },
    ],
  });
  console.log(`✅ ${5} tratamentos criados\n`);

  // ============================================
  // 6. COLHEITAS (HARVESTS) - Todas as qualidades
  // ============================================
  console.log("🌾 Criando colheitas (todas as qualidades)...");
  await prisma.harvest.createMany({
    data: [
      {
        crop: "Soja",
        date: new Date("2025-05-20"),
        yield: 3200.0,
        expectedYield: 3500.0,
        harvestArea: 50.0,
        quality: "GOOD",
        cropId: crop1.id,
        ownerId: farmer1.id,
      },
      {
        crop: "Milho",
        date: new Date("2025-06-15"),
        yield: 7500.0,
        expectedYield: 8000.0,
        harvestArea: 45.0,
        quality: "EXCELLENT",
        cropId: crop2.id,
        ownerId: farmer1.id,
      },
      {
        crop: "Soja",
        date: new Date("2025-04-10"),
        yield: 2800.0,
        expectedYield: 3000.0,
        harvestArea: 30.0,
        quality: "AVERAGE",
        ownerId: farmer2.id,
      },
      {
        crop: "Trigo",
        date: new Date("2025-09-15"),
        yield: 4000.0,
        expectedYield: 4200.0,
        harvestArea: 60.0,
        quality: "EXCELLENT",
        cropId: crop7.id,
        ownerId: farmer2.id,
      },
      {
        crop: "Soja",
        date: new Date("2025-03-20"),
        yield: 2500.0,
        expectedYield: 3000.0,
        harvestArea: 40.0,
        quality: "LOW",
        ownerId: farmer1.id,
      },
    ],
  });
  console.log(`✅ ${5} colheitas criadas (EXCELLENT, GOOD, AVERAGE, LOW)\n`);

  // ============================================
  // 7. PECUÁRIA (LIVESTOCK) - Todas as categorias
  // ============================================
  console.log("🐄 Criando gado (todas as categorias)...");
  const livestock = await prisma.livestock.createManyAndReturn({
    data: [
      {
        name: "Gado Nelore",
        breed: "Nelore",
        quantity: 50,
        age: 24,
        weight: 450.0,
        category: "BOVINO",
        status: "ACTIVE",
        fieldId: field3.id,
      },
      {
        name: "Gado Angus",
        breed: "Angus",
        quantity: 30,
        age: 18,
        weight: 380.0,
        category: "BOVINO",
        status: "ACTIVE",
        fieldId: field3.id,
      },
      {
        name: "Suínos Large White",
        breed: "Large White",
        quantity: 100,
        age: 6,
        weight: 80.0,
        category: "SUINO",
        status: "ACTIVE",
        fieldId: field3.id,
      },
      {
        name: "Ovinos Dorper",
        breed: "Dorper",
        quantity: 80,
        age: 12,
        weight: 45.0,
        category: "OVINO",
        status: "ACTIVE",
        fieldId: field6.id,
      },
      {
        name: "Caprinos Boer",
        breed: "Boer",
        quantity: 60,
        age: 8,
        weight: 35.0,
        category: "CAPRINO",
        status: "ACTIVE",
        fieldId: field6.id,
      },
      {
        name: "Galinhas Poedeiras",
        breed: "Rhode Island Red",
        quantity: 200,
        age: 3,
        weight: 2.5,
        category: "AVICOLA",
        status: "ACTIVE",
        fieldId: field3.id,
      },
      {
        name: "Cavalos Quarto de Milha",
        breed: "Quarto de Milha",
        quantity: 12,
        age: 48,
        weight: 500.0,
        category: "EQUINO",
        status: "ACTIVE",
        fieldId: field3.id,
      },
      {
        name: "Gado Vendido",
        breed: "Nelore",
        quantity: 10,
        age: 30,
        weight: 480.0,
        category: "BOVINO",
        status: "SOLD",
        fieldId: field3.id,
      },
    ],
  });

  const [
    livestock1,
    livestock2,
    livestock3,
    livestock4,
    livestock5,
    livestock6,
    livestock7,
    livestock8,
  ] = livestock;
  console.log(
    `✅ ${8} grupos de gado criados (BOVINO, SUINO, OVINO, CAPRINO, AVICOLA, EQUINO, SOLD)\n`
  );

  // ============================================
  // 8. ALIMENTAÇÕES (FEEDINGS) - Variadas
  // ============================================
  console.log("🌾 Criando registros de alimentação...");
  await prisma.feeding.createMany({
    data: [
      {
        livestockId: livestock1.id,
        feedType: "Ração Concentrada",
        quantity: 500.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Alimentação diária matutina",
      },
      {
        livestockId: livestock1.id,
        feedType: "Pasto",
        quantity: 2000.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Pastejo livre",
      },
      {
        livestockId: livestock2.id,
        feedType: "Ração Premium",
        quantity: 300.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Alimentação para engorda",
      },
      {
        livestockId: livestock3.id,
        feedType: "Ração Suína",
        quantity: 200.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Ração balanceada",
      },
      {
        livestockId: livestock4.id,
        feedType: "Pasto + Suplemento",
        quantity: 150.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Pastejo com suplementação",
      },
      {
        livestockId: livestock5.id,
        feedType: "Ração Caprina",
        quantity: 80.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Ração específica para caprinos",
      },
      {
        livestockId: livestock6.id,
        feedType: "Ração Aviária",
        quantity: 50.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Ração para postura",
      },
      {
        livestockId: livestock7.id,
        feedType: "Feno + Ração",
        quantity: 120.0,
        unit: "kg",
        feedingDate: new Date("2025-11-15"),
        notes: "Alimentação para equinos",
      },
    ],
  });
  console.log(`✅ ${8} registros de alimentação criados\n`);

  // ============================================
  // 9. VACINAÇÕES (VACCINATIONS) - Histórico completo
  // ============================================
  console.log("💉 Criando registros de vacinação...");
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
  console.log(`✅ ${6} registros de vacinação criados\n`);

  // ============================================
  // 10. REPRODUÇÕES (REPRODUCTIONS) - Todos os status
  // ============================================
  console.log("🐣 Criando registros de reprodução (todos os status)...");
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
      {
        livestockId: livestock4.id,
        matingDate: new Date("2025-07-01"),
        expectedDeliveryDate: new Date("2025-12-01"),
        status: "PLANNED",
        notes: "Planejamento de reprodução",
      },
      {
        livestockId: livestock2.id,
        matingDate: new Date("2025-01-15"),
        expectedDeliveryDate: new Date("2025-10-20"),
        status: "ABORTED",
        notes: "Aborto espontâneo",
      },
    ],
  });
  console.log(
    `✅ ${6} registros de reprodução criados (PLANNED, PREGNANT, DELIVERED, ABORTED)\n`
  );

  // ============================================
  // 11. SUPRIMENTOS VETERINÁRIOS - Todas as categorias
  // ============================================
  console.log("💊 Criando suprimentos veterinários (todas as categorias)...");
  const supplies = await prisma.veterinarySupply.createManyAndReturn({
    data: [
      {
        name: "Vacina Febre Aftosa",
        description: "Vacina para prevenção de febre aftosa em bovinos",
        quantity: 100.0,
        unit: "doses",
        supplier: "Laboratório Veterinário XYZ",
        expirationDate: new Date("2026-12-31"),
        batchNumber: "FA-2025-001",
        category: "VACCINE",
      },
      {
        name: "Antibiótico Bovino",
        description: "Antibiótico de amplo espectro para bovinos",
        quantity: 50.0,
        unit: "frascos",
        supplier: "Farmácia Veterinária ABC",
        expirationDate: new Date("2026-06-30"),
        batchNumber: "AB-2025-002",
        category: "MEDICINE",
      },
      {
        name: "Suplemento Mineral",
        description: "Suplemento mineral para bovinos",
        quantity: 500.0,
        unit: "kg",
        supplier: "Nutrição Animal LTDA",
        expirationDate: new Date("2027-12-31"),
        batchNumber: "SM-2025-003",
        category: "SUPPLEMENT",
      },
      {
        name: "Ração Medicada",
        description: "Ração com medicamento para tratamento",
        quantity: 200.0,
        unit: "kg",
        supplier: "Nutrição Animal LTDA",
        expirationDate: new Date("2026-03-31"),
        batchNumber: "RM-2025-004",
        category: "FEED",
      },
      {
        name: "Seringas Descartáveis",
        description: "Seringas para aplicação de vacinas",
        quantity: 500.0,
        unit: "unidades",
        supplier: "Material Veterinário",
        expirationDate: new Date("2027-12-31"),
        batchNumber: "SD-2025-005",
        category: "OTHER",
      },
    ],
  });

  const [supply1, supply2, supply3, supply4, supply5] = supplies;
  console.log(
    `✅ ${5} suprimentos criados (VACCINE, MEDICINE, SUPPLEMENT, FEED, OTHER)\n`
  );

  // ============================================
  // 12. USOS DE SUPRIMENTOS
  // ============================================
  console.log("📋 Criando registros de uso de suprimentos...");
  await prisma.livestockSupplyUsage.createMany({
    data: [
      {
        livestockId: livestock1.id,
        supplyId: supply1.id,
        quantityUsed: 50.0,
        unit: "doses",
        usageDate: new Date("2025-05-15"),
        notes: "Aplicação em todo o rebanho",
      },
      {
        livestockId: livestock2.id,
        supplyId: supply1.id,
        quantityUsed: 30.0,
        unit: "doses",
        usageDate: new Date("2025-05-15"),
        notes: "Aplicação preventiva",
      },
      {
        livestockId: livestock1.id,
        supplyId: supply3.id,
        quantityUsed: 100.0,
        unit: "kg",
        usageDate: new Date("2025-11-01"),
        notes: "Suplementação mensal",
      },
      {
        livestockId: livestock3.id,
        supplyId: supply4.id,
        quantityUsed: 50.0,
        unit: "kg",
        usageDate: new Date("2025-10-15"),
        notes: "Tratamento de suínos",
      },
    ],
  });
  console.log(`✅ ${4} registros de uso de suprimentos criados\n`);

  // ============================================
  // 13. INVENTÁRIO - Categorias variadas
  // ============================================
  console.log("📦 Criando inventário...");
  await prisma.inventory.createMany({
    data: [
      {
        itemName: "Fertilizante NPK 10-10-10",
        category: "Fertilizante",
        quantity: 100,
        unit: "sacos",
        cost: 120.5,
        supplier: "AgroSupply LTDA",
        purchaseDate: new Date("2025-10-01"),
        expiryDate: new Date("2027-10-01"),
        farmId: farm1.id,
      },
      {
        itemName: "Sementes de Soja BRS 284",
        category: "Sementes",
        quantity: 500,
        unit: "kg",
        cost: 15.8,
        supplier: "Sementes Premium",
        purchaseDate: new Date("2025-09-15"),
        farmId: farm1.id,
      },
      {
        itemName: "Herbicida Glifosato",
        category: "Defensivo",
        quantity: 50,
        unit: "litros",
        cost: 45.0,
        supplier: "AgroQuímica XYZ",
        purchaseDate: new Date("2025-10-10"),
        expiryDate: new Date("2026-10-10"),
        farmId: farm1.id,
      },
      {
        itemName: "Ração Concentrada",
        category: "Ração",
        quantity: 200,
        unit: "sacos",
        cost: 85.0,
        supplier: "Nutrição Animal",
        purchaseDate: new Date("2025-11-01"),
        farmId: farm2.id,
      },
      {
        itemName: "Calcário Agrícola",
        category: "Corretivo",
        quantity: 500,
        unit: "kg",
        cost: 0.35,
        supplier: "Minerais do Brasil",
        purchaseDate: new Date("2025-08-20"),
        farmId: farm1.id,
      },
      {
        itemName: "Fungicida Triazol",
        category: "Defensivo",
        quantity: 30,
        unit: "litros",
        cost: 85.0,
        supplier: "AgroQuímica XYZ",
        purchaseDate: new Date("2025-10-05"),
        expiryDate: new Date("2026-10-05"),
        farmId: farm1.id,
      },
      {
        itemName: "Sementes de Milho BRS 2020",
        category: "Sementes",
        quantity: 300,
        unit: "kg",
        cost: 12.5,
        supplier: "Sementes Premium",
        purchaseDate: new Date("2025-09-20"),
        farmId: farm1.id,
      },
    ],
  });
  console.log(`✅ ${7} itens de inventário criados\n`);

  // ============================================
  // 14. EQUIPAMENTOS - Todos os status
  // ============================================
  console.log("🚜 Criando equipamentos (todos os status)...");
  const equipment = await prisma.equipment.createManyAndReturn({
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
        farmId: farm1.id,
      },
      {
        name: "Colheitadeira Case IH",
        type: "Colheitadeira",
        brand: "Case IH",
        model: "Axial Flow 8230",
        year: 2018,
        status: "IN_USE",
        purchaseDate: new Date("2018-05-20"),
        lastMaintenance: new Date("2025-09-01"),
        farmId: farm1.id,
      },
      {
        name: "Pulverizador Jacto",
        type: "Pulverizador",
        brand: "Jacto",
        model: "Uniport 3030",
        year: 2022,
        status: "AVAILABLE",
        purchaseDate: new Date("2022-02-10"),
        lastMaintenance: new Date("2025-11-01"),
        farmId: farm1.id,
      },
      {
        name: "Trator Massey Ferguson",
        type: "Trator",
        brand: "Massey Ferguson",
        model: "MF 6713",
        year: 2019,
        status: "MAINTENANCE",
        purchaseDate: new Date("2019-04-12"),
        lastMaintenance: new Date("2025-08-20"),
        farmId: farm2.id,
      },
      {
        name: "Plantadeira Semeato",
        type: "Plantadeira",
        brand: "Semeato",
        model: "PD 3060",
        year: 2021,
        status: "AVAILABLE",
        purchaseDate: new Date("2021-03-10"),
        lastMaintenance: new Date("2025-10-01"),
        farmId: farm1.id,
      },
      {
        name: "Trator Antigo",
        type: "Trator",
        brand: "Valmet",
        model: "685",
        year: 1995,
        status: "OUT_OF_ORDER",
        purchaseDate: new Date("1995-01-01"),
        lastMaintenance: new Date("2024-12-01"),
        farmId: farm2.id,
      },
    ],
  });

  const [
    equipment1,
    equipment2,
    equipment3,
    equipment4,
    equipment5,
    equipment6,
  ] = equipment;
  console.log(
    `✅ ${6} equipamentos criados (AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_ORDER)\n`
  );

  // ============================================
  // 15. REGISTROS DE MANUTENÇÃO
  // ============================================
  console.log("🔧 Criando registros de manutenção...");
  await prisma.maintenanceRecord.createMany({
    data: [
      {
        equipmentId: equipment1.id,
        date: new Date("2025-10-15"),
        type: "Manutenção Preventiva",
        description: "Troca de óleo, filtros e revisão geral",
        cost: 2500.0,
      },
      {
        equipmentId: equipment2.id,
        date: new Date("2025-09-01"),
        type: "Manutenção Corretiva",
        description: "Reparo no sistema de corte",
        cost: 8500.0,
      },
      {
        equipmentId: equipment3.id,
        date: new Date("2025-11-01"),
        type: "Manutenção Preventiva",
        description: "Limpeza e calibração dos bicos",
        cost: 800.0,
      },
      {
        equipmentId: equipment4.id,
        date: new Date("2025-08-20"),
        type: "Manutenção Preventiva",
        description: "Revisão completa do motor",
        cost: 3200.0,
      },
      {
        equipmentId: equipment5.id,
        date: new Date("2025-10-01"),
        type: "Manutenção Preventiva",
        description: "Ajuste dos discos de plantio",
        cost: 1200.0,
      },
      {
        equipmentId: equipment6.id,
        date: new Date("2024-12-01"),
        type: "Manutenção Corretiva",
        description: "Reparo no sistema hidráulico - aguardando peças",
        cost: 5000.0,
      },
    ],
  });
  console.log(`✅ ${6} registros de manutenção criados\n`);

  // ============================================
  // 16. FUNCIONÁRIOS
  // ============================================
  console.log("👷 Criando funcionários...");
  await prisma.employee.createMany({
    data: [
      {
        firstName: "Pedro",
        lastName: "Oliveira",
        email: "pedro.oliveira@fazenda.com",
        phone: "+55 11 99999-0101",
        position: "Operador de Máquinas",
        hireDate: new Date("2020-01-15"),
        salary: 3500.0,
        farmId: farm1.id,
      },
      {
        firstName: "Ana",
        lastName: "Costa",
        email: "ana.costa@fazenda.com",
        phone: "+55 11 99999-0102",
        position: "Técnico Agrícola",
        hireDate: new Date("2021-03-20"),
        salary: 4500.0,
        farmId: farm1.id,
      },
      {
        firstName: "Roberto",
        lastName: "Ferreira",
        email: "roberto.ferreira@fazenda.com",
        phone: "+55 11 99999-0103",
        position: "Gerente de Pecuária",
        hireDate: new Date("2019-06-10"),
        salary: 6000.0,
        farmId: farm2.id,
      },
      {
        firstName: "Juliana",
        lastName: "Martins",
        email: "juliana.martins@fazenda.com",
        phone: "+55 11 99999-0104",
        position: "Veterinária",
        hireDate: new Date("2022-02-01"),
        salary: 7000.0,
        farmId: farm2.id,
      },
      {
        firstName: "Carlos",
        lastName: "Souza",
        email: "carlos.souza@fazenda.com",
        phone: "+55 11 99999-0105",
        position: "Técnico em Irrigação",
        hireDate: new Date("2023-05-15"),
        salary: 4000.0,
        farmId: farm3.id,
      },
    ],
  });
  console.log(`✅ ${5} funcionários criados\n`);

  // ============================================
  // 17. TRANSAÇÕES FINANCEIRAS - INCOME e EXPENSE
  // ============================================
  console.log("💰 Criando transações financeiras...");
  await prisma.finance.createMany({
    data: [
      {
        type: "INCOME",
        category: "Venda de Soja",
        amount: 160000.0,
        description: "Venda de 50 hectares de soja - Safra 2025",
        date: new Date("2025-05-25"),
        fieldId: field1.id,
      },
      {
        type: "INCOME",
        category: "Venda de Milho",
        amount: 135000.0,
        description: "Venda de 45 hectares de milho - Safra 2025",
        date: new Date("2025-06-20"),
        fieldId: field2.id,
      },
      {
        type: "INCOME",
        category: "Venda de Trigo",
        amount: 96000.0,
        description: "Venda de 60 hectares de trigo - Safra 2025",
        date: new Date("2025-09-20"),
        fieldId: field4.id,
      },
      {
        type: "INCOME",
        category: "Venda de Gado",
        amount: 45000.0,
        description: "Venda de 10 cabeças de gado Nelore",
        date: new Date("2025-10-20"),
        fieldId: field3.id,
      },
      {
        type: "EXPENSE",
        category: "Compra de Sementes",
        amount: 7900.0,
        description: "Compra de sementes de soja BRS 284",
        date: new Date("2025-09-15"),
        fieldId: field1.id,
      },
      {
        type: "EXPENSE",
        category: "Fertilizantes",
        amount: 12050.0,
        description: "Compra de fertilizante NPK",
        date: new Date("2025-10-01"),
        fieldId: field1.id,
      },
      {
        type: "EXPENSE",
        category: "Defensivos",
        amount: 8500.0,
        description: "Compra de herbicidas e fungicidas",
        date: new Date("2025-10-10"),
        fieldId: field1.id,
      },
      {
        type: "EXPENSE",
        category: "Manutenção de Equipamentos",
        amount: 2500.0,
        description: "Manutenção preventiva do trator",
        date: new Date("2025-10-15"),
      },
      {
        type: "EXPENSE",
        category: "Salários",
        amount: 14000.0,
        description: "Pagamento de salários - Novembro 2025",
        date: new Date("2025-11-05"),
      },
      {
        type: "EXPENSE",
        category: "Ração",
        amount: 17000.0,
        description: "Compra de ração para o rebanho",
        date: new Date("2025-11-01"),
        fieldId: field3.id,
      },
      {
        type: "EXPENSE",
        category: "Combustível",
        amount: 5000.0,
        description: "Abastecimento de máquinas",
        date: new Date("2025-11-10"),
      },
    ],
  });
  console.log(`✅ ${11} transações financeiras criadas (INCOME e EXPENSE)\n`);

  // ============================================
  // 18. TAREFAS - Todas as prioridades e status
  // ============================================
  console.log("📋 Criando tarefas (todas as prioridades e status)...");
  await prisma.task.createMany({
    data: [
      {
        title: "Preparar solo para plantio",
        description: "Aplicar calcário e adubação no talhão norte",
        dueDate: new Date("2025-12-01"),
        priority: "HIGH",
        status: "TODO",
        fieldId: field1.id,
        cropId: crop5.id,
        farmId: farm1.id,
      },
      {
        title: "Aplicar herbicida",
        description: "Pulverização preventiva de herbicida",
        dueDate: new Date("2025-11-25"),
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        fieldId: field1.id,
        cropId: crop3.id,
        farmId: farm1.id,
      },
      {
        title: "Vacinação do rebanho",
        description: "Aplicar segunda dose da vacina contra febre aftosa",
        dueDate: new Date("2025-11-20"),
        priority: "HIGH",
        status: "TODO",
        fieldId: field3.id,
        farmId: farm2.id,
      },
      {
        title: "Manutenção da colheitadeira",
        description: "Revisão completa antes da próxima safra",
        dueDate: new Date("2025-12-10"),
        priority: "MEDIUM",
        status: "TODO",
        farmId: farm1.id,
      },
      {
        title: "Colheita de soja",
        description: "Iniciar colheita da safra de soja",
        dueDate: new Date("2026-01-15"),
        priority: "URGENT",
        status: "TODO",
        fieldId: field4.id,
        cropId: crop3.id,
        farmId: farm2.id,
      },
      {
        title: "Plantio de feijão",
        description: "Plantio de feijão no talhão sul",
        dueDate: new Date("2025-12-15"),
        priority: "MEDIUM",
        status: "DONE",
        completedAt: new Date("2025-12-14"),
        fieldId: field2.id,
        cropId: crop6.id,
        farmId: farm1.id,
      },
      {
        title: "Revisão de equipamentos",
        description: "Revisar todos os equipamentos antes da safra",
        dueDate: new Date("2025-12-05"),
        priority: "LOW",
        status: "CANCELLED",
        farmId: farm1.id,
      },
    ],
  });
  console.log(
    `✅ ${7} tarefas criadas (LOW, MEDIUM, HIGH, URGENT / TODO, IN_PROGRESS, DONE, CANCELLED)\n`
  );

  // ============================================
  // 19. ALERTAS METEOROLÓGICOS - Todos os tipos
  // ============================================
  console.log("🌦️ Criando alertas meteorológicos (todos os tipos)...");
  await prisma.weatherAlert.createMany({
    data: [
      {
        type: "HEAVY_RAIN",
        severity: "HIGH",
        title: "Chuva Intensa Prevista",
        description:
          "Previsão de chuvas intensas nos próximos 3 dias. Atenção para possíveis alagamentos.",
        startDate: new Date("2025-11-18"),
        endDate: new Date("2025-11-21"),
        region: "Ribeirão Preto, SP",
        farmId: farm1.id,
        fieldId: field1.id,
        isActive: true,
      },
      {
        type: "DROUGHT",
        severity: "MEDIUM",
        title: "Período de Seca",
        description:
          "Previsão de período sem chuvas. Atenção para irrigação das culturas.",
        startDate: new Date("2025-11-25"),
        endDate: new Date("2025-12-05"),
        region: "Campinas, SP",
        farmId: farm2.id,
        isActive: true,
      },
      {
        type: "FROST",
        severity: "CRITICAL",
        title: "Alerta de Geada",
        description:
          "Temperaturas baixas previstas. Proteger culturas sensíveis.",
        startDate: new Date("2025-12-10"),
        endDate: new Date("2025-12-12"),
        region: "Ribeirão Preto, SP",
        farmId: farm1.id,
        isActive: true,
      },
      {
        type: "STORM",
        severity: "HIGH",
        title: "Tempestade com Ventos Fortes",
        description: "Previsão de tempestade com ventos de até 80 km/h.",
        startDate: new Date("2025-11-22"),
        endDate: new Date("2025-11-23"),
        region: "Piracicaba, SP",
        farmId: farm3.id,
        isActive: true,
      },
      {
        type: "HAIL",
        severity: "CRITICAL",
        title: "Alerta de Granizo",
        description:
          "Possibilidade de granizo. Proteger culturas e equipamentos.",
        startDate: new Date("2025-12-15"),
        endDate: new Date("2025-12-16"),
        region: "Campinas, SP",
        farmId: farm2.id,
        isActive: true,
      },
      {
        type: "HEAT_WAVE",
        severity: "MEDIUM",
        title: "Onda de Calor",
        description:
          "Temperaturas acima de 35°C previstas. Atenção para irrigação.",
        startDate: new Date("2025-11-28"),
        endDate: new Date("2025-12-02"),
        region: "Ribeirão Preto, SP",
        farmId: farm1.id,
        isActive: true,
      },
    ],
  });
  console.log(
    `✅ ${6} alertas meteorológicos criados (HEAVY_RAIN, DROUGHT, FROST, STORM, HAIL, HEAT_WAVE)\n`
  );

  // ============================================
  // 20. ALERTAS GERAIS - Todos os tipos
  // ============================================
  console.log("🔔 Criando alertas gerais (todos os tipos)...");
  await prisma.alert.createMany({
    data: [
      {
        type: "INVENTORY_LOW",
        severity: "MEDIUM",
        title: "Estoque de Fertilizante Baixo",
        message:
          "O estoque de fertilizante NPK está abaixo do mínimo recomendado.",
        isRead: false,
        isActive: true,
        farmId: farm1.id,
      },
      {
        type: "VACCINATION_DUE",
        severity: "HIGH",
        title: "Vacinação Pendente",
        message:
          "Segunda dose da vacina contra febre aftosa deve ser aplicada até 20/11/2025.",
        isRead: false,
        isActive: true,
        farmId: farm2.id,
        livestockId: livestock1.id,
      },
      {
        type: "MAINTENANCE_DUE",
        severity: "MEDIUM",
        title: "Manutenção do Trator Pendente",
        message: "O trator Massey Ferguson está com manutenção atrasada.",
        isRead: false,
        isActive: true,
        farmId: farm2.id,
      },
      {
        type: "HARVEST_TIME",
        severity: "HIGH",
        title: "Época de Colheita",
        message: "A cultura de soja no talhão leste está pronta para colheita.",
        isRead: false,
        isActive: true,
        farmId: farm2.id,
        fieldId: field4.id,
        cropId: crop3.id,
      },
      {
        type: "PLANTING_TIME",
        severity: "MEDIUM",
        title: "Época de Plantio",
        message:
          "Período ideal para plantio de soja se aproxima. Preparar solo.",
        isRead: false,
        isActive: true,
        farmId: farm1.id,
        fieldId: field1.id,
      },
      {
        type: "WEATHER_WARNING",
        severity: "HIGH",
        title: "Alerta Meteorológico Ativo",
        message: "Alerta de geada ativo. Proteger culturas sensíveis.",
        isRead: false,
        isActive: true,
        farmId: farm1.id,
      },
      {
        type: "FINANCIAL_ALERT",
        severity: "MEDIUM",
        title: "Despesas do Mês",
        message:
          "Despesas do mês de novembro ultrapassaram o orçamento previsto.",
        isRead: false,
        isActive: true,
        farmId: farm1.id,
      },
      {
        type: "OTHER",
        severity: "LOW",
        title: "Reunião Agendada",
        message:
          "Reunião com fornecedor de sementes agendada para próxima semana.",
        isRead: true,
        isActive: true,
        farmId: farm1.id,
      },
    ],
  });
  console.log(
    `✅ ${8} alertas gerais criados (todos os tipos e severidades)\n`
  );

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ SEED COMPLETO CONCLUÍDO COM SUCESSO!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n📊 Resumo dos dados criados:");
  console.log(`   👤 Usuários: 5 (ADMIN, FARMER x2, MANAGER, WORKER)`);
  console.log(`   🏡 Fazendas: 3`);
  console.log(`   🌾 Parcelas: 6`);
  console.log(`   🌱 Culturas: 7 (todos os status)`);
  console.log(`   💊 Tratamentos: 5`);
  console.log(`   🌾 Colheitas: 5 (todas as qualidades)`);
  console.log(`   🐄 Gado: 8 grupos (todas as categorias e status)`);
  console.log(`   🌾 Alimentações: 8`);
  console.log(`   💉 Vacinações: 6`);
  console.log(`   🐣 Reproduções: 6 (todos os status)`);
  console.log(`   💊 Suprimentos Veterinários: 5 (todas as categorias)`);
  console.log(`   📋 Usos de Suprimentos: 4`);
  console.log(`   📦 Inventário: 7 itens`);
  console.log(`   🚜 Equipamentos: 6 (todos os status)`);
  console.log(`   🔧 Manutenções: 6`);
  console.log(`   👷 Funcionários: 5`);
  console.log(`   💰 Transações Financeiras: 11 (INCOME e EXPENSE)`);
  console.log(`   📋 Tarefas: 7 (todas as prioridades e status)`);
  console.log(`   🌦️ Alertas Meteorológicos: 6 (todos os tipos)`);
  console.log(`   🔔 Alertas Gerais: 8 (todos os tipos e severidades)`);
  console.log("\n🔑 Credenciais de acesso:");
  console.log("   Admin: admin@agroxp.com / Senha@123");
  console.log("   Fazendeiro 1: joao.silva@fazenda.com / Senha@123");
  console.log("   Fazendeiro 2: maria.santos@fazenda.com / Senha@123");
  console.log("   Gerente: carlos.oliveira@fazenda.com / Senha@123");
  console.log("   Trabalhador: pedro.worker@fazenda.com / Senha@123");
  console.log("\n✨ TODAS as funcionalidades do sistema foram populadas!");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
