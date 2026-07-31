import type { Context } from 'hono';
import type { Env } from '../../../generated/bindings.js';
import { runLifecycle } from '../../../core/lifecycle/run-lifecycle.js';
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import { CreateTaskInputSchema } from './create-task.input.js';
import { pre } from './create-task.pre.js';
import { process } from './create-task.process.js';
import { post } from './create-task.post.js';
import { TaskRepository } from '../task.repository.js';
import { logger } from '../../../core/observability/logger.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Handle the HTTP request to create a Task — orchestrates input validation, lifecycle execution, and response formatting
 */
export async function createTaskRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();
  const startTime = Date.now();

  try {

    const rawBody = await c.req.json().catch(() => ({}));
    const inputResult = CreateTaskInputSchema.safeParse(rawBody);
    if (!inputResult.success) {
      return c.json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid request body',
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
        entity: 'task',
        operation: 'create',
        eventName: 'tasks.task.created.v1',
      },
    };

    const result = await runLifecycle(ctx, { pre, process, post });

    const statusCode = 201;

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
      method: 'POST',
      path: '/api/v1/tasks',
      duration: Date.now() - startTime,
    });
  }
}
