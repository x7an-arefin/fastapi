import type { IPlugin, Application } from 'honestjs';
import type { Hono } from 'hono';

/**
 * @author arefin
 * @description Health & Metrics Plugin — exposes /health and /metrics endpoints for monitoring application status
 */
export class HealthAndMetricsPlugin implements IPlugin {
  meta = { name: 'HealthAndMetricsPlugin' };

  /**
   * @author arefin
   * @description Mount /health and /metrics routes after module registration
   */
  async afterModulesRegistered(_app: Application, hono: Hono): Promise<void> {
    hono.get('/health', (c) => {
      const env = c.env as Record<string, unknown>;
      const hasDb = Boolean(env && env['HYPERDRIVE']);

      return c.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          app: 'TaskMaster API',
          environment: (env?.['ENVIRONMENT'] as string) ?? 'development',
          database: hasDb ? 'configured' : 'unbound',
        },
        200,
      );
    });

    hono.get('/metrics', (c) => {
      return c.json({
        app: 'TaskMaster API',
        uptimeSeconds: Math.floor(performance.now() / 1000),
        memoryAllocated: 'edge-runtime',
      });
    });
  }
}
