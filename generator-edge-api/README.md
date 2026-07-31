# generator-edge-api

> **Full-Feature, Event-Driven, Lifecycle-Aware CRUD Generator for Cloudflare Workers**

Write a single `application.json` file. The generator builds a complete, production-ready API.

---

## What Gets Generated

For each entity + CRUD operation, you get **7 files**:

| File | Owner | Description |
|---|---|---|
| `*.route.ts` | Generator | Hono route handler — wires lifecycle runner |
| `*.input.ts` | Generator | Zod input validation schema |
| `*.output.ts` | Generator | Zod response schema |
| `*.pre.ts` | **Developer** | PRE: auth, authorization, validation hooks |
| `*.process.ts` | **Developer** | PROCESS: database operation via Drizzle |
| `*.post.ts` | **Developer** | POST: domain event publishing to Cloudflare Queue |
| `*.test.ts` | **Developer** | Vitest tests — scaffolded, never overwritten |

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | Hono 4.x |
| Database | CockroachDB via Hyperdrive |
| ORM | Drizzle ORM |
| Auth | Better Auth (via adapter/port pattern) |
| Queue | Cloudflare Queues |
| Storage | Backblaze B2 (presigned URL pattern) |
| Email | Resend (queue-only, never in HTTP handlers) |
| Validation | Zod |
| Testing | Vitest + @cloudflare/vitest-pool-workers |

---

## Quick Start

### 1. Install the generator

```bash
npm install -g yo generator-edge-api
```

### 2. Create your `application.json`

```bash
cp node_modules/generator-edge-api/application.json ./application.json
# Edit application.json to match your domain
```

### 3. Validate your specification

```bash
yo edge-api:validate --spec application.json
```

### 4. Preview what will be generated

```bash
yo edge-api:plan --spec application.json
```

### 5. Generate the project

```bash
mkdir my-api && cd my-api
yo edge-api --spec ../application.json
```

### 6. Install and run

```bash
npm install
# Edit wrangler.jsonc — fill in YOUR_HYPERDRIVE_ID, YOUR_KV_NAMESPACE_ID
wrangler dev
```

---

## CLI Commands

```bash
yo edge-api --spec application.json           # Full generation
yo edge-api:validate --spec application.json  # Validate spec only
yo edge-api:plan --spec application.json      # Dry-run: show files that would be created
yo edge-api:entity product                    # Generate/update a single entity
yo edge-api:openapi                           # Regenerate openapi.json only
```

---

## Lifecycle Model

Every endpoint has three lifecycle stages running in strict order:

```
HTTP Request
  → PRE     (authenticate → authorize → validate business rules)
      └─ rejection → standard error response (PROCESS never runs)
  → PROCESS (Drizzle mutation through Hyperdrive)
      └─ failure → error response (POST never runs)
  → POST    (publish domain event to Cloudflare Queue)
  → HTTP Response
```

### Event Naming Convention

```
{domain}.{entity}.{operation}.{stage}.v{version}

# Lifecycle hooks:
commerce.product.create.pre.v1
commerce.product.create.process.v1
commerce.product.create.post.v1

# Domain facts (past tense — emitted after successful PROCESS):
commerce.product.created.v1
commerce.product.updated.v1
commerce.product.deleted.v1
```

---

## Event Envelope

Every event published to Cloudflare Queues uses this standard envelope:

```json
{
  "specVersion": "1.0",
  "eventId": "uuid",
  "eventName": "commerce.product.created.v1",
  "occurredAt": "2026-07-31T14:30:00.000Z",
  "correlationId": "request-correlation-id",
  "actor": { "type": "user", "id": "user-id" },
  "subject": { "type": "product", "id": "product-id" },
  "data": { "entityId": "...", "changedFields": [...] },
  "metadata": { "source": "api", "schemaVersion": 1 }
}
```

Payload size is enforced at **< 64 KB** (platform max is 128 KB; we keep a safety margin).

---

## File Ownership Model

| Pattern | Owner | Behavior on Re-run |
|---|---|---|
| `*.generated.ts` | Generator | **Always overwritten** |
| `src/generated/**` | Generator | **Always overwritten** |
| `openapi.json` | Generator | **Always overwritten** |
| `*.pre.ts` | Developer | **Never overwritten** |
| `*.process.ts` | Developer | **Never overwritten** |
| `*.post.ts` | Developer | **Never overwritten** |
| `*.test.ts` | Developer | **Never overwritten** |
| `wrangler.jsonc` | Managed | Created once |
| `package.json` | Managed | Created once |
| `src/app.ts` | Managed | Created once |

