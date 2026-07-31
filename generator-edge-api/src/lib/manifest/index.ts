import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const GENERATOR_VERSION = '1.0.0';

export interface ManifestEntry {
  file: string;
  owner: 'generated' | 'scaffolded' | 'managed';
  hash: string;
  generatedAt: string;
}

export interface Manifest {
  generatorVersion: string;
  specificationHash: string;
  generatedAt: string;
  files: ManifestEntry[];
}

/**
 * @author arefin
 * @description Compute a content hash of the specification file for change detection
 */
export function hashSpecification(specPath: string): string {
  const content = readFileSync(specPath, 'utf-8');
  return 'sha256:' + createHash('sha256').update(content).digest('hex');
}

/**
 * @author arefin
 * @description Compute a SHA-256 hash of a string content for integrity verification
 */
export function hashContent(content: string): string {
  return 'sha256:' + createHash('sha256').update(content).digest('hex');
}

/**
 * @author arefin
 * @description Build the generation manifest with file entries, hashes, and metadata
 */
export function buildManifest(specPath: string, entries: ManifestEntry[]): Manifest {
  return {
    generatorVersion: GENERATOR_VERSION,
    specificationHash: hashSpecification(specPath),
    generatedAt: new Date().toISOString(),
    files: entries,
  };
}

/**
 * @author arefin
 * @description Generate the file header comment block for generated source files
 */
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

/**
 * @author arefin
 * @description Generate the file header comment block for scaffolded (user-editable) source files
 */
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
