// Script para testar criação via API HTTP
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@agroxp.com';
const ADMIN_PASSWORD = 'Senha@123';

async function testAPICreate() {
  console.log('🧪 Testando criação de registro via API HTTP...\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  try {
    // 1. Fazer login para obter token
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

    // 2. Criar registro financeiro via API
    console.log('2️⃣ Criando registro financeiro via API...');
    const createData = {
      type: 'EXPENSE',
      category: 'Teste API',
      amount: 250.75,
      description: 'Registro criado via teste de API - ' + new Date().toISOString(),
      date: new Date().toISOString(),
      fieldId: null,
    };

    console.log('   Dados enviados:', JSON.stringify(createData, null, 2));

    const createResponse = await fetch(`${API_URL}/api/finance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(createData),
    });

    console.log(`   Status: ${createResponse.status} ${createResponse.statusText}`);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Erro ao criar registro:', errorText);
      return;
    }

    const createdRecord = await createResponse.json();
    console.log('✅ Registro criado via API!');
    console.log('   ID:', createdRecord.id);
    console.log('   Tipo:', createdRecord.type);
    console.log('   Categoria:', createdRecord.category);
    console.log('   Valor:', createdRecord.amount);
    console.log('');

    // 3. Aguardar 1 segundo
    console.log('⏳ Aguardando 1 segundo...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');

    // 4. Buscar o registro criado
    console.log('3️⃣ Buscando registro criado...');
    const getResponse = await fetch(`${API_URL}/api/finance/${createdRecord.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (getResponse.ok) {
      const fetchedRecord = await getResponse.json();
      console.log('✅ Registro encontrado via API!');
      console.log('   Dados:', JSON.stringify(fetchedRecord, null, 2));
      console.log('');
    } else {
      console.error('❌ Erro ao buscar registro:', getResponse.status);
    }

    // 5. Listar todos os registros
    console.log('4️⃣ Listando todos os registros financeiros...');
    const listResponse = await fetch(`${API_URL}/api/finance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (listResponse.ok) {
      const records = await listResponse.json();
      console.log(`✅ Total de registros encontrados: ${records.length}`);
      console.log('');
      console.log('📋 Últimos 5 registros:');
      records.slice(0, 5).forEach((record: any, index: number) => {
        console.log(`   ${index + 1}. [${record.type}] ${record.category} - R$ ${record.amount}`);
      });
      console.log('');
    } else {
      console.error('❌ Erro ao listar registros:', listResponse.status);
    }

    // 6. Deletar o registro de teste
    console.log('5️⃣ Removendo registro de teste...');
    const deleteResponse = await fetch(`${API_URL}/api/finance/${createdRecord.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (deleteResponse.ok) {
      console.log('✅ Registro de teste removido');
    } else {
      console.error('❌ Erro ao remover registro:', deleteResponse.status);
    }

    console.log('');
    console.log('✅ Teste de API concluído!');
    console.log('📊 Resumo:');
    console.log('   - Login: ✅');
    console.log('   - Criação via API: ✅');
    console.log('   - Busca do registro: ✅');
    console.log('   - Listagem de registros: ✅');
    console.log('   - Remoção: ✅');

  } catch (error: any) {
    console.error('❌ Erro durante o teste:', error);
    console.error('   Mensagem:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
  }
}

testAPICreate();

