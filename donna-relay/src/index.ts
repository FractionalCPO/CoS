import express from "express";
import { config } from "./config.js";
import { authMiddleware } from "./auth.js";
import healthRouter from "./routes/health.js";
import dataforseoRouter from "./routes/dataforseo.js";
import whatsappRouter from "./routes/whatsapp.js";
import execRouter from "./routes/exec.js";

const app = express();

app.use(express.json({ limit: "5mb" }));

// Health check is public (for monitoring)
app.use(healthRouter);

// All other routes require auth
app.use(authMiddleware);
app.use(dataforseoRouter);
app.use(whatsappRouter);
app.use(execRouter);

if (config.secret === "donna-relay-dev") {
  console.warn("[relay] ⚠ WARNING: Using default secret. Set RELAY_SECRET env var for production.");
}

app.listen(config.port, () => {
  console.log(`[relay] Donna relay server running on port ${config.port}`);
  console.log(`[relay] Services: WhatsApp, DataForSEO${config.dataforseoAuth ? "" : " (not configured)"}, exec`);
  console.log(`[relay] Auth: ${config.secret === "donna-relay-dev" ? "DEFAULT (insecure)" : "configured"}`);
});
