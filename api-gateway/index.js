const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : [];

// Fallback para desenvolvimento
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const isDevelopment = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Em desenvolvimento, permitir localhost
      if (isDevelopment) {
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          return callback(null, true);
        }
      }

      // Em produção, verificar apenas origens permitidas
      if (allowedOrigins.length > 0) {
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
      } else if (origin === frontendUrl) {
        // Fallback para FRONTEND_URL se ALLOWED_ORIGINS não estiver configurado
        return callback(null, true);
      }

      console.warn(`[CORS] Origin not allowed: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(express.json({ limit: "10mb" })); // Increase body size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use((req, res, next) => {
  console.log(
    `[api-gateway] Received request: ${req.method} ${req.originalUrl}`
  );
  next();
});

// Proxy configuration for services
// Simpler proxy: forward all /api calls to a single BACKEND_URL (monolith or aggregated endpoint)
const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3001";

// Increase timeout for proxy requests
const apiProxy = createProxyMiddleware("/api", {
  target: BACKEND_URL,
  changeOrigin: true,
  timeout: 600000, // 600 seconds timeout (10 minutes)
  proxyTimeout: 600000, // 600 seconds proxy timeout
  secure: process.env.NODE_ENV === "production", // Use HTTPS in production
  // Additional settings to prevent timeout issues
  pathRewrite: {
    "^/api": "/api",
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `[api-gateway] Proxying request to: ${BACKEND_URL}${proxyReq.path}`
    );
    // Configure proxy request to handle long operations
    proxyReq.setTimeout(600000); // 10 minutes

    // Set headers to ensure the request is handled properly
    proxyReq.setHeader("Connection", "keep-alive");
    proxyReq.setHeader("Accept-Encoding", "identity");
    
    // Prevent stream errors by handling request abort
    req.on("aborted", () => {
      proxyReq.destroy();
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Handle response errors to prevent stream issues
    proxyRes.on("error", (err) => {
      console.error("[api-gateway] Proxy response error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Proxy response error" });
      }
    });
    
    // Handle client disconnect
    req.on("close", () => {
      if (!res.headersSent) {
        proxyRes.destroy();
      }
    });
  },
  onError: (err, req, res) => {
    console.error("[api-gateway] Proxy error:", err);
    // Only send error if response hasn't been sent
    if (!res.headersSent) {
      res.status(500).json({ error: "Proxy error", message: err.message });
    }
  },
  onProxyReqWs: (proxyReq, req, socket) => {
    // Handle WebSocket connections if needed
    socket.on("error", (err) => {
      console.error("[api-gateway] WebSocket error:", err);
    });
  },
  // Configure to handle long responses
  selfHandleResponse: false,
  // Remove buffer option that can cause readableAddChunk errors
  // The default stream handling is better
});

app.use("/api", apiProxy);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "API Gateway is running" });
});

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AgroXP API Gateway" });
});

// Global error handlers to prevent stream-related crashes
process.on("uncaughtException", (err) => {
  // Ignore readableAddChunk errors as they're usually harmless
  if (err.message && err.message.includes("readableAddChunk")) {
    console.warn("[api-gateway] Stream error (ignored):", err.message);
    return;
  }
  console.error("[api-gateway] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  // Ignore stream-related rejections
  if (reason && reason.message && reason.message.includes("readableAddChunk")) {
    console.warn("[api-gateway] Stream rejection (ignored):", reason.message);
    return;
  }
  console.error("[api-gateway] Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle stream errors globally
process.stdin.on("error", (err) => {
  if (err.code !== "EPIPE" && !err.message.includes("readableAddChunk")) {
    console.error("[api-gateway] stdin error:", err);
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
