import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { LifecycleResult } from '../../../core/lifecycle/lifecycle-result.js';

import { publishEvent } from '../../../core/events/event-publisher.js';
import { TASK_EVENTS } from '../task.events.js';

/**
 * @author arefin
 * @description Post-lifecycle side effects and event publishing after create Task completes successfully
 */
export async function post(ctx: LifecycleContext): Promise<void> {

  const entityId = ctx.result?.entityId ?? 'unknown';
  const actor = ctx.meta['actor'] as { type: string; id: string } | undefined;

  await publishEvent(ctx.env.DOMAIN_EVENTS, {
    eventName: TASK_EVENTS.CREATED,
    correlationId: ctx.correlationId,
    actor: actor ?? null,
    subject: { type: 'task', id: entityId },
    data: {
      entityId,

    },
  });

}
