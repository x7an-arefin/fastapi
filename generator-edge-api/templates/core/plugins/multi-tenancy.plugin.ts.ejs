import type { IPlugin, Application } from 'honestjs';
import type { Hono } from 'hono';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Pattern A: Multi-Tenant Schema & Isolation Plugin — extracts tenant context from hostname or headers and sets tenant context in application pipeline
 */
export class MultiTenancyPlugin implements IPlugin {
  meta = { name: 'MultiTenancyPlugin' };

  /**
   * @author arefin
   * @description Extract tenant ID and inject into request pipeline before modules run
   */
  async beforeModulesRegistered(app: Application, hono: Hono): Promise<void> {
    hono.use('*', async (c, next) => {
      const tenantId = c.req.header('x-tenant-id') ?? c.req.header('host')?.split('.')[0] ?? 'default';

      (c as any).set('tenantId', tenantId);
      app.getContext().set('current.tenant', tenantId);

      logger.debug({ action: 'tenant_resolved', tenantId });
      await next();
    });
  }
}
