import type { MiddlewareHandler } from 'hono';
import type { Env } from '../../generated/bindings.js';

/**
 * @author arefin
 * @description Middleware that generates or propagates a correlation ID for request tracing across services
 */
export function correlationMiddleware(): MiddlewareHandler<{ Bindings: Env; Variables: { correlationId: string } }> {
  return async (c, next) => {
    const existingId = c.req.header('x-correlation-id');
    const correlationId = existingId ?? crypto.randomUUID();

    c.set('correlationId', correlationId);
    c.header('x-correlation-id', correlationId);

    await next();
  };
}
