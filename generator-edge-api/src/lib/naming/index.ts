/**
 * Naming utilities — ALL name transformations for generated code go through here.
 * No template or generator may do ad-hoc string manipulation.
 */

/** kebab-case: "myEntity" → "my-entity" */
export function toKebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/** snake_case: "myEntity" → "my_entity" */
export function toSnakeCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/** PascalCase: "my-entity" → "MyEntity" */
export function toPascalCase(input: string): string {
  return input
    .replace(/[-_\s]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^(.)/, (_, char: string) => char.toUpperCase());
}

/** camelCase: "my-entity" → "myEntity" */
export function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/** SCREAMING_SNAKE: "myEntity" → "MY_ENTITY" */
export function toScreamingSnakeCase(input: string): string {
  return toSnakeCase(input).toUpperCase();
}

/** pluralize — simple English pluralization */
export function pluralize(word: string): string {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  if (/(?:s|sh|ch|x|z)$/i.test(word)) {
    return word + 'es';
  }
  return word + 's';
}

/** singularize — simple English singularization */
export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('ses') || word.endsWith('shes') || word.endsWith('ches') || word.endsWith('xes') || word.endsWith('zes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

// ── Domain event names ────────────────────────────────────────────────────────

/**
 * Lifecycle hook event name: commerce.product.create.pre.v1
 */
export function toLifecycleEventName(
  domain: string,
  entity: string,
  operation: CrudOperation,
  stage: LifecycleStage,
  version: number = 1
): string {
  return `${domain}.${toKebabCase(entity)}.${operation}.${stage}.v${version}`;
}

/**
 * Domain fact event name (past tense): commerce.product.created.v1
 */
export function toDomainEventName(
  domain: string,
  entity: string,
  operation: CrudOperation,
  version: number = 1
): string {
  const pastTense = toPastTense(operation);
  return `${domain}.${toKebabCase(entity)}.${pastTense}.v${version}`;
}

/** Convert operation to past tense for domain facts */
export function toPastTense(operation: CrudOperation): string {
  const map: Record<CrudOperation, string> = {
    create: 'created',
    get: 'retrieved',
    list: 'listed',
    update: 'updated',
    delete: 'deleted',
  };
  return map[operation];
}

// ── File/directory names ──────────────────────────────────────────────────────

/** src/modules/product/create/create-product.route.ts */
export function toEndpointFilename(operation: CrudOperation, entityName: string, suffix: string): string {
  return `${operation}-${toKebabCase(entityName)}.${suffix}.ts`;
}

/** src/modules/product → module directory path segment */
export function toModulePath(entityName: string): string {
  return `src/modules/${toKebabCase(entityName)}`;
}

/** src/modules/product/create */
export function toOperationPath(entityName: string, operation: CrudOperation): string {
  return `${toModulePath(entityName)}/${operation}`;
}

// ── Type names ────────────────────────────────────────────────────────────────

/** ProductEntity */
export function toEntityTypeName(entityName: string): string {
  return `${toPascalCase(entityName)}Entity`;
}

/** CreateProductInput */
export function toInputTypeName(operation: CrudOperation, entityName: string): string {
  return `${toPascalCase(operation)}${toPascalCase(entityName)}Input`;
}

/** CreateProductOutput */
export function toOutputTypeName(operation: CrudOperation, entityName: string): string {
  return `${toPascalCase(operation)}${toPascalCase(entityName)}Output`;
}

/** ProductRepository */
export function toRepositoryTypeName(entityName: string): string {
  return `${toPascalCase(entityName)}Repository`;
}

// ── Types used in naming ──────────────────────────────────────────────────────

export type CrudOperation = 'create' | 'get' | 'list' | 'update' | 'delete';
export type LifecycleStage = 'pre' | 'process' | 'post';
