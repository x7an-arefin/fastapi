import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '../task.repository.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Core update logic for the Task entity — executes the primary business operation
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository(ctx.env.HYPERDRIVE);

  const id = ctx.input.id as string;
  const existing = await repo.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  const updated = await repo.update({ ...ctx.input, id: id });
  if (!updated) {
    throw new AppError('UPDATE_FAILED', 'Failed to update task', 500);
  }

  return { output: updated, entityId: id };

}
