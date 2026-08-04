export interface SemanticError {
    path: string;
    message: string;
    severity: 'error' | 'warning';
}
type RawSpec = Record<string, any>;
/**
 * @author arefin
 * @description Validate semantic correctness of the raw specification — check for missing references and invalid configurations
 */
export declare function validateSemantics(raw: RawSpec): SemanticError[];
export {};
