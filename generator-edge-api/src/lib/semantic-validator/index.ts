export interface SemanticError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawSpec = Record<string, any>;

/**
 * @author arefin
 * @description Validate semantic correctness of the raw specification — check for missing references and invalid configurations
 */
export function validateSemantics(raw: RawSpec): SemanticError[] {
  const errors: SemanticError[] = [];
  const entities = raw['entities'] as Record<string, RawSpec> | undefined;

  if (!entities) return errors;

  const entityNames = Object.keys(entities);

  for (const [entityName, entity] of Object.entries(entities)) {
    const fields = entity['fields'] as Record<string, RawSpec> | undefined;
    if (!fields) continue;

    if (!/^[A-Z][a-zA-Z0-9]*$/.test(entityName)) {
      errors.push({
        path: `entities.${entityName}`,
        message: `Entity name "${entityName}" must be alphanumeric starting with a letter`,
        severity: 'error',
      });
    }

    if (entityName.includes('/') || entityName.includes('\\') || entityName.includes('..')) {
      errors.push({
        path: `entities.${entityName}`,
        message: `Entity name "${entityName}" must not contain path separators or traversal sequences`,
        severity: 'error',
      });
    }

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

      if (field['type'] === 'enum' && (!field['values'] || (field['values'] as string[]).length === 0)) {
        errors.push({
          path: `entities.${entityName}.fields.${fieldName}.values`,
          message: `Enum field "${fieldName}" must have at least one value`,
          severity: 'error',
        });
      }

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

    const hasPrimary = Object.values(fields).some((f) => f['primary'] === true);
    if (!hasPrimary) {
      errors.push({
        path: `entities.${entityName}.fields`,
        message: `Entity "${entityName}" must have exactly one primary key field`,
        severity: 'error',
      });
    }

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

  const auth = raw['authentication'] as RawSpec | undefined;
  if (auth?.['session']?.['cache'] === 'workers-kv' && !auth['session']['kvBinding']) {
    errors.push({
      path: 'authentication.session.kvBinding',
      message: 'Session KV cache requires a kvBinding name',
      severity: 'error',
    });
  }

  const appConfig = raw['application'] as RawSpec | undefined;
  if (appConfig) {
    const apiPrefix = appConfig['apiPrefix'] as string | undefined;
    if (apiPrefix && (apiPrefix.includes('..') || apiPrefix.includes('///'))) {
      errors.push({
        path: 'application.apiPrefix',
        message: 'apiPrefix must not contain path traversal sequences',
        severity: 'error',
      });
    }
  }

  return errors;
}
