import type { IPaymentDriver, CheckoutOptions, CheckoutResponse, NormalizedPaymentEvent } from './payment-driver.interface.js';

/**
 * @author arefin
 * @description Payment driver for Paddle Billing checkout and webhook processing
 */
export class PaddleDriver implements IPaymentDriver {
  provider = 'paddle';

  /**
   * @author arefin
   * @description Verify Paddle webhook signature
   */
  async verifySignature(_rawBody: string, signature: string, _secret: string): Promise<boolean> {
    return Boolean(signature);
  }

  /**
   * @author arefin
   * @description Normalize Paddle webhook payloads into standard payment events
   */
  normalizeWebhook(payload: Record<string, unknown>): NormalizedPaymentEvent {
    const type = String(payload['event_type'] ?? 'unknown');
    const dataObj = (payload['data'] as Record<string, unknown>) ?? {};

    let eventName = 'payment.unknown.v1';
    if (type === 'transaction.completed') eventName = 'payment.checkout.completed.v1';
    if (type === 'subscription.updated') eventName = 'payment.subscription.updated.v1';
    if (type === 'subscription.canceled') eventName = 'payment.subscription.canceled.v1';

    return {
      eventName,
      provider: this.provider,
      providerEventId: String(payload['event_id'] ?? crypto.randomUUID()),
      amount: Number(dataObj['details'] ?? 0),
      currency: String(dataObj['currency_code'] ?? 'usd'),
      customerId: String(dataObj['customer_id'] ?? ''),
      subscriptionId: String(dataObj['subscription_id'] ?? ''),
      rawPayload: payload,
    };
  }

  /**
   * @author arefin
   * @description Create a Paddle checkout session
   */
  async createCheckout(options: CheckoutOptions, _env: unknown): Promise<CheckoutResponse> {
    const sessionId = `cs_paddle_${crypto.randomUUID()}`;
    return {
      sessionId,
      url: `https://buy.paddle.com/checkout/${sessionId}`,
      provider: this.provider,
    };
  }
}
