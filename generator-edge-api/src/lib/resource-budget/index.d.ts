import type { CrudOperation } from '../naming/index.js';
import type { OperationBudgetIR, ApplicationIR } from '../ir/types.js';
type RawOpConfig = Record<string, any>;
/**
 * @author arefin
 * @description Compute resource usage budget for a single entity based on its fields and operations
 */
export declare function computeBudget(operation: CrudOperation, auth: boolean, config: RawOpConfig, rawOp: RawOpConfig): OperationBudgetIR;
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
 * @author arefin
 * @description Validate all entity resource budgets against defined limits and constraints
 */
export declare function validateBudgets(ir: ApplicationIR): BudgetReport;
export {};
