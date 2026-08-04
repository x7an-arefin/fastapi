import { toCamelCase, toDomainEventName, toKebabCase, toLifecycleEventName, toPascalCase, toSnakeCase, pluralize, } from '../naming/index.js';
import { extractEntityDependencies, topologicalSort } from '../dependency-graph/index.js';
import { computeBudget } from '../resource-budget/index.js';
/**
 * @author arefin
 * @description Convert a normalized field definition to a Drizzle ORM column type with appropriate constraints
 */
function toDrizzleColumn(field, fieldName) {
    const type = field['type'];
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
                return `timestamp("${snakeName}", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())`;
            }
            return `timestamp("${snakeName}", { withTimezone: true })`;
        case 'enum': {
            const values = field['values'].map((v) => `"${v}"`).join(', ');
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
function normalizeField(fieldName, raw, entityName, entities) {
    const type = raw['type'];
    const generated = raw['generated'];
    const required = raw['required'] ?? false;
    const isPrimary = raw['primary'] ?? false;
    const isGenerated = generated !== undefined && generated !== false;
    let references;
    const rawRef = raw['references'];
    if (rawRef) {
        const refEntity = entities[rawRef.entity];
        const refTable = refEntity?.['table'];
        references = {
            entityName: rawRef.entity,
            fieldName: rawRef.field,
            tableName: refTable ?? pluralize(toSnakeCase(rawRef.entity)),
            onDelete: rawRef.onDelete ?? 'no-action',
            onUpdate: rawRef.onUpdate ?? 'no-action',
            relation: rawRef.relation ?? 'many-to-one',
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
        unique: raw['unique'] ?? false,
        nullable: !required && !isPrimary && !isGenerated,
        minLength: raw['minLength'],
        maxLength: raw['maxLength'],
        precision: raw['precision'],
        scale: raw['scale'],
        default: raw['default'],
        enumValues: raw['values'],
        references,
        drizzleColumn: toDrizzleColumn(raw, fieldName),
    };
}
const HTTP_METHODS = {
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
function normalizeOperation(operation, raw, entityName, apiPrefix, domain, eventVersion, fields, entities) {
    const method = raw['method'] ?? HTTP_METHODS[operation];
    const defaultPath = buildDefaultPath(operation, entityName, apiPrefix);
    const path = raw['path'] ?? defaultPath.relative;
    const fullPath = apiPrefix + path;
    const auth = raw['auth'] ?? false;
    const permissions = raw['permissions'] ?? [];
    const delivery = raw['delivery'] ?? 'best-effort';
    const selectFieldNames = raw['select'];
    const selectFields = selectFieldNames
        ? fields.filter((f) => selectFieldNames.includes(f.name))
        : fields.filter((f) => !f.nullable || f.primary);
    const rawLifecycle = raw['lifecycle'];
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
function buildDefaultPath(operation, entityName, apiPrefix) {
    const pluralKebab = pluralize(toKebabCase(entityName));
    const relative = operation === 'create' || operation === 'list' ? `/${pluralKebab}` : `/${pluralKebab}/:id`;
    return { relative, full: apiPrefix + relative };
}
/**
 * @author arefin
 * @description Get the default pre-lifecycle hooks for a given operation type
 */
function getDefaultPreHooks(operation, auth) {
    const hooks = [];
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
function getDefaultPostHooks(operation, entityName) {
    if (operation === 'get' || operation === 'list')
        return [];
    return [`publish${toPascalCase(entityName)}${toPascalCase(operation)}d`, 'queueAuditEvent'];
}
/**
 * @author arefin
 * @description Build the complete operation configuration with defaults, hooks, and path settings
 */
function buildOperationConfig(operation, raw) {
    switch (operation) {
        case 'create':
            return {
                kind: 'create',
                idempotency: raw['idempotency'] ?? false,
            };
        case 'get': {
            const rawCache = raw['cache'];
            return {
                kind: 'get',
                cache: rawCache ? { mode: rawCache.mode, maxAge: rawCache.maxAge } : null,
            };
        }
        case 'list': {
            const rawPag = raw['pagination'];
            return {
                kind: 'list',
                pagination: {
                    type: rawPag?.type ?? 'cursor',
                    defaultLimit: rawPag?.defaultLimit ?? 20,
                    maximumLimit: rawPag?.maximumLimit ?? 100,
                },
                filterFields: raw['filter'] ?? [],
                sortFields: raw['sort'] ?? [],
            };
        }
        case 'update': {
            const rawConc = raw['concurrency'];
            return {
                kind: 'update',
                concurrency: {
                    mode: rawConc?.mode ?? 'updatedAt',
                },
            };
        }
        case 'delete':
            return {
                kind: 'delete',
                mode: raw['mode'] ?? 'soft',
            };
    }
}
/**
 * @author arefin
 * @description Normalize a single entity from raw spec format to the fully-resolved intermediate representation
 */
function normalizeEntity(entityName, raw, apiPrefix, domain, eventVersion, allEntities) {
    const rawFields = raw['fields'];
    const fields = Object.entries(rawFields).map(([fname, fraw]) => normalizeField(fname, fraw, entityName, allEntities));
    // Auto-inject audit timestamp fields
    const createdAtField = normalizeField('createdAt', { type: 'timestamp', generated: 'createdAt' }, entityName, allEntities);
    const updatedAtField = normalizeField('updatedAt', { type: 'timestamp', generated: 'updatedAt' }, entityName, allEntities);
    fields.push(createdAtField, updatedAtField);
    // Compute hasSoftDelete early to decide if we inject deletedAt
    const rawCrudForCheck = raw['crud'];
    const rawDeleteOp = rawCrudForCheck?.['delete'];
    const softDelete = rawDeleteOp && rawDeleteOp['enabled'] !== false && (rawDeleteOp['mode'] ?? 'soft') === 'soft';
    if (softDelete) {
        const deletedAtField = normalizeField('deletedAt', { type: 'timestamp' }, entityName, allEntities);
        fields.push(deletedAtField);
    }
    const primaryKey = fields.find((f) => f.primary);
    if (!primaryKey) {
        throw new Error(`Entity "${entityName}" has no primary key field`);
    }
    const rawIndexes = raw['indexes'] ?? [];
    const indexes = rawIndexes.map((idx) => ({
        name: idx['name'],
        fields: idx['fields'],
        unique: idx['unique'] ?? false,
    }));
    const rawCrud = raw['crud'];
    const operations = [];
    const crudOrder = ['create', 'get', 'list', 'update', 'delete'];
    if (rawCrud) {
        for (const op of crudOrder) {
            const rawOp = rawCrud[op];
            if (rawOp && rawOp['enabled'] !== false) {
                operations.push(normalizeOperation(op, rawOp, entityName, apiPrefix, domain, eventVersion, fields, allEntities));
            }
        }
    }
    const hasSoftDelete = operations.some((op) => op.operation === 'delete' && op.config.mode === 'soft');
    const hasOptimisticConcurrency = operations.some((op) => op.operation === 'update' && op.config.concurrency.mode !== 'none');
    const hasTransactionalOutbox = operations.some((op) => op.delivery === 'transactional-outbox');
    return {
        name: entityName,
        nameKebab: toKebabCase(entityName),
        namePascal: toPascalCase(entityName),
        nameCamel: toCamelCase(entityName),
        namePluralKebab: pluralize(toKebabCase(entityName)),
        table: raw['table'],
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
export function normalizeSpecification(raw) {
    const app = raw['application'];
    const db = raw['database'];
    const auth = raw['authentication'];
    const events = raw['events'];
    const rawEntities = raw['entities'] ?? {};
    const storage = raw['storage'];
    const email = raw['email'];
    const webhooks = raw['webhooks'] ?? {};
    const scheduled = raw['scheduled'] ?? {};
    const obs = raw['observability'] ?? {};
    const budgetsRaw = raw['budgets'] ?? {};
    const application = {
        name: app['name'],
        domain: app['domain'],
        apiPrefix: app['apiPrefix'],
        runtime: 'cloudflare-workers',
        framework: 'hono',
        language: 'typescript',
        nameKebab: toKebabCase(app['name']),
        namePascal: toPascalCase(app['name']),
        nameCamel: toCamelCase(app['name']),
    };
    const database = {
        provider: db['provider'],
        connection: 'hyperdrive',
        orm: 'drizzle',
        binding: db['binding'],
        migrations: db['migrations'] ?? true,
    };
    const authentication = auth
        ? {
            provider: 'better-auth',
            session: {
                primaryStore: 'cockroachdb',
                cache: 'workers-kv',
                kvBinding: auth['session']?.['kvBinding'],
                writePolicy: 'auth-events-only',
            },
        }
        : null;
    const eventsConfig = events ?? {};
    const eventsIR = {
        version: eventsConfig['version'] ?? 1,
        defaultPostMode: eventsConfig['defaultPostMode'] ?? 'queue',
        queueBinding: eventsConfig['queueBinding'] ?? 'DOMAIN_EVENTS',
        deadLetterQueueBinding: eventsConfig['deadLetterQueueBinding'] ?? 'DOMAIN_EVENTS_DLQ',
        includeCorrelationId: eventsConfig['includeCorrelationId'] ?? true,
        includeActor: eventsConfig['includeActor'] ?? true,
    };
    const depNodes = extractEntityDependencies(rawEntities);
    const sortedEntityNames = topologicalSort(depNodes);
    const entities = sortedEntityNames.map((name) => normalizeEntity(name, rawEntities[name], application.apiPrefix, application.domain, eventsIR.version, rawEntities));
    const storageIR = storage
        ? {
            provider: 'backblaze-b2',
            uploadMode: 'presigned-url',
            publicBaseUrl: storage['publicBaseUrl'],
            maximumUploadBytes: storage['maximumUploadBytes'] ?? 10485760,
            allowedMimeTypes: storage['allowedMimeTypes'] ?? ['image/jpeg', 'image/png'],
            binding: storage['binding'] ?? 'MEDIA_BUCKET',
        }
        : null;
    const emailIR = email
        ? { provider: 'resend', execution: 'queue-only' }
        : null;
    const webhookIRs = Object.entries(webhooks).map(([name, wh]) => ({
        name,
        namePascal: toPascalCase(name),
        path: wh['path'],
        signatureType: wh['signature']['type'],
        secretBinding: wh['signature']['secretBinding'],
        queueBinding: wh['queue'],
        responseStatus: wh['responseStatus'] ?? 202,
    }));
    const scheduledIRs = Object.entries(scheduled).map(([name, job]) => ({
        name,
        nameKebab: toKebabCase(name),
        namePascal: toPascalCase(name),
        cron: job['cron'],
        description: job['description'] ?? '',
    }));
    const observability = {
        correlationHeader: obs['correlationHeader'] ?? 'x-correlation-id',
        structuredLogs: obs['structuredLogs'] ?? true,
        provider: obs['provider'] ?? 'none',
        transport: obs['transport'] ?? 'console',
        profile: obs['profile'] ?? 'free',
    };
    const budgetReq = budgetsRaw['request'] ?? {};
    const budgets = {
        request: {
            maximumDatabaseQueries: budgetReq['maximumDatabaseQueries'] ?? 3,
            maximumKvReads: budgetReq['maximumKvReads'] ?? 2,
            maximumKvWrites: budgetReq['maximumKvWrites'] ?? 0,
            maximumQueueWrites: budgetReq['maximumQueueWrites'] ?? 2,
            maximumB2Operations: budgetReq['maximumB2Operations'] ?? 1,
        },
    };
    const secRaw = raw['security'] ?? {};
    const corsRaw = secRaw['cors'] ?? {};
    const rlRaw = secRaw['rateLimit'] ?? {};
    const security = {
        defaultAuth: secRaw['defaultAuth'] ?? false,
        cors: {
            origins: corsRaw['origins'] ?? ['*'],
            methods: corsRaw['methods'] ?? ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
            credentials: corsRaw['credentials'] ?? false,
            maxAge: corsRaw['maxAge'] ?? 86400,
        },
        rateLimit: {
            enabled: rlRaw['enabled'] ?? true,
            windowMs: rlRaw['windowMs'] ?? 60000,
            maxRequests: rlRaw['maxRequests'] ?? 100,
            store: rlRaw['store'] ?? 'kv',
            kvBinding: rlRaw['kvBinding'] ?? 'RATE_LIMIT_KV',
        },
    };
    return {
        specVersion: raw['specVersion'],
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
        security,
    };
}
//# sourceMappingURL=index.js.map