import Generator from 'yeoman-generator';
import path from 'path';
import type { FrontendIR } from '../../lib/ir/types.js';

/** @author arefin */
export default class PagesGenerator extends Generator {
  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
  }
  writing(): void {
    const opts = this.options as unknown as Record<string, unknown>;
    const ir = opts['ir'] as FrontendIR;
    const templatesRoot = opts['templatesRoot'] as string;
    const ejsContext = {
      appName: ir.appName,
      appTitle: ir.appTitle,
      loginRedirect: ir.auth.loginRedirect,
    };
    this.fs.copyTpl(
      path.join(templatesRoot, 'pages', '**', '*'),
      this.destinationPath('src/app/pages'),
      ejsContext,
      {},
      { globOptions: { dot: true } }
    );
  }
}