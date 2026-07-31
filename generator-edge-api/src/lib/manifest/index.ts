/**
 * Manifest — tracks generated files, generator version, and spec hash.
 * Written to the generated project root as manifest.json.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const GENERATOR_VERSION = '1.0.0';

export interface ManifestEntry {
  file: string;
  owner: 'generated' | 'scaffolded' | 'managed';
  /** SHA-256 hash of the file content at generation time */
  hash: string;
  generatedAt: string;
}

export interface Manifest {
  generatorVersion: string;
  specificationHash: string;
  generatedAt: string;
  files: ManifestEntry[];
}

export function hashSpecification(specPath: string): string {
  const content = readFileSync(specPath, 'utf-8');
  return 'sha256:' + createHash('sha256').update(content).digest('hex');
}

export function hashContent(content: string): string {
  return 'sha256:' + createHash('sha256').update(content).digest('hex');
}

export function buildManifest(specPath: string, entries: ManifestEntry[]): Manifest {
  return {
    generatorVersion: GENERATOR_VERSION,
    specificationHash: hashSpecification(specPath),
    generatedAt: new Date().toISOString(),
    files: entries,
  };
}

export function generatedFileHeader(entityName: string, operation: string): string {
  return [
    '// ╔══════════════════════════════════════════════════════════════════════╗',
    '// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║',
    '// ║  Source: application.json                                           ║',
    `// ║  Entity: ${entityName.padEnd(58)} ║`,
    `// ║  Operation: ${operation.padEnd(55)} ║`,
    `// ║  Generator version: ${GENERATOR_VERSION.padEnd(47)} ║`,
    '// ╚══════════════════════════════════════════════════════════════════════╝',
    '',
  ].join('\n');
}

export function scaffoldedFileHeader(): string {
  return [
    '// ╔══════════════════════════════════════════════════════════════════════╗',
    '// ║  SCAFFOLDED FILE — This file was created by the generator once.     ║',
    '// ║  It will NOT be overwritten on subsequent generator runs.           ║',
    '// ║  Edit freely — this is your business logic.                         ║',
    '// ╚══════════════════════════════════════════════════════════════════════╝',
    '',
  ].join('\n');
}
