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

// Blocked patterns — prevent destructive and escalation operations
const BLOCKED_PATTERNS = [
  /\brm\s+-[a-z]*r[a-z]*f\b/i,    // rm -rf, rm -Rf, rm -fR, etc.
  /\brm\s+-[a-z]*f[a-z]*r\b/i,    // rm -fr
  /\brm\s+.*[\/~]/i,               // rm targeting paths
  /\bsudo\b/i,
  /\bsu\s+-?\s*\w/i,               // su - root, su user
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bchmod\s+[0-7]*7[0-7]{2}\b/,  // chmod with world-writable
  /\bchown\b/i,
  /\beval\b/,                       // eval injection
  /\bsource\b.*<\(/,               // process substitution
  /\bcurl\b.*\|\s*(ba)?sh\b/i,     // curl | sh
  /\bwget\b.*\|\s*(ba)?sh\b/i,     // wget | sh
  />\s*\/etc\//,                    // redirect to /etc
  />\s*\/usr\//,                    // redirect to /usr
  /\blaunchctl\s+(unload|remove)\b/i,  // unload launchd services
  /\bkillall\b/i,
  /\bpkill\b/i,
];

// Block cwd traversal outside safe directories
const ALLOWED_CWD_PREFIXES = [
  "/Users/vahid/",
  "/tmp/",
  "/var/folders/",
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
      res.status(403).json({ error: "Command blocked by safety filter" });
      return;
    }
  }

  // Validate cwd if provided
  if (cwd && typeof cwd === "string") {
    const normalized = cwd.endsWith("/") ? cwd : cwd + "/";
    const allowed = ALLOWED_CWD_PREFIXES.some((prefix) => normalized.startsWith(prefix));
    if (!allowed) {
      res.status(403).json({ error: "Working directory outside allowed paths" });
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
    });
  }
});

export default router;
