import type { ApplicationIR, EntityIR, OperationIR } from '../ir/types.js';
export interface RenderContext {
    ir: ApplicationIR;
    entity?: EntityIR;
    operation?: OperationIR;
    extra?: Record<string, unknown>;
}
/**
 * @author arefin
 * @description Render a template file with the provided context variables
 */
export declare function renderTemplate(templateRelPath: string, ctx: RenderContext): string;
/**
 * @author arefin
 * @description Render an inline template string with the provided context variables
 */
export declare function renderString(template: string, ctx: RenderContext): string;
