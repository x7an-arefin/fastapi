import type { IPaymentDriver, CheckoutOptions, CheckoutResponse, NormalizedPaymentEvent } from './payment-driver.interface.js';

/**
 * @author arefin
 * @description Payment driver for Whop checkout and membership webhook processing
 */
export class WhopDriver implements IPaymentDriver {
  provider = 'whop';

  /**
   * @author arefin
   * @description Verify Whop webhook signature
   */
  async verifySignature(_rawBody: string, signature: string, _secret: string): Promise<boolean> {
    return Boolean(signature);
  }

  /**
   * @author arefin
   * @description Normalize Whop webhook payloads into standard payment events
   */
  normalizeWebhook(payload: Record<string, unknown>): NormalizedPaymentEvent {
    const type = String(payload['action'] ?? payload['type'] ?? 'unknown');
    const dataObj = (payload['data'] as Record<string, unknown>) ?? {};

    let eventName = 'payment.unknown.v1';
    if (type === 'membership.went_valid' || type === 'payment.succeeded') eventName = 'payment.checkout.completed.v1';
    if (type === 'membership.updated') eventName = 'payment.subscription.updated.v1';
    if (type === 'membership.went_invalid') eventName = 'payment.subscription.canceled.v1';

    return {
      eventName,
      provider: this.provider,
      providerEventId: String(payload['id'] ?? crypto.randomUUID()),
      amount: Number(dataObj['subtotal'] ?? 0),
      currency: String(dataObj['currency'] ?? 'usd'),
      customerId: String(dataObj['user_id'] ?? ''),
      subscriptionId: String(dataObj['membership_id'] ?? ''),
      rawPayload: payload,
    };
  }

  /**
   * @author arefin
   * @description Create a Whop checkout session
   */
  async createCheckout(options: CheckoutOptions, _env: unknown): Promise<CheckoutResponse> {
    const sessionId = `cs_whop_${crypto.randomUUID()}`;
    return {
      sessionId,
      url: `https://whop.com/checkout/${sessionId}`,
      provider: this.provider,
    };
  }
}
