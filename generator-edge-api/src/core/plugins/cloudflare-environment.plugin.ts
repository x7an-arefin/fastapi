import type { IPlugin, Application } from 'honestjs';
import type { Hono } from 'hono';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Cloudflare Environment Plugin — validates required environment bindings at application startup
 */
export class CloudflareEnvironmentPlugin implements IPlugin {
  meta = { name: 'CloudflareEnvironmentPlugin' };

  /**
   * @author arefin
   * @description Validate essential Cloudflare Worker environment bindings
   */
  async beforeModulesRegistered(_app: Application, hono: Hono): Promise<void> {
    hono.use('*', async (c, next) => {
      const env = c.env as Record<string, unknown>;
      if (env) {
        const hasHyperdrive = Boolean(env['HYPERDRIVE']);
        if (!hasHyperdrive) {
          logger.warn({ action: 'binding_warning', note: 'Hyperdrive binding not present on request env' });
        }
      }
      await next();
    });
  }
}
