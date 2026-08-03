import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

/**
 * @author arefin
 * @description CORS middleware configured from the application security specification
 */
export const corsMiddleware: MiddlewareHandler = cors({
  origin: "*",
  allowMethods: ["GET","POST","PATCH","DELETE","OPTIONS"],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  credentials: false,
  maxAge: 86400,
});
