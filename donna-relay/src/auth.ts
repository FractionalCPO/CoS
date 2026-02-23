import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";
import { config } from "./config.js";

/**
 * Shared-secret auth middleware with timing-safe comparison.
 * Railway Donna sends `Authorization: Bearer <secret>`.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const expected = Buffer.from(`Bearer ${config.secret}`);
  const received = Buffer.from(auth);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
