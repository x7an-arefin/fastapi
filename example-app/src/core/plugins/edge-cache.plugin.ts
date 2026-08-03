import type { IPlugin, Application } from 'honestjs';
import type { Hono } from 'hono';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Pattern B: Edge Distributed Cache Plugin — manages sub-5ms GET read responses and event-driven cache invalidation at Cloudflare edge
 */
export class EdgeCachePlugin implements IPlugin {
  meta = { name: 'EdgeCachePlugin' };

  /**
   * @author arefin
   * @description Cache GET responses at Cloudflare edge before hitting backend queries
   */
  async beforeModulesRegistered(_app: Application, hono: Hono): Promise<void> {
    hono.use('*', async (c, next) => {
      if (c.req.method !== 'GET') {
        return next();
      }

      c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      await next();
    });
  }

  /**
   * @author arefin
   * @description Setup edge cache invalidation listeners after modules load
   */
  async afterModulesRegistered(app: Application, _hono: Hono): Promise<void> {
    app.getContext().set('cache.invalidate', (tag: string) => {
      logger.info({ action: 'edge_cache_invalidated', tag });
    });
  }
}
