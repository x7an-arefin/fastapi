// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SCAFFOLDED FILE — This file was created by the generator once.     ║
// ║  It will NOT be overwritten on subsequent generator runs.           ║
// ║  Edit freely — this is your business logic.                         ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * PROCESS lifecycle handler for UPDATE Task.
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
import { TaskRepository } from '../task.repository.js';
import { AppError } from '../../../core/errors/application-error.js';


/**
 * PROCESS hooks to run: updateTask
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
