import type { Context } from 'hono';
import type { Env } from '../../../generated/bindings.js';
import { runLifecycle } from '../../../core/lifecycle/run-lifecycle.js';
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import { ListUserInputSchema } from './list-user.input.js';
import { pre } from './list-user.pre.js';
import { process } from './list-user.process.js';
import { post } from './list-user.post.js';
import { UserRepository } from '../user.repository.js';
import { logger } from '../../../core/observability/logger.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Handle the HTTP request to list a User — orchestrates input validation, lifecycle execution, and response formatting
 */
export async function listUserRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();
  const startTime = Date.now();

  try {

    const query = c.req.query();
    const inputResult = ListUserInputSchema.safeParse(query);
    if (!inputResult.success) {
      return c.json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: inputResult.error.flatten().fieldErrors,
        correlationId,
      }, 422);
    }
    const input = inputResult.data;

    const ctx: LifecycleContext = {
      correlationId,
      env: c.env,
      request: c.req.raw,
      input,
      result: null,
      meta: {
        entity: 'user',
        operation: 'list',
        eventName: 'tasks.user.listed.v1',
      },
    };

    const result = await runLifecycle(ctx, { pre, process, post });

    const statusCode = 200;

    c.header('x-correlation-id', correlationId);
    return c.json({ data: result.output, correlationId }, statusCode);

  } catch (err) {
    if (err instanceof AppError) {
      logger.error({ correlationId, code: err.code, message: err.message });
      return c.json({
        error: err.code,
        message: err.message,
        correlationId,
      }, err.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 500);
    }
    logger.error({ correlationId, error: String(err), stack: err instanceof Error ? err.stack : undefined });
    return c.json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      correlationId,
    }, 500);
  } finally {
    logger.info({
      correlationId,
      method: 'GET',
      path: '/api/v1/users',
      duration: Date.now() - startTime,
    });
  }
}
