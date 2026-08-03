import type { Env } from '@generated/bindings.js';

const REQUIRED_BINDINGS: (keyof Env)[] = [
  'HYPERDRIVE',

  'AUTH_SESSION_KV',


  'DOMAIN_EVENTS',


  'RATE_LIMIT_KV',

];

/**
 * @author arefin
 * @description Validate that all required Cloudflare bindings are present in the Worker environment at startup
 */
export function validateBindings(env: Env): void {
  const missing: string[] = [];

  for (const binding of REQUIRED_BINDINGS) {
    if (!env[binding]) {
      missing.push(String(binding));
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Cloudflare bindings: ${missing.join(', ')}. ` +
      `Check your wrangler.jsonc and Cloudflare dashboard configuration.`
    );
  }
}
