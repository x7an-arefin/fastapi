import type { LifecycleContext } from '@core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '@core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '@modules/task/task.repository.js';
import { AppError } from '@core/errors/application-error.js';


/**
 * @author arefin
 * @description PROCESS lifecycle handler for CREATE Task — executes the core business operation via the repository
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository();

  const task = await repo.create(ctx.input as any);

  return { output: task, entityId: task.id };

}
