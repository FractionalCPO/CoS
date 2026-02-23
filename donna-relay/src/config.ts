/**
 * Configuration for the local relay server.
 * Uses env vars with sensible defaults for local dev.
 */
export const config = {
  port: parseInt(process.env.RELAY_PORT || "3100", 10),
  /** Shared secret — Railway Donna must send this to authenticate */
  secret: process.env.RELAY_SECRET || "donna-relay-dev",
  /** WhatsApp bridge API URL */
  whatsappBridgeUrl: process.env.WHATSAPP_BRIDGE_URL || "http://localhost:8080",
  /** WhatsApp messages SQLite DB path */
  whatsappMessagesDbPath: process.env.WHATSAPP_MESSAGES_DB || "/Users/vahid/code/CoS/whatsapp-mcp/whatsapp-bridge/store/messages.db",
  /** DataForSEO credentials */
  dataforseoAuth: process.env.DATAFORSEO_AUTH || "dmFoaWRAZnJhY3Rpb25hbGNwby5jb206NGJhYzI2ZGY1NjJlOWUxNA==",
  /** Donna Railway URL (for callbacks) */
  donnaUrl: process.env.DONNA_URL || "https://donna-production-74a3.up.railway.app",
} as const;
