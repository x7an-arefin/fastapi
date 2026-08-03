import type { Env } from '@generated/bindings.js';
import type { EventEnvelope } from '@core/events/event-envelope.js';
import { logger } from '@core/observability/logger.js';

type EventHandler = (envelope: EventEnvelope, env: Env, ctx: ExecutionContext) => Promise<void>;




/**
 * @author arefin
 * @description Handle taskmaster-api.user.created.v1 domain events — extend with downstream side-effect logic
 */
async function handleUserCreated(envelope: EventEnvelope, env: Env, _ctx: ExecutionContext): Promise<void> {
  logger.info({
    action: 'handle_user_created',
    eventId: envelope.eventId,
    subjectId: envelope.subject?.id,
  });
}










/**
 * @author arefin
 * @description Handle taskmaster-api.task.created.v1 domain events — extend with downstream side-effect logic
 */
async function handleTaskCreated(envelope: EventEnvelope, env: Env, _ctx: ExecutionContext): Promise<void> {
  logger.info({
    action: 'handle_task_created',
    eventId: envelope.eventId,
    subjectId: envelope.subject?.id,
  });
}








/**
 * @author arefin
 * @description Handle taskmaster-api.task.updated.v1 domain events — extend with downstream side-effect logic
 */
async function handleTaskUpdated(envelope: EventEnvelope, env: Env, _ctx: ExecutionContext): Promise<void> {
  logger.info({
    action: 'handle_task_updated',
    eventId: envelope.eventId,
    subjectId: envelope.subject?.id,
  });
}




/**
 * @author arefin
 * @description Handle taskmaster-api.task.deleted.v1 domain events — extend with downstream side-effect logic
 */
async function handleTaskDeleted(envelope: EventEnvelope, env: Env, _ctx: ExecutionContext): Promise<void> {
  logger.info({
    action: 'handle_task_deleted',
    eventId: envelope.eventId,
    subjectId: envelope.subject?.id,
  });
}





const EVENT_HANDLERS: Record<string, EventHandler> = {



  'taskmaster-api.user.created.v1': handleUserCreated,









  'taskmaster-api.task.created.v1': handleTaskCreated,







  'taskmaster-api.task.updated.v1': handleTaskUpdated,



  'taskmaster-api.task.deleted.v1': handleTaskDeleted,



};

/**
 * @author arefin
 * @description Consume and route domain events from the queue — implements idempotency checking and individual message acknowledgement
 */
export async function domainEventConsumer(
  batch: MessageBatch<EventEnvelope>,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const processedIds = new Set<string>();

  for (const message of batch.messages) {
    const envelope = message.body;
    const { eventId, eventName } = envelope;

    try {
      if (processedIds.has(eventId)) {
        logger.warn({ action: 'event_duplicate_skipped', eventId, eventName });
        message.ack();
        continue;
      }

      logger.info({
        action: 'event_processing',
        eventId,
        eventName,
        correlationId: envelope.correlationId,
        subjectId: envelope.subject?.id,
      });

      const handler = EVENT_HANDLERS[eventName];
      if (handler) {
        await handler(envelope, env, ctx);
      } else {
        logger.warn({ action: 'event_no_handler', eventName });
      }

      processedIds.add(eventId);
      message.ack();

      logger.info({ action: 'event_processed', eventId, eventName });
    } catch (err) {
      logger.error({
        action: 'event_processing_failed',
        eventId,
        eventName,
        error: String(err),
      });
      message.retry();
    }
  }
}
