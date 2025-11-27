// Script para testar criação e listagem de harvests via API HTTP
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@agroxp.com';
const ADMIN_PASSWORD = 'Senha@123';

async function testHarvestAPI() {
  console.log('🧪 Testando criação e listagem de harvests via API HTTP...\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Erro no login:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token || loginData.accessToken;
    
    if (!token) {
      console.error('❌ Token não encontrado na resposta:', loginData);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // 2. Listar harvests antes (baseline)
    console.log('2️⃣ Listando harvests antes da criação...');
    const beforeResponse = await fetch(`${API_URL}/api/harvest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!beforeResponse.ok) {
      console.error('❌ Erro ao listar harvests:', beforeResponse.status);
      return;
    }

    const beforeHarvests = await beforeResponse.json();
    console.log(`✅ Encontrados ${beforeHarvests.length} harvest(s) antes da criação\n`);

    // 3. Criar novo harvest
    console.log('3️⃣ Criando novo harvest...');
    const harvestData = {
      crop: 'Teste API - ' + new Date().toISOString(),
      date: new Date().toISOString(),
      yield: 150.75,
      expectedYield: 180.0,
      harvestArea: 15.5,
      quality: 'EXCELLENT',
      cropId: null, // Sem cropId - deve aparecer pela ownerId
    };

    console.log('   Dados enviados:', JSON.stringify(harvestData, null, 2));

    const createResponse = await fetch(`${API_URL}/api/harvest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(harvestData),
    });

    console.log(`   Status: ${createResponse.status} ${createResponse.statusText}`);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Erro ao criar harvest:', errorText);
      return;
    }

    const createdHarvest = await createResponse.json();
    console.log('✅ Harvest criado via API!');
    console.log('   ID:', createdHarvest.id);
    console.log('   Crop:', createdHarvest.crop);
    console.log('   OwnerId:', createdHarvest.ownerId);
    console.log('   CropId:', createdHarvest.cropId);
    console.log('');

    // 4. Aguardar 1 segundo
    console.log('⏳ Aguardando 1 segundo...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');

    // 5. Listar harvests depois
    console.log('4️⃣ Listando harvests depois da criação...');
    const afterResponse = await fetch(`${API_URL}/api/harvest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!afterResponse.ok) {
      console.error('❌ Erro ao listar harvests:', afterResponse.status);
      return;
    }

    const afterHarvests = await afterResponse.json();
    console.log(`✅ Encontrados ${afterHarvests.length} harvest(s) depois da criação\n`);

    // 6. Verificar se o harvest criado está na lista
    const harvestFound = afterHarvests.find((h: any) => h.id === createdHarvest.id);
    
    if (harvestFound) {
      console.log('✅ SUCESSO: Harvest criado encontrado na listagem!');
      console.log('   Dados do harvest encontrado:', {
        id: harvestFound.id,
        crop: harvestFound.crop,
        ownerId: harvestFound.ownerId,
        cropId: harvestFound.cropId,
      });
    } else {
      console.error('❌ ERRO: Harvest criado NÃO foi encontrado na listagem!');
      console.error('   Isso indica que há um problema na rota GET.');
      console.error(`   Harvests na lista: ${afterHarvests.length}`);
      console.error(`   IDs na lista: ${afterHarvests.map((h: any) => h.id).join(', ')}`);
    }
    console.log('');

    // 7. Verificar se o número aumentou
    if (afterHarvests.length > beforeHarvests.length) {
      console.log(`✅ O número de harvests aumentou de ${beforeHarvests.length} para ${afterHarvests.length}`);
    } else if (afterHarvests.length === beforeHarvests.length) {
      console.warn(`⚠️  O número de harvests não mudou (${beforeHarvests.length})`);
      console.warn('   Isso pode indicar que o harvest foi criado mas não aparece na listagem.');
    } else {
      console.error(`❌ O número de harvests diminuiu de ${beforeHarvests.length} para ${afterHarvests.length}`);
    }
    console.log('');

    // 8. Buscar o harvest específico
    console.log('5️⃣ Buscando harvest específico por ID...');
    const getResponse = await fetch(`${API_URL}/api/harvest/${createdHarvest.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (getResponse.ok) {
      const specificHarvest = await getResponse.json();
      console.log('✅ Harvest encontrado por ID!');
      console.log('   Dados:', {
        id: specificHarvest.id,
        crop: specificHarvest.crop,
        yield: specificHarvest.yield,
      });
    } else {
      console.error('❌ Erro ao buscar harvest por ID:', getResponse.status);
    }
    console.log('');

    // 9. Deletar o harvest de teste
    console.log('6️⃣ Removendo harvest de teste...');
    const deleteResponse = await fetch(`${API_URL}/api/harvest/${createdHarvest.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (deleteResponse.ok) {
      console.log('✅ Harvest de teste removido');
    } else {
      console.error('❌ Erro ao remover harvest:', deleteResponse.status);
    }
    console.log('');

    // 10. Resumo
    console.log('📊 Resumo do teste:');
    console.log('   - Login: ✅');
    console.log('   - Criação via API: ✅');
    console.log('   - Harvest encontrado na listagem: ' + (harvestFound ? '✅' : '❌'));
    console.log('   - Busca por ID: ' + (getResponse.ok ? '✅' : '❌'));
    console.log('   - Remoção: ' + (deleteResponse.ok ? '✅' : '❌'));
    
    if (harvestFound && getResponse.ok && deleteResponse.ok) {
      console.log('\n✅ TESTE PASSOU: Tudo funcionando corretamente via API!');
    } else {
      console.log('\n❌ TESTE FALHOU: Há problemas que precisam ser corrigidos.');
    }

  } catch (error: any) {
    console.error('❌ Erro durante o teste:', error);
    console.error('   Mensagem:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
  }
}

testHarvestAPI();

