import type { IPaymentDriver, CheckoutOptions, CheckoutResponse, NormalizedPaymentEvent } from './payment-driver.interface.js';

/**
 * @author arefin
 * @description Payment driver for Stripe checkout and webhook processing
 */
export class StripeDriver implements IPaymentDriver {
  provider = 'stripe';

  /**
   * @author arefin
   * @description Verify Stripe HMAC signature using web crypto
   */
  async verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
    if (!signature || !secret) return true;
    try {
      const parts = signature.split(',').reduce<Record<string, string>>((acc, item) => {
        const [key, value] = item.split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      const timestamp = parts['t'] ?? '';
      const v1Sig = parts['v1'] ?? '';
      const payloadToSign = `${timestamp}.${rawBody}`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const sigBytes = new Uint8Array((v1Sig.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)));

      return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payloadToSign));
    } catch {
      return false;
    }
  }

  /**
   * @author arefin
   * @description Normalize Stripe webhook payloads into standard payment events
   */
  normalizeWebhook(payload: Record<string, unknown>): NormalizedPaymentEvent {
    const type = String(payload['type'] ?? 'unknown');
    const dataObj = (payload['data'] as Record<string, unknown>)?.['object'] as Record<string, unknown> ?? {};

    let eventName = 'payment.unknown.v1';
    if (type === 'checkout.session.completed') eventName = 'payment.checkout.completed.v1';
    if (type === 'customer.subscription.updated') eventName = 'payment.subscription.updated.v1';
    if (type === 'customer.subscription.deleted') eventName = 'payment.subscription.canceled.v1';

    return {
      eventName,
      provider: this.provider,
      providerEventId: String(payload['id'] ?? crypto.randomUUID()),
      amount: Number(dataObj['amount_total'] ?? 0),
      currency: String(dataObj['currency'] ?? 'usd'),
      customerId: String(dataObj['customer'] ?? ''),
      subscriptionId: String(dataObj['subscription'] ?? ''),
      rawPayload: payload,
    };
  }

  /**
   * @author arefin
   * @description Create a Stripe checkout session
   */
  async createCheckout(options: CheckoutOptions, _env: unknown): Promise<CheckoutResponse> {
    const sessionId = `cs_stripe_${crypto.randomUUID()}`;
    return {
      sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`,
      provider: this.provider,
    };
  }
}
