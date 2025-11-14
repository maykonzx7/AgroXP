import { Router } from "express";
import sequelize from "../config/database.config.js";

const router = Router();

// Dev-only endpoint to trigger sequelize.sync()
router.post("/sync", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not allowed in production" });
  }

  try {
    await sequelize.sync({ alter: true });
    return res.json({
      success: true,
      message: "Database synchronized (alter:true)",
    });
  } catch (error) {
    console.error("Dev sync error:", error);
    return res
      .status(500)
      .json({ error: "Sync failed", details: String(error) });
  }
});

export default router;
