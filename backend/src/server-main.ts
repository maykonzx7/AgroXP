import express from "express";
import cors from "cors";
import prisma from "./services/database.service.js";
import parcelsRouter from "./modules/parcels/routes/parcel.routes.js";
import cropsRouter from "./modules/crops/routes/crops.routes.js";
import inventoryRouter from "./modules/inventory/routes/inventory.routes.js";
// @ts-ignore - TypeScript route file
import financeRouter from "./modules/finance/routes/finance.routes.js";
import livestockRouter from "./modules/livestock/routes/livestock.routes.js";
import feedingRouter from "./modules/livestock/routes/feeding.routes.js";
import vaccinationRouter from "./modules/livestock/routes/vaccination.routes.js";
import reproductionRouter from "./modules/livestock/routes/reproduction.routes.js";
import veterinarySupplyRouter from "./modules/livestock/routes/veterinarySupply.routes.js";
import livestockSupplyUsageRouter from "./modules/livestock/routes/livestockSupplyUsage.routes.js";
// @ts-ignore - TypeScript route file
import harvestRouter from "./modules/harvest/routes/harvest.routes.js";
import authRouter from "./routes/auth.routes.js";
import farmRouter from "./modules/farms/routes/farm.routes.js";
import tasksRouter from "./modules/tasks/routes/tasks.routes.js";
import weatherRouter from "./modules/weather/routes/weather.routes.js";
import alertsRouter from "./modules/alerts/routes/alerts.routes.js";
import devRouter from "./routes/dev.routes.js";
import { securityMiddleware } from "./middleware/security.middleware.js";
import { defaultRateLimiter } from "./middleware/rateLimiter.middleware.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Increase timeout and configure body parser
app.use((req, res, next) => {
  req.setTimeout(60000); // 60 seconds timeout
  res.setTimeout(60000); // 60 seconds timeout
  next();
});

// Middleware
// CORS configuration - allow localhost origins in development, specific origins in production
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
// Increase body size limit
app.use(express.json({ limit: "10mb" }));

// Security middleware - aplicar antes das rotas
app.use(securityMiddleware);

// Rate limiting - aplicar após security middleware
app.use(defaultRateLimiter);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// Root health check for Docker health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/farms", farmRouter);
// Dev-only routes
if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRouter);
}
app.use("/api/parcels", parcelsRouter);
app.use("/api/crops", cropsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/finance", financeRouter);
// Rotas específicas de livestock devem vir ANTES da rota geral para evitar conflito com /:id
app.use("/api/livestock/feeding", feedingRouter);
app.use("/api/livestock/vaccination", vaccinationRouter);
app.use("/api/livestock/reproduction", reproductionRouter);
app.use("/api/livestock/supplies", veterinarySupplyRouter);
app.use("/api/livestock/supply-usage", livestockSupplyUsageRouter);
app.use("/api/livestock", livestockRouter);
app.use("/api/harvest", harvestRouter);
console.log("✓ Harvest routes registered at /api/harvest");
app.use("/api/tasks", tasksRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/alerts", alertsRouter);

// Database connection with Prisma
const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection has been established successfully with Prisma.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Global error handlers to prevent stream-related crashes
process.on("uncaughtException", (err) => {
  // Ignore readableAddChunk errors as they're usually harmless
  if (err.message && err.message.includes("readableAddChunk")) {
    console.warn("[backend] Stream error (ignored):", err.message);
    return;
  }
  console.error("[backend] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  // Ignore stream-related rejections
  if (reason && typeof reason === "object" && "message" in reason) {
    const reasonMessage = (reason as Error).message;
    if (reasonMessage && reasonMessage.includes("readableAddChunk")) {
      console.warn("[backend] Stream rejection (ignored):", reasonMessage);
      return;
    }
  }
  console.error("[backend] Unhandled Rejection at:", promise, "reason:", reason);
});

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
