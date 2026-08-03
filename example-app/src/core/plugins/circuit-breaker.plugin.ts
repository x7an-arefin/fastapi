import type { IPlugin, Application } from 'honestjs';
import type { Hono } from 'hono';
import { logger } from '@core/observability/logger.js';

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitState {
  state: State;
  failures: number;
  lastFailureTime: number;
}

/**
 * @author arefin
 * @description Pattern C: Self-Healing Circuit Breaker Plugin — protects external third-party API dependencies (Resend, B2, Payment Gateways) from cascading failures
 */
export class CircuitBreakerPlugin implements IPlugin {
  meta = { name: 'CircuitBreakerPlugin' };
  private circuits = new Map<string, CircuitState>();
  private failureThreshold = 5;
  private cooldownMs = 30000;

  /**
   * @author arefin
   * @description Attach circuit breaker context helper to application pipeline
   */
  async beforeModulesRegistered(app: Application, _hono: Hono): Promise<void> {
    app.getContext().set('circuit.execute', async <T>(name: string, action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> => {
      const state = this.getCircuit(name);

      if (state.state === 'OPEN') {
        if (Date.now() - state.lastFailureTime > this.cooldownMs) {
          state.state = 'HALF_OPEN';
          logger.info({ action: 'circuit_half_open', name });
        } else {
          logger.warn({ action: 'circuit_open_blocked', name });
          if (fallback) return fallback();
          throw new Error(`Circuit ${name} is OPEN`);
        }
      }

      try {
        const result = await action();
        if (state.state === 'HALF_OPEN') {
          state.state = 'CLOSED';
          state.failures = 0;
          logger.info({ action: 'circuit_closed', name });
        }
        return result;
      } catch (err) {
        state.failures++;
        state.lastFailureTime = Date.now();

        if (state.failures >= this.failureThreshold) {
          state.state = 'OPEN';
          logger.error({ action: 'circuit_tripped_open', name, failures: state.failures });
        }

        if (fallback) return fallback();
        throw err;
      }
    });
  }

  private getCircuit(name: string): CircuitState {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, { state: 'CLOSED', failures: 0, lastFailureTime: 0 });
    }
    return this.circuits.get(name)!;
  }
}
