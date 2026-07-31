/**
 * Intermediate Representation (IR) — the stable internal model passed to all sub-generators.
 * Templates never read the raw application.json directly.
 */
import type { CrudOperation, LifecycleStage } from '../naming/index.js';

// ── Top-level IR ──────────────────────────────────────────────────────────────

export interface ApplicationIR {
  /** Original spec version */
  specVersion: string;
  /** Application metadata */
  application: ApplicationMetaIR;
  /** Database configuration */
  database: DatabaseIR;
  /** Authentication (optional) */
  authentication: AuthenticationIR | null;
  /** Events configuration */
  events: EventsIR;
  /** Normalized entities (ordered by dependency) */
  entities: EntityIR[];
  /** Storage configuration (optional) */
  storage: StorageIR | null;
  /** Email configuration (optional) */
  email: EmailIR | null;
  /** Webhook configurations */
  webhooks: WebhookIR[];
  /** Scheduled jobs */
  scheduled: ScheduledJobIR[];
  /** Observability */
  observability: ObservabilityIR;
  /** Resource budgets */
  budgets: BudgetPolicyIR;
}

// ── Application Meta ──────────────────────────────────────────────────────────

export interface ApplicationMetaIR {
  name: string;
  /** e.g. "commerce" */
  domain: string;
  /** e.g. "/api/v1" */
  apiPrefix: string;
  runtime: 'cloudflare-workers';
  framework: 'hono';
  language: 'typescript';
  /** kebab-case name for file paths */
  nameKebab: string;
  /** PascalCase name for type names */
  namePascal: string;
  /** camelCase name for variable names */
  nameCamel: string;
}

// ── Database ──────────────────────────────────────────────────────────────────

export interface DatabaseIR {
  provider: 'cockroachdb' | 'postgresql';
  connection: 'hyperdrive';
  orm: 'drizzle';
  /** Wrangler binding name e.g. "HYPERDRIVE" */
  binding: string;
  migrations: boolean;
}

// ── Authentication ────────────────────────────────────────────────────────────

export interface AuthenticationIR {
  provider: 'better-auth';
  session: {
    primaryStore: 'cockroachdb';
    cache: 'workers-kv';
    kvBinding: string;
    writePolicy: 'auth-events-only';
  };
}

// ── Events ────────────────────────────────────────────────────────────────────

