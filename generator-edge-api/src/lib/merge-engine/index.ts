/**
 * Merge Engine — structured merging for managed files (wrangler.jsonc, package.json).
 * Uses deep-merge strategies; never does raw string replacement.
 */

// ── Deep merge ────────────────────────────────────────────────────────────────

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

/**
 * Deep merge two objects. The patch takes priority.
 * Arrays are merged by concatenating unique primitive values.
 */
export function deepMerge(base: JsonObject, patch: JsonObject): JsonObject {
  const result: JsonObject = { ...base };

  for (const [key, patchValue] of Object.entries(patch)) {
    const baseValue = result[key];

    if (isObject(patchValue) && isObject(baseValue)) {
      result[key] = deepMerge(baseValue, patchValue);
    } else if (Array.isArray(patchValue) && Array.isArray(baseValue)) {
      result[key] = mergeArrays(baseValue, patchValue);
    } else {
      result[key] = patchValue;
    }
  }

  return result;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeArrays(base: JsonArray, patch: JsonArray): JsonArray {
  const result = [...base];
  for (const item of patch) {
    if (typeof item !== 'object' && !result.includes(item)) {
      result.push(item);
    } else if (typeof item === 'object') {
      // For objects in arrays, always add (can't safely dedupe by content)
      result.push(item);
    }
  }
  return result;
}

// ── package.json merging ──────────────────────────────────────────────────────

export interface PackageJsonDeps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

/**
 * Merge generated package.json additions into an existing one.
 * Existing scripts/deps from the developer are preserved.
 * Generator-added entries are added without overwriting manual ones.
 */
export function mergePackageJson(existing: JsonObject, generated: PackageJsonDeps): JsonObject {
  const result = { ...existing };

  if (generated.dependencies) {
    const existingDeps = (result['dependencies'] as Record<string, string> | undefined) ?? {};
    result['dependencies'] = {
      ...generated.dependencies,
      ...existingDeps, // developer-set versions win
    };
  }

  if (generated.devDependencies) {
    const existingDevDeps = (result['devDependencies'] as Record<string, string> | undefined) ?? {};
    result['devDependencies'] = {
      ...generated.devDependencies,
      ...existingDevDeps,
    };
  }

  if (generated.scripts) {
    const existingScripts = (result['scripts'] as Record<string, string> | undefined) ?? {};
    result['scripts'] = {
      ...generated.scripts,
      ...existingScripts,
    };
  }

  return result;
}

// ── wrangler.jsonc merging ────────────────────────────────────────────────────

export interface WranglerAdditions {
  kv_namespaces?: JsonObject[];
  queues?: { producers?: JsonObject[]; consumers?: JsonObject[] };
  d1_databases?: JsonObject[];
  hyperdrive?: JsonObject[];
  crons?: string[];
  vars?: Record<string, string>;
}

/**
 * Merge generated wrangler additions into existing wrangler.jsonc content.
 */
export function mergeWranglerConfig(existing: JsonObject, additions: WranglerAdditions): JsonObject {
  let result = { ...existing };

  if (additions.kv_namespaces?.length) {
    const existing_kv = (result['kv_namespaces'] as JsonObject[] | undefined) ?? [];
    const newBindings = additions.kv_namespaces.filter(
      (n) => !existing_kv.some((e) => e['binding'] === n['binding'])
    );
    result['kv_namespaces'] = [...existing_kv, ...newBindings];
  }

  if (additions.queues) {
    const existingQueues = (result['queues'] as JsonObject | undefined) ?? {};
    const existingProducers = (existingQueues['producers'] as JsonObject[] | undefined) ?? [];
    const existingConsumers = (existingQueues['consumers'] as JsonObject[] | undefined) ?? [];

    const newProducers = (additions.queues.producers ?? []).filter(
      (p) => !existingProducers.some((e) => e['binding'] === p['binding'])
    );
    const newConsumers = (additions.queues.consumers ?? []).filter(
      (c) => !existingConsumers.some((e) => e['queue_name'] === c['queue_name'])
    );

    result['queues'] = {
      ...existingQueues,
      producers: [...existingProducers, ...newProducers],
      consumers: [...existingConsumers, ...newConsumers],
    };
  }

  if (additions.hyperdrive?.length) {
    const existing_hd = (result['hyperdrive'] as JsonObject[] | undefined) ?? [];
    const newHd = additions.hyperdrive.filter(
      (h) => !existing_hd.some((e) => e['binding'] === h['binding'])
    );
    result['hyperdrive'] = [...existing_hd, ...newHd];
  }

  if (additions.vars) {
    const existingVars = (result['vars'] as Record<string, string> | undefined) ?? {};
    result['vars'] = { ...existingVars, ...additions.vars };
  }

  return result;
}
