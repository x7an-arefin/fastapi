/**
 * @author arefin
 * @description Generate a cryptographically random UUID v4 string
 */
const randomUUID = () => crypto.randomUUID();

export interface EventEnvelope<T = unknown> {
  specVersion: '1.0';
  eventId: string;
  eventName: string;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  traceId?: string;
  tenantId?: string;
  actor: { type: string; id: string } | null;
  subject: { type: string; id: string } | null;
  data: T;
  metadata: {
    source: 'api' | 'queue' | 'cron' | 'webhook';
    schemaVersion: number;
  };
}

export interface CreateEventOptions<T = unknown> {
  eventName: string;
  correlationId: string;
  actor: { type: string; id: string } | null;
  subject: { type: string; id: string } | null;
  data: T;
  causationId?: string;
  tenantId?: string;
  source?: 'api' | 'queue' | 'cron' | 'webhook';
}

/**
 * @author arefin
 * @description Create a structured event envelope with metadata for event-driven communication
 */
export function createEventEnvelope<T = unknown>(options: CreateEventOptions<T>): EventEnvelope<T> {
  return {
    specVersion: '1.0',
    eventId: randomUUID(),
    eventName: options.eventName,
    occurredAt: new Date().toISOString(),
    correlationId: options.correlationId,
    causationId: options.causationId,
    actor: options.actor,
    subject: options.subject,
    tenantId: options.tenantId,
    data: options.data,
    metadata: {
      source: options.source ?? 'api',
      schemaVersion: 1,
    },
  };
}

/**
 * @author arefin
 * @description Validate that the event envelope payload does not exceed the maximum allowed size
 */
export function assertPayloadSize(envelope: EventEnvelope): void {
  const bytes = new TextEncoder().encode(JSON.stringify(envelope)).length;
  const MAX_BYTES = 64 * 1024;
  if (bytes > MAX_BYTES) {
    throw new Error(
      `Event payload too large: ${bytes} bytes (max ${MAX_BYTES} bytes). ` +
      `Event: ${envelope.eventName}. Strip full records from event.data and use IDs only.`
    );
  }
}
