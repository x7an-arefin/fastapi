# EdgeAPI Generator — Complete Technical Documentation

> [!NOTE]
> This documentation covers the `generator-edge-api` tool, which is designed to convert a declarative JSON specification into a production-grade backend API running on Cloudflare Workers. 

## 1. Project Overview

The **EdgeAPI Generator** is a powerful scaffolding and boilerplate generation engine designed for high-performance, edge-deployed web applications. The core philosophy is **declarative specification to production code**: you define your data models, endpoints, and integrations in a single `application.json` file, and the generator produces a full, type-safe, production-ready TypeScript backend.

### Technology Stack
- **Runtime:** Cloudflare Workers (Edge runtime)
- **Framework:** Hono (HonestJS) - ultra-fast web framework
- **Database Layer:** Drizzle ORM paired with PostgreSQL or CockroachDB
- **Connection Pooling:** Hyperdrive (for edge-to-database connections)
- **Authentication:** Better-Auth with KV-based session caching
- **Language:** TypeScript (strict mode)

### Architecture Flow

```mermaid
flowchart LR
  A[application.json] --> B[Schema Validator]
  B --> C[Semantic Validator]
  C --> D[Normalizer → IR]
  D --> E[ProjectGenerator]
  D --> F[EntityGenerator]
  D --> G[EndpointGenerator]
  E --> H[src/core/**]
  F --> I[src/modules/{entity}/**]
  G --> J[src/modules/{entity}/{op}/**]
```

## 2. Quick Start

### Prerequisites
- Node.js (v18+)
- Cloudflare Wrangler CLI (`npm i -g wrangler`)
- A PostgreSQL or CockroachDB instance

### Installation & Usage

```bash
# Install the generator globally
npm install -g generator-edge-api

# Initialize a new application specification wizard
node dist/cli.js init application.json

# Validate the generated or hand-written specification
node dist/cli.js validate --spec application.json

# Generate the project codebase
node dist/cli.js generate --spec application.json

# Navigate to the generated app and install dependencies
cd my-app && npm install

# Run the local development server (Wrangler/Miniflare)
npm run dev
```

> [!TIP]
> Use `node dist/cli.js plan --spec application.json` to perform a dry run. It will output the planned file structure without writing anything to disk.

## 3. The Application Specification (application.json)

The `application.json` file is the heart of your project. It acts as the single source of truth for your API's architecture.

### 3.1 application

The `application` block configures the high-level metadata and runtime environment.

| Property | Type | Required | Description | Example |
|---|---|---|---|---|
| `name` | string | Yes | Project name (max 64 chars) | `"TaskMaster API"` |
| `domain` | string | Yes | The domain identifier | `"taskmaster-api"` |
| `apiPrefix` | string | Yes | Base path for all endpoints | `"/api/v1"` |
| `runtime` | string | Yes | The target runtime | `"cloudflare-workers"` |
| `framework` | string | Yes | The web framework | `"hono"` |
| `language` | string | Yes | Programming language | `"typescript"` |

```json
"application": {
  "name": "TaskMaster API",
  "domain": "taskmaster-api",
  "apiPrefix": "/api/v1",
  "runtime": "cloudflare-workers",
  "framework": "hono",
  "language": "typescript"
}
```

### 3.2 database

Defines your database provider and ORM configuration.

| Property | Type | Required | Description | Example |
|---|---|---|---|---|
| `provider` | string | Yes | DB engine (`postgresql`, `cockroachdb`) | `"postgresql"` |
| `connection` | string | Yes | Edge connection method | `"hyperdrive"` |
| `orm` | string | Yes | The ORM to use | `"drizzle"` |
| `binding` | string | Yes | Wrangler binding name | `"HYPERDRIVE"` |
| `migrations` | boolean | No | Whether to auto-run migrations | `true` |

```json
"database": {
  "provider": "postgresql",
  "connection": "hyperdrive",
  "binding": "HYPERDRIVE",
  "orm": "drizzle"
}
```

### 3.3 authentication

Configures Better-Auth and session management.

Session Flow: 
1. The client sends a Bearer token.
2. The edge worker checks the KV cache (default 5 min TTL).
3. On cache miss, it queries the Drizzle DB fallback.
4. If unauthorized, returns a 401.

> [!NOTE]
> `writePolicy: "auth-events-only"` means sessions are primarily written to the database asynchronously via events to reduce latency.

```json
"authentication": {
  "provider": "better-auth",
  "session": {
    "primaryStore": "cockroachdb",
    "cache": "workers-kv",
    "kvBinding": "AUTH_SESSION_KV",
    "writePolicy": "auth-events-only"
  }
}
```

