// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SCAFFOLDED FILE — This file was created by the generator once.     ║
// ║  It will NOT be overwritten on subsequent generator runs.           ║
// ║  Edit freely — this is your business logic.                         ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * POST lifecycle handler for DELETE Task.
 *
 * Runs AFTER the main operation has succeeded.
 * Responsibilities:
 *   - Publish domain events to Cloudflare Queues (durable, retried)
 *   - Queue email jobs (never call email provider directly here)
 *   - Cache invalidation
 *   - Analytics dispatch (best-effort via ctx.waitUntil)
 *   - Search index synchronization
 *
 * Two modes:
 *   post.immediate — small, disposable work via ExecutionContext.waitUntil()
 *   post.queue     — durable work via Cloudflare Queues (retry-safe)
 *
 * RULES:
 *   - Never call external APIs synchronously here
 *   - Never do database writes here (use the PROCESS stage instead)
 *   - Queue payloads must be under 64 KB
 */
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';

import { publishEvent } from '../../../core/events/event-publisher.js';
import { TASK_EVENTS } from '../task.events.js';


/**
 * POST hooks to run: publishTaskDeleted, queueAuditEvent
 */
export async function post(ctx: LifecycleContext): Promise<void> {

  const entityId = ctx.result?.entityId ?? 'unknown';
  const actor = ctx.meta['actor'] as { type: string; id: string } | undefined;

  // Publish domain event to Cloudflare Queue (durable, retry-safe)
  await publishEvent(ctx.env.DOMAIN_EVENTS, {
    eventName: TASK_EVENTS.DELETED,
    correlationId: ctx.correlationId,
    actor: actor ?? null,
    subject: { type: 'task', id: entityId },
    data: {
      entityId,
      // Add changed fields or summary data here
      // Keep payload under 64 KB — don't include full database records
    },
  });

  // TODO: Add additional post-operation work here
  // Examples:
  //   - await publishEvent(ctx.env.DOMAIN_EVENTS, { eventName: 'audit-event', ... });
  //   - // Queue email via separate email queue binding
  //   - // Invalidate CDN/KV cache

}
