import express from 'express';
import cors from 'cors';
import sequelize from './config/database.config.js';
import { Parcel, Crop, Livestock } from './associations.js';
import Inventory from './modules/inventory/models/Inventory.model.js';
import Finance from './modules/finance/models/Finance.model.js';
import parcelsRouter from './routes/parcels.js';
import cropsRouter from './routes/crops.js';
import inventoryRouter from './modules/inventory/routes/inventory.routes.js';
import financeRouter from './modules/finance/routes/finance.routes.js';
import livestockRouter from './routes/livestock.js';
import feedingRouter from './modules/livestock/routes/feeding.routes.js';
import vaccinationRouter from './modules/livestock/routes/vaccination.routes.js';
import reproductionRouter from './modules/livestock/routes/reproduction.routes.js';
import veterinarySupplyRouter from './modules/livestock/routes/veterinarySupply.routes.js';
import livestockSupplyUsageRouter from './modules/livestock/routes/livestockSupplyUsage.routes.js';
import authRouter from './routes/auth.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/parcels', parcelsRouter);
app.use('/api/crops', cropsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/finance', financeRouter);
app.use('/api/livestock', livestockRouter);
app.use('/api/livestock/feeding', feedingRouter);
app.use('/api/livestock/vaccination', vaccinationRouter);
app.use('/api/livestock/reproduction', reproductionRouter);
app.use('/api/livestock/supplies', veterinarySupplyRouter);
app.use('/api/livestock/supply-usage', livestockSupplyUsageRouter);

// Database synchronization
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with force: false to avoid dropping data, but handle enums properly
    await sequelize.sync({ alter: true }); // This will handle alter operations carefully
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;