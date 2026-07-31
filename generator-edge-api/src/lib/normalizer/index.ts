import type {
  ApplicationIR,
  ApplicationMetaIR,
  AuthenticationIR,
  BudgetPolicyIR,
  CreateOpConfig,
  DatabaseIR,
  DeleteOpConfig,
  EmailIR,
  EntityIR,
  EventsIR,
  FieldIR,
  FieldType,
  GetOpConfig,
  IndexIR,
  ListOpConfig,
  ObservabilityIR,
  OperationBudgetIR,
  OperationIR,
  ReferenceIR,
  ScheduledJobIR,
  StorageIR,
  UpdateOpConfig,
  WebhookIR,
} from '../ir/types.js';
import {
  toCamelCase,
  toDomainEventName,
  toKebabCase,
  toLifecycleEventName,
  toPascalCase,
  toSnakeCase,
  pluralize,
  type CrudOperation,
} from '../naming/index.js';
import { extractEntityDependencies, topologicalSort } from '../dependency-graph/index.js';
import { computeBudget } from '../resource-budget/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawSpec = Record<string, any>;

/**
 * @author arefin
 * @description Convert a normalized field definition to a Drizzle ORM column type with appropriate constraints
 */
function toDrizzleColumn(field: RawSpec, fieldName: string): string {
  const type = field['type'] as FieldType;
  const snakeName = toSnakeCase(fieldName);

  switch (type) {
    case 'uuid':
      if (field['primary'] && field['generated']) {
        return `uuid("${snakeName}").defaultRandom().primaryKey()`;
      }
      return `uuid("${snakeName}")`;

    case 'string':
      if (field['maxLength']) {
        return `varchar("${snakeName}", { length: ${field['maxLength']} })`;
      }
      return `varchar("${snakeName}", { length: 255 })`;

    case 'text':
      return `text("${snakeName}")`;

    case 'integer':
      return `integer("${snakeName}")`;

    case 'bigint':
      return `bigint("${snakeName}", { mode: "number" })`;

    case 'decimal':
      return `decimal("${snakeName}", { precision: ${field['precision'] ?? 10}, scale: ${field['scale'] ?? 2} })`;

    case 'boolean':
      return `boolean("${snakeName}")`;

    case 'timestamp':
      if (field['generated'] === 'createdAt') {
        return `timestamp("${snakeName}", { withTimezone: true }).defaultNow().notNull()`;
      }
      if (field['generated'] === 'updatedAt') {
        return `timestamp("${snakeName}", { withTimezone: true }).defaultNow().notNull()`;
      }
      return `timestamp("${snakeName}", { withTimezone: true })`;

    case 'enum': {
      const values = (field['values'] as string[]).map((v) => `"${v}"`).join(', ');
      const enumName = `${fieldName}Enum`;
      return `${enumName}("${snakeName}")`;
    }

    case 'json':
      return `jsonb("${snakeName}")`;

    default:
      return `text("${snakeName}")`;
  }
}

/**
 * @author arefin
 * @description Normalize a single field definition from raw spec format to the intermediate representation
 */
function normalizeField(fieldName: string, raw: RawSpec, entityName: string, entities: RawSpec): FieldIR {
  const type = raw['type'] as FieldType;
  const generated = raw['generated'] as boolean | 'createdAt' | 'updatedAt' | undefined;
  const required = (raw['required'] as boolean | undefined) ?? false;
  const isPrimary = (raw['primary'] as boolean | undefined) ?? false;
  const isGenerated = generated !== undefined && generated !== false;

  let references: ReferenceIR | undefined;
  const rawRef = raw['references'] as { entity: string; field: string } | undefined;
  if (rawRef) {
    const refEntity = entities[rawRef.entity] as RawSpec | undefined;
    const refTable = refEntity?.['table'] as string | undefined;
    references = {
      entityName: rawRef.entity,
      fieldName: rawRef.field,
      tableName: refTable ?? pluralize(toSnakeCase(rawRef.entity)),
    };
  }

  return {
    name: fieldName,
    nameSnake: toSnakeCase(fieldName),
    nameCamel: toCamelCase(fieldName),
    namePascal: toPascalCase(fieldName),
    type,
    primary: isPrimary,
    generated: generated ?? false,
    required: isPrimary || isGenerated ? false : required,
    unique: (raw['unique'] as boolean | undefined) ?? false,
    nullable: !required && !isPrimary && !isGenerated,
    minLength: raw['minLength'] as number | undefined,
    maxLength: raw['maxLength'] as number | undefined,
    precision: raw['precision'] as number | undefined,
    scale: raw['scale'] as number | undefined,
    default: raw['default'],
    enumValues: raw['values'] as string[] | undefined,
    references,
    drizzleColumn: toDrizzleColumn(raw, fieldName),
  };
}

