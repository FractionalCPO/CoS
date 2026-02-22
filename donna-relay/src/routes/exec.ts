import { Router, type Request, type Response } from "express";
import { execSync } from "node:child_process";

const router = Router();

/**
 * POST /exec — Execute a shell command locally.
 * This is the generic escape hatch — Donna can run any local command.
 *
 * Body: { command: "string", cwd?: "string", timeout?: number }
 * Returns: { stdout: "string", exitCode: number }
 *
 * SECURITY: Protected by shared secret auth middleware.
 * Only Donna on Railway can call this.
 */

const MAX_TIMEOUT = 60_000; // 60 seconds max
const DEFAULT_TIMEOUT = 30_000;

// Blocked patterns — prevent destructive operations
const BLOCKED_PATTERNS = [
  /\brm\s+-rf\s+[\/~]/i,
  /\bsudo\b/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
];

router.post("/exec", (req: Request, res: Response) => {
  const { command, cwd, timeout } = req.body;
  if (!command || typeof command !== "string") {
    res.status(400).json({ error: "Missing 'command' string" });
    return;
  }

  // Safety check
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      res.status(403).json({ error: "Command blocked by safety filter", pattern: pattern.source });
      return;
    }
  }

  const effectiveTimeout = Math.min(timeout || DEFAULT_TIMEOUT, MAX_TIMEOUT);

  try {
    const stdout = execSync(command, {
      cwd: cwd || process.env.HOME,
      encoding: "utf-8",
      timeout: effectiveTimeout,
      maxBuffer: 5 * 1024 * 1024, // 5MB
    });

    res.json({ stdout: stdout.trim(), exitCode: 0 });
  } catch (err: any) {
    res.json({
      stdout: err.stdout?.trim() || "",
      stderr: err.stderr?.trim() || "",
      exitCode: err.status ?? 1,
      error: err.message,
    });
  }
});

export default router;
