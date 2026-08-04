/**
 * @author arefin
 * @description Convert a string to kebab-case format
 */
export declare function toKebabCase(input: string): string;
/**
 * @author arefin
 * @description Convert a string to snake_case format
 */
export declare function toSnakeCase(input: string): string;
/**
 * @author arefin
 * @description Convert a string to PascalCase format
 */
export declare function toPascalCase(input: string): string;
/**
 * @author arefin
 * @description Convert a string to camelCase format
 */
export declare function toCamelCase(input: string): string;
/**
 * @author arefin
 * @description Convert a string to SCREAMING_SNAKE_CASE format
 */
export declare function toScreamingSnakeCase(input: string): string;
/**
 * @author arefin
 * @description Return the plural form of an English word
 */
export declare function pluralize(word: string): string;
/**
 * @author arefin
 * @description Return the singular form of an English word
 */
export declare function singularize(word: string): string;
/**
 * @author arefin
 * @description Generate the lifecycle event name for a given entity and operation
 */
export declare function toLifecycleEventName(domain: string, entity: string, operation: CrudOperation, stage: LifecycleStage, version?: number): string;
/**
 * @author arefin
 * @description Generate the domain event name for a given entity and past-tense operation
 */
export declare function toDomainEventName(domain: string, entity: string, operation: CrudOperation, version?: number): string;
/**
 * @author arefin
 * @description Convert a CRUD operation verb to its past tense form
 */
export declare function toPastTense(operation: CrudOperation): string;
/**
 * @author arefin
 * @description Generate the filename for a lifecycle endpoint file
 */
export declare function toEndpointFilename(operation: CrudOperation, entityName: string, suffix: string): string;
/**
 * @author arefin
 * @description Generate the module directory path for a given entity
 */
export declare function toModulePath(entityName: string): string;
/**
 * @author arefin
 * @description Generate the file path for a specific entity operation
 */
export declare function toOperationPath(entityName: string, operation: CrudOperation): string;
/**
 * @author arefin
 * @description Generate the TypeScript type name for an entity
 */
export declare function toEntityTypeName(entityName: string): string;
/**
 * @author arefin
 * @description Generate the TypeScript input DTO type name for an entity operation
 */
export declare function toInputTypeName(operation: CrudOperation, entityName: string): string;
/**
 * @author arefin
 * @description Generate the TypeScript output DTO type name for an entity operation
 */
export declare function toOutputTypeName(operation: CrudOperation, entityName: string): string;
/**
 * @author arefin
 * @description Generate the TypeScript repository interface type name for an entity
 */
export declare function toRepositoryTypeName(entityName: string): string;
export type CrudOperation = 'create' | 'get' | 'list' | 'update' | 'delete';
export type LifecycleStage = 'pre' | 'process' | 'post';