const HTTP_METHODS: Record<CrudOperation, string> = {
  create: 'POST',
  get: 'GET',
  list: 'GET',
  update: 'PATCH',
  delete: 'DELETE',
};

/**
 * @author arefin
 * @description Normalize a single CRUD operation from raw spec format to the intermediate representation with defaults
 */
function normalizeOperation(
  operation: CrudOperation,
  raw: RawSpec,
  entityName: string,
  apiPrefix: string,
  domain: string,
  eventVersion: number,
  fields: FieldIR[],
  entities: RawSpec
): OperationIR {
  const method = (raw['method'] as string | undefined) ?? HTTP_METHODS[operation];
  const defaultPath = buildDefaultPath(operation, entityName, apiPrefix);
  const path = (raw['path'] as string | undefined) ?? defaultPath.relative;
  const fullPath = apiPrefix + path;

  const auth = (raw['auth'] as boolean | undefined) ?? false;
  const permissions = (raw['permissions'] as string[] | undefined) ?? [];
  const delivery = (raw['delivery'] as 'best-effort' | 'transactional-outbox' | undefined) ?? 'best-effort';

  const selectFieldNames = raw['select'] as string[] | undefined;
  const selectFields = selectFieldNames
    ? fields.filter((f) => selectFieldNames.includes(f.name))
    : fields.filter((f) => !f.nullable || f.primary);

  const rawLifecycle = raw['lifecycle'] as { pre?: string[]; process?: string[]; post?: string[] } | undefined;
  const lifecycle = {
    pre: rawLifecycle?.pre ?? getDefaultPreHooks(operation, auth),
    process: rawLifecycle?.process ?? [`${operation}${toPascalCase(entityName)}`],
    post: rawLifecycle?.post ?? getDefaultPostHooks(operation, entityName),
  };

  const domainEventName = toDomainEventName(domain, entityName, operation, eventVersion);
  const lifecycleEventNames = {
    pre: toLifecycleEventName(domain, entityName, operation, 'pre', eventVersion),
    process: toLifecycleEventName(domain, entityName, operation, 'process', eventVersion),
    post: toLifecycleEventName(domain, entityName, operation, 'post', eventVersion),
  };

  const config = buildOperationConfig(operation, raw);

  const budget = computeBudget(operation, auth, config, raw);

  return {
    operation,
    method,
    path,
    fullPath,
    auth,
    permissions,
    selectFields,
    lifecycle,
    domainEventName,
    lifecycleEventNames,
    budget,
    delivery,
    config,
  };
}

/**
 * @author arefin
 * @description Build the default API route path for a given entity and operation
 */
function buildDefaultPath(
  operation: CrudOperation,
  entityName: string,
  apiPrefix: string
): { relative: string; full: string } {
  const pluralKebab = pluralize(toKebabCase(entityName));
  const relative = operation === 'create' || operation === 'list' ? `/${pluralKebab}` : `/${pluralKebab}/:id`;
  return { relative, full: apiPrefix + relative };
}

/**
 * @author arefin
 * @description Get the default pre-lifecycle hooks for a given operation type
 */
function getDefaultPreHooks(operation: CrudOperation, auth: boolean): string[] {
  const hooks: string[] = [];
  if (auth) {
    hooks.push('authenticate', 'authorize');
  }
  if (operation === 'create' || operation === 'update') {
    hooks.push('validateInput');
  }
  return hooks;
}

/**
 * @author arefin
 * @description Get the default post-lifecycle hooks for a given operation type
 */
function getDefaultPostHooks(operation: CrudOperation, entityName: string): string[] {
  if (operation === 'get' || operation === 'list') return [];
  return [`publish${toPascalCase(entityName)}${toPascalCase(operation)}d`, 'queueAuditEvent'];
}

/**
 * @author arefin
 * @description Build the complete operation configuration with defaults, hooks, and path settings
 */
