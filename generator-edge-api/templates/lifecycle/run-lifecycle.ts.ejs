// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Lifecycle Runner — executes PRE → PROCESS → POST in strict order.
 *
 * Ordering guarantees:
 *   1. PRE runs completely before PROCESS starts
 *   2. PROCESS failure prevents POST from running
 *   3. PRE rejection (thrown AppError) prevents PROCESS from running
 *   4. POST queue failure follows the configured delivery policy
 */
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
 * Run the full lifecycle pipeline for a single request.
 * Returns the result from the PROCESS stage.
 */
export async function runLifecycle(
  ctx: LifecycleContext,
  handlers: LifecycleHandlers
): Promise<LifecycleResult> {
  // ── PRE ──────────────────────────────────────────────────────────────────
  logger.debug({ correlationId: ctx.correlationId, stage: 'pre', entity: ctx.meta['entity'], operation: ctx.meta['operation'] });

  const preResult = await handlers.pre(ctx);

  // PRE may return a short-circuit result (e.g., cached response)
  if (preResult && 'output' in preResult) {
    logger.debug({ correlationId: ctx.correlationId, stage: 'pre', shortCircuit: true });
    return preResult;
  }

  // ── PROCESS ──────────────────────────────────────────────────────────────
  logger.debug({ correlationId: ctx.correlationId, stage: 'process' });

  let result: LifecycleResult;
  try {
    result = await handlers.process(ctx);
    ctx.result = result;
  } catch (err) {
    // PROCESS failure — POST does NOT run
    logger.error({ correlationId: ctx.correlationId, stage: 'process', error: String(err) });
    throw err;
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  logger.debug({ correlationId: ctx.correlationId, stage: 'post' });

  try {
    await handlers.post(ctx);
  } catch (err) {
    // POST failure — log but do NOT fail the request
    // The HTTP response has already been determined by PROCESS
    // Queue retries will handle durable delivery failures
    logger.error({
      correlationId: ctx.correlationId,
      stage: 'post',
      error: String(err),
      message: 'POST lifecycle failed — request succeeded, event delivery may be retried',
    });
  }

  return result;
}
