import type { IPlugin, Application } from 'honestjs';
import type { Hono } from 'hono';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Pattern D: Edge Feature Flags Plugin — dynamically enables/disables API features or routes based on Workers KV flag configurations
 */
export class FeatureFlagPlugin implements IPlugin {
  meta = { name: 'FeatureFlagPlugin' };

  /**
   * @author arefin
   * @description Inject feature flag checking utility into application context
   */
  async beforeModulesRegistered(app: Application, _hono: Hono): Promise<void> {
    app.getContext().set('feature.isEnabled', async (flagKey: string, env: Record<string, unknown>): Promise<boolean> => {
      const kv = env['AUTH_SESSION_KV'] as { get: (key: string) => Promise<string | null> } | undefined;
      if (!kv) return true;

      try {
        const value = await kv.get(`flag:${flagKey}`);
        const enabled = value === 'true';
        logger.debug({ action: 'feature_flag_checked', flagKey, enabled });
        return enabled;
      } catch {
        return true;
      }
    });
  }
}