function buildOperationConfig(operation: CrudOperation, raw: RawSpec): OperationIR['config'] {
  switch (operation) {
    case 'create':
      return {
        kind: 'create',
        idempotency: (raw['idempotency'] as boolean | undefined) ?? false,
      } satisfies CreateOpConfig;

    case 'get': {
      const rawCache = raw['cache'] as { mode: string; maxAge: number } | undefined;
      return {
        kind: 'get',
        cache: rawCache ? { mode: rawCache.mode as 'http' | 'kv', maxAge: rawCache.maxAge } : null,
      } satisfies GetOpConfig;
    }

    case 'list': {
      const rawPag = raw['pagination'] as { type?: string; defaultLimit?: number; maximumLimit?: number } | undefined;
      return {
        kind: 'list',
        pagination: {
          type: (rawPag?.type as 'cursor' | 'offset' | undefined) ?? 'cursor',
          defaultLimit: rawPag?.defaultLimit ?? 20,
          maximumLimit: rawPag?.maximumLimit ?? 100,
        },
        filterFields: (raw['filter'] as string[] | undefined) ?? [],
        sortFields: (raw['sort'] as string[] | undefined) ?? [],
      } satisfies ListOpConfig;
    }

    case 'update': {
      const rawConc = raw['concurrency'] as { mode?: string } | undefined;
      return {
        kind: 'update',
        concurrency: {
          mode: (rawConc?.mode as 'updatedAt' | 'version' | 'none' | undefined) ?? 'updatedAt',
        },
      } satisfies UpdateOpConfig;
    }

    case 'delete':
      return {
        kind: 'delete',
        mode: (raw['mode'] as 'soft' | 'hard' | undefined) ?? 'soft',
      } satisfies DeleteOpConfig;
  }
}

/**
 * @author arefin
 * @description Normalize a single entity from raw spec format to the fully-resolved intermediate representation
 */
function normalizeEntity(
  entityName: string,
  raw: RawSpec,
  apiPrefix: string,
  domain: string,
  eventVersion: number,
  allEntities: RawSpec
): EntityIR {
  const rawFields = raw['fields'] as Record<string, RawSpec>;
  const fields: FieldIR[] = Object.entries(rawFields).map(([fname, fraw]) =>
    normalizeField(fname, fraw, entityName, allEntities)
  );

  const primaryKey = fields.find((f) => f.primary);
  if (!primaryKey) {
    throw new Error(`Entity "${entityName}" has no primary key field`);
  }

  const rawIndexes = (raw['indexes'] as RawSpec[] | undefined) ?? [];
  const indexes: IndexIR[] = rawIndexes.map((idx) => ({
    name: idx['name'] as string,
    fields: idx['fields'] as string[],
    unique: (idx['unique'] as boolean | undefined) ?? false,
  }));

  const rawCrud = raw['crud'] as Record<string, RawSpec> | undefined;
  const operations: OperationIR[] = [];
  const crudOrder: CrudOperation[] = ['create', 'get', 'list', 'update', 'delete'];

  if (rawCrud) {
    for (const op of crudOrder) {
      const rawOp = rawCrud[op] as RawSpec | undefined;
      if (rawOp && rawOp['enabled'] !== false) {
        operations.push(
          normalizeOperation(op, rawOp, entityName, apiPrefix, domain, eventVersion, fields, allEntities)
        );
      }
    }
  }

  const hasSoftDelete = operations.some((op) => op.operation === 'delete' && (op.config as DeleteOpConfig).mode === 'soft');
  const hasOptimisticConcurrency = operations.some(
    (op) => op.operation === 'update' && (op.config as UpdateOpConfig).concurrency.mode !== 'none'
  );
  const hasTransactionalOutbox = operations.some((op) => op.delivery === 'transactional-outbox');

  return {
    name: entityName,
    nameKebab: toKebabCase(entityName),
    namePascal: toPascalCase(entityName),
    nameCamel: toCamelCase(entityName),
    namePluralKebab: pluralize(toKebabCase(entityName)),
    table: raw['table'] as string,
    fields,
    primaryKey,
    indexes,
    operations,
    hasSoftDelete,
    hasOptimisticConcurrency,
    hasTransactionalOutbox,
  };
}

/**
 * @author arefin
 * @description Normalize raw specification input into a fully-resolved application intermediate representation
 */
