export interface Env {
  HYPERDRIVE: Hyperdrive;

  AUTH_SESSION_KV: KVNamespace;


  DOMAIN_EVENTS: Queue;
  DOMAIN_EVENTS_DLQ: Queue;


  STRIPE_WEBHOOK_SECRET: string;


  ENVIRONMENT: string;
}
