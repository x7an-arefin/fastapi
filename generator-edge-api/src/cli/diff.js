import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { normalizeSpecification } from '../lib/normalizer/index.js';
import { loadSpecification } from '../lib/specification-loader/index.js';
/**
 * @author arefin
 * @description Inspector utility to perform deep field-level diff between two specification files
 */
export async function diffSpecs(specPathA, specPathB) {
    const fileA = path.resolve(specPathA);
    const fileB = path.resolve(specPathB);
    if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
        throw new Error(`One or both specification files do not exist: ${fileA}, ${fileB}`);
    }
    const { raw: rawA, errors: errA } = loadSpecification(fileA);
    const { raw: rawB, errors: errB } = loadSpecification(fileB);
    if (errA.length > 0)
        throw new Error(`Spec A validation errors: ${errA.join(', ')}`);
    if (errB.length > 0)
        throw new Error(`Spec B validation errors: ${errB.join(', ')}`);
    const irA = normalizeSpecification(rawA);
    const irB = normalizeSpecification(rawB);
    console.log(chalk.blue('\n🔍 Specification Diff Report'));
    console.log(chalk.gray(`  ${fileA}\n  ➔ ${fileB}\n`));
    const entityNamesA = new Set(irA.entities.map((e) => e.name));
    const entityNamesB = new Set(irB.entities.map((e) => e.name));
    const added = irB.entities.filter((e) => !entityNamesA.has(e.name));
    const removed = irA.entities.filter((e) => !entityNamesB.has(e.name));
    const common = irB.entities.filter((e) => entityNamesA.has(e.name));
    let hasChanges = false;
    if (added.length > 0 || removed.length > 0 || common.length > 0) {
        console.log(chalk.bold('Entities:'));
    }
    for (const entity of added) {
        hasChanges = true;
        console.log(chalk.green(`  + ${entity.name} (NEW — ${entity.fields.length} fields, ${entity.operations.length} operations)`));
    }
    for (const entity of removed) {
        hasChanges = true;
        console.log(chalk.red(`  - ${entity.name} (REMOVED)`));
    }
    for (const entityB of common) {
        const entityA = irA.entities.find((e) => e.name === entityB.name);
        const entityChanges = diffEntity(entityA, entityB);
        if (entityChanges.length > 0) {
            hasChanges = true;
            console.log(chalk.yellow(`  ~ ${entityB.name} (MODIFIED)`));
            for (const change of entityChanges) {
                console.log(`    ${change}`);
            }
        }
    }
    // Budget diff
    const totalOpsA = irA.entities.reduce((n, e) => n + e.operations.length, 0);
    const totalOpsB = irB.entities.reduce((n, e) => n + e.operations.length, 0);
    const dbQueriesA = irA.entities.flatMap((e) => e.operations).reduce((n, op) => n + op.budget.dbQueries, 0);
    const dbQueriesB = irB.entities.flatMap((e) => e.operations).reduce((n, op) => n + op.budget.dbQueries, 0);
    const queueWritesA = irA.entities.flatMap((e) => e.operations).reduce((n, op) => n + op.budget.queueWrites, 0);
    const queueWritesB = irB.entities.flatMap((e) => e.operations).reduce((n, op) => n + op.budget.queueWrites, 0);
    console.log(chalk.bold('\nBudget Impact:'));
    console.log(`  Operations: ${totalOpsA} ➔ ${totalOpsB} (${fmt(totalOpsB - totalOpsA)})`);
    console.log(`  DB Queries (total): ${dbQueriesA} ➔ ${dbQueriesB} (${fmt(dbQueriesB - dbQueriesA)})`);
    console.log(`  Queue Writes (total): ${queueWritesA} ➔ ${queueWritesB} (${fmt(queueWritesB - queueWritesA)})`);
    if (!hasChanges) {
        console.log(chalk.green('\n✅ No entity changes detected between specifications.\n'));
    }
    else {
        console.log(chalk.yellow('\n⚠️  Changes detected — run generate to apply.\n'));
    }
}
/**
 * @author arefin
 * @description Compare two entity IRs and return a list of human-readable change descriptions
 */
function diffEntity(a, b) {
    const changes = [];
    const fieldsA = new Map(a.fields.map((f) => [f.name, f]));
    const fieldsB = new Map(b.fields.map((f) => [f.name, f]));
    const addedFields = b.fields.filter((f) => !fieldsA.has(f.name));
    const removedFields = a.fields.filter((f) => !fieldsB.has(f.name));
    if (addedFields.length > 0 || removedFields.length > 0) {
        changes.push(chalk.bold('Fields:'));
    }
    for (const f of addedFields) {
        changes.push(chalk.green(`      + ${f.name}: ${f.type}`));
    }
    for (const f of removedFields) {
        changes.push(chalk.red(`      - ${f.name}: ${f.type}`));
    }
    for (const [name, fb] of fieldsB) {
        const fa = fieldsA.get(name);
        if (fa) {
            const fieldChanges = diffField(fa, fb);
            if (fieldChanges.length > 0) {
                changes.push(chalk.yellow(`      ~ ${name}:`));
                changes.push(...fieldChanges.map((c) => `        ${c}`));
            }
        }
    }
    const opsA = new Map(a.operations.map((op) => [op.operation, op]));
    const opsB = new Map(b.operations.map((op) => [op.operation, op]));
    const addedOps = b.operations.filter((op) => !opsA.has(op.operation));
    const removedOps = a.operations.filter((op) => !opsB.has(op.operation));
    if (addedOps.length > 0 || removedOps.length > 0) {
        changes.push(chalk.bold('    Operations:'));
    }
    for (const op of addedOps) {
        changes.push(chalk.green(`      + ${op.method} ${op.path} (NEW)`));
    }
    for (const op of removedOps) {
        changes.push(chalk.red(`      - ${op.method} ${op.path} (REMOVED)`));
    }
    return changes;
}
/**
 * @author arefin
 * @description Compare two field IRs and return descriptions of changed properties
 */
function diffField(a, b) {
    const changes = [];
    if (a.type !== b.type)
        changes.push(chalk.yellow(`type: ${a.type} ➔ ${b.type}`));
    if (a.required !== b.required)
        changes.push(chalk.yellow(`required: ${a.required} ➔ ${b.required}`));
    if (a.unique !== b.unique)
        changes.push(chalk.yellow(`unique: ${a.unique} ➔ ${b.unique}`));
    if (String(a.default) !== String(b.default))
        changes.push(chalk.yellow(`default: '${a.default}' ➔ '${b.default}'`));
    return changes;
}
/**
 * @author arefin
 * @description Format a numeric diff value with a + or - prefix for display
 */
function fmt(n) {
    if (n > 0)
        return chalk.red(`+${n}`);
    if (n < 0)
        return chalk.green(`${n}`);
    return chalk.gray('0');
}
//# sourceMappingURL=diff.js.map