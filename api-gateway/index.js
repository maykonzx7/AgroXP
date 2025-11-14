const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require('cors');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase body size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[api-gateway] Received request: ${req.method} ${req.originalUrl}`);
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
  secure: false, // Set to true if using HTTPS
  // Additional settings to prevent timeout issues
  pathRewrite: {
    "^/api": "/api",
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[api-gateway] Proxying request to: ${BACKEND_URL}${proxyReq.path}`);
    // Configure proxy request to handle long operations
    proxyReq.setTimeout(600000); // 10 minutes
    
    // Set headers to ensure the request is handled properly
    proxyReq.setHeader('Connection', 'keep-alive');
    proxyReq.setHeader('Accept-Encoding', 'identity');
  },
  onError: (err, req, res) => {
    console.error('[api-gateway] Proxy error:', err);
    res.status(500).send('Proxy error');
  },
  onProxyReqWs: (proxyReq, req, socket) => {
    // Handle WebSocket connections if needed
  },
  // Configure to handle long responses
  selfHandleResponse: false,
  // Additional options for handling slow operations
  buffer: require('stream').PassThrough(),
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

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
