// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Event Publisher — publishes domain events to Cloudflare Queues.
 *
 * Rules:
 *   - All events use the standard EventEnvelope
 *   - Payload must be under 64 KB (enforced before sending)
 *   - Never call this inside an open database transaction
 *   - Consumers must implement idempotency using the eventId
 */
import { createEventEnvelope, assertPayloadSize, type CreateEventOptions, type EventEnvelope } from './event-envelope.js';
import { logger } from '../observability/logger.js';

/**
 * Publish a single domain event to the specified Cloudflare Queue.
 */
export async function publishEvent<T = unknown>(
  queue: Queue,
  options: CreateEventOptions<T>
): Promise<void> {
  const envelope = createEventEnvelope(options);

  // Enforce 64 KB payload policy before sending
  assertPayloadSize(envelope as EventEnvelope);

  await queue.send(envelope, {
    contentType: 'json',
  });

  logger.debug({
    action: 'event_published',
    eventId: envelope.eventId,
    eventName: envelope.eventName,
    correlationId: envelope.correlationId,
    subjectId: envelope.subject?.id,
  });
}

/**
 * Publish multiple events in a single batch.
 * More efficient than multiple publishEvent() calls.
 */
export async function publishEvents<T = unknown>(
  queue: Queue,
  events: CreateEventOptions<T>[]
): Promise<void> {
  const envelopes = events.map((opts) => {
    const envelope = createEventEnvelope(opts);
    assertPayloadSize(envelope as EventEnvelope);
    return { body: envelope, contentType: 'json' as const };
  });

  await queue.sendBatch(envelopes);

  logger.debug({
    action: 'events_batch_published',
    count: envelopes.length,
  });
}
