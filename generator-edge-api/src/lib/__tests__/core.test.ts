/**
 * Unit tests for the core library modules.
 */
import { describe, it, expect } from 'vitest';
import {
  toKebabCase,
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  toScreamingSnakeCase,
  pluralize,
  toLifecycleEventName,
  toDomainEventName,
  toEndpointFilename,
} from '../naming/index.js';

describe('naming utilities', () => {
  describe('toKebabCase', () => {
    it('converts camelCase to kebab-case', () => {
      expect(toKebabCase('myEntity')).toBe('my-entity');
    });
    it('converts PascalCase to kebab-case', () => {
      expect(toKebabCase('MyEntity')).toBe('my-entity');
    });
    it('handles single word', () => {
      expect(toKebabCase('product')).toBe('product');
    });
    it('handles acronyms', () => {
      expect(toKebabCase('HTTPSConnection')).toBe('https-connection');
    });
  });

  describe('toPascalCase', () => {
    it('converts kebab-case to PascalCase', () => {
      expect(toPascalCase('my-entity')).toBe('MyEntity');
    });
    it('converts camelCase to PascalCase', () => {
      expect(toCamelCase('my-entity')).toBe('myEntity');
    });
    it('handles single word', () => {
      expect(toPascalCase('product')).toBe('Product');
    });
  });

  describe('toCamelCase', () => {
    it('converts kebab-case to camelCase', () => {
      expect(toCamelCase('my-entity')).toBe('myEntity');
    });
    it('converts PascalCase to camelCase', () => {
      expect(toCamelCase('MyEntity')).toBe('myEntity');
    });
  });

  describe('toSnakeCase', () => {
    it('converts camelCase to snake_case', () => {
      expect(toSnakeCase('myEntity')).toBe('my_entity');
    });
    it('converts PascalCase to snake_case', () => {
      expect(toSnakeCase('MyEntity')).toBe('my_entity');
    });
  });

  describe('toScreamingSnakeCase', () => {
    it('converts camelCase to SCREAMING_SNAKE', () => {
      expect(toScreamingSnakeCase('myEntity')).toBe('MY_ENTITY');
    });
  });

  describe('pluralize', () => {
    it('adds s for regular words', () => {
      expect(pluralize('product')).toBe('products');
    });
    it('handles words ending in y', () => {
      expect(pluralize('category')).toBe('categories');
    });
    it('handles words ending in sh', () => {
      expect(pluralize('wish')).toBe('wishes');
    });
  });

  describe('toLifecycleEventName', () => {
    it('generates correct lifecycle event name', () => {
      expect(toLifecycleEventName('commerce', 'product', 'create', 'pre', 1))
        .toBe('commerce.product.create.pre.v1');
    });
    it('generates correct post lifecycle event name', () => {
      expect(toLifecycleEventName('commerce', 'product', 'delete', 'post', 1))
        .toBe('commerce.product.delete.post.v1');
    });
  });

  describe('toDomainEventName', () => {
    it('generates past-tense domain event name', () => {
      expect(toDomainEventName('commerce', 'product', 'create', 1))
        .toBe('commerce.product.created.v1');
    });
    it('generates past-tense for update', () => {
      expect(toDomainEventName('commerce', 'product', 'update', 1))
        .toBe('commerce.product.updated.v1');
    });
    it('generates past-tense for delete', () => {
      expect(toDomainEventName('commerce', 'product', 'delete', 1))
        .toBe('commerce.product.deleted.v1');
    });
  });

  describe('toEndpointFilename', () => {
    it('generates endpoint filename', () => {
      expect(toEndpointFilename('create', 'product', 'route'))
        .toBe('create-product.route.ts');
    });
    it('generates pre filename', () => {
      expect(toEndpointFilename('update', 'product', 'pre'))
        .toBe('update-product.pre.ts');
    });
  });
});

describe('dependency-graph', () => {
  it('sorts entities with no dependencies first', async () => {
    const { topologicalSort, extractEntityDependencies } = await import('../dependency-graph/index.js');
    const entities = {
      product: { fields: { ownerId: { type: 'uuid', references: { entity: 'user', field: 'id' } } } },
      user: { fields: { id: { type: 'uuid', primary: true } } },
    };
    const deps = extractEntityDependencies(entities);
    const order = topologicalSort(deps);
    expect(order.indexOf('user')).toBeLessThan(order.indexOf('product'));
  });

  it('throws on circular dependencies', async () => {
    const { topologicalSort, CircularDependencyError } = await import('../dependency-graph/index.js');
    const nodes = [
      { name: 'a', dependsOn: ['b'] },
      { name: 'b', dependsOn: ['a'] },
    ];
    expect(() => topologicalSort(nodes)).toThrow(CircularDependencyError);
  });
});

