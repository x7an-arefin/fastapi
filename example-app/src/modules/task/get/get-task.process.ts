import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '../task.repository.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Core get logic for the Task entity — executes the primary business operation
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository(ctx.env.HYPERDRIVE);

  const task = await repo.findById(ctx.input.id as string);
  if (!task) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  return { output: task, entityId: task.id };

}
