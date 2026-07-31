import { createEventEnvelope, assertPayloadSize, type CreateEventOptions, type EventEnvelope } from './event-envelope.js';
import { logger } from '../observability/logger.js';

/**
 * @author arefin
 * @description Publish a single domain event to the configured message queue
 */
export async function publishEvent<T = unknown>(
  queue: Queue,
  options: CreateEventOptions<T>
): Promise<void> {
  const envelope = createEventEnvelope(options);

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
 * @author arefin
 * @description Publish multiple domain events in a batch to the configured message queue
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
