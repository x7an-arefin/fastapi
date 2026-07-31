/**
 * Template Engine — wraps EJS rendering with the normalized IR.
 * All templates receive consistent context; no template reads raw JSON.
 */
import ejs from 'ejs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import * as naming from '../naming/index.js';
import type { ApplicationIR, EntityIR, OperationIR } from '../ir/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = resolve(__dirname, '../../../templates');

export interface RenderContext {
  ir: ApplicationIR;
  /** The current entity being rendered (if applicable) */
  entity?: EntityIR;
  /** The current operation being rendered (if applicable) */
  operation?: OperationIR;
  /** Extra data specific to the template */
  extra?: Record<string, unknown>;
}

// Interop helper for ejs.render across ESM/CJS
function ejsRender(template: string, data: ejs.Data, options: ejs.Options): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderFn = (ejs as any).render ?? (ejs as any).default?.render;
  if (typeof renderFn !== 'function') {
    throw new Error('EJS render function not found');
  }
  return renderFn(template, data, options);
}

/**
 * Render an EJS template by relative path from the templates/ directory.
 * The context always includes the full IR + naming utilities.
 */
export function renderTemplate(templateRelPath: string, ctx: RenderContext): string {
  const templatePath = resolve(TEMPLATES_DIR, templateRelPath);
  const template = readFileSync(templatePath, 'utf-8');

  const ejsContext = {
    ir: ctx.ir,
    entity: ctx.entity,
    operation: ctx.operation,
    extra: ctx.extra ?? {},
    naming,
    app: ctx.ir.application,
    db: ctx.ir.database,
    events: ctx.ir.events,
    auth: ctx.ir.authentication,
    storage: ctx.ir.storage,
    email: ctx.ir.email,
    observability: ctx.ir.observability,
  };

  return ejsRender(template, ejsContext, {
    filename: templatePath,
    rmWhitespace: false,
  });
}

/**
 * Render an EJS template from a string (for inline templates).
 */
export function renderString(template: string, ctx: RenderContext): string {
  const ejsContext = {
    ir: ctx.ir,
    entity: ctx.entity,
    operation: ctx.operation,
    extra: ctx.extra ?? {},
    naming,
    app: ctx.ir.application,
    db: ctx.ir.database,
    events: ctx.ir.events,
    auth: ctx.ir.authentication,
    storage: ctx.ir.storage,
    email: ctx.ir.email,
    observability: ctx.ir.observability,
  };

  return ejsRender(template, ejsContext, { rmWhitespace: false });
}
