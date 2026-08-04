type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = {
    [key: string]: JsonValue;
};
type JsonArray = JsonValue[];
/**
 * @author arefin
 * @description Deep merge two JSON objects — patch values override base values recursively
 */
export declare function deepMerge(base: JsonObject, patch: JsonObject): JsonObject;
export interface PackageJsonDeps {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
}
/**
 * @author arefin
 * @description Merge generated dependency declarations into an existing package.json structure
 */
export declare function mergePackageJson(existing: JsonObject, generated: PackageJsonDeps): JsonObject;
export interface WranglerAdditions {
    kv_namespaces?: JsonObject[];
    queues?: {
        producers?: JsonObject[];
        consumers?: JsonObject[];
    };
    d1_databases?: JsonObject[];
    hyperdrive?: JsonObject[];
    crons?: string[];
    vars?: Record<string, string>;
}
/**
 * @author arefin
 * @description Merge generated Wrangler additions into an existing wrangler.toml configuration
 */
export declare function mergeWranglerConfig(existing: JsonObject, additions: WranglerAdditions): JsonObject;
export {};
