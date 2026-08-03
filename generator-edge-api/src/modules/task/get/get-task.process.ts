import type { LifecycleContext } from '@core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '@core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '@modules/task/task.repository.js';
import { AppError } from '@core/errors/application-error.js';


/**
 * @author arefin
 * @description PROCESS lifecycle handler for GET Task — executes the core business operation via the repository
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository();

  const task = await repo.findById(ctx.input.id as string);
  if (!task) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  return { output: task, entityId: task.id };

}
