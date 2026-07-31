// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Dead Letter Queue Consumer — handles events that failed all retries.
 * Used for alerting, manual review, or archival of unprocessable events.
 */
import type { Env } from '../generated/bindings.js';
import type { EventEnvelope } from '../core/events/event-envelope.js';
import { logger } from '../core/observability/logger.js';

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
      // Alert your on-call team or store in permanent audit storage
    });

    // TODO: Store to permanent audit log or send alert
    // Examples:
    //   - Write to a dead_letter_archive table
    //   - Send a Slack/PagerDuty alert
    //   - Push to New Relic as an error event

    message.ack(); // Always ack DLQ messages to prevent infinite loop
  }
}
