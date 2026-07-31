/**
 * Dependency Graph — topological sort of entity dependencies.
 * Ensures entities with foreign keys are generated after their referenced entities.
 */

export interface DependencyNode {
  name: string;
  dependsOn: string[];
}

export class CircularDependencyError extends Error {
  constructor(cycle: string[]) {
    super(`Circular dependency detected: ${cycle.join(' → ')}`);
    this.name = 'CircularDependencyError';
  }
}

/**
 * Given a list of entity dependency nodes, return them in topological order.
 * Entities with no dependencies come first.
 */
export function topologicalSort(nodes: DependencyNode[]): string[] {
  const nodeMap = new Map<string, DependencyNode>();
  for (const node of nodes) {
    nodeMap.set(node.name, node);
  }

  const visited = new Set<string>();
  const inProgress = new Set<string>();
  const result: string[] = [];

  function visit(name: string, path: string[]): void {
    if (visited.has(name)) return;
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

/**
 * Extract dependency nodes from raw entity specification.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractEntityDependencies(entities: Record<string, any>): DependencyNode[] {
  return Object.entries(entities).map(([entityName, entity]) => {
    const dependencies = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = entity['fields'] as Record<string, any> | undefined;
    if (fields) {
      for (const field of Object.values(fields)) {
        const ref = field['references'] as { entity: string } | undefined;
        if (ref && ref.entity !== entityName) {
          dependencies.add(ref.entity);
        }
      }
    }
    return { name: entityName, dependsOn: Array.from(dependencies) };
  });
}
