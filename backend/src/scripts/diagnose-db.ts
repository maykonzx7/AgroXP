// Script de diagnóstico para verificar problemas com o banco de dados
import prisma from '../services/database.service.js';

async function diagnoseDatabase() {
  console.log('🔍 Iniciando diagnóstico do banco de dados...\n');

  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso\n');

    // 2. Testar query simples
    console.log('2️⃣ Testando query simples...');
    const userCount = await prisma.user.count();
    console.log(`✅ Query executada com sucesso. Total de usuários: ${userCount}\n`);

    // 3. Testar criação de registro
    console.log('3️⃣ Testando criação de registro...');
    const testRecord = await prisma.finance.create({
      data: {
        type: 'EXPENSE',
        category: 'Teste',
        amount: 1.0,
        description: 'Registro de teste - pode ser deletado',
        date: new Date(),
      },
    });
    console.log(`✅ Registro criado com sucesso. ID: ${testRecord.id}\n`);

    // 4. Verificar se o registro foi salvo
    console.log('4️⃣ Verificando se o registro foi salvo...');
    const savedRecord = await prisma.finance.findUnique({
      where: { id: testRecord.id },
    });
    
    if (savedRecord) {
      console.log('✅ Registro encontrado no banco de dados\n');
      console.log('Dados do registro:', JSON.stringify(savedRecord, null, 2));
    } else {
      console.log('❌ ERRO: Registro não foi encontrado após criação!\n');
    }

    // 5. Limpar registro de teste
    console.log('\n5️⃣ Limpando registro de teste...');
    await prisma.finance.delete({
      where: { id: testRecord.id },
    });
    console.log('✅ Registro de teste removido\n');

    // 6. Testar transação
    console.log('6️⃣ Testando transação...');
    const transactionResult = await prisma.$transaction(async (tx) => {
      const record = await tx.finance.create({
        data: {
          type: 'INCOME',
          category: 'Teste Transação',
          amount: 2.0,
          description: 'Teste de transação - pode ser deletado',
          date: new Date(),
        },
      });
      return record;
    });
    console.log(`✅ Transação executada com sucesso. ID: ${transactionResult.id}\n`);

    // Verificar se a transação foi commitada
    const transactionRecord = await prisma.finance.findUnique({
      where: { id: transactionResult.id },
    });
    
    if (transactionRecord) {
      console.log('✅ Registro da transação encontrado no banco\n');
      await prisma.finance.delete({
        where: { id: transactionResult.id },
      });
      console.log('✅ Registro da transação removido\n');
    } else {
      console.log('❌ ERRO: Registro da transação não foi encontrado!\n');
    }

    // 7. Verificar configuração do Prisma
    console.log('7️⃣ Verificando configuração do Prisma...');
    const prismaConfig = {
      datasource: process.env.DATABASE_URL ? 'Configurado' : 'Não configurado',
      nodeEnv: process.env.NODE_ENV || 'Não definido',
    };
    console.log('Configuração:', JSON.stringify(prismaConfig, null, 2));
    console.log('✅ Verificação de configuração concluída\n');

    console.log('✅ Diagnóstico concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('   - Conexão: OK');
    console.log('   - Queries: OK');
    console.log('   - Criação de registros: OK');
    console.log('   - Transações: OK');
    console.log('   - Persistência: OK');

  } catch (error: any) {
    console.error('❌ Erro durante o diagnóstico:', error);
    console.error('Stack:', error.stack);
    console.error('\n📋 Detalhes do erro:');
    console.error('   - Mensagem:', error.message);
    console.error('   - Código:', error.code);
    console.error('   - Meta:', JSON.stringify(error.meta, null, 2));
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Prisma Client desconectado');
  }
}

diagnoseDatabase();

