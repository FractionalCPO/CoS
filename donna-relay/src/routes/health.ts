import { Router } from "express";
import { existsSync } from "node:fs";
import os from "node:os";
import { execSync } from "node:child_process";
import { config } from "../config.js";

const router = Router();

function checkWhatsAppBridge(): {
  status: "ok" | "down";
  bridgeExists: boolean;
  bridgeRunning: boolean;
  reason?: string;
} {
  const bridgeExists = existsSync(config.whatsappBridgePath);
  if (!bridgeExists) {
    return { status: "down", bridgeExists: false, bridgeRunning: false, reason: "Bridge binary not found" };
  }

  // Check if bridge process is running
  let bridgeRunning = false;
  try {
    const result = execSync("pgrep -f whatsapp-bridge", { encoding: "utf-8", timeout: 3000 }).trim();
    bridgeRunning = result.length > 0;
  } catch {
    // pgrep returns exit code 1 when no process found
    bridgeRunning = false;
  }

  if (!bridgeRunning) {
    return { status: "down", bridgeExists: true, bridgeRunning: false, reason: "Bridge process not running" };
  }

  // Check if store DB exists (indicates an active/past session)
  const storeExists = existsSync(config.whatsappStorePath);
  if (!storeExists) {
    return { status: "down", bridgeExists: true, bridgeRunning: true, reason: "QR code not scanned (no store)" };
  }

  return { status: "ok", bridgeExists: true, bridgeRunning: true };
}

router.get("/health", (_req, res) => {
  const whatsapp = checkWhatsAppBridge();

  res.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    services: {
      whatsapp,
      dataforseo: {
        status: config.dataforseoAuth ? "ok" : "down",
      },
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
