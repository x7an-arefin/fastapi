import type { Context, Next } from 'hono';
import type { IMiddleware } from 'honestjs';

/**
 * @author arefin
 * @description Inject a correlation ID into every request for distributed tracing
 */
export class CorrelationMiddleware implements IMiddleware {
  async use(c: Context, next: Next): Promise<void> {
    const id = c.req.header('x-correlation-id') ?? crypto.randomUUID();
    c.res.headers.set('x-correlation-id', id);
    await next();
  }
}
