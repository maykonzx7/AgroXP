const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy configuration for services
// Simpler proxy: forward all /api calls to a single BACKEND_URL (monolith or aggregated endpoint)
const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3001";

const apiProxy = createProxyMiddleware("/api", {
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api": "/api",
  },
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
