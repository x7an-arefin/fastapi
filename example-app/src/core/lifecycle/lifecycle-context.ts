/**
 * Lifecycle Context — the shared state object passed through PRE → PROCESS → POST.
 * All lifecycle handlers read from and write to this context.
 */
import type { Env } from '../../generated/bindings.js';

export interface LifecycleContext {
  /** Distributed correlation ID — propagated from the request header */
  correlationId: string;
  /** Cloudflare Workers environment bindings */
  env: Env;
  /** Original incoming HTTP request */
  request: Request;
  /** Parsed and validated input (set before PRE runs) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: Record<string, any>;
  /** The result from the PROCESS stage (null before PROCESS runs) */
  result: { output: unknown; entityId: string | null } | null;
  /** Arbitrary metadata — use this for actor, permissions, cached resources */
  meta: Record<string, unknown>;
}
