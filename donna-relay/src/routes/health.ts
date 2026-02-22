import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    services: {
      whatsapp: "available",
      dataforseo: "available",
      playwright: "available",
    },
  });
});

export default router;
