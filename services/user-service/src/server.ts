import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import sequelize from './config/database.config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Rotas
app.use('/api/users', userRoutes);

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
};

// Inicializar aplicação
const initializeApp = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`User Service rodando na porta ${PORT}`);
  });
};

// Lidar com encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\nEncerrando User Service...');
  await sequelize.close();
  process.exit(0);
});

initializeApp().catch(console.error);

export default app;