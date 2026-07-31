// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: LIST                        ║
// ╚══════════════════════════════════════════════════════════════════════╝
import type { Context } from 'hono';
import type { Env } from '../../../generated/bindings.js';
import { runLifecycle } from '../../../core/lifecycle/run-lifecycle.js';
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import { ListTaskInputSchema } from './list-task.input.js';
import { pre } from './list-task.pre.js';
import { process } from './list-task.process.js';
import { post } from './list-task.post.js';
import { TaskRepository } from '../task.repository.js';
import { logger } from '../../../core/observability/logger.js';
import { AppError } from '../../../core/errors/application-error.js';

export async function listTaskRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Parse and validate input

    const query = c.req.query();
    const inputResult = ListTaskInputSchema.safeParse(query);
    if (!inputResult.success) {
      return c.json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: inputResult.error.flatten().fieldErrors,
        correlationId,
      }, 422);
    }
    const input = inputResult.data;


    // Build lifecycle context
    const ctx: LifecycleContext = {
      correlationId,
      env: c.env,
      request: c.req.raw,
      input,
      result: null,
      meta: {
        entity: 'task',
        operation: 'list',
        eventName: 'tasks.task.listed.v1',
      },
    };

    // Execute lifecycle: PRE → PROCESS → POST
    const result = await runLifecycle(ctx, { pre, process, post });

    // Return response
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
      path: '/api/v1/tasks',
      duration: Date.now() - startTime,
    });
  }
}
