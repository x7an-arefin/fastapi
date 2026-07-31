import type { Env } from '../generated/bindings.js';
import type { EventEnvelope } from '../core/events/event-envelope.js';
import { logger } from '../core/observability/logger.js';

/**
 * @author arefin
 * @description Process dead-letter queue messages — handle undeliverable events with logging and alerting
 */
export async function deadLetterConsumer(
  batch: MessageBatch<EventEnvelope>,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  for (const message of batch.messages) {
    const envelope = message.body;

    logger.error({
      action: 'dead_letter_received',
      eventId: envelope.eventId,
      eventName: envelope.eventName,
      correlationId: envelope.correlationId,
      occurredAt: envelope.occurredAt,

    });

    message.ack();
  }
}
