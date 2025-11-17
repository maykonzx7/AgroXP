import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import farmRoutes from './modules/farms/routes/farm.routes.js';

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
  res.json({ status: 'OK', message: 'Backend is running with Prisma ORM' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;