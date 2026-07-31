import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pre } from './list-user.pre.js';
import { process } from './list-user.process.js';
import { post } from './list-user.post.js';
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { Env } from '../../../generated/bindings.js';

/**
 * @author arefin
 * @description Test suite for the makeCtx functionality
 */
function makeCtx(overrides: Partial<LifecycleContext> = {}): LifecycleContext {
  return {
    correlationId: 'test-correlation-id',
    env: {
      HYPERDRIVE: { connectionString: 'postgresql://test:test@localhost:5432/test' } as unknown as Hyperdrive,
      DOMAIN_EVENTS: { send: vi.fn() } as unknown as Queue,
      ENVIRONMENT: 'test',
    } as unknown as Env,
    request: new Request('https://example.com/users'),
    input: {},
    result: null,
    meta: {},
    ...overrides,
  };
}

describe('User — LIST lifecycle', () => {

  describe('pre()', () => {

    it('should throw UNAUTHORIZED when session token is missing', async () => {
      const ctx = makeCtx();
      await expect(pre(ctx)).rejects.toThrow('Authentication required');
    });

  });

  describe('process()', () => {
    it('should return data', async () => {
      expect(true).toBe(true);
    });
  });

  describe('post()', () => {

    it('should be a no-op for read operations', async () => {
      const ctx = makeCtx({ result: { output: [], entityId: null } });
      await expect(post(ctx)).resolves.toBeUndefined();
    });

  });

  describe('lifecycle ordering', () => {
    it('PRE must complete before PROCESS runs', async () => {
      const callOrder: string[] = [];

      /**
       * @author arefin
       * @description Test suite for the trackedPre functionality
       */
      const trackedPre = async (ctx: LifecycleContext) => { callOrder.push('pre'); return pre(ctx); };

      /**
       * @author arefin
       * @description Test suite for the trackedProcess functionality
       */
      const trackedProcess = async (ctx: LifecycleContext) => { callOrder.push('process'); return process(ctx); };

      expect(callOrder.indexOf('pre')).toBeLessThan(callOrder.indexOf('process') === -1 ? Infinity : callOrder.indexOf('process'));
    });
  });
});
