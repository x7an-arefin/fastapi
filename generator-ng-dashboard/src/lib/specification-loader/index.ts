import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export function loadFrontendSpec(specPath: string): { raw: Record<string, unknown>; errors: string[] } {
  let raw: Record<string, unknown>;
  try {
    const content = fs.readFileSync(specPath, 'utf8');
    raw = JSON.parse(content);
  } catch (err: any) {
    return { raw: {}, errors: [`Failed to load frontend spec: ${err.message}`] };
  }

  const ajv = new Ajv.default({ allErrors: true });
  addFormats.default(ajv);
  
  let schemaContent: string;
  try {
    const schemaPath = path.resolve(process.cwd(), 'schemas', 'frontend.schema.json');
    schemaContent = fs.readFileSync(schemaPath, 'utf8');
  } catch (err: any) {
    try {
        const schemaPath = path.resolve(new URL('.', import.meta.url).pathname, '../../../schemas/frontend.schema.json');
        schemaContent = fs.readFileSync(schemaPath, 'utf8');
    } catch (err2: any) {
        return { raw, errors: [`Failed to load frontend schema: ${err2.message}`] };
    }
  }

  const schema = JSON.parse(schemaContent);
  const validate = ajv.compile(schema);
  const valid = validate(raw);

  const errors = valid ? [] : (validate.errors?.map((e) => `${e.instancePath} ${e.message}`) || []);
  return { raw, errors };
}

export function loadOpenApiSpec(specPath: string): { raw: Record<string, unknown>; errors: string[] } {
  try {
    const content = fs.readFileSync(specPath, 'utf8');
    const raw = JSON.parse(content);
    return { raw, errors: [] };
  } catch (err: any) {
    return { raw: {}, errors: [`Failed to load OpenAPI spec: ${err.message}`] };
  }
}
