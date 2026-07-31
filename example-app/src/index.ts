import app from './app.js';
import type { Env } from './generated/bindings.js';
import { domainEventConsumer } from './consumers/domain-event.consumer.js';
import { emailConsumer } from './consumers/email.consumer.js';
import { deadLetterConsumer } from './consumers/dead-letter.consumer.js';
import { cleanupExpiredTasksHandler } from './scheduled/cleanup-expired-tasks.js';

export default {
  /**
   * HTTP fetch handler — all API requests come through here.
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  /**
   * Queue consumer handler — processes domain events and background jobs.
   */
  async queue(batch: MessageBatch<unknown>, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (batch.queue) {
      case 'task-master-api-domain-events':
        await domainEventConsumer(batch as any, env, ctx);
        break;
      case 'task-master-api-email-jobs':
        await emailConsumer(batch as any, env, ctx);
        break;
      case 'task-master-api-domain-events-dlq':
        await deadLetterConsumer(batch as any, env, ctx);
        break;
      default:
        console.warn(`[index] Unknown queue: ${batch.queue}`);
    }
  },

  /**
   * Cron trigger handler — runs scheduled background jobs.
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (event.cron) {
      case '0 0 * * *': // Archive completed tasks older than 30 days
        await ctx.waitUntil(cleanupExpiredTasksHandler(env));
        break;
      default:
        console.warn(`[scheduled] Unknown cron: ${event.cron}`);
    }
  },
};
