import type { Context } from 'hono';
import type { IGuard } from 'honestjs';
import { verifySession } from '@core/auth/session-cache.js';

/**
 * @author arefin
 * @description Validate the incoming session token against the KV cache before allowing route execution
 */
export class AuthGuard implements IGuard {
  async canActivate(c: Context): Promise<boolean> {
    const session = await verifySession((c as any).env, c.req.raw);
    return session !== null;
  }
}
