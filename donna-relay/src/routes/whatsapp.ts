import { Router, type Request, type Response } from "express";
import { execSync } from "node:child_process";
import { config } from "../config.js";
import { existsSync } from "node:fs";

const router = Router();

/**
 * WhatsApp operations via the local bridge.
 * The bridge binary must be running for these to work.
 */

function isBridgeAvailable(): boolean {
  return existsSync(config.whatsappBridgePath);
}

/**
 * POST /whatsapp/send — Send a WhatsApp message
 * Body: { to: "phone_or_name", message: "text" }
 */
router.post("/whatsapp/send", async (req: Request, res: Response) => {
  if (!isBridgeAvailable()) {
    res.status(503).json({ error: "WhatsApp bridge not available" });
    return;
  }

  const { to, message } = req.body;
  if (!to || !message) {
    res.status(400).json({ error: "Missing 'to' or 'message'" });
    return;
  }

  try {
    // The WhatsApp MCP bridge handles sending via its own protocol
    // For now, return not-implemented — this will be wired when the bridge API is documented
    res.status(501).json({ error: "WhatsApp send not yet implemented — needs bridge API integration" });
  } catch (err) {
    res.status(500).json({ error: "WhatsApp send failed", detail: (err as Error).message });
  }
});

/**
 * GET /whatsapp/status — Check bridge status
 */
router.get("/whatsapp/status", (_req: Request, res: Response) => {
  res.json({
    bridgeExists: isBridgeAvailable(),
    storePath: config.whatsappStorePath,
    storeExists: existsSync(config.whatsappStorePath),
  });
});

export default router;
