export interface LoadResult {
    raw: Record<string, unknown>;
    errors: string[];
}
/**
 * @author arefin
 * @description Load and parse the application specification from disk into the intermediate representation
 */
export declare function loadSpecification(specPath: string): LoadResult;