---

## Resource Budget Enforcement

The generator statically analyzes each endpoint's platform operation count and fails if any endpoint exceeds your declared policy:

```json
"budgets": {
  "request": {
    "maximumDatabaseQueries": 3,
    "maximumKvReads": 2,
    "maximumKvWrites": 0,
    "maximumQueueWrites": 2
  }
}
```

Example budget report printed at generation time:

```
Generated Resource Budget Report
──────────────────────────────────────────────────────────────────────
Method   Endpoint                        DB   KV-R  KV-W  Queue  B2
──────────────────────────────────────────────────────────────────────
POST     /api/v1/products                2    1     0     1      0
GET      /api/v1/products/:id            1    0     0     0      0
GET      /api/v1/products                1    0     0     0      0
PATCH    /api/v1/products/:id            2    1     0     1      0
DELETE   /api/v1/products/:id            2    1     0     1      0
──────────────────────────────────────────────────────────────────────
✅ All endpoints within budget limits
```

---

## Session + KV Strategy

Follows the free-tier KV budget constraints:

| Action | KV Operation |
|---|---|
| API request (session check) | 1 KV **read** (from cache) |
| Login / renewal | 1 KV **write** (cache the session) |
| Logout | 1 KV **delete** |
| Standard GET | No KV write |

**CockroachDB is always authoritative.** KV is a positive session cache with a 5-minute TTL to limit revocation windows.

---

## Generated Project Structure

```
src/
├── index.ts                     ← Worker entry (fetch + queue + scheduled)
├── app.ts                       ← Hono app + global middleware
├── generated/
│   ├── bindings.ts              ← Typed Env interface
│   ├── routes.ts                ← Route registry (auto-updated)
│   └── resource-budget.ts       ← Budget analysis output
├── core/
│   ├── lifecycle/               ← PRE→PROCESS→POST runner
│   ├── events/                  ← Envelope + publisher
│   ├── auth/                    ← AuthPort + session cache
│   ├── errors/                  ← AppError hierarchy + handler
│   └── observability/           ← Structured logger + correlation
├── modules/
│   └── product/
│       ├── product.schema.ts
│       ├── product.types.ts
│       ├── product.repository.ts
│       ├── product.events.ts
│       ├── create/
│       │   ├── create-product.route.ts   ← generated
│       │   ├── create-product.input.ts   ← generated
│       │   ├── create-product.output.ts  ← generated
│       │   ├── create-product.pre.ts     ← YOUR CODE (never overwritten)
│       │   ├── create-product.process.ts ← YOUR CODE
│       │   ├── create-product.post.ts    ← YOUR CODE
│       │   └── create-product.test.ts    ← YOUR TESTS
│       ├── get/
│       ├── list/
│       ├── update/
│       └── delete/
├── consumers/
│   ├── domain-event.consumer.ts
│   ├── email.consumer.ts
│   └── dead-letter.consumer.ts
├── webhooks/
│   └── stripe/handler.ts
└── scheduled/
    └── cleanup-stale-sessions.ts
openapi.json                     ← generated
application.json                 ← YOUR SOURCE OF TRUTH
wrangler.jsonc
drizzle.config.ts
```

---

## application.json Reference

See [application.json](./application.json) for a complete working example with:
- `product` entity with all 5 CRUD operations
- Auth (Better Auth + KV session cache)
- Events (Cloudflare Queues)
- Storage (Backblaze B2)
- Email (Resend, queue-only)
- Webhooks (Stripe signature verification)
- Cron (daily session cleanup)
- Observability (structured logs, correlation IDs)
- Resource budget policy

---

## Free-Tier Resource Limits

| Resource | Free Limit |
|---|---|
| Cloudflare Workers CPU | 10ms/request |
| Cloudflare KV reads | 100,000/day |
| Cloudflare KV writes | 1,000/day |
| Cloudflare Queues | 100,000 ops/day |
| Hyperdrive DB queries | 100,000/day |
| CockroachDB storage | 5 GB |
| Backblaze B2 storage | 10 GB |
| Resend emails | 3,000/month |

The resource budget compiler enforces these limits statically at generation time.
