import { drizzle } from 'drizzle-orm/postgres-js';
import { and, lt, isNotNull } from 'drizzle-orm';
import type { Env } from '@generated/bindings.js';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Scheduled job handler for cleanupExpiredTasks — runs on schedule 0 2 * * *
 * Purge soft-deleted task records older than 30 days
 */
export async function cleanupExpiredTasksHandler(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info({ action: 'cleanup-expired-tasks_started', cron: '0 2 * * *' });

  try {
    // TODO: Implement scheduled job logic
    // Description: Purge soft-deleted task records older than 30 days
    //
    // Example: Soft-deleted record cleanup
    // const db = drizzle(env.HYPERDRIVE.connectionString);
    // await db.delete(myTable).where(
    //   and(
    //     isNotNull(myTable.deletedAt),
    //     lt(myTable.deletedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    //   )
    // );

    logger.info({
      action: 'cleanup-expired-tasks_completed',
      durationMs: Date.now() - startTime,
    });
  } catch (err) {
    logger.error({
      action: 'cleanup-expired-tasks_failed',
      error: String(err),
      durationMs: Date.now() - startTime,
    });
    throw err;
  }
}
