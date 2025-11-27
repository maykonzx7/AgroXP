// Script de teste para criar um registro e verificar se está sendo salvo
import prisma from '../services/database.service.js';

async function testCreateRecord() {
  console.log('🧪 Testando criação de registro...\n');

  try {
    // 1. Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados\n');

    // 2. Buscar um usuário admin para usar como ownerId
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!admin) {
      console.error('❌ Nenhum usuário admin encontrado');
      return;
    }

    console.log(`✅ Usuário admin encontrado: ${admin.email} (ID: ${admin.id})\n`);

    // 3. Criar um registro financeiro
    console.log('📝 Criando registro financeiro...');
    const testRecord = await prisma.finance.create({
      data: {
        type: 'EXPENSE',
        category: 'Teste Automatizado',
        amount: 100.50,
        description: 'Registro de teste criado automaticamente - ' + new Date().toISOString(),
        date: new Date(),
        fieldId: null,
      },
    });

    console.log('✅ Registro criado!');
    console.log('   ID:', testRecord.id);
    console.log('   Tipo:', testRecord.type);
    console.log('   Categoria:', testRecord.category);
    console.log('   Valor:', testRecord.amount);
    console.log('   Data:', testRecord.date);
    console.log('');

    // 4. Aguardar 1 segundo
    console.log('⏳ Aguardando 1 segundo...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');

    // 5. Verificar se o registro foi salvo
    console.log('🔍 Verificando se o registro foi salvo no banco...');
    const savedRecord = await prisma.finance.findUnique({
      where: { id: testRecord.id },
    });

    if (savedRecord) {
      console.log('✅ Registro encontrado no banco de dados!');
      console.log('   Dados completos:', JSON.stringify(savedRecord, null, 2));
      console.log('');
      
      // 6. Contar total de registros
      const totalRecords = await prisma.finance.count();
      console.log(`📊 Total de registros financeiros no banco: ${totalRecords}`);
      console.log('');

      // 7. Listar últimos 5 registros
      console.log('📋 Últimos 5 registros financeiros:');
      const recentRecords = await prisma.finance.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          category: true,
          amount: true,
          description: true,
          createdAt: true,
        },
      });

      recentRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. [${record.type}] ${record.category} - R$ ${record.amount} (${record.createdAt.toISOString()})`);
      });
      console.log('');

      // 8. Deletar o registro de teste
      console.log('🗑️  Removendo registro de teste...');
      await prisma.finance.delete({
        where: { id: testRecord.id },
      });
      console.log('✅ Registro de teste removido');
      console.log('');

      console.log('✅ Teste concluído com sucesso!');
      console.log('📊 Resumo:');
      console.log('   - Registro criado: ✅');
      console.log('   - Registro persistido: ✅');
      console.log('   - Registro encontrado: ✅');
      console.log('   - Registro removido: ✅');
    } else {
      console.error('❌ ERRO CRÍTICO: Registro foi criado mas não foi encontrado no banco!');
      console.error('   Isso indica um problema de persistência.');
    }

  } catch (error: any) {
    console.error('❌ Erro durante o teste:', error);
    console.error('   Mensagem:', error.message);
    console.error('   Código:', error.code);
    if (error.meta) {
      console.error('   Meta:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Prisma Client desconectado');
  }
}

testCreateRecord();

