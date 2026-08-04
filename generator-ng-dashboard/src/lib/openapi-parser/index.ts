import type { ApiIR, ApiOperation, SchemaIR, ParamIR } from '../ir/types.js';
import { resolveRef } from '../ref-resolver/index.js';

/**
 * @author arefin
 * @description Parses an OpenAPI 3.x document into ApiIR
 */
export function parseOpenApi(doc: Record<string, unknown>): ApiIR {
  const operations: Record<string, ApiOperation> = {};
  const schemas: Record<string, SchemaIR> = {};
  const tagsSet = new Set<string>();

  // Extract component schemas
  const components = doc['components'];
  if (components && typeof components === 'object') {
    const comp = components as Record<string, unknown>;
    const rawSchemas = comp['schemas'];
    if (rawSchemas && typeof rawSchemas === 'object') {
      for (const [key, value] of Object.entries(rawSchemas as Record<string, unknown>)) {
        schemas[key] = value as unknown as SchemaIR;
      }
    }
  }

  // Extract paths
  const paths = doc['paths'];
  if (paths && typeof paths === 'object') {
    for (const [urlPath, pathItem] of Object.entries(paths as Record<string, unknown>)) {
      if (typeof pathItem !== 'object' || pathItem === null) continue;
      const pathObj = pathItem as Record<string, unknown>;

      for (const [method, operationRaw] of Object.entries(pathObj)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) continue;
        const op = operationRaw as Record<string, unknown>;

        const operationId = (op['operationId'] as string) || `${method}_${urlPath}`;
        const tags = op['tags'];
        const tag = Array.isArray(tags) && tags.length > 0 ? (tags[0] as string) : 'Unknown';
        tagsSet.add(tag);

        const pathParams: ParamIR[] = [];
        const queryParams: ParamIR[] = [];

        const parameters = op['parameters'];
        if (Array.isArray(parameters)) {
          for (const p of parameters) {
            const param = p as Record<string, unknown>;
            const paramSchema = param['schema'] as Record<string, unknown> | undefined;
            const paramIR: ParamIR = {
              name:        (param['name'] as string) || '',
              type:        (paramSchema?.['type'] as string) || 'string',
              required:    !!(param['required']),
              description: param['description'] as string | undefined,
            };
            if (param['in'] === 'path') {
              pathParams.push(paramIR);
            } else if (param['in'] === 'query') {
              queryParams.push(paramIR);
            }
          }
        }

        let successStatus = 200;
        let responseSchemaRef: string | undefined;
        let responseSchema: SchemaIR | undefined;

        const responses = op['responses'];
        if (responses && typeof responses === 'object') {
          const resp = responses as Record<string, unknown>;
          for (const statusCode of ['200', '201', '204']) {
            if (resp[statusCode]) {
              successStatus = parseInt(statusCode, 10);
              const respObj = resp[statusCode] as Record<string, unknown>;
              const content = (respObj['content'] as Record<string, unknown> | undefined);
              const jsonContent = content?.['application/json'] as Record<string, unknown> | undefined;
              const schema = jsonContent?.['schema'] as Record<string, unknown> | undefined;
              if (schema) {
                if (schema['$ref']) {
                  responseSchemaRef = schema['$ref'] as string;
                  try { responseSchema = resolveRef(responseSchemaRef, doc) as unknown as SchemaIR; } catch { /* ignore */ }
                } else {
                  responseSchema = schema as unknown as SchemaIR;
                }
              }
              break;
            }
          }
        }

        let requestBodySchemaRef: string | undefined;
        let requestBodySchema: SchemaIR | undefined;

        const requestBody = op['requestBody'];
        if (requestBody && typeof requestBody === 'object') {
          const rb = requestBody as Record<string, unknown>;
          const content = (rb['content'] as Record<string, unknown> | undefined);
          const jsonContent = content?.['application/json'] as Record<string, unknown> | undefined;
          const schema = jsonContent?.['schema'] as Record<string, unknown> | undefined;
          if (schema) {
            if (schema['$ref']) {
              requestBodySchemaRef = schema['$ref'] as string;
              try { requestBodySchema = resolveRef(requestBodySchemaRef, doc) as unknown as SchemaIR; } catch { /* ignore */ }
            } else {
              requestBodySchema = schema as unknown as SchemaIR;
            }
          }
        }

        operations[operationId] = {
          operationId,
          method: method.toUpperCase(),
          path: urlPath,
          tag,
          summary:      (op['summary'] as string) || '',
          hasAuth:      !!(op['security']) && Array.isArray(op['security']) && (op['security'] as unknown[]).length > 0,
          requestBodySchemaRef,
          responseSchemaRef,
          pathParams,
          queryParams,
          successStatus,
          requestBodySchema,
          responseSchema,
        };
      }
    }
  }

  return {
    operations,
    schemas,
    tags: Array.from(tagsSet),
  };
}
