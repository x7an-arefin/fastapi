import { describe, it, expect } from 'vitest';
import { resolveRef } from '../index.js';

describe('ref-resolver', () => {
  it('should resolve a valid reference', () => {
    const doc = {
      paths: {
        '~api~v1~tasks': {
          get: { operationId: 'getTasks' }
        }
      }
    };
    
    // ~1 is / and ~0 is ~
    const result = resolveRef('#/paths/~0api~0v1~0tasks/get', doc);
    expect(result).toEqual({ operationId: 'getTasks' });
  });

  it('should decode tildes correctly (~1 -> /, ~0 -> ~)', () => {
    const doc = {
      paths: {
        '/api/v1/tasks': {
          get: { operationId: 'getTasks2' }
        }
      }
    };
    
    const result = resolveRef('#/paths/~1api~1v1~1tasks/get', doc);
    expect(result).toEqual({ operationId: 'getTasks2' });
  });

  it('should throw on missing path', () => {
    const doc = { paths: {} };
    expect(() => resolveRef('#/paths/missing', doc)).toThrow(/Could not resolve JSON pointer/);
  });
});
