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

  it("accepts valid endpoint structure", async () => {
    // This will actually call DataForSEO API — just verify the request format works
    const res = await fetch(`${baseUrl}/dataforseo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authed() },
      body: JSON.stringify({ endpoint: "/v3/serp/google/organic/live/advanced", body: [{ keyword: "test", location_code: 2840 }] }),
    });
    // Should get 200 (success) or 502 (network issue) — not 400/401
    expect([200, 502]).toContain(res.status);
  });
});

describe("WhatsApp", () => {
  it("returns bridge status", async () => {
    const res = await fetch(`${baseUrl}/whatsapp/status`, {
      headers: authed(),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(typeof data.bridgeExists).toBe("boolean");
  });
});
