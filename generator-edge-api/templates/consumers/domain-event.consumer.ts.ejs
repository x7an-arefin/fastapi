// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Domain Event Consumer — processes events from the domain events queue.
 *
 * Idempotency contract:
 *   1. Inspect event ID
 *   2. Check if already processed (via processedEventIds set or DB record)
 *   3. Perform operation
 *   4. Mark event as processed
 *   5. Acknowledge the message (message.ack())
 *
 * Each message is acknowledged individually so that failures in one
 * message don't prevent others in the batch from being acknowledged.
 */
import type { Env } from '../generated/bindings.js';
import type { EventEnvelope } from '../core/events/event-envelope.js';
import { logger } from '../core/observability/logger.js';

export async function domainEventConsumer(
  batch: MessageBatch<EventEnvelope>,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const processedIds = new Set<string>();

  for (const message of batch.messages) {
    const envelope = message.body;
    const eventId = envelope.eventId;
    const eventName = envelope.eventName;

    try {
      // ── Idempotency check ───────────────────────────────────────────────
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

      // ── Route by event name ─────────────────────────────────────────────
      await routeEvent(envelope, env, ctx);

      // ── Mark processed and acknowledge ──────────────────────────────────
      processedIds.add(eventId);
      message.ack();

      logger.info({
        action: 'event_processed',
        eventId,
        eventName,
      });
    } catch (err) {
      logger.error({
        action: 'event_processing_failed',
        eventId,
        eventName,
        error: String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });

      // Retry message (do not ack) — will be retried up to max_retries
      message.retry();
    }
  }
}

async function routeEvent(
  envelope: EventEnvelope,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const { eventName } = envelope;

  // TODO: Add event routing here as you add new entities and operations
  // Example:
  // switch (eventName) {
  //   case PRODUCT_EVENTS.CREATED:
  //     await handleProductCreated(envelope, env);
  //     break;
  //   default:
  //     logger.warn({ action: 'event_unhandled', eventName });
  // }

  logger.info({ action: 'event_routed', eventName, note: 'no handler registered yet' });
}
