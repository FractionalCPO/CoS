import { Router, type Request, type Response } from "express";
import { config } from "../config.js";

const router = Router();

/**
 * Proxy DataForSEO API requests.
 * Donna sends: POST /dataforseo { endpoint: "/v3/...", body: {...} }
 * Relay forwards to DataForSEO API with auth.
 */
router.post("/dataforseo", async (req: Request, res: Response) => {
  const { endpoint, body } = req.body;
  if (!endpoint) {
    res.status(400).json({ error: "Missing endpoint" });
    return;
  }

  // Validate endpoint starts with /v3/ to prevent SSRF
  if (!endpoint.startsWith("/v3/")) {
    res.status(400).json({ error: "Invalid endpoint — must start with /v3/" });
    return;
  }

  if (!config.dataforseoAuth) {
    res.status(503).json({ error: "DataForSEO not configured" });
    return;
  }

  try {
    const response = await fetch(`https://api.dataforseo.com${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${config.dataforseoAuth}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "DataForSEO request failed" });
  }
});

export default router;
