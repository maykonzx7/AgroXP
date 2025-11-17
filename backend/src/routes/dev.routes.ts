import { Router } from "express";
import prisma from "../services/database.service.js";

const router = Router();

// Dev-only endpoint to validate Prisma connectivity and metadata
router.get("/health", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not allowed in production" });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const [userCount, farmCount] = await Promise.all([
      prisma.user.count(),
      prisma.farm.count(),
    ]);

    return res.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
      metrics: {
        users: userCount,
        farms: farmCount,
      },
    });
  } catch (error) {
    console.error("Dev health error:", error);
    return res.status(500).json({
      error: "Database not reachable",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