### 3.4 security (New in latest version)

The new security block provides defence-in-depth features.

- `defaultAuth`: When true, every endpoint globally requires authentication unless explicitly decorated with `@Public()`.
- `cors`: Handles Cross-Origin Resource Sharing. Configures allowed origins, methods, credentials, and max-age preflight caching.
- `rateLimit`: A KV-backed sliding window rate limiter. Keys are formatted as `rl:{ip}:{floor(Date.now()/windowMs)}`. Exceeding limits returns a 429 Too Many Requests response with a `Retry-After` header.

Example:
```json
"security": {
  "defaultAuth": true,
  "cors": {
    "origins": ["https://myapp.com", "https://staging.myapp.com"],
    "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    "credentials": true,
    "maxAge": 86400
  },
  "rateLimit": {
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 100,
    "store": "kv",
    "kvBinding": "RATE_LIMIT_KV"
  }
}
```

### 3.5 entities (Most important section)

The `entities` object maps directly to database tables and RESTful endpoints.

**Field Types & Drizzle Output:**
- `uuid` → `.defaultRandom().primaryKey()`
- `string` → `varchar` (supports `maxLength`)
- `text` → `text`
- `integer`, `bigint`, `decimal`, `boolean` → standard Drizzle types
- `timestamp` → `timestamp`
- `enum` → native PG enums or constrained varchar
- `json` → `jsonb`

**Auto-injected fields:**
- `createdAt`: Injected automatically with `.defaultNow()`.
- `updatedAt`: Injected with `.$onUpdate(() => new Date())`.
- `deletedAt`: Injected automatically if the delete mode is `"soft"`.

**References & Foreign Keys:**
Use the `references` object to create relations. `onDelete` supports `cascade`, `set-null`, `restrict`, and `no-action`.

**CRUD Operations:**
Define which operations are available and their specific configurations:
- `create`: Can enforce `idempotency`.
- `get`: Configurable `cache` (HTTP or KV).
- `list`: Configurable `pagination` (`cursor` or `offset`), `filter` fields, and `sort` fields.
- `update`: Can enable optimistic `concurrency` (e.g., matching `updatedAt` or a `version` field).
- `delete`: Can be `soft` (updates `deletedAt`) or `hard` (removes record).

Full entity example:
```json
"entities": {
  "Product": {
    "table": "products",
    "fields": {
      "id": { "type": "uuid", "primary": true, "generated": true },
      "name": { "type": "string", "required": true, "maxLength": 255 },
      "price": { "type": "decimal", "precision": 10, "scale": 2, "required": true },
      "status": { "type": "enum", "values": ["active", "draft", "archived"], "default": "draft" },
      "userId": { "type": "uuid", "references": { "entity": "User", "field": "id", "onDelete": "cascade" } }
    },
    "indexes": [
      { "name": "idx_products_status", "fields": ["status"] }
    ],
    "crud": {
      "create": { "auth": true, "permissions": ["products:write"] },
      "get": { "auth": false, "cache": { "mode": "http", "maxAge": 300 } },
      "list": {
        "pagination": { "type": "cursor", "defaultLimit": 20, "maximumLimit": 100 },
        "filter": ["status"],
        "sort": ["createdAt"]
      },
      "update": { "auth": true, "concurrency": { "mode": "updatedAt" } },
      "delete": { "auth": true, "mode": "soft" }
    }
  }
}
```

### 3.6 events

Configure domain events emitted on operations.
- **Naming convention:** `{domain}.{entity}.{operation}d.v{version}` (e.g., `taskmaster-api.task.created.v1`).
- Supported queues: Primary Cloudflare Queue + Dead Letter Queue (DLQ).
- Includes optional metadata like `correlationId` and `actor`.

```json
"events": {
  "version": 1,
  "queueBinding": "DOMAIN_EVENTS",
  "deadLetterQueueBinding": "DOMAIN_EVENTS_DLQ",
  "includeCorrelationId": true
}
```

### 3.7 webhooks

Defines ingress webhooks, validating signatures and routing to queues.

```json
"webhooks": {
  "stripeEvents": {
    "path": "/webhooks/stripe",
    "signature": {
      "type": "stripe",
      "secretBinding": "STRIPE_WEBHOOK_SECRET"
    },
    "queue": "DOMAIN_EVENTS",
    "responseStatus": 200
  }
}
```

### 3.8 scheduled

Configure cron jobs mapped to Cloudflare Workers Scheduled Events. The handler files will be generated in `src/scheduled/`.

```json
"scheduled": {
  "cleanupExpiredTasks": {
    "cron": "0 2 * * *",
    "description": "Purge soft-deleted task records older than 30 days"
  }
}
```

