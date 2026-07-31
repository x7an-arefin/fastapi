// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SCAFFOLDED FILE — This file was created by the generator once.     ║
// ║  It will NOT be overwritten on subsequent generator runs.           ║
// ║  Edit freely — this is your business logic.                         ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * PROCESS lifecycle handler for GET User.
 *
 * Runs the authoritative business operation.
 * Responsibilities:
 *   - Database read or mutation via Drizzle through Hyperdrive
 *   - Short transactions ONLY
 *   - Optimistic concurrency checks
 *   - Creating the canonical result
 *   - Writing the outbox event when delivery = "transactional-outbox"
 *
 * Rules:
 *   - NO third-party HTTP calls inside a transaction
 *   - NO queue writes inside an open transaction
 *   - Keep transactions as short as possible
 */
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { UserRepository } from '../user.repository.js';
import { AppError } from '../../../core/errors/application-error.js';


/**
 * PROCESS hooks to run: getUser
 */
export async function process(ctx: LifecycleContext): Promise<LifecycleResult> {
  const repo = new UserRepository(ctx.env.HYPERDRIVE);

  const user = await repo.findById(ctx.input.id as string);
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  return { output: user, entityId: user.id };

}
