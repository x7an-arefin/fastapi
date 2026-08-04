import Generator from 'yeoman-generator';
import path from 'path';
import type { FrontendIR } from '../../lib/ir/types.js';

/** @author arefin */
export default class CoreGenerator extends Generator {
  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
  }
  writing(): void {
    const opts = this.options as unknown as Record<string, unknown>;
    const ir = opts['ir'] as FrontendIR;
    const templatesRoot = opts['templatesRoot'] as string;
    const ejsContext = {
      appName: ir.appName, apiBaseUrl: ir.apiBaseUrl,
      auth: ir.auth, defaultRoute: ir.defaultRoute, modules: ir.modules,
    };
    this.fs.copyTpl(
      path.join(templatesRoot, 'core', '**', '*'),
      this.destinationPath('src/app/core'),
      ejsContext, {}, { globOptions: { dot: true } }
    );
  }
}