import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import { Parcel, Crop, Livestock } from './associations.js';
import Inventory from './models/Inventory.js';
import Finance from './models/Finance.js';
import parcelsRouter from './routes/parcels.js';
import cropsRouter from './routes/crops.js';
import inventoryRouter from './routes/inventory.js';
import financeRouter from './routes/finance.js';
import livestockRouter from './routes/livestock.js';
import feedingRouter from './modules/livestock/feeding.routes.js';
import vaccinationRouter from './modules/livestock/vaccination.routes.js';
import reproductionRouter from './modules/livestock/reproduction.routes.js';
import veterinarySupplyRouter from './modules/livestock/veterinarySupply.routes.js';
import livestockSupplyUsageRouter from './modules/livestock/livestockSupplyUsage.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Routes
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
    
    // Sync models
    await sequelize.sync({ alter: true });
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