// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Email Consumer — processes email jobs from the email queue.
 * Calls Resend API only from here — never from HTTP handlers directly.
 *
 * This ensures email provider latency never impacts user response times.
 */
import type { Env } from '../generated/bindings.js';
import { logger } from '../core/observability/logger.js';

export interface EmailJob {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  correlationId: string;
}

export async function emailConsumer(
  batch: MessageBatch<EmailJob>,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  for (const message of batch.messages) {
    const job = message.body;

    try {
      // Call Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(env as unknown as Record<string, string>)['RESEND_API_KEY']}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: job.to,
          from: job.from,
          subject: job.subject,
          html: job.html,
          text: job.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${response.status} ${error}`);
      }

      logger.info({
        action: 'email_sent',
        to: job.to,
        subject: job.subject,
        correlationId: job.correlationId,
      });

      message.ack();
    } catch (err) {
      logger.error({
        action: 'email_failed',
        to: job.to,
        subject: job.subject,
        error: String(err),
        correlationId: job.correlationId,
      });
      message.retry();
    }
  }
}
