import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { UserRepository } from '../user.repository.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Core create logic for the User entity — executes the primary business operation
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new UserRepository(ctx.env.HYPERDRIVE);

  const user = await repo.create(ctx.input as any);

  return { output: user, entityId: user.id };

}
