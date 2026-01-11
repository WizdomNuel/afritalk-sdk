import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

const WINDOW_MS = 60 * 1000; // 1 Minute
const MAX_REQUESTS = 20; // 20 requests per minute

export const rateLimitMiddleware = (req: any, res: any, next: any) => {
  // Use generic header access if authorization is not strictly typed in all definitions, 
  // though standard Request interface includes it.
  const authHeader = req.headers['authorization']; 
  const apiKey = authHeader ? authHeader.split(" ")[1] : "unknown";
  const currentTime = Date.now();

  if (!store.has(apiKey)) {
    store.set(apiKey, { count: 1, resetTime: currentTime + WINDOW_MS });
    return next();
  }

  const record = store.get(apiKey)!;

  if (currentTime > record.resetTime) {
    // Reset window
    record.count = 1;
    record.resetTime = currentTime + WINDOW_MS;
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    res.status(429).json({ 
      error: "Too Many Requests", 
      message: "Please slow down. Limit is 20 requests per minute." 
    });
    return;
  }

  record.count++;
  next();
};