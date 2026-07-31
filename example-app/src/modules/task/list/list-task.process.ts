import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '../task.repository.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Core list logic for the Task entity — executes the primary business operation
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository(ctx.env.HYPERDRIVE);

  const result = await repo.findAll({
    cursor: ctx.input.cursor as string | undefined,
    limit: ctx.input.limit as number | undefined,
    status: ctx.input.status as string | undefined,
    userId: ctx.input.userId as string | undefined,

  });

  return { output: result, entityId: null };

}
