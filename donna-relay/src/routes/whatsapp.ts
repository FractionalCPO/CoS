import { Router, type Request, type Response } from "express";
import Database from "better-sqlite3";
import { config } from "../config.js";

const router = Router();

/** Open a read-only connection to the messages DB */
function openDb(): Database.Database {
  return new Database(config.whatsappMessagesDbPath, { readonly: true });
}

/** Clamp pagination params to safe ranges */
function parsePagination(req: Request): { limit: number; offset: number } {
  const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 20, 100));
  const page = Math.max(0, parseInt(req.query.page as string) || 0);
  return { limit, offset: page * limit };
}

/**
 * GET /whatsapp/chats — List chats with last message
 * Query params: query, limit (default 20), page (default 0)
 */
router.get("/whatsapp/chats", (req: Request, res: Response) => {
  const db = openDb();
  try {
    const query = req.query.query as string | undefined;
    const { limit, offset } = parsePagination(req);

    let sql = `
      SELECT
        c.jid,
        c.name,
        c.last_message_time,
        m.content AS last_message,
        m.sender AS last_sender,
        m.is_from_me AS last_is_from_me
      FROM chats c
      LEFT JOIN messages m ON c.jid = m.chat_jid
        AND c.last_message_time = m.timestamp
    `;
    const params: unknown[] = [];

    if (query) {
      sql += " WHERE (LOWER(c.name) LIKE LOWER(?) OR c.jid LIKE ?)";
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += " ORDER BY c.last_message_time DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to list chats" });
  } finally {
    db.close();
  }
});

/**
 * GET /whatsapp/messages — List messages with filters
 * Query params: chat_jid, after, before, query, sender, limit (default 20), page (default 0)
 */
router.get("/whatsapp/messages", (req: Request, res: Response) => {
  const db = openDb();
  try {
    const chatJid = req.query.chat_jid as string | undefined;
    const after = req.query.after as string | undefined;
    const before = req.query.before as string | undefined;
    const query = req.query.query as string | undefined;
    const sender = req.query.sender as string | undefined;
    const { limit, offset } = parsePagination(req);

    let sql = `
      SELECT
        m.id,
        m.timestamp,
        m.sender,
        m.content,
        m.is_from_me,
        m.chat_jid,
        m.media_type,
        c.name AS chat_name
      FROM messages m
      JOIN chats c ON m.chat_jid = c.jid
    `;
    const where: string[] = [];
    const params: unknown[] = [];

    if (chatJid) {
      where.push("m.chat_jid = ?");
      params.push(chatJid);
    }
    if (after) {
      where.push("m.timestamp > ?");
      params.push(after);
    }
    if (before) {
      where.push("m.timestamp < ?");
      params.push(before);
    }
    if (query) {
      where.push("LOWER(m.content) LIKE LOWER(?)");
      params.push(`%${query}%`);
    }
    if (sender) {
      where.push("m.sender = ?");
      params.push(sender);
    }

    if (where.length > 0) {
      sql += " WHERE " + where.join(" AND ");
    }

    sql += " ORDER BY m.timestamp DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to list messages" });
  } finally {
    db.close();
  }
});

/**
 * GET /whatsapp/contacts/search — Search contacts by name or phone
 * Query params: query (required)
 */
router.get("/whatsapp/contacts/search", (req: Request, res: Response) => {
  const query = req.query.query as string;
  if (!query) {
    res.status(400).json({ error: "Missing 'query' parameter" });
    return;
  }

  const db = openDb();
  try {
    const pattern = `%${query}%`;
    const rows = db.prepare(`
      SELECT DISTINCT jid, name
      FROM chats
      WHERE (LOWER(name) LIKE LOWER(?) OR LOWER(jid) LIKE LOWER(?))
        AND jid NOT LIKE '%@g.us'
      ORDER BY name, jid
      LIMIT 50
    `).all(pattern, pattern);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to search contacts" });
  } finally {
    db.close();
  }
});

/**
 * POST /whatsapp/send — Send a WhatsApp message (proxied to bridge)
 * Body: { recipient: "phone_or_jid", message: "text" }
 */
router.post("/whatsapp/send", async (req: Request, res: Response) => {
  const { recipient, message } = req.body;
  if (!recipient || !message) {
    res.status(400).json({ error: "Missing 'recipient' or 'message'" });
    return;
  }

  try {
    const resp = await fetch(`${config.whatsappBridgeUrl}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, message }),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(502).json({ error: "Bridge unreachable" });
  }
});

/**
 * POST /whatsapp/download — Download media from a message (proxied to bridge)
 * Body: { message_id: "id", chat_jid: "jid" }
 */
router.post("/whatsapp/download", async (req: Request, res: Response) => {
  const { message_id, chat_jid } = req.body;
  if (!message_id || !chat_jid) {
    res.status(400).json({ error: "Missing 'message_id' or 'chat_jid'" });
    return;
  }

  try {
    const resp = await fetch(`${config.whatsappBridgeUrl}/api/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id, chat_jid }),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(502).json({ error: "Bridge unreachable" });
  }
});

/**
 * GET /whatsapp/status — Bridge status check
 */
router.get("/whatsapp/status", (_req: Request, res: Response) => {
  res.json({ status: "configured" });
});

export default router;
