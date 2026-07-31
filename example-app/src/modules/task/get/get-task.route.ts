import type { Context } from 'hono';
import type { Env } from '../../../generated/bindings.js';
import { runLifecycle } from '../../../core/lifecycle/run-lifecycle.js';
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import { GetTaskInputSchema } from './get-task.input.js';
import { pre } from './get-task.pre.js';
import { process } from './get-task.process.js';
import { post } from './get-task.post.js';
import { TaskRepository } from '../task.repository.js';
import { logger } from '../../../core/observability/logger.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Handle the HTTP request to get a Task — orchestrates input validation, lifecycle execution, and response formatting
 */
export async function getTaskRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();
  const startTime = Date.now();

  try {

    const id = c.req.param('id');
    if (!id) {
      return c.json({ error: 'MISSING_PARAM', message: 'id is required', correlationId }, 400);
    }
    const input = { id };

    const ctx: LifecycleContext = {
      correlationId,
      env: c.env,
      request: c.req.raw,
      input,
      result: null,
      meta: {
        entity: 'task',
        operation: 'get',
        eventName: 'tasks.task.retrieved.v1',
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
      path: '/api/v1/tasks/:id',
      duration: Date.now() - startTime,
    });
  }
}
