export interface DependencyNode {
    name: string;
    dependsOn: string[];
}
export declare class CircularDependencyError extends Error {
    /**
     * @author arefin
     * @description Initialize the class instance with required dependencies and configuration
     */
    constructor(cycle: string[]);
}
/**
 * @author arefin
 * @description Perform a topological sort on dependency nodes to determine correct generation order
 */
export declare function topologicalSort(nodes: DependencyNode[]): string[];
/**
 * @author arefin
 * @description Extract dependency relationships between entities from the specification
 */
export declare function extractEntityDependencies(entities: Record<string, any>): DependencyNode[];
