import type { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

/**
 * Simple shared-secret auth middleware.
 * Railway Donna sends `Authorization: Bearer <secret>`.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${config.secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
