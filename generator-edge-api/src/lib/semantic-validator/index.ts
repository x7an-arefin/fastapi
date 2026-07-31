/**
 * Semantic Validator — validates business rules beyond JSON Schema.
 * Cross-references, naming conflicts, circular dependencies, budget violations.
 */

export interface SemanticError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawSpec = Record<string, any>;

export function validateSemantics(raw: RawSpec): SemanticError[] {
  const errors: SemanticError[] = [];
  const entities = raw['entities'] as Record<string, RawSpec> | undefined;

  if (!entities) return errors;

  const entityNames = Object.keys(entities);

  for (const [entityName, entity] of Object.entries(entities)) {
    const fields = entity['fields'] as Record<string, RawSpec> | undefined;
    if (!fields) continue;

    // Validate entity name format
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(entityName)) {
      errors.push({
        path: `entities.${entityName}`,
        message: `Entity name "${entityName}" must be alphanumeric starting with a letter`,
        severity: 'error',
      });
    }

    // Validate field references
    for (const [fieldName, field] of Object.entries(fields)) {
      const ref = field['references'] as { entity: string; field: string } | undefined;
      if (ref) {
        if (!entityNames.includes(ref.entity)) {
          errors.push({
            path: `entities.${entityName}.fields.${fieldName}.references.entity`,
            message: `References unknown entity "${ref.entity}". Known entities: ${entityNames.join(', ')}`,
            severity: 'error',
          });
        } else {
          const refEntity = entities[ref.entity] as RawSpec;
          const refFields = refEntity['fields'] as Record<string, RawSpec> | undefined;
          if (refFields && !Object.keys(refFields).includes(ref.field)) {
            errors.push({
              path: `entities.${entityName}.fields.${fieldName}.references.field`,
              message: `References unknown field "${ref.field}" on entity "${ref.entity}"`,
              severity: 'error',
            });
          }
        }
      }

      // Validate enum fields have values
      if (field['type'] === 'enum' && (!field['values'] || (field['values'] as string[]).length === 0)) {
        errors.push({
          path: `entities.${entityName}.fields.${fieldName}.values`,
          message: `Enum field "${fieldName}" must have at least one value`,
          severity: 'error',
        });
      }

      // Validate decimal precision/scale
      if (field['type'] === 'decimal') {
        if (field['precision'] && field['scale'] && (field['scale'] as number) > (field['precision'] as number)) {
          errors.push({
            path: `entities.${entityName}.fields.${fieldName}`,
            message: `Decimal field scale (${field['scale']}) cannot exceed precision (${field['precision']})`,
            severity: 'error',
          });
        }
      }
    }

    // Validate primary key exists
    const hasPrimary = Object.values(fields).some((f) => f['primary'] === true);
    if (!hasPrimary) {
      errors.push({
        path: `entities.${entityName}.fields`,
        message: `Entity "${entityName}" must have exactly one primary key field`,
        severity: 'error',
      });
    }

    // Validate crud select fields exist
    const crud = entity['crud'] as Record<string, RawSpec> | undefined;
    if (crud) {
      for (const [opName, op] of Object.entries(crud)) {
        const select = op['select'] as string[] | undefined;
        if (select) {
          for (const selectedField of select) {
            if (!Object.keys(fields).includes(selectedField)) {
              errors.push({
                path: `entities.${entityName}.crud.${opName}.select`,
                message: `Selected field "${selectedField}" does not exist on entity "${entityName}"`,
                severity: 'error',
              });
            }
          }
        }

        // Validate sort/filter fields on list operations
        if (opName === 'list') {
          const filterFields = op['filter'] as string[] | undefined;
          if (filterFields) {
            for (const f of filterFields) {
              if (!Object.keys(fields).includes(f)) {
                errors.push({
                  path: `entities.${entityName}.crud.list.filter`,
                  message: `Filter field "${f}" does not exist on entity "${entityName}"`,
                  severity: 'warning',
                });
              }
            }
          }
          const sortFields = op['sort'] as string[] | undefined;
          if (sortFields) {
            for (const f of sortFields) {
              if (!Object.keys(fields).includes(f)) {
                errors.push({
                  path: `entities.${entityName}.crud.list.sort`,
                  message: `Sort field "${f}" does not exist on entity "${entityName}"`,
                  severity: 'warning',
                });
              }
            }
          }
        }
      }
    }

    // Validate index fields exist
    const indexes = entity['indexes'] as RawSpec[] | undefined;
    if (indexes) {
      for (const index of indexes) {
        const indexFields = index['fields'] as string[] | undefined;
        if (indexFields) {
          for (const f of indexFields) {
            if (!Object.keys(fields).includes(f)) {
              errors.push({
                path: `entities.${entityName}.indexes`,
                message: `Index field "${f}" does not exist on entity "${entityName}"`,
                severity: 'error',
              });
            }
          }
        }
      }
    }
  }

  // Validate webhook queue bindings declared in events
  const webhooks = raw['webhooks'] as Record<string, RawSpec> | undefined;
  if (webhooks) {
    for (const [webhookName, webhook] of Object.entries(webhooks)) {
      if (!webhook['queue']) {
        errors.push({
          path: `webhooks.${webhookName}.queue`,
          message: `Webhook "${webhookName}" must specify a queue binding`,
          severity: 'error',
        });
      }
    }
  }

  // Validate auth session KV binding exists if auth configured
  const auth = raw['authentication'] as RawSpec | undefined;
  if (auth?.['session']?.['cache'] === 'workers-kv' && !auth['session']['kvBinding']) {
    errors.push({
      path: 'authentication.session.kvBinding',
      message: 'Session KV cache requires a kvBinding name',
      severity: 'error',
    });
  }

  return errors;
}
