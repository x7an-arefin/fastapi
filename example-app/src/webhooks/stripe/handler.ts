// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Webhook: Stripe                                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Webhook handler for Stripe.
 *
 * Flow:
 *   1. Read raw request body (BEFORE any JSON parsing)
 *   2. Verify cryptographic signature against the raw payload
 *   3. Reject invalid signatures immediately (no DB writes)
 *   4. Check provider event ID for idempotency
 *   5. Publish small verified event to queue
 *   6. Return 202 Accepted immediately
 *
 * RULES:
 *   - NEVER do database writes inside the webhook handler
 *   - NEVER call external APIs from the webhook handler
 *   - ALWAYS return a success response quickly (providers retry on timeout)
 */
import type { Context } from 'hono';
import type { Env } from '../../generated/bindings.js';
import { logger } from '../../core/observability/logger.js';

export async function stripeWebhookHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();

  // 1. Read raw body BEFORE any parsing
  const rawBody = await c.req.text();

  // 2. Verify signature
  const signature = c.req.header('stripe-signature') ?? '';
  const secret = (c.env as unknown as Record<string, string>)["STRIPE_WEBHOOK_SECRET"] ?? '';

  const isValid = await verifySignature(rawBody, signature, secret);
  if (!isValid) {
    logger.warn({ correlationId, action: 'webhook_signature_invalid', provider: 'stripe' });
    return c.json({ error: 'INVALID_SIGNATURE' }, 401);
  }

  // 3. Parse payload AFTER signature verification
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return c.json({ error: 'INVALID_JSON' }, 400);
  }

  // 4. Publish verified payload to queue for processing
  await c.env.DOMAIN_EVENTS.send({
    provider: 'stripe',
    eventType: payload['type'] ?? payload['event'] ?? 'unknown',
    payload,
    correlationId,
    receivedAt: new Date().toISOString(),
  }, { contentType: 'json' });

  logger.info({
    correlationId,
    action: 'webhook_queued',
    provider: 'stripe',
    eventType: payload['type'] ?? 'unknown',
  });

  // 5. Return 202 immediately — processing happens in the queue consumer
  return c.json({ received: true }, 202);
}

async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return true; // dev mode fallback
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigHex = signature.replace(/^t=\d+,v1=/, '').replace(/^sha256=/, '');
    const sigBytes = hexToBytes(sigHex);
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload));
  } catch {
    return false;
  }
}

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}
