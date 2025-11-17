import express from 'express';
import cors from 'cors';
import sequelize from './config/database.config.js';
import { Parcel, Crop, Livestock, Harvest } from './associations.js';
import Inventory from './modules/inventory/Inventory.model.js';
import Finance from './modules/finance/Finance.model.js';
import parcelsRouter from './routes/parcels.js';
import cropsRouter from './routes/crops.js';
import inventoryRouter from './modules/inventory/inventory.routes.js';
import financeRouter from './modules/finance/finance.routes.js';
import harvestRouter from './modules/harvest/harvest.routes.js';
import livestockRouter from './routes/livestock.js';
import feedingRouter from './modules/livestock/feeding.routes.js';
import vaccinationRouter from './modules/livestock/vaccination.routes.js';
import reproductionRouter from './modules/livestock/reproduction.routes.js';
import veterinarySupplyRouter from './modules/livestock/veterinarySupply.routes.js';
import livestockSupplyUsageRouter from './modules/livestock/livestockSupplyUsage.routes.js';
import authRouter from './routes/auth.routes.js';
import { authenticate } from './middleware/auth.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - allow localhost origins in development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all localhost variations
      if (process.env.NODE_ENV !== "production") {
        // Match localhost, 127.0.0.1, [::1], or any IPv6 localhost with any port
        const localhostPatterns = [
          /^https?:\/\/localhost(:\d+)?$/,
          /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
          /^https?:\/\/\[::1\](:\d+)?$/,
          /^https?:\/\/::1(:\d+)?$/,
        ];
        
        if (localhostPatterns.some(pattern => pattern.test(origin))) {
          return callback(null, true);
        }
      }
      
      // In production, use specific allowed origins
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
        : [];
      
      // Fallback to FRONTEND_URL if no ALLOWED_ORIGINS
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (allowedOrigins.includes(origin) || origin === frontendUrl) {
        return callback(null, true);
      }
      
      console.warn(`[CORS] Origin not allowed: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);
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
app.use('/api/harvest', harvestRouter);
// Register specific livestock routes BEFORE the generic /api/livestock route
// This ensures Express matches specific routes first
app.use('/api/livestock/feeding', feedingRouter);
app.use('/api/livestock/vaccination', vaccinationRouter);
app.use('/api/livestock/reproduction', reproductionRouter);
app.use('/api/livestock/supplies', veterinarySupplyRouter);
app.use('/api/livestock/supply-usage', livestockSupplyUsageRouter);
app.use('/api/livestock', livestockRouter);

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