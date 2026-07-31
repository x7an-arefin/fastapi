import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = resolve(__dirname, '../../../schemas/application.schema.json');

export interface LoadResult {
  raw: Record<string, unknown>;
  errors: string[];
}

/**
 * @author arefin
 * @description Load and parse the application specification from disk into the intermediate representation
 */
export function loadSpecification(specPath: string): LoadResult {
  const absolutePath = resolve(process.cwd(), specPath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Specification file not found: ${absolutePath}`);
  }

  let raw: Record<string, unknown>;
  try {
    const content = readFileSync(absolutePath, 'utf-8');
    raw = JSON.parse(content) as Record<string, unknown>;
  } catch (err) {
    throw new Error(`Failed to parse ${absolutePath}: ${String(err)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AjvCtor = (Ajv as any).default || Ajv;
  const ajv = new AjvCtor({ allErrors: true, strict: false });
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as object;
  const validate = ajv.compile(schema);
  const valid = validate(raw);
  const errors: string[] = [];

  if (!valid && validate.errors) {
    for (const err of validate.errors) {
      const path = err.instancePath || '/';
      errors.push(`[${path}] ${err.message ?? 'unknown error'}`);
    }
  }

  return { raw, errors };
}
