import Generator from 'yeoman-generator';
import path from 'path';
import type { FrontendIR } from '../../lib/ir/types.js';

/** @author arefin */
export default class StylesGenerator extends Generator {
  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
  }
  writing(): void {
    const opts = this.options as unknown as Record<string, unknown>;
    const ir = opts['ir'] as FrontendIR;
    const templatesRoot = opts['templatesRoot'] as string;
    this.fs.copyTpl(
      path.join(templatesRoot, 'styles', '**', '*'),
      this.destinationPath('src/styles'),
      { theme: ir.theme, appName: ir.appName },
      {},
      { globOptions: { dot: true } }
    );
  }
}