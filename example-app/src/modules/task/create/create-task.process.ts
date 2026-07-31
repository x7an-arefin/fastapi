import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '../task.repository.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Core create logic for the Task entity — executes the primary business operation
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository(ctx.env.HYPERDRIVE);

  const task = await repo.create(ctx.input as any);

  return { output: task, entityId: task.id };

}
