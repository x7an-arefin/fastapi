// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Event Envelope — the standard CloudEvents-inspired wrapper for all events.
 * Every internal lifecycle hook and queued domain event uses this envelope.
 */
const randomUUID = () => crypto.randomUUID();

export interface EventEnvelope<T = unknown> {
  /** Envelope specification version */
  specVersion: '1.0';
  /** Globally unique event ID (ULID-style UUID) */
  eventId: string;
  /** Full event name: domain.entity.operation.stage.v{version} */
  eventName: string;
  /** ISO-8601 timestamp of when the event occurred */
  occurredAt: string;
  /** Correlation ID from the originating HTTP request */
  correlationId: string;
  /** Causation ID — the event that caused this event (optional) */
  causationId?: string;
  /** Distributed trace ID (optional) */
  traceId?: string;
  /** Tenant ID for multi-tenant applications (optional) */
  tenantId?: string;
  /** The actor that triggered the event */
  actor: { type: string; id: string } | null;
  /** The primary subject of the event */
  subject: { type: string; id: string } | null;
  /** Event-specific payload — keep under 64 KB */
  data: T;
  /** Metadata for routing and version tracking */
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
 * Create a standard event envelope.
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
 * Validate that a queue message payload is within the 64 KB safety limit.
 */
export function assertPayloadSize(envelope: EventEnvelope): void {
  const bytes = new TextEncoder().encode(JSON.stringify(envelope)).length;
  const MAX_BYTES = 64 * 1024; // 64 KB (our policy, platform max is 128 KB)
  if (bytes > MAX_BYTES) {
    throw new Error(
      `Event payload too large: ${bytes} bytes (max ${MAX_BYTES} bytes). ` +
      `Event: ${envelope.eventName}. Strip full records from event.data and use IDs only.`
    );
  }
}
