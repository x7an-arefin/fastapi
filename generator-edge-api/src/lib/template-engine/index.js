import ejs from 'ejs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import * as naming from '../naming/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = resolve(__dirname, '../../../templates');
/**
 * @author arefin
 * @description Render an EJS template string with the provided context variables and return the output
 */
function ejsRender(template, data, options) {
    return ejs.render(template, data, options);
}
/**
 * @author arefin
 * @description Render a template file with the provided context variables
 */
export function renderTemplate(templateRelPath, ctx) {
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
export function renderString(template, ctx) {
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
//# sourceMappingURL=index.js.map