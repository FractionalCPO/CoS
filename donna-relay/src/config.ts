/**
 * Configuration for the local relay server.
 * Uses env vars with sensible defaults for local dev.
 */
export const config = {
  port: parseInt(process.env.RELAY_PORT || "3100", 10),
  /** Shared secret — Railway Donna must send this to authenticate */
  secret: process.env.RELAY_SECRET || "donna-relay-dev",
  /** WhatsApp bridge binary path */
  whatsappBridgePath: process.env.WHATSAPP_BRIDGE_PATH || "/Users/vahid/code/whatsapp-mcp/whatsapp-bridge/whatsapp-bridge",
  /** WhatsApp bridge store */
  whatsappStorePath: process.env.WHATSAPP_STORE_PATH || "/Users/vahid/code/whatsapp-mcp/whatsapp-bridge/store/whatsapp.db",
  /** DataForSEO credentials */
  dataforseoAuth: process.env.DATAFORSEO_AUTH || "dmFoaWRAZnJhY3Rpb25hbGNwby5jb206NGJhYzI2ZGY1NjJlOWUxNA==",
  /** Donna Railway URL (for callbacks) */
  donnaUrl: process.env.DONNA_URL || "https://donna-production-74a3.up.railway.app",
} as const;
