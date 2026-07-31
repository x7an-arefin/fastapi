// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
import type { MiddlewareHandler } from 'hono';
import type { Env } from '../../generated/bindings.js';

/**
 * Correlation ID middleware — ensures every request has a traceable ID.
 * Reads from the 'x-correlation-id' header or generates a new UUID.
 * Sets the correlation ID on the response header.
 */
export function correlationMiddleware(): MiddlewareHandler<{ Bindings: Env; Variables: { correlationId: string } }> {
  return async (c, next) => {
    const existingId = c.req.header('x-correlation-id');
    const correlationId = existingId ?? crypto.randomUUID();

    // Make available for downstream middleware and handlers
    c.set('correlationId', correlationId);
    c.header('x-correlation-id', correlationId);

    await next();
  };
}
