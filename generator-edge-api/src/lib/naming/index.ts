/**
 * @author arefin
 * @description Convert a string to kebab-case format
 */
export function toKebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * @author arefin
 * @description Convert a string to snake_case format
 */
export function toSnakeCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * @author arefin
 * @description Convert a string to PascalCase format
 */
export function toPascalCase(input: string): string {
  return input
    .replace(/[-_\s]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^(.)/, (_, char: string) => char.toUpperCase());
}

/**
 * @author arefin
 * @description Convert a string to camelCase format
 */
export function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * @author arefin
 * @description Convert a string to SCREAMING_SNAKE_CASE format
 */
export function toScreamingSnakeCase(input: string): string {
  return toSnakeCase(input).toUpperCase();
}

/**
 * @author arefin
 * @description Return the plural form of an English word
 */
export function pluralize(word: string): string {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  if (/(?:s|sh|ch|x|z)$/i.test(word)) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * @author arefin
 * @description Return the singular form of an English word
 */
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

/**
 * @author arefin
 * @description Generate the lifecycle event name for a given entity and operation
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
 * @author arefin
 * @description Generate the domain event name for a given entity and past-tense operation
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

/**
 * @author arefin
 * @description Convert a CRUD operation verb to its past tense form
 */
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

/**
 * @author arefin
 * @description Generate the filename for a lifecycle endpoint file
 */
export function toEndpointFilename(operation: CrudOperation, entityName: string, suffix: string): string {
  return `${operation}-${toKebabCase(entityName)}.${suffix}.ts`;
}

/**
 * @author arefin
 * @description Generate the module directory path for a given entity
 */
export function toModulePath(entityName: string): string {
  return `src/modules/${toKebabCase(entityName)}`;
}

/**
 * @author arefin
 * @description Generate the file path for a specific entity operation
 */
export function toOperationPath(entityName: string, operation: CrudOperation): string {
  return `${toModulePath(entityName)}/${operation}`;
}

/**
 * @author arefin
 * @description Generate the TypeScript type name for an entity
 */
export function toEntityTypeName(entityName: string): string {
  return `${toPascalCase(entityName)}Entity`;
}

/**
 * @author arefin
 * @description Generate the TypeScript input DTO type name for an entity operation
 */
export function toInputTypeName(operation: CrudOperation, entityName: string): string {
  return `${toPascalCase(operation)}${toPascalCase(entityName)}Input`;
}

/**
 * @author arefin
 * @description Generate the TypeScript output DTO type name for an entity operation
 */
export function toOutputTypeName(operation: CrudOperation, entityName: string): string {
  return `${toPascalCase(operation)}${toPascalCase(entityName)}Output`;
}

/**
 * @author arefin
 * @description Generate the TypeScript repository interface type name for an entity
 */
export function toRepositoryTypeName(entityName: string): string {
  return `${toPascalCase(entityName)}Repository`;
}

export type CrudOperation = 'create' | 'get' | 'list' | 'update' | 'delete';
export type LifecycleStage = 'pre' | 'process' | 'post';
