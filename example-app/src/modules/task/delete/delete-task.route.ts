// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: DELETE                        ║
// ╚══════════════════════════════════════════════════════════════════════╝
import type { Context } from 'hono';
import type { Env } from '../../../generated/bindings.js';
import { runLifecycle } from '../../../core/lifecycle/run-lifecycle.js';
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import { DeleteTaskInputSchema } from './delete-task.input.js';
import { pre } from './delete-task.pre.js';
import { process } from './delete-task.process.js';
import { post } from './delete-task.post.js';
import { TaskRepository } from '../task.repository.js';
import { logger } from '../../../core/observability/logger.js';
import { AppError } from '../../../core/errors/application-error.js';

export async function deleteTaskRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Parse and validate input

    const id = c.req.param('id');
    if (!id) {
      return c.json({ error: 'MISSING_PARAM', message: 'id is required', correlationId }, 400);
    }
    const input = { id };


    // Build lifecycle context
    const ctx: LifecycleContext = {
      correlationId,
      env: c.env,
      request: c.req.raw,
      input,
      result: null,
      meta: {
        entity: 'task',
        operation: 'delete',
        eventName: 'tasks.task.deleted.v1',
      },
    };

    // Execute lifecycle: PRE → PROCESS → POST
    const result = await runLifecycle(ctx, { pre, process, post });

    // Return response
    const statusCode = 204;

    return new Response(null, { status: 204 });

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
      method: 'DELETE',
      path: '/api/v1/tasks/:id',
      duration: Date.now() - startTime,
    });
  }
}
