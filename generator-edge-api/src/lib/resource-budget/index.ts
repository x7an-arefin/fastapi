/**
 * Resource Budget Compiler — static analysis of per-endpoint platform operation costs.
 * Generation FAILS if any endpoint exceeds the declared budget policy.
 */
import type { CrudOperation } from '../naming/index.js';
import type { OperationBudgetIR, OperationIR, ApplicationIR } from '../ir/types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawOpConfig = Record<string, any>;

/**
 * Estimate platform operations for a single CRUD endpoint.
 */
export function computeBudget(
  operation: CrudOperation,
  auth: boolean,
  config: RawOpConfig,
  rawOp: RawOpConfig
): OperationBudgetIR {
  let dbQueries = 0;
  let kvReads = 0;
  let kvWrites = 0;
  let queueWrites = 0;
  let b2Operations = 0;

  // Session check: always 1 KV read if auth is required
  if (auth) {
    kvReads += 1;
  }

  switch (operation) {
    case 'create':
      dbQueries += 1; // INSERT
      if (config['idempotency']) dbQueries += 1; // idempotency record check
      queueWrites += 1; // domain event to queue
      break;

    case 'get':
      dbQueries += 1; // SELECT by ID
      break;

    case 'list':
      dbQueries += 1; // SELECT with filters/pagination
      break;

    case 'update':
      dbQueries += 1; // SELECT for optimistic lock check
      dbQueries += 1; // UPDATE
      queueWrites += 1; // domain event
      break;

    case 'delete':
      dbQueries += 1; // SELECT (verify ownership)
      dbQueries += 1; // UPDATE (soft delete) or DELETE (hard delete)
      queueWrites += 1; // domain event
      break;
  }

  return { dbQueries, kvReads, kvWrites, queueWrites, b2Operations };
}

export interface BudgetViolation {
  entityName: string;
  operation: CrudOperation;
  path: string;
  resource: string;
  actual: number;
  maximum: number;
}

export interface BudgetReport {
  violations: BudgetViolation[];
  rows: BudgetRow[];
  summary: string;
}

export interface BudgetRow {
  endpoint: string;
  method: string;
  dbQueries: number;
  kvReads: number;
  kvWrites: number;
  queueWrites: number;
  b2Operations: number;
}

/**
 * Validate all operations against the declared budget policy.
 * Returns a report with any violations.
 */
export function validateBudgets(ir: ApplicationIR): BudgetReport {
  const violations: BudgetViolation[] = [];
  const rows: BudgetRow[] = [];
  const policy = ir.budgets.request;

  for (const entity of ir.entities) {
    for (const op of entity.operations) {
      const b = op.budget;

      rows.push({
        endpoint: op.fullPath,
        method: op.method,
        dbQueries: b.dbQueries,
        kvReads: b.kvReads,
        kvWrites: b.kvWrites,
        queueWrites: b.queueWrites,
        b2Operations: b.b2Operations,
      });

      if (b.dbQueries > policy.maximumDatabaseQueries) {
        violations.push({
          entityName: entity.name,
          operation: op.operation,
          path: op.fullPath,
          resource: 'dbQueries',
          actual: b.dbQueries,
          maximum: policy.maximumDatabaseQueries,
        });
      }
      if (b.kvReads > policy.maximumKvReads) {
        violations.push({
          entityName: entity.name,
          operation: op.operation,
          path: op.fullPath,
          resource: 'kvReads',
          actual: b.kvReads,
          maximum: policy.maximumKvReads,
        });
      }
      if (b.kvWrites > policy.maximumKvWrites) {
        violations.push({
          entityName: entity.name,
          operation: op.operation,
          path: op.fullPath,
          resource: 'kvWrites',
          actual: b.kvWrites,
          maximum: policy.maximumKvWrites,
        });
      }
      if (b.queueWrites > policy.maximumQueueWrites) {
        violations.push({
          entityName: entity.name,
          operation: op.operation,
          path: op.fullPath,
          resource: 'queueWrites',
          actual: b.queueWrites,
          maximum: policy.maximumQueueWrites,
        });
      }
    }
  }

  const summary = formatBudgetReport(rows, violations);
  return { violations, rows, summary };
}

function formatBudgetReport(rows: BudgetRow[], violations: BudgetViolation[]): string {
  const col = (s: string, width: number) => s.padEnd(width).slice(0, width);
  const lines: string[] = [
    '',
    'Generated Resource Budget Report',
    '─'.repeat(70),
    `${col('Method', 8)} ${col('Endpoint', 30)} ${col('DB', 4)} ${col('KV-R', 5)} ${col('KV-W', 5)} ${col('Queue', 6)} ${col('B2', 4)}`,
    '─'.repeat(70),
  ];

  for (const row of rows) {
    lines.push(
      `${col(row.method, 8)} ${col(row.endpoint, 30)} ${col(String(row.dbQueries), 4)} ${col(String(row.kvReads), 5)} ${col(String(row.kvWrites), 5)} ${col(String(row.queueWrites), 6)} ${col(String(row.b2Operations), 4)}`
    );
  }

  lines.push('─'.repeat(70));

  if (violations.length > 0) {
    lines.push('');
    lines.push('⛔ Budget violations:');
    for (const v of violations) {
      lines.push(
        `  ${v.path}  →  ${v.resource}: ${v.actual} (max ${v.maximum})`
      );
    }
  } else {
    lines.push('✅ All endpoints within budget limits');
  }

  lines.push('');
  return lines.join('\n');
}
