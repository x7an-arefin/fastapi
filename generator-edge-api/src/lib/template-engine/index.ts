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
  entity?: EntityIR;
  operation?: OperationIR;
  extra?: Record<string, unknown>;
}

/**
 * @author arefin
 * @description Render an EJS template string with the provided context variables and return the output
 */
function ejsRender(template: string, data: ejs.Data, options: ejs.Options): string {
  return ejs.render(template, data, options) as string;
}

/**
 * @author arefin
 * @description Render a template file with the provided context variables
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
    entities: ctx.ir.entities,
    auth: ctx.ir.authentication,
    storage: ctx.ir.storage,
    email: ctx.ir.email,
    observability: ctx.ir.observability,
    security: ctx.ir.security,
  };

  return ejsRender(template, ejsContext, {
    filename: templatePath,
    rmWhitespace: false,
  });
}

/**
 * @author arefin
 * @description Render an inline template string with the provided context variables
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
    security: ctx.ir.security,
  };

  return ejsRender(template, ejsContext, { rmWhitespace: false });
}
