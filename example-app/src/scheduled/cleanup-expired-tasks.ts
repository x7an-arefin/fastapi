import type { Env } from '../generated/bindings.js';
import { logger } from '../core/observability/logger.js';

/**
 * @author arefin
 * @description Scheduled handler that cleans up expired tasks from the database
 */
export async function cleanupExpiredTasksHandler(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info({ action: 'cleanup-expired-tasks_started', cron: '0 0 * * *' });

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
