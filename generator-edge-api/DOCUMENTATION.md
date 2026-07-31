# generator-edge-api — Complete Documentation & Usage Guide

> **Full-Feature, Event-Driven, Lifecycle-Aware Edge API Generator for Cloudflare Workers**

`generator-edge-api` is a domain-specific code generator built on Yeoman. It accepts a single declarative specification file (`application.json`) and generates a complete, edge-native TypeScript microservice architecture designed for Cloudflare Workers.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [File Ownership & Re-generation Model](#3-file-ownership--re-generation-model)
4. [The PRE → PROCESS → POST Lifecycle Engine](#4-the-pre--process--post-lifecycle-engine)
5. [Event-Driven Architecture & CloudEvents Envelope](#5-event-driven-architecture--cloudevents-envelope)
6. [Resource Budget Compiler](#6-resource-budget-compiler)
7. [Authentication & Session Cache Strategy](#7-authentication--session-cache-strategy)
8. [Specification Schema (`application.json`) Reference](#8-specification-schema-applicationjson-reference)
9. [Step-by-Step Step-by-Step Usage Guide](#9-step-by-step-usage-guide)
10. [CLI Command Reference](#10-cli-command-reference)
11. [Best Practices & Developer Guidelines](#11-best-practices--developer-guidelines)

---

## 1. Architecture Overview

The generator operates on a **Declarative Pipeline Model**:

```
application.json
    │
    ▼
JSON Schema Validation  (schemas/application.schema.json)
    │
    ▼
Semantic Validator      (cross-reference resolution, enum checks, naming validation)
    │
    ▼
Resource Budget Compiler (pre-generation static quota analysis)
    │
    ▼
Normalized IR           (ApplicationIR data model)
    │
    ▼
EJS Template Engine     (generates project scaffold, entity repositories, Hono routes)
    │
    ▼
Target Project Codebase
```

Templates **never** read raw `application.json`. They consume the compiled, type-safe `ApplicationIR`, guaranteeing consistent rendering and predictable output.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | **Cloudflare Workers** | Edge execution engine |
| Framework | **Hono 4.x** | Fast, lightweight HTTP routing |
| Database | **CockroachDB via Hyperdrive** | Authoritative relational database with global connection pooling |
| ORM | **Drizzle ORM** | Type-safe SQL query builder and schema management |
| Auth | **Better Auth + Workers KV** | Session management with positive KV caching |
| Event Queue | **Cloudflare Queues** | Asynchronous, durable event streaming & queue workers |
| Object Storage | **Backblaze B2** | S3-compatible media storage using presigned upload URLs |
| Email | **Resend** | Queue-isolated email dispatching |
| Validation | **Zod** | Runtime request/response payload validation |
| Testing | **Vitest** | Fast unit testing for lifecycle handlers |

---

## 3. File Ownership & Re-generation Model

The generator enforces a strict three-tier file ownership contract to prevent developer code from being lost when re-running the generator:

| Ownership Tier | File Pattern | Behavior on Re-run (`yo edge-api`) |
|---|---|---|
| **Generated** | `*.schema.ts`, `*.types.ts`, `*.repository.ts`, `*.events.ts`, `*.route.ts`, `*.input.ts`, `*.output.ts`, `bindings.ts`, `routes.ts`, `openapi.json` | **Always overwritten**. Never edit these manually. |
| **Scaffolded** | `*.pre.ts`, `*.process.ts`, `*.post.ts`, `*.test.ts`, `src/scheduled/*.ts` | **Created ONCE**. Never overwritten. This is where your custom business logic lives. |
| **Managed** | `package.json`, `wrangler.jsonc`, `drizzle.config.ts`, `src/app.ts` | **Created if missing**. Preserved if already present. |

---

## 4. The PRE → PROCESS → POST Lifecycle Engine

Every generated CRUD endpoint routes through a structured lifecycle pipeline:

```
Incoming HTTP Request
       │
       ▼
 ┌──────────┐
 │   PRE    │ ── Reject (Throw AppError) ──► HTTP Error Response (401/403/422)
 └────┬─────┘   (PROCESS & POST never run)
      │
      ▼
 ┌──────────┐
 │ PROCESS  │ ── Failure ──► HTTP Error Response (500/409)
 └────┬─────┘   (POST never runs)
      │
      ▼
 ┌──────────┐
 │   POST   │ ── Failure ──► Logged & Retried via Queue
 └────┬─────┘   (HTTP Response is already successful)
      │
      ▼
HTTP 200 / 201 / 204 Response
```

### Stage Responsibilities

#### `PRE` (`*.pre.ts`)
- **Authentication**: Validates session via KV session cache or CockroachDB fallback.
- **Authorization**: Checks roles and required permission strings (e.g., `["task:create"]`).
- **Validation**: Enforces business invariants and uniqueness rules before database access.
- **Idempotency**: Inspects request headers or idempotency keys.

#### `PROCESS` (`*.process.ts`)
- **Authoritative Database Operations**: Performs Drizzle ORM mutations/reads over Hyperdrive.
- **Short Transactions ONLY**: Keeps database locks minimal to prevent connection starvation.
- **Optimistic Concurrency**: Checks `updatedAt` timestamps for concurrent update safety.

#### `POST` (`*.post.ts`)
- **Domain Event Publishing**: Publishes structured events to Cloudflare Queues (`publishEvent()`).
- **Queue Jobs**: Dispatches background email jobs or search indexing.
- **Best-Effort Async**: Uses `ctx.waitUntil()` for disposable side-effects.

---

## 5. Event-Driven Architecture & CloudEvents Envelope

### Event Naming Standard

```
{domain}.{entity}.{operation}.{stage}.v{version}
```

- **Lifecycle Event**: `tasks.task.create.pre.v1`
- **Domain Fact Event** *(past tense)*: `tasks.task.created.v1`

### CloudEvents Envelope Structure

Every published event uses this envelope schema:

```json
{
  "specVersion": "1.0",
  "eventId": "c40b3dae-2587-42f8-b327-3364c37be0b1",
  "eventName": "tasks.task.created.v1",
  "occurredAt": "2026-07-31T22:00:00.000Z",
  "correlationId": "x-correlation-id-header-value",
  "actor": { "type": "user", "id": "usr_123" },
  "subject": { "type": "task", "id": "tsk_456" },
  "data": {
    "entityId": "tsk_456"
  },
  "metadata": {
    "source": "api",
    "schemaVersion": 1
  }
}
```

> ⚠️ **64 KB Payload Limit Policy**: Payloads are checked before sending (`assertPayloadSize()`). Events must contain entity IDs and reference metadata rather than full database dumps.

---

## 6. Resource Budget Compiler

During code generation, the resource budget compiler statically evaluates platform operations per endpoint:

```json
"budgets": {
  "request": {
    "maximumDatabaseQueries": 3,
    "maximumKvReads": 2,
    "maximumKvWrites": 0,
    "maximumQueueWrites": 2,
    "maximumB2Operations": 1
  }
}
```

If an endpoint exceeds budget limits, generation stops immediately with a report:

```
Generated Resource Budget Report
──────────────────────────────────────────────────────────────────────
Method   Endpoint                       DB   KV-R  KV-W  Queue  B2  
──────────────────────────────────────────────────────────────────────
POST     /api/v1/users                  1    1     0     1      0   
GET      /api/v1/users/:id              1    1     0     0      0   
POST     /api/v1/tasks                  2    1     0     1      0   
PATCH    /api/v1/tasks/:id              2    1     0     1      0   
DELETE   /api/v1/tasks/:id              2    1     0     1      0   
──────────────────────────────────────────────────────────────────────
✅ All endpoints within budget limits
```

---

## 7. Authentication & Session Cache Strategy

To stay within Cloudflare Workers Free Tier limits (100,000 KV reads/day vs 1,000 KV writes/day):

- **CockroachDB** is the authoritative session store.
- **Workers KV** acts as a **positive session cache** with a 5-minute TTL (`SESSION_TTL_SECONDS = 300`).
- KV writes happen **only on login/session creation**. Standard GET/POST API requests read from KV but never write to it.

---

## 8. Specification Schema (`application.json`) Reference

Below is a complete specification example:

```json
{
  "$schema": "./schemas/application.schema.json",
  "specVersion": "1.0",
  "application": {
    "name": "my-app",
    "domain": "my-domain",
    "apiPrefix": "/api/v1",
    "runtime": "cloudflare-workers",
    "framework": "hono",
    "language": "typescript"
  },
  "database": {
    "provider": "cockroachdb",
    "connection": "hyperdrive",
    "orm": "drizzle",
    "binding": "HYPERDRIVE",
    "migrations": true
  },
  "authentication": {
    "provider": "better-auth",
    "session": {
      "primaryStore": "cockroachdb",
      "cache": "workers-kv",
      "kvBinding": "AUTH_SESSION_KV"
    }
  },
  "events": {
    "version": 1,
    "queueBinding": "DOMAIN_EVENTS",
    "deadLetterQueueBinding": "DOMAIN_EVENTS_DLQ"
  },
  "entities": {
    "task": {
      "table": "tasks",
      "fields": {
        "id": { "type": "uuid", "primary": true, "generated": true },
        "title": { "type": "string", "required": true, "maxLength": 200 },
        "status": { "type": "enum", "values": ["todo", "completed"], "default": "todo" },
        "createdAt": { "type": "timestamp", "generated": "createdAt" }
      },
      "crud": {
        "create": { "enabled": true, "method": "POST", "path": "/tasks", "auth": true },
        "get": { "enabled": true, "method": "GET", "path": "/tasks/:id", "auth": false },
        "list": { "enabled": true, "method": "GET", "path": "/tasks", "auth": false },
        "delete": { "enabled": true, "method": "DELETE", "path": "/tasks/:id", "auth": true, "mode": "soft" }
      }
    }
  }
}
```

---

## 9. Step-by-Step Usage Guide

### Prerequisites
- **Node.js**: `v24.12.0` or higher
- **npm**: `v11.6.2` or higher
- **Wrangler**: `v4.115.0` or higher

### Step 1: Install the Generator
```bash
cd generator-edge-api
npm install
npm run build
```

### Step 2: Validate Your Specification
Before generating code, validate your `application.json`:
```bash
node dist/cli.js validate --spec path/to/application.json
```

### Step 3: Run Dry-Run Preview
See what files will be created without modifying the filesystem:
```bash
node dist/cli.js plan --spec path/to/application.json
```

### Step 4: Generate the Microservice
Generate the complete API into your target project directory:
```bash
cd my-target-project
node /path/to/generator-edge-api/dist/cli.js generate --spec application.json --force
```

### Step 5: Install Project Dependencies
```bash
npm install
```

### Step 6: Configure Environment Bindings
Update `wrangler.jsonc` with your Cloudflare resource IDs:
- Replace `YOUR_HYPERDRIVE_ID` with your Cloudflare Hyperdrive connection ID.
- Replace `YOUR_KV_NAMESPACE_ID` with your Cloudflare KV namespace ID.

### Step 7: Run Type Check & Unit Tests
```bash
# Verify TypeScript compilation across all generated files
npx -p typescript tsc --noEmit

# Run unit test suite
npm test
```

---

## 10. CLI Command Reference

| Command | Option | Description |
|---|---|---|
| `node dist/cli.js validate` | `--spec <file>` | Validates structural JSON Schema and semantic rules. |
| `node dist/cli.js plan` | `--spec <file>` | Performs dry-run file generation preview and budget check. |
| `node dist/cli.js generate` | `--spec <file> [--force]` | Generates full project source code. `--force` overwrites without prompts. |

---

## 11. Best Practices & Developer Guidelines

1. **Write Business Logic in `*.pre.ts`, `*.process.ts`, and `*.post.ts`**:
   - `pre.ts`: Perform validation, check custom user permissions, inspect headers.
   - `process.ts`: Perform custom Drizzle queries and DB updates.
   - `post.ts`: Send queue messages or publish audit events.
2. **Never Edit Generated Files**:
   - `schema.ts`, `repository.ts`, `routes.ts`, `bindings.ts`, and `openapi.json` will be replaced on generator re-runs.
3. **Keep Database Queries Short**:
   - Hyperdrive pools database connections at the edge. Avoid long-running transactions inside `process.ts`.
4. **Queue Payload Safety**:
   - Keep event data lightweight (`{ entityId, status }`). Never send large blobs in `publishEvent()`.
