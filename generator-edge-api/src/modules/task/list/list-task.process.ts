import type { LifecycleContext } from '@core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '@core/lifecycle/lifecycle-result.js';
import { TaskRepository } from '@modules/task/task.repository.js';
import { AppError } from '@core/errors/application-error.js';


/**
 * @author arefin
 * @description PROCESS lifecycle handler for LIST Task — executes the core business operation via the repository
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new TaskRepository();

  const result = await repo.findAll({
    cursor: ctx.input.cursor as string | undefined,
    limit: ctx.input.limit as number | undefined,

  });

  return { output: result, entityId: null };

}
