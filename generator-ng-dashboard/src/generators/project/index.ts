import Generator from 'yeoman-generator';
import path from 'path';
import type { FrontendIR } from '../../lib/ir/types.js';

/** @author arefin */
export default class ProjectGenerator extends Generator {
  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
  }
  writing(): void {
    const opts = this.options as unknown as Record<string, unknown>;
    const ir = opts['ir'] as FrontendIR;
    const templatesRoot = opts['templatesRoot'] as string;

    const ejsContext = {
      appName:      ir.appName,
      appTitle:     ir.appTitle,
      appNameKebab: ir.appName.toLowerCase().replace(/\s+/g, '-'),
      baseHref:     ir.baseHref,
      defaultRoute: ir.defaultRoute,
      apiBaseUrl:   ir.apiBaseUrl,
      auth:         ir.auth,
      theme:        ir.theme,
      sidebar:      ir.sidebar,
      modules:      ir.modules,
    };

    this.fs.copyTpl(
      path.join(templatesRoot, 'project', '**', '*'),
      this.destinationPath(),
      ejsContext,
      {},
      { globOptions: { dot: true } }
    );
  }
}