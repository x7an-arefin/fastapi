// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Source: application.json                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝

/**
 * Typed Cloudflare Workers environment bindings for task-master-api.
 * Generated from application.json. Run `wrangler types` to regenerate
 * after changing wrangler.jsonc.
 */
export interface Env {
  // Hyperdrive binding
  HYPERDRIVE: Hyperdrive;

  // KV session cache
  AUTH_SESSION_KV: KVNamespace;


  // Domain events queue
  DOMAIN_EVENTS: Queue;
  DOMAIN_EVENTS_DLQ: Queue;


  // Webhook secret: stripe
  STRIPE_WEBHOOK_SECRET: string;


  // General
  ENVIRONMENT: string;
}
