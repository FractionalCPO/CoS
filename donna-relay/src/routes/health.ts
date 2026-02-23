import { Router } from "express";
import { existsSync } from "node:fs";
import os from "node:os";
import { execSync } from "node:child_process";
import { config } from "../config.js";

const router = Router();

function checkWhatsAppBridge(): {
  status: "ok" | "down";
  dbExists: boolean;
  bridgeRunning: boolean;
  reason?: string;
} {
  const dbExists = existsSync(config.whatsappMessagesDbPath);
  if (!dbExists) {
    return { status: "down", dbExists: false, bridgeRunning: false, reason: "Messages DB not found" };
  }

  // Check if bridge process is running
  let bridgeRunning = false;
  try {
    const result = execSync("pgrep -f whatsapp-bridge", { encoding: "utf-8", timeout: 3000 }).trim();
    bridgeRunning = result.length > 0;
  } catch {
    bridgeRunning = false;
  }

  if (!bridgeRunning) {
    return { status: "down", dbExists: true, bridgeRunning: false, reason: "Bridge process not running" };
  }

  return { status: "ok", dbExists: true, bridgeRunning: true };
}

router.get("/health", (_req, res) => {
  const whatsapp = checkWhatsAppBridge();

  res.json({
    status: "ok",
    uptime: process.uptime(),
    services: {
      whatsapp: whatsapp.status === "ok" ? "available" : `down: ${whatsapp.reason}`,
      dataforseo: config.dataforseoAuth ? "available" : "not configured",
      playwright: "available",
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      loadAvg: os.loadavg().map((v) => Math.round(v * 100) / 100),
    },
  });
});

export default router;
