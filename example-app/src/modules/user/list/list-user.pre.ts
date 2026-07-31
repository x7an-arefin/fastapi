// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SCAFFOLDED FILE — This file was created by the generator once.     ║
// ║  It will NOT be overwritten on subsequent generator runs.           ║
// ║  Edit freely — this is your business logic.                         ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * PRE lifecycle handler for LIST User.
 *
 * Runs synchronously BEFORE the main operation.
 * Responsibilities:
 *   - Authentication (verify session token)
 *   - Authorization (verify permissions)
 *   - Request normalization
 *   - Business-rule validation (uniqueness, invariants)
 *   - Idempotency checks
 *   - Rate-limit checks
 *
 * A PRE handler may:
 *   - Continue (return undefined)
 *   - Modify ctx.input
 *   - Reject the request (throw AppError)
 *   - Return a short-circuit LifecycleResult
 */
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { verifySession, checkPermissions } from '../../../core/auth/session-cache.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * PRE hooks to run: authenticate, authorize
 */
export async function pre(ctx: LifecycleContext): Promise<LifecycleResult | void> {

  // 1. Authenticate — verify session via KV cache (falls back to DB on miss)
  const session = await verifySession(ctx.env, ctx.request);
  if (!session) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }
  ctx.meta['actor'] = { type: 'user', id: session.userId };

  // 2. Authorize — check permissions


  // TODO: Add custom pre-operation business logic here
  // Examples:
  //   - Validate business invariants
  //   - Check idempotency keys
  //   - Normalize request fields
  //   - Load dependent resources into ctx.meta
}
