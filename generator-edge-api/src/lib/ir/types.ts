import type { CrudOperation, LifecycleStage } from '../naming/index.js';

export interface ApplicationIR {
  specVersion: string;
  application: ApplicationMetaIR;
  database: DatabaseIR;
  authentication: AuthenticationIR | null;
  events: EventsIR;
  entities: EntityIR[];
  storage: StorageIR | null;
  email: EmailIR | null;
  webhooks: WebhookIR[];
  scheduled: ScheduledJobIR[];
  observability: ObservabilityIR;
  budgets: BudgetPolicyIR;
  security: SecurityIR;
}

export interface ApplicationMetaIR {
  name: string;
  domain: string;
  apiPrefix: string;
  runtime: 'cloudflare-workers';
  framework: 'hono';
  language: 'typescript';
  nameKebab: string;
  namePascal: string;
  nameCamel: string;
}

export interface DatabaseIR {
  provider: 'cockroachdb' | 'postgresql';
  connection: 'hyperdrive';
  orm: 'drizzle';
  binding: string;
  migrations: boolean;
}

export interface AuthenticationIR {
  provider: 'better-auth';
  session: {
    primaryStore: 'cockroachdb';
    cache: 'workers-kv';
    kvBinding: string;
    writePolicy: 'auth-events-only';
  };
}

export interface EventsIR {
  version: number;
  defaultPostMode: 'queue' | 'immediate' | 'both';
  queueBinding: string;
  deadLetterQueueBinding: string;
  includeCorrelationId: boolean;
  includeActor: boolean;
}

export interface EntityIR {
  name: string;
  nameKebab: string;
  namePascal: string;
  nameCamel: string;
  namePluralKebab: string;
  table: string;
  fields: FieldIR[];
  primaryKey: FieldIR;
  indexes: IndexIR[];
  operations: OperationIR[];
  hasSoftDelete: boolean;
  hasOptimisticConcurrency: boolean;
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
  drizzleColumn: string;
}

export type FieldType = 'uuid' | 'string' | 'text' | 'integer' | 'bigint' | 'decimal' | 'boolean' | 'timestamp' | 'enum' | 'json';

export interface ReferenceIR {
  entityName: string;
  fieldName: string;
  tableName: string;
  onDelete: 'cascade' | 'set-null' | 'restrict' | 'no-action';
  onUpdate: 'cascade' | 'set-null' | 'restrict' | 'no-action';
  relation: 'many-to-one' | 'one-to-one';
}

export interface IndexIR {
  name: string;
  fields: string[];
  unique: boolean;
}

export interface OperationIR {
  operation: CrudOperation;
  method: string;
  path: string;
  fullPath: string;
  auth: boolean;
  permissions: string[];
  selectFields: FieldIR[];
  lifecycle: LifecycleIR;
  domainEventName: string;
  lifecycleEventNames: Record<LifecycleStage, string>;
  budget: OperationBudgetIR;
  delivery: 'best-effort' | 'transactional-outbox';
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

export interface OperationBudgetIR {
  dbQueries: number;
  kvReads: number;
  kvWrites: number;
  queueWrites: number;
  b2Operations: number;
}

export interface StorageIR {
  provider: 'backblaze-b2';
  uploadMode: 'presigned-url';
  publicBaseUrl: string;
  maximumUploadBytes: number;
  allowedMimeTypes: string[];
  binding: string;
}

export interface EmailIR {
  provider: 'resend';
  execution: 'queue-only';
}

export interface WebhookIR {
  name: string;
  namePascal: string;
  path: string;
  signatureType: 'stripe' | 'github' | 'shopify' | 'hmac';
  secretBinding: string;
  queueBinding: string;
  responseStatus: number;
}

export interface ScheduledJobIR {
  name: string;
  nameKebab: string;
  namePascal: string;
  cron: string;
  description: string;
}

export interface ObservabilityIR {
  correlationHeader: string;
  structuredLogs: boolean;
  provider: 'new-relic' | 'datadog' | 'none';
  transport: 'cloudflare-logpush' | 'console';
  profile: 'free' | 'paid-logpush';
}

export interface BudgetPolicyIR {
  request: {
    maximumDatabaseQueries: number;
    maximumKvReads: number;
    maximumKvWrites: number;
    maximumQueueWrites: number;
    maximumB2Operations: number;
  };
}

export interface SecurityIR {
  defaultAuth: boolean;
  cors: {
    origins: string[];
    methods: string[];
    credentials: boolean;
    maxAge: number;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    store: 'memory' | 'kv';
    kvBinding: string;
  };
}