export function normalizeSpecification(raw: RawSpec): ApplicationIR {
  const app = raw['application'] as RawSpec;
  const db = raw['database'] as RawSpec;
  const auth = raw['authentication'] as RawSpec | undefined;
  const events = raw['events'] as RawSpec | undefined;
  const rawEntities = (raw['entities'] as Record<string, RawSpec> | undefined) ?? {};
  const storage = raw['storage'] as RawSpec | undefined;
  const email = raw['email'] as RawSpec | undefined;
  const webhooks = (raw['webhooks'] as Record<string, RawSpec> | undefined) ?? {};
  const scheduled = (raw['scheduled'] as Record<string, RawSpec> | undefined) ?? {};
  const obs = (raw['observability'] as RawSpec | undefined) ?? {};
  const budgetsRaw = (raw['budgets'] as RawSpec | undefined) ?? {};

  const application: ApplicationMetaIR = {
    name: app['name'] as string,
    domain: app['domain'] as string,
    apiPrefix: app['apiPrefix'] as string,
    runtime: 'cloudflare-workers',
    framework: 'hono',
    language: 'typescript',
    nameKebab: toKebabCase(app['name'] as string),
    namePascal: toPascalCase(app['name'] as string),
    nameCamel: toCamelCase(app['name'] as string),
  };

  const database: DatabaseIR = {
    provider: db['provider'] as 'cockroachdb' | 'postgresql',
    connection: 'hyperdrive',
    orm: 'drizzle',
    binding: db['binding'] as string,
    migrations: (db['migrations'] as boolean | undefined) ?? true,
  };

  const authentication: AuthenticationIR | null = auth
    ? {
        provider: 'better-auth',
        session: {
          primaryStore: 'cockroachdb',
          cache: 'workers-kv',
          kvBinding: auth['session']?.['kvBinding'] as string,
          writePolicy: 'auth-events-only',
        },
      }
    : null;

  const eventsConfig = events ?? {};
  const eventsIR: EventsIR = {
    version: (eventsConfig['version'] as number | undefined) ?? 1,
    defaultPostMode: (eventsConfig['defaultPostMode'] as 'queue' | 'immediate' | 'both' | undefined) ?? 'queue',
    queueBinding: (eventsConfig['queueBinding'] as string | undefined) ?? 'DOMAIN_EVENTS',
    deadLetterQueueBinding: (eventsConfig['deadLetterQueueBinding'] as string | undefined) ?? 'DOMAIN_EVENTS_DLQ',
    includeCorrelationId: (eventsConfig['includeCorrelationId'] as boolean | undefined) ?? true,
    includeActor: (eventsConfig['includeActor'] as boolean | undefined) ?? true,
  };

  const depNodes = extractEntityDependencies(rawEntities);
  const sortedEntityNames = topologicalSort(depNodes);

  const entities: EntityIR[] = sortedEntityNames.map((name) =>
    normalizeEntity(name, rawEntities[name]!, application.apiPrefix, application.domain, eventsIR.version, rawEntities)
  );

  const storageIR: StorageIR | null = storage
    ? {
        provider: 'backblaze-b2',
        uploadMode: 'presigned-url',
        publicBaseUrl: storage['publicBaseUrl'] as string,
        maximumUploadBytes: (storage['maximumUploadBytes'] as number | undefined) ?? 10485760,
        allowedMimeTypes: (storage['allowedMimeTypes'] as string[] | undefined) ?? ['image/jpeg', 'image/png'],
        binding: (storage['binding'] as string | undefined) ?? 'MEDIA_BUCKET',
      }
    : null;

  const emailIR: EmailIR | null = email
    ? { provider: 'resend', execution: 'queue-only' }
    : null;

  const webhookIRs: WebhookIR[] = Object.entries(webhooks).map(([name, wh]) => ({
    name,
    namePascal: toPascalCase(name),
    path: wh['path'] as string,
    signatureType: wh['signature']['type'] as 'stripe' | 'github' | 'shopify' | 'hmac',
    secretBinding: wh['signature']['secretBinding'] as string,
    queueBinding: wh['queue'] as string,
    responseStatus: (wh['responseStatus'] as number | undefined) ?? 202,
  }));

  const scheduledIRs: ScheduledJobIR[] = Object.entries(scheduled).map(([name, job]) => ({
    name,
    nameKebab: toKebabCase(name),
    namePascal: toPascalCase(name),
    cron: job['cron'] as string,
    description: (job['description'] as string | undefined) ?? '',
  }));

  const observability: ObservabilityIR = {
    correlationHeader: (obs['correlationHeader'] as string | undefined) ?? 'x-correlation-id',
    structuredLogs: (obs['structuredLogs'] as boolean | undefined) ?? true,
    provider: (obs['provider'] as 'new-relic' | 'datadog' | 'none' | undefined) ?? 'none',
    transport: (obs['transport'] as 'cloudflare-logpush' | 'console' | undefined) ?? 'console',
    profile: (obs['profile'] as 'free' | 'paid-logpush' | undefined) ?? 'free',
  };

  const budgetReq = (budgetsRaw['request'] as RawSpec | undefined) ?? {};
  const budgets: BudgetPolicyIR = {
    request: {
      maximumDatabaseQueries: (budgetReq['maximumDatabaseQueries'] as number | undefined) ?? 3,
      maximumKvReads: (budgetReq['maximumKvReads'] as number | undefined) ?? 2,
      maximumKvWrites: (budgetReq['maximumKvWrites'] as number | undefined) ?? 0,
      maximumQueueWrites: (budgetReq['maximumQueueWrites'] as number | undefined) ?? 2,
      maximumB2Operations: (budgetReq['maximumB2Operations'] as number | undefined) ?? 1,
    },
  };

  return {
    specVersion: raw['specVersion'] as string,
    application,
    database,
    authentication,
    events: eventsIR,
    entities,
    storage: storageIR,
    email: emailIR,
    webhooks: webhookIRs,
    scheduled: scheduledIRs,
    observability,
    budgets,
  };
}
