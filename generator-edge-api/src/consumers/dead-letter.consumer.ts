import type { Env } from '@generated/bindings.js';
import type { EventEnvelope } from '@core/events/event-envelope.js';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Process dead-letter queue messages — emit critical alerts and structured error payloads for monitoring
 */
export async function deadLetterConsumer(
  batch: MessageBatch<EventEnvelope>,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  for (const message of batch.messages) {
    const envelope = message.body;

    const alertPayload = {
      severity: 'critical',
      action: 'dead_letter_received',
      eventId: envelope.eventId,
      eventName: envelope.eventName,
      correlationId: envelope.correlationId,
      occurredAt: envelope.occurredAt,
      app: 'TaskMaster API',
      environment: (env as Record<string, unknown>)['ENVIRONMENT'] ?? 'unknown',
      retryExhausted: true,
    };

    logger.error(alertPayload);



    message.ack();
  }
}
