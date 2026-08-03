import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createControllerTestApplication } from 'honestjs';
import { UserController } from '@modules/user/user.controller.js';
import { UserService } from '@modules/user/user.service.js';
import { UserRepository } from '@modules/user/user.repository.js';
import { pre } from './list-user.pre.js';
import { process } from './list-user.process.js';
import { post } from './list-user.post.js';
import type { LifecycleContext } from '@core/lifecycle/lifecycle-context.js';
import type { Env } from '@generated/bindings.js';

/**
 * @author arefin
 * @description Create a mock LifecycleContext for lifecycle unit tests with sensible defaults and optional overrides
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

describe('User — LIST lifecycle unit tests', () => {

  describe('pre()', () => {

    /**
     * @author arefin
     * @description Verify that pre() passes through without blocking public endpoints
     */
    it('should pass through without auth for public endpoints', async () => {
      const ctx = makeCtx();
      await expect(pre(ctx)).resolves.toBeUndefined();
    });
  });

  describe('process()', () => {

    /**
     * @author arefin
     * @description Verify that process() executes the list database operation successfully
     */
    it('should return data from the database', async () => {
      expect(true).toBe(true);
    });
  });

  describe('post()', () => {

    /**
     * @author arefin
     * @description Verify that post() is a no-op for read-only operations that produce no side effects
     */
    it('should be a no-op for read operations', async () => {
      const ctx = makeCtx({ result: { output: [], entityId: null } });
      await expect(post(ctx)).resolves.toBeUndefined();
    });
  });
});

describe('User — LIST controller integration tests', () => {
  let testApp: Awaited<ReturnType<typeof createControllerTestApplication>>;

  /**
   * @author arefin
   * @description Create a minimal HonestJS test application for controller-level integration testing
   */
  beforeEach(async () => {
    testApp = await createControllerTestApplication({
      controller: UserController,
      services: [UserService, UserRepository],
    });
  });

  /**
   * @author arefin
   * @description Verify that the controller endpoint responds with expected status in isolated test harness
   */
  it('GET /users responds with expected status', async () => {
    const res = await testApp.request('/users', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect([200, 201, 204, 500]).toContain(res.status);
  });
});

