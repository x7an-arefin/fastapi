import type { Env } from '../generated/bindings.js';
import { logger } from '../core/observability/logger.js';

/**
 * @author arefin
 * @description Scheduled job handler for cleanupExpiredTasks — runs via Cloudflare Cron Triggers on schedule 0 2 * * *
 */
export async function cleanupExpiredTasksHandler(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info({ action: 'cleanup-expired-tasks_started', cron: '0 2 * * *' });

  try {

    logger.info({
      action: 'cleanup-expired-tasks_completed',
      duration: Date.now() - startTime,
    });
  } catch (err) {
    logger.error({
      action: 'cleanup-expired-tasks_failed',
      error: String(err),
      duration: Date.now() - startTime,
    });
    throw err;
  }
}