### 3.9 storage, email, observability, budgets

- **storage:** B2 Cloud Storage configs (presigned-url mode).
- **email:** Resend configuration.
- **observability:** Datadog/NewRelic integrations, Logpush, and correlation IDs.
- **budgets:** Strict limits for an edge request (e.g., max 3 DB queries, 2 KV reads).

## 4. CLI Commands Reference

The CLI is invoked via `node dist/cli.js <command> [options]`.

1. `init [file]`
   Initializes an interactive wizard to scaffold an `application.json` spec.
   *Example:* `node dist/cli.js init my-app.json`
2. `diff <specA> [specB]`
   Compares two specifications for schema changes.
   *Example:* `node dist/cli.js diff v1.json v2.json`
3. `validate --spec <file>`
   Runs the Semantic Validator against your schema, catching broken references and type mismatches.
   *Example:* `node dist/cli.js validate --spec application.json`
4. `plan --spec <file>`
   Dry-runs the generation to show the file output tree without writing to disk.
5. `generate --spec <file>`
   Executes the full pipeline, writing the actual codebase to the output directory.

## 5. Generated Project Structure

```
my-app/
├── wrangler.toml         # Cloudflare Workers config
├── package.json
├── tsconfig.json
├── application.json      # The spec used for generation
├── src/
│   ├── index.ts          # Hono app entry point
│   ├── core/             # Framework plumbing
│   │   ├── db.ts         # Drizzle/Hyperdrive init
│   │   ├── auth.ts       # Session management
│   │   └── logger.ts     # Structured logging
│   ├── schema/           # Drizzle schema definitions
│   │   ├── index.ts
│   │   ├── users.ts
│   │   └── tasks.ts
│   ├── modules/          # Entity domain logic
│   │   ├── user/
│   │   │   ├── create.ts # Handler, validators, hooks
│   │   │   ├── get.ts
│   │   │   └── list.ts
│   │   └── task/
│   │       ├── create.ts
│   │       ├── update.ts
│   │       └── delete.ts
│   ├── scheduled/        # Cron handlers
│   │   └── cleanupExpiredTasks.ts
│   └── webhooks/         # Webhook ingress
│       └── stripeEvents.ts
└── migrations/           # Auto-generated SQL migrations
```

## 6. The Lifecycle System

The generator produces endpoints that follow a strict pipeline: `pre` → `process` → `post`.

- **pre:** Authorization, rate limiting, and request validation (Zod).
- **process:** The core business logic and database transactions.
- **post:** Emitting events, formatting responses, and cache invalidation.

Each stage receives a `LifecycleContext` containing: `req`, `env`, `correlationId`, `entity`, `operation`, `input`, and `session`.

**Example of a generated process hook:**
```typescript
export async function processHook(ctx: LifecycleContext<TaskCreateInput>) {
  const { db, input, session } = ctx;
  
  const result = await db.insert(tasks).values({
    id: crypto.randomUUID(),
    title: input.title,
    userId: session.user.id,
    createdAt: new Date()
  }).returning();
  
  return result[0];
}
```

## 7. Authentication & Authorization

EdgeAPI leverages Better-Auth combined with Cloudflare KV for sub-millisecond edge session reads.

**Sequence:**
1. Request arrives at `/api/v1/tasks`.
2. Middleware extracts the `Bearer` token.
3. Performs a `KV.get(sessionKey)`.
4. On hit: verifies expiration. 
5. On miss: Queries DB through Hyperdrive. If valid, populates KV in background (`ctx.waitUntil`).
6. Middleware evaluates Endpoint Permissions against `session.user.roles`.

Endpoints can be exempted using the `@Public()` decorator equivalent inside the Hono route setup if `auth: false` is defined in the spec.

## 8. Event System

The Event system allows true asynchronous decoupling.

```typescript
export interface EventEnvelope<T> {
  id: string;
  type: string;          // e.g., 'taskmaster-api.task.created.v1'
  source: string;
  time: string;
  data: T;
  correlationId?: string;
  actorId?: string;
}
```

Events are published to Cloudflare Queues. The `EVENT_HANDLERS` map routes queue batches to specific functions. If a message fails retries, it lands in the DLQ. Idempotency inside the queue consumer is handled via a `processedIds` KV Set.

## 9. Plugin Architecture

The generator supports plugins to alter ASTs before code emission.

- **OpenAPI Plugin:** Generates a `swagger.json` and a Scalar UI route.
- **Zod Plugin:** Overrides default schema generation with strict Zod types.
- **MockData Plugin:** Generates a seeder script based on field types.

