import type { Context } from 'hono';
import type { IGuard } from 'honestjs';
import { Reflector } from 'honestjs';
import { verifySession } from '@core/auth/session-cache.js';
import { IS_PUBLIC_KEY } from '@core/decorators/public.decorator.js';

/**
 * @author arefin
 * @description Validate the incoming session token — skips verification for routes decorated with @Public()
 */
export class AuthGuard implements IGuard {
  /**
   * @author arefin
   * @description Check if the route is public or requires authentication, then verify the session token accordingly
   */
  async canActivate(c: Context): Promise<boolean> {
    const reflector = new Reflector();
    const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, c);
    if (isPublic) return true;

    const session = await verifySession((c as unknown as { env: Record<string, unknown> }).env as never, c.req.raw);
    return session !== null;
  }
}
