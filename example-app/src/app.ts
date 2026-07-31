import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import type { Env } from './generated/bindings.js';
import { registerRoutes } from './generated/routes.js';
import { correlationMiddleware } from './core/observability/correlation.js';
import { errorHandler } from './core/errors/error-handler.js';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', correlationMiddleware());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  exposeHeaders: ['x-correlation-id'],
}));

// Register all CRUD routes
registerRoutes(app);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'task-master-api' }));

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'NOT_FOUND',
    message: `Route ${c.req.method} ${c.req.path} not found`,
    correlationId: c.req.header('x-correlation-id') ?? 'unknown',
  }, 404);
});

// Global error handler
app.onError(errorHandler);

export default app;