Custom plugins implement the `IPlugin` interface, exposing hooks like `beforeGenerate(ir)` and `afterGenerate(files)`.

## 10. Security Architecture

EdgeAPI employs a Defence-in-Depth model:

```
Request → validateBindings → CORS → RateLimit → AuthGuard (@Public bypass) → UUID validation → Zod → Repository
```

1. **validateBindings:** Ensures env vars (KV, DB, Secrets) exist at runtime.
2. **CORS:** Blocks unauthorized browser origins.
3. **RateLimit:** Prevents brute-force and DDoS via KV token buckets.
4. **AuthGuard:** Verifies session identity.
5. **UUID Validation:** Ensures URL params are strictly UUIDs to prevent SQL injection edge cases.
6. **Zod:** Validates JSON body semantics.
7. **Repository:** Executes parameterized queries via Drizzle.

## 11. Database Layer

Drizzle ORM translates the JSON schema into highly optimized PostgreSQL/CockroachDB SQL.
- **Auto-timestamps:** Handled inherently by Drizzle's `.$onUpdateFn()`.
- **Pagination:** Cursor pagination uses keyset scrolling (e.g., `WHERE created_at < ? ORDER BY created_at DESC`).
- **Soft Delete:** A global middleware modifies all `.find()` queries to append `WHERE deleted_at IS NULL`.
- **Hyperdrive:** Edge connection pooling keeps Postgres connections alive to eliminate TLS handshake latency on warm starts.

## 12. Observability

EdgeAPI utilizes **Structured JSON Logging**.

```json
{
  "level": "info",
  "msg": "Task created successfully",
  "correlationId": "req-12345",
  "actor": "user-987",
  "latencyMs": 42
}
```

- **Health Checks:** A generated `/health` endpoint performs shallow checks, and `/health/deep` attempts a `SELECT 1` via Hyperdrive.
- **Metrics:** Optional `/metrics` endpoint exports Prometheus-compatible stats.

## 13. CI/CD Pipeline

The generator outputs a baseline GitHub Actions workflow:
1. **Lint & Test:** Runs TSC and unit tests.
2. **Migrations:** Runs `drizzle-kit push` against the production DB. (Runs *before* deploy to ensure schema matches the incoming code).
3. **Deploy:** Executes `wrangler deploy`.

## 14. SDK

A fully typed TypeScript client SDK is generated alongside the backend.

```typescript
import { EdgeApiClient } from './sdk';

const client = new EdgeApiClient({ baseUrl: 'https://api.myapp.com', token: '...' });
const tasks = await client.tasks.list({ filter: { status: 'pending' }, limit: 10 });
```

## 15. Advanced Examples

*Note: Due to length constraints, one deep example is highlighted.*

**Multi-Tenant SaaS Spec:**
```json
{
  "$schema": "https://edge-api.dev/schemas/application.schema.json",
  "specVersion": "1.0",
  "application": { ... },
  "database": { ... },
  "entities": {
    "Organization": {
      "table": "orgs",
      "fields": {
        "id": { "type": "uuid", "primary": true, "generated": true },
        "name": { "type": "string" }
      },
      "crud": { "get": {}, "create": {} }
    },
    "Project": {
      "table": "projects",
      "fields": {
        "id": { "type": "uuid", "primary": true, "generated": true },
        "orgId": { "type": "uuid", "references": { "entity": "Organization", "field": "id" } }
      }
    }
  }
}
```

## 16. Extending the Generator

To add custom capabilities:
1. **Schema Sections:** Modify `application.schema.json` to define the new block.
2. **Normalizer:** Update `src/lib/normalizer/index.ts` to map the raw JSON into the IR (`ApplicationIR`).
3. **Templates:** Add EJS templates to `src/generators/` mapping the IR to TypeScript files.
4. **Recompile:** Run `npm run build` to update the CLI.

## 17. Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `References unknown entity` | Typo in `references.entity` | Ensure the target entity exists and casing matches perfectly. |
| `Hyperdrive binding not found` | Wrangler config mismatch | Ensure `wrangler.toml` contains `[[hyperdrive]]` with the exact binding name from `database.binding`. |
| `Cannot read properties of undefined` | Malformed JSON specification | Run `node cli.js validate` to catch syntax and semantic errors. |
| `RateLimit KV not configured` | Rate limiting enabled without KV | Provide `kvBinding` in `security.rateLimit` and define it in Wrangler. |
| `Migrations failed to run` | Database unreachable | Ensure your DB is publicly accessible or Cloudflare Tunnels are configured. |

---
*Generated by Antigravity using generator-edge-api internal specifications.*
