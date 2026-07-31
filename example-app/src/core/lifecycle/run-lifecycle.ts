import type { LifecycleContext } from './lifecycle-context.js';
import type { LifecycleResult } from './lifecycle-result.js';
import { logger } from '../observability/logger.js';
import { AppError } from '../errors/application-error.js';

export interface LifecycleHandlers {
  pre: (ctx: LifecycleContext) => Promise<LifecycleResult | void>;
  process: (ctx: LifecycleContext) => Promise<LifecycleResult>;
  post: (ctx: LifecycleContext) => Promise<void>;
}

/**
 * @author arefin
 * @description Execute the full lifecycle pipeline (PRE → PROCESS → POST) for a single request in strict order
 */
export async function runLifecycle(
  ctx: LifecycleContext,
  handlers: LifecycleHandlers
): Promise<LifecycleResult> {

  logger.debug({ correlationId: ctx.correlationId, stage: 'pre', entity: ctx.meta['entity'], operation: ctx.meta['operation'] });

  const preResult = await handlers.pre(ctx);

  if (preResult && 'output' in preResult) {
    logger.debug({ correlationId: ctx.correlationId, stage: 'pre', shortCircuit: true });
    return preResult;
  }

  logger.debug({ correlationId: ctx.correlationId, stage: 'process' });

  let result: LifecycleResult;
  try {
    result = await handlers.process(ctx);
    ctx.result = result;
  } catch (err) {

    logger.error({ correlationId: ctx.correlationId, stage: 'process', error: String(err) });
    throw err;
  }

  logger.debug({ correlationId: ctx.correlationId, stage: 'post' });

  try {
    await handlers.post(ctx);
  } catch (err) {

    logger.error({
      correlationId: ctx.correlationId,
      stage: 'post',
      error: String(err),
      message: 'POST lifecycle failed — request succeeded, event delivery may be retried',
    });
  }

  return result;
}