describe('semantic-validator', () => {
  it('passes for a valid specification', async () => {
    const { validateSemantics } = await import('../semantic-validator/index.js');
    const raw = {
      entities: {
        product: {
          table: 'products',
          fields: {
            id: { type: 'uuid', primary: true, generated: true },
            name: { type: 'string', required: true },
          },
        },
      },
    };
    const errors = validateSemantics(raw);
    expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0);
  });

  it('catches invalid entity field reference', async () => {
    const { validateSemantics } = await import('../semantic-validator/index.js');
    const raw = {
      entities: {
        product: {
          table: 'products',
          fields: {
            id: { type: 'uuid', primary: true },
            userId: { type: 'uuid', references: { entity: 'nonexistent', field: 'id' } },
          },
        },
      },
    };
    const errors = validateSemantics(raw);
    expect(errors.some((e) => e.severity === 'error' && e.message.includes('nonexistent'))).toBe(true);
  });

  it('catches enum field with no values', async () => {
    const { validateSemantics } = await import('../semantic-validator/index.js');
    const raw = {
      entities: {
        product: {
          table: 'products',
          fields: {
            id: { type: 'uuid', primary: true },
            status: { type: 'enum', values: [] },
          },
        },
      },
    };
    const errors = validateSemantics(raw);
    expect(errors.some((e) => e.path.includes('status'))).toBe(true);
  });
});

describe('normalizer', () => {
  it('normalizes a basic specification', async () => {
    const { normalizeSpecification } = await import('../normalizer/index.js');
    const raw = {
      specVersion: '1.0',
      application: {
        name: 'test-api',
        domain: 'test',
        apiPrefix: '/api/v1',
        runtime: 'cloudflare-workers',
        framework: 'hono',
        language: 'typescript',
      },
      database: {
        provider: 'cockroachdb',
        connection: 'hyperdrive',
        orm: 'drizzle',
        binding: 'HYPERDRIVE',
      },
      entities: {
        product: {
          table: 'products',
          fields: {
            id: { type: 'uuid', primary: true, generated: true },
            name: { type: 'string', required: true, maxLength: 100 },
          },
          crud: {
            create: { enabled: true, method: 'POST', path: '/products', auth: false },
            get: { enabled: true, method: 'GET', path: '/products/:id', auth: false },
          },
        },
      },
    };

    const ir = normalizeSpecification(raw);

    expect(ir.application.name).toBe('test-api');
    expect(ir.application.nameKebab).toBe('test-api');
    expect(ir.application.namePascal).toBe('TestApi');
    expect(ir.entities).toHaveLength(1);
    expect(ir.entities[0]?.name).toBe('product');
    expect(ir.entities[0]?.namePascal).toBe('Product');
    expect(ir.entities[0]?.operations).toHaveLength(2);
    expect(ir.entities[0]?.operations[0]?.operation).toBe('create');
    expect(ir.entities[0]?.operations[0]?.domainEventName).toBe('test.product.created.v1');
  });
});

describe('resource-budget', () => {
  it('passes when all endpoints are within budget', async () => {
    const { validateBudgets } = await import('../resource-budget/index.js');
    const { normalizeSpecification } = await import('../normalizer/index.js');
    const raw = {
      specVersion: '1.0',
      application: { name: 'test', domain: 'test', apiPrefix: '/api/v1', runtime: 'cloudflare-workers', framework: 'hono', language: 'typescript' },
      database: { provider: 'cockroachdb', connection: 'hyperdrive', orm: 'drizzle', binding: 'HYPERDRIVE' },
      entities: {
        product: {
          table: 'products',
          fields: { id: { type: 'uuid', primary: true, generated: true } },
          crud: {
            get: { enabled: true, method: 'GET', path: '/products/:id', auth: false },
          },
        },
      },
      budgets: { request: { maximumDatabaseQueries: 3, maximumKvReads: 2, maximumKvWrites: 0, maximumQueueWrites: 2, maximumB2Operations: 1 } },
    };

    const ir = normalizeSpecification(raw);
    const report = validateBudgets(ir);
    expect(report.violations).toHaveLength(0);
  });
});
