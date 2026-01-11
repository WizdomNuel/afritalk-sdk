import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// In production, this would be a database lookup.
// For now, we allow keys defined in environment variable API_KEYS (comma separated)
const VALID_KEYS = new Set((process.env.API_KEYS || "").split(",").map(k => k.trim()));

export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  logger.info('auth attempt', { path: req.path, method: req.method });

  if (!authHeader) {
    logger.warn('missing auth header', { path: req.path });
    res.status(401).json({ error: "Unauthorized: Missing Authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  if (!token || !VALID_KEYS.has(token)) {
    logger.warn('invalid api key', { path: req.path, tokenPresent: !!token });
    res.status(403).json({ error: "Forbidden: Invalid API Key" });
    return;
  }
  logger.info('auth success', { path: req.path });

  next();
};