import type { Env } from '../../generated/bindings.js';

export interface LifecycleContext {
  correlationId: string;
  env: Env;
  request: Request;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: Record<string, any>;
  result: { output: unknown; entityId: string | null } | null;
  meta: Record<string, unknown>;
}
