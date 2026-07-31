import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { UserRepository } from '../user.repository.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Core get logic for the User entity — executes the primary business operation
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new UserRepository(ctx.env.HYPERDRIVE);

  const user = await repo.findById(ctx.input.id as string);
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  return { output: user, entityId: user.id };

}
