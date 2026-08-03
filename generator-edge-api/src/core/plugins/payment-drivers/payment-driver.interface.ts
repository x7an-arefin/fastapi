import type { Context } from 'hono';

export interface CheckoutOptions {
  amount: number;
  currency: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
  provider: string;
}

export interface NormalizedPaymentEvent {
  eventName: string;
  provider: string;
  providerEventId: string;
  amount?: number;
  currency?: string;
  customerId?: string;
  subscriptionId?: string;
  rawPayload: Record<string, unknown>;
}

/**
 * @author arefin
 * @description Standardized interface for payment gateway drivers (Stripe, Paddle, Whop, etc.)
 */
export interface IPaymentDriver {
  provider: string;

  /**
   * @author arefin
   * @description Verify the raw cryptographic signature for incoming webhook payloads
   */
  verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean>;

  /**
   * @author arefin
   * @description Normalize provider-specific webhook payloads into a unified payment event format
   */
  normalizeWebhook(payload: Record<string, unknown>): NormalizedPaymentEvent;

  /**
   * @author arefin
   * @description Create a checkout session and return the redirect URL
   */
  createCheckout(options: CheckoutOptions, env: unknown): Promise<CheckoutResponse>;
}
