export declare const GENERATOR_VERSION = "1.0.0";
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
export declare function hashSpecification(specPath: string): string;
/**
 * @author arefin
 * @description Compute a SHA-256 hash of a string content for integrity verification
 */
export declare function hashContent(content: string): string;
/**
 * @author arefin
 * @description Build the generation manifest with file entries, hashes, and metadata
 */
export declare function buildManifest(specPath: string, entries: ManifestEntry[]): Manifest;
/**
 * @author arefin
 * @description Generate the file header comment block for generated source files
 */
export declare function generatedFileHeader(entityName: string, operation: string): string;
/**
 * @author arefin
 * @description Generate the file header comment block for scaffolded (user-editable) source files
 */
export declare function scaffoldedFileHeader(): string;
