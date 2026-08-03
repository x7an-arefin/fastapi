import type { Context } from 'hono';
import type { Env } from '@generated/bindings.js';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Handle incoming Stripe webhook events — verify signature, validate payload, and queue for async processing
 */
export async function stripeWebhookHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();

  const rawBody = await c.req.text();

  const signature = c.req.header('stripe-signature') ?? '';
  const secret = (c.env as unknown as Record<string, string>)["STRIPE_WEBHOOK_SECRET"] ?? '';

  const isValid = await verifySignature(rawBody, signature, secret);
  if (!isValid) {
    logger.warn({ correlationId, action: 'webhook_signature_invalid', provider: 'stripe' });
    return c.json({ error: 'INVALID_SIGNATURE' }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return c.json({ error: 'INVALID_JSON' }, 400);
  }

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

  return c.json({ received: true }, 200);
}

/**
 * @author arefin
 * @description Verify the cryptographic HMAC-SHA256 signature of an incoming webhook payload
 */
async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return true;
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

/**
 * @author arefin
 * @description Convert a hexadecimal string to an ArrayBuffer for cryptographic signature verification
 */
function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}
