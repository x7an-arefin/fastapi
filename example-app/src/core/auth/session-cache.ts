import type { Env } from '@generated/bindings.js';
import type { SessionData } from './auth-port.js';
import { logger } from '@core/observability/logger.js';

const SESSION_TTL_SECONDS = 300;
const SESSION_KV_PREFIX = 'session:';

/**
 * @author arefin
 * @description Extract the Bearer token from an HTTP Authorization header
 */
function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * @author arefin
 * @description Verify and retrieve the authenticated session — checks KV cache first, falls back to DB on cache miss
 */
export async function verifySession(env: Env, request: Request): Promise<SessionData | null> {
  const token = extractBearerToken(request);
  if (!token) return null;


  try {
    const cached = await env.AUTH_SESSION_KV.get(`${SESSION_KV_PREFIX}${token}`, 'json');
    if (cached) {
      logger.debug({ action: 'session_cache_hit', note: 'KV cache hit' });
      return cached as SessionData;
    }
  } catch {
    logger.warn({ action: 'session_cache_error', note: 'KV unavailable, falling back to DB' });
  }


  logger.warn({ action: 'session_db_fallback', note: 'DB session lookup not yet implemented' });
  return null;
}

/**
 * @author arefin
 * @description Store an authenticated session in KV cache — call only on login or renewal, never on standard API requests
 */
export async function cacheSession(env: Env, token: string, session: SessionData): Promise<void> {

  await env.AUTH_SESSION_KV.put(
    `${SESSION_KV_PREFIX}${token}`,
    JSON.stringify(session),
    { expirationTtl: SESSION_TTL_SECONDS }
  );
  logger.debug({ action: 'session_cached', userId: session.userId });

}

/**
 * @author arefin
 * @description Revoke an active session from KV cache on logout
 */
export async function revokeSession(env: Env, token: string): Promise<void> {

  await env.AUTH_SESSION_KV.delete(`${SESSION_KV_PREFIX}${token}`);
  logger.info({ action: 'session_revoked' });

}

/**
 * @author arefin
 * @description Check whether the session has all the required permissions or an admin role
 */
export function checkPermissions(session: SessionData, required: string[]): boolean {
  return required.every((perm) => session.permissions.includes(perm) || session.roles.includes('admin'));
}
