import 'reflect-metadata';
import { hono } from './app.js';
import type { Env } from '@generated/bindings.js';
import { domainEventConsumer } from '@consumers/domain-event.consumer.js';
import { deadLetterConsumer } from '@consumers/dead-letter.consumer.js';
import { cleanupExpiredTasksHandler } from '@scheduled/cleanup-expired-tasks.js';

export default {

  /**
   * @author arefin
   * @description Handle incoming HTTP requests by delegating to the HonestJS application instance
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return hono.fetch(request, env, ctx);
  },

  /**
   * @author arefin
   * @description Route incoming queue message batches to the appropriate consumer handler based on queue name
   */
  async queue(batch: MessageBatch<unknown>, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (batch.queue) {
      case 'task-master-api-domain-events':
        await domainEventConsumer(batch as any, env, ctx);
        break;
      case 'task-master-api-domain-events-dlq':
        await deadLetterConsumer(batch as any, env, ctx);
        break;
      default:
        console.warn(`[index] Unknown queue: ${batch.queue}`);
    }
  },

  /**
   * @author arefin
   * @description Handle scheduled cron triggers and dispatch to the appropriate background job handler
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (event.cron) {
      case '0 2 * * *':
        await ctx.waitUntil(cleanupExpiredTasksHandler(env));
        break;
      default:
        console.warn(`[scheduled] Unknown cron: ${event.cron}`);
    }
  },
};
