// Script para executar o seed
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runSeed() {
  try {
    console.log('🌱 Executando seed...\n');
    const { stdout, stderr } = await execAsync('node prisma/seed.js', {
      cwd: process.cwd(),
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error: any) {
    console.error('Erro ao executar seed:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
}

runSeed();

