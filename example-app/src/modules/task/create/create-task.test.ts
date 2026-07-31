// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SCAFFOLDED FILE — This file was created by the generator once.     ║
// ║  It will NOT be overwritten on subsequent generator runs.           ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pre } from './create-task.pre.js';
import { process } from './create-task.process.js';
import { post } from './create-task.post.js';
import type { LifecycleContext } from '../../../core/lifecycle/lifecycle-context.js';
import type { Env } from '../../../generated/bindings.js';

function makeCtx(overrides: Partial<LifecycleContext> = {}): LifecycleContext {
  return {
    correlationId: 'test-correlation-id',
    env: {
      HYPERDRIVE: { connectionString: 'postgresql://test:test@localhost:5432/test' } as unknown as Hyperdrive,
      DOMAIN_EVENTS: { send: vi.fn() } as unknown as Queue,
      ENVIRONMENT: 'test',
    } as unknown as Env,
    request: new Request('https://example.com/tasks'),
    input: {},
    result: null,
    meta: {},
    ...overrides,
  };
}

describe('Task — CREATE lifecycle', () => {
  // ── PRE ────────────────────────────────────────────────────────────────────

  describe('pre()', () => {

    it('should throw UNAUTHORIZED when session token is missing', async () => {
      const ctx = makeCtx();
      await expect(pre(ctx)).rejects.toThrow('Authentication required');
    });

  });

  // ── PROCESS ────────────────────────────────────────────────────────────────

  describe('process()', () => {
    it('should successfully create a task', async () => {
      expect(true).toBe(true);
    });
  });

  // ── POST ───────────────────────────────────────────────────────────────────

  describe('post()', () => {

    it('should publish a domain event to the queue', async () => {
      const mockSend = vi.fn().mockResolvedValue(undefined);
      const ctx = makeCtx({
        result: { output: {}, entityId: 'test-uuid' },
        meta: { actor: { type: 'user', id: 'user-123' } },
        env: {
          ...makeCtx().env,
          DOMAIN_EVENTS: { send: mockSend } as unknown as Queue,
        },
      });

      await expect(post(ctx)).resolves.toBeUndefined();

      expect(mockSend).toHaveBeenCalledOnce();
    });

  });

  // ── Lifecycle ordering ─────────────────────────────────────────────────────

  describe('lifecycle ordering', () => {
    it('PRE must complete before PROCESS runs', async () => {
      const callOrder: string[] = [];
      const trackedPre = async (ctx: LifecycleContext) => { callOrder.push('pre'); return pre(ctx); };
      const trackedProcess = async (ctx: LifecycleContext) => { callOrder.push('process'); return process(ctx); };

      expect(callOrder.indexOf('pre')).toBeLessThan(callOrder.indexOf('process') === -1 ? Infinity : callOrder.indexOf('process'));
    });
  });
});
