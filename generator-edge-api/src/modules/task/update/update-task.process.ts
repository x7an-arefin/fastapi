import type { LifecycleContext } from '@core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '@core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '@modules/task/task.repository.js';
import { AppError } from '@core/errors/application-error.js';


/**
 * @author arefin
 * @description PROCESS lifecycle handler for UPDATE Task — executes the core business operation via the repository
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository();

  const id = ctx.input.id as string;
  const existing = await repo.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  const updated = await repo.update({ ...ctx.input, id: id });
  if (!updated) {
    throw new AppError('UPDATE_FAILED', 'Failed to update Task', 500);
  }

  return { output: updated, entityId: id };

}
