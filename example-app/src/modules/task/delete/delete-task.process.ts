import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '../task.repository.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Core delete logic for the Task entity — executes the primary business operation
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository(ctx.env.HYPERDRIVE);

  const id = ctx.input.id as string;
  const existing = await repo.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  const deleted = await repo.delete(id);
  if (!deleted) {
    throw new AppError('DELETE_FAILED', 'Failed to delete task', 500);
  }

  return { output: null, entityId: id };

}
