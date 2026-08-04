export class CircularDependencyError extends Error {
    /**
     * @author arefin
     * @description Initialize the class instance with required dependencies and configuration
     */
    constructor(cycle) {
        super(`Circular dependency detected: ${cycle.join(' → ')}`);
        this.name = 'CircularDependencyError';
    }
}
/**
 * @author arefin
 * @description Perform a topological sort on dependency nodes to determine correct generation order
 */
export function topologicalSort(nodes) {
    const nodeMap = new Map();
    for (const node of nodes) {
        nodeMap.set(node.name, node);
    }
    const visited = new Set();
    const inProgress = new Set();
    const result = [];
    /**
     * @author arefin
     * @description Recursively visit a dependency node during topological sort — detects cycles
     */
    function visit(name, path) {
        if (visited.has(name))
            return;
        if (inProgress.has(name)) {
            const cycleStart = path.indexOf(name);
            throw new CircularDependencyError([...path.slice(cycleStart), name]);
        }
        inProgress.add(name);
        const node = nodeMap.get(name);
        if (node) {
            for (const dep of node.dependsOn) {
                visit(dep, [...path, name]);
            }
        }
        inProgress.delete(name);
        visited.add(name);
        result.push(name);
    }
    for (const node of nodes) {
        visit(node.name, []);
    }
    return result;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * @author arefin
 * @description Extract dependency relationships between entities from the specification
 */
export function extractEntityDependencies(entities) {
    return Object.entries(entities).map(([entityName, entity]) => {
        const dependencies = new Set();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fields = entity['fields'];
        if (fields) {
            for (const field of Object.values(fields)) {
                const ref = field['references'];
                if (ref && ref.entity !== entityName) {
                    dependencies.add(ref.entity);
                }
            }
        }
        return { name: entityName, dependsOn: Array.from(dependencies) };
    });
}
//# sourceMappingURL=index.js.map