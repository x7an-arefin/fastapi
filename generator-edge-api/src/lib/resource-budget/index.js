/**
 * @author arefin
 * @description Compute resource usage budget for a single entity based on its fields and operations
 */
export function computeBudget(operation, auth, config, rawOp) {
    let dbQueries = 0;
    let kvReads = 0;
    let kvWrites = 0;
    let queueWrites = 0;
    let b2Operations = 0;
    if (auth) {
        kvReads += 1;
    }
    switch (operation) {
        case 'create':
            dbQueries += 1;
            if (config['idempotency'])
                dbQueries += 1;
            queueWrites += 1;
            break;
        case 'get':
            dbQueries += 1;
            break;
        case 'list':
            dbQueries += 1;
            break;
        case 'update':
            dbQueries += 1;
            dbQueries += 1;
            queueWrites += 1;
            break;
        case 'delete':
            dbQueries += 1;
            dbQueries += 1;
            queueWrites += 1;
            break;
    }
    return { dbQueries, kvReads, kvWrites, queueWrites, b2Operations };
}
/**
 * @author arefin
 * @description Validate all entity resource budgets against defined limits and constraints
 */
export function validateBudgets(ir) {
    const violations = [];
    const rows = [];
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
/**
 * @author arefin
 * @description Format the budget validation report into a human-readable summary string
 */
function formatBudgetReport(rows, violations) {
    /**
     * @author arefin
     * @description Generate a formatted table column string with padding for budget report display
     */
    const col = (s, width) => s.padEnd(width).slice(0, width);
    const lines = [
        '',
        'Generated Resource Budget Report',
        '─'.repeat(70),
        `${col('Method', 8)} ${col('Endpoint', 30)} ${col('DB', 4)} ${col('KV-R', 5)} ${col('KV-W', 5)} ${col('Queue', 6)} ${col('B2', 4)}`,
        '─'.repeat(70),
    ];
    for (const row of rows) {
        lines.push(`${col(row.method, 8)} ${col(row.endpoint, 30)} ${col(String(row.dbQueries), 4)} ${col(String(row.kvReads), 5)} ${col(String(row.kvWrites), 5)} ${col(String(row.queueWrites), 6)} ${col(String(row.b2Operations), 4)}`);
    }
    lines.push('─'.repeat(70));
    if (violations.length > 0) {
        lines.push('');
        lines.push('⛔ Budget violations:');
        for (const v of violations) {
            lines.push(`  ${v.path}  →  ${v.resource}: ${v.actual} (max ${v.maximum})`);
        }
    }
    else {
        lines.push('✅ All endpoints within budget limits');
    }
    lines.push('');
    return lines.join('\n');
}
//# sourceMappingURL=index.js.map