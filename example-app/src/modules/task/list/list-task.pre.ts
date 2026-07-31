import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';
import { verifySession, checkPermissions } from '../../../core/auth/session-cache.js';
import { AppError } from '../../../core/errors/application-error.js';

/**
 * @author arefin
 * @description Pre-lifecycle validation and authorization checks for the list task operation
 */
export async function pre(ctx: LifecycleContext): Promise<LifecycleResult | void> {

  const session = await verifySession(ctx.env, ctx.request);
  if (!session) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }
  ctx.meta['actor'] = { type: 'user', id: session.userId };

}
