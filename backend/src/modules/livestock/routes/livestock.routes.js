// Shim router mínimo para evitar ciclos de reexport durante desenvolvimento
import express from "express";

const router = express.Router();

// rota mínima de sanity
router.get("/", (req, res) =>
  res.json({ message: "Livestock routes placeholder" })
);

export default router;
export { router };