export interface EventsIR {
  version: number;
  defaultPostMode: 'queue' | 'immediate' | 'both';
  queueBinding: string;
  deadLetterQueueBinding: string;
  includeCorrelationId: boolean;
  includeActor: boolean;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export interface EntityIR {
  /** Original name from JSON key e.g. "product" */
  name: string;
  /** kebab-case: "product" */
  nameKebab: string;
  /** PascalCase: "Product" */
  namePascal: string;
  /** camelCase: "product" */
  nameCamel: string;
  /** plural kebab: "products" */
  namePluralKebab: string;
  /** Database table name */
  table: string;
  /** Normalized fields */
  fields: FieldIR[];
  /** Primary key field */
  primaryKey: FieldIR;
  /** Indexes */
  indexes: IndexIR[];
  /** CRUD operations (only enabled ones) */
  operations: OperationIR[];
  /** Whether this entity has a soft-delete field */
  hasSoftDelete: boolean;
  /** Whether this entity has optimistic concurrency (updatedAt field) */
  hasOptimisticConcurrency: boolean;
  /** Whether this entity has outbox delivery on any operation */
  hasTransactionalOutbox: boolean;
}

export interface FieldIR {
  name: string;
  nameSnake: string;
  nameCamel: string;
  namePascal: string;
  type: FieldType;
  primary: boolean;
  generated: boolean | 'createdAt' | 'updatedAt';
  required: boolean;
  unique: boolean;
  nullable: boolean;
  minLength?: number;
  maxLength?: number;
  precision?: number;
  scale?: number;
  default?: unknown;
  enumValues?: string[];
  references?: ReferenceIR;
  /** Drizzle column type expression */
  drizzleColumn: string;
}

export type FieldType = 'uuid' | 'string' | 'text' | 'integer' | 'bigint' | 'decimal' | 'boolean' | 'timestamp' | 'enum' | 'json';

export interface ReferenceIR {
  entityName: string;
  fieldName: string;
  tableName: string;
}

export interface IndexIR {
  name: string;
  fields: string[];
  unique: boolean;
}

// ── Operations ────────────────────────────────────────────────────────────────

export interface OperationIR {
  /** e.g. "create" */
  operation: CrudOperation;
  /** HTTP method */
  method: string;
  /** Route path e.g. "/products" */
  path: string;
  /** Full API path e.g. "/api/v1/products" */
  fullPath: string;
  auth: boolean;
  permissions: string[];
  /** Fields to SELECT/return */
  selectFields: FieldIR[];
  lifecycle: LifecycleIR;
  /** Domain event name (fact): commerce.product.created.v1 */
  domainEventName: string;
  /** Lifecycle event names */
  lifecycleEventNames: Record<LifecycleStage, string>;
  /** Budget estimate for this operation */
  budget: OperationBudgetIR;
  /** Delivery mode */
  delivery: 'best-effort' | 'transactional-outbox';
  /** Operation-specific config */
  config: CreateOpConfig | GetOpConfig | ListOpConfig | UpdateOpConfig | DeleteOpConfig;
}

export interface LifecycleIR {
  pre: string[];
  process: string[];
  post: string[];
}

export interface CreateOpConfig {
  kind: 'create';
  idempotency: boolean;
}

export interface GetOpConfig {
  kind: 'get';
  cache: { mode: 'http' | 'kv'; maxAge: number } | null;
}

export interface ListOpConfig {
  kind: 'list';
  pagination: { type: 'cursor' | 'offset'; defaultLimit: number; maximumLimit: number };
  filterFields: string[];
  sortFields: string[];
}

export interface UpdateOpConfig {
  kind: 'update';
  concurrency: { mode: 'updatedAt' | 'version' | 'none' };
}

export interface DeleteOpConfig {
  kind: 'delete';
  mode: 'soft' | 'hard';
}

// ── Budget ────────────────────────────────────────────────────────────────────

export interface OperationBudgetIR {
  dbQueries: number;
  kvReads: number;
  kvWrites: number;
  queueWrites: number;
  b2Operations: number;
}

// ── Storage ───────────────────────────────────────────────────────────────────

export interface StorageIR {
  provider: 'backblaze-b2';
  uploadMode: 'presigned-url';
  publicBaseUrl: string;
  maximumUploadBytes: number;
  allowedMimeTypes: string[];
  binding: string;
}

// ── Email ─────────────────────────────────────────────────────────────────────

export interface EmailIR {
  provider: 'resend';
  execution: 'queue-only';
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export interface WebhookIR {
  name: string;
  namePascal: string;
  path: string;
  signatureType: 'stripe' | 'github' | 'shopify' | 'hmac';
  secretBinding: string;
  queueBinding: string;
  responseStatus: number;
}

// ── Scheduled ─────────────────────────────────────────────────────────────────

export interface ScheduledJobIR {
  name: string;
  nameKebab: string;
  namePascal: string;
  cron: string;
  description: string;
}

// ── Observability ─────────────────────────────────────────────────────────────

export interface ObservabilityIR {
  correlationHeader: string;
  structuredLogs: boolean;
  provider: 'new-relic' | 'datadog' | 'none';
  transport: 'cloudflare-logpush' | 'console';
  profile: 'free' | 'paid-logpush';
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export interface BudgetPolicyIR {
  request: {
    maximumDatabaseQueries: number;
    maximumKvReads: number;
    maximumKvWrites: number;
    maximumQueueWrites: number;
    maximumB2Operations: number;
  };
}
