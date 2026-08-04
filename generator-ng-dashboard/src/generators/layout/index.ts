import Generator from 'yeoman-generator';
import path from 'path';
import type { FrontendIR } from '../../lib/ir/types.js';

/** @author arefin */
export default class LayoutGenerator extends Generator {
  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
  }
  writing(): void {
    const opts = this.options as unknown as Record<string, unknown>;
    const ir = opts['ir'] as FrontendIR;
    const templatesRoot = opts['templatesRoot'] as string;
    const normalizeIcon = (ic: string) => {
      if (!ic) return 'heroSquare3Stack3d';
      if (ic.startsWith('hero')) return ic;
      return 'hero' + ic.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    };

    const sidebar = {
      ...ir.sidebar,
      items: ir.sidebar.items.map(item => ({
        ...item,
        icon: normalizeIcon(item.icon),
      })),
    };

    const ejsContext = {
      appName: ir.appName,
      sidebar: sidebar,
      modules: ir.modules,
      defaultRoute: ir.defaultRoute,
    };
    this.fs.copyTpl(
      path.join(templatesRoot, 'layout', '**', '*'),
      this.destinationPath('src/app/layout'),
      ejsContext,
      {},
      { globOptions: { dot: true } }
    );
  }
}