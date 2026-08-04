import Generator from 'yeoman-generator';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadFrontendSpec, loadOpenApiSpec } from '../../lib/specification-loader/index.js';
import { parseOpenApi } from '../../lib/openapi-parser/index.js';
import { normalizeFrontendSpec } from '../../lib/normalizer/index.js';
import type { FrontendIR, ApiIR } from '../../lib/ir/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @author arefin
 * @description Orchestrator generator — reads frontend.json + openapi.json, builds IRs, composes all sub-generators.
 */
export default class AppGenerator extends Generator {
  private ir!: FrontendIR;
  private apiIR!: ApiIR;
  private dryRun!: boolean;
  private templatesRoot!: string;

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
    this.templatesRoot = path.resolve(__dirname, '../../../templates');
  }

  async initializing(): Promise<void> {
    this.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
    this.log(chalk.bold.cyan('║   ng-dashboard  ·  Angular Generator ║'));
    this.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));

    const opts = this.options as Record<string, unknown>;
    const specFlag    = (opts['spec']    as string) || 'frontend.json';
    const openApiFlag = (opts['openapi'] as string) || 'openapi.json';
    const outputFlag  = (opts['output']  as string) || './dashboard-app';
    this.dryRun       = !!(opts['dryRun'] as boolean);

    const frontendSpecPath = path.resolve(process.cwd(), specFlag);
    const openApiSpecPath  = path.resolve(process.cwd(), openApiFlag);

    this.log(chalk.dim(`  spec:    ${frontendSpecPath}`));
    this.log(chalk.dim(`  openapi: ${openApiSpecPath}`));
    this.log(chalk.dim(`  output:  ${path.resolve(process.cwd(), outputFlag)}\n`));

    const frontendRes = loadFrontendSpec(frontendSpecPath);
    if (frontendRes.errors.length > 0) {
      this.log(chalk.red('❌ Frontend spec validation errors:'));
      frontendRes.errors.forEach(e => this.log(chalk.red(`   • ${e}`)));
      throw new Error('Frontend spec invalid — fix the errors above and retry.');
    }

    const openApiRes = loadOpenApiSpec(openApiSpecPath);
    if (openApiRes.errors.length > 0) {
      this.log(chalk.red('❌ OpenAPI spec errors:'));
      openApiRes.errors.forEach(e => this.log(chalk.red(`   • ${e}`)));
      throw new Error('OpenAPI spec invalid.');
    }

    this.apiIR = parseOpenApi(openApiRes.raw);
    this.ir    = normalizeFrontendSpec(frontendRes.raw, this.apiIR);

    this.destinationRoot(path.resolve(process.cwd(), outputFlag));
  }

  configuring(): void {
    this.log(chalk.green('✔ Spec loaded successfully'));
    this.log(`  App:     ${chalk.bold(this.ir.appName)}`);
    this.log(`  Auth:    ${chalk.bold(this.ir.auth.provider)}`);
    this.log(`  Modules: ${chalk.bold(this.ir.modules.map(m => m.label).join(', '))}\n`);
  }

  writing(): void {
    if (this.dryRun) {
      this._printPlan();
    }
  }

  async composing(): Promise<void> {
    if (this.dryRun) return;

    const composeOpts = {
      ir: this.ir,
      apiIR: this.apiIR,
      templatesRoot: this.templatesRoot,
    };

    const gDir = path.resolve(__dirname, '..');

    const [Proj, Sty, Cor, Shr, Lay, Pgs, Feat] = await Promise.all([
      import('../project/index.js'),
      import('../styles/index.js'),
      import('../core/index.js'),
      import('../shared/index.js'),
      import('../layout/index.js'),
      import('../pages/index.js'),
      import('../feature/index.js'),
    ]);

    await (this as any).composeWith({ Generator: Proj.default, path: path.join(gDir, 'project') }, composeOpts);
    await (this as any).composeWith({ Generator: Sty.default,  path: path.join(gDir, 'styles')  }, composeOpts);
    await (this as any).composeWith({ Generator: Cor.default,  path: path.join(gDir, 'core')    }, composeOpts);
    await (this as any).composeWith({ Generator: Shr.default,  path: path.join(gDir, 'shared')  }, composeOpts);
    await (this as any).composeWith({ Generator: Lay.default,  path: path.join(gDir, 'layout')  }, composeOpts);
    await (this as any).composeWith({ Generator: Pgs.default,  path: path.join(gDir, 'pages')   }, composeOpts);
    await (this as any).composeWith({ Generator: Feat.default, path: path.join(gDir, 'feature') }, composeOpts);
  }

  end(): void {
    if (this.dryRun) return;
    const opts = this.options as Record<string, unknown>;
    this.log(chalk.bold.green('\n✅ Generation complete!\n'));
    this.log('Next steps:');
    this.log(chalk.cyan(`  cd ${this.destinationRoot()}`));
    this.log(chalk.cyan('  npm install'));
    this.log(chalk.cyan('  npm run start\n'));
    this.log(chalk.dim('  App runs at http://localhost:4200'));
    this.log(chalk.dim('  Login at http://localhost:4200/login\n'));
  }

  private _printPlan(): void {
    this.log(chalk.yellow('\n📋 Dry run — files that WOULD be generated:\n'));
    const dest = this.destinationRoot();

    const staticFiles = [
      'angular.json', 'package.json', 'tsconfig.json', 'tsconfig.app.json',
      'src/main.ts', 'src/app/app.component.ts', 'src/app/app.config.ts', 'src/app/app.routes.ts',
      'src/styles/styles.scss', 'src/styles/_design-tokens.scss', 'src/styles/_base.scss',
      'src/environments/environment.ts',
      'src/app/core/auth/auth.service.ts', 'src/app/core/auth/auth.guard.ts',
      'src/app/core/http/error.interceptor.ts', 'src/app/core/http/correlation.interceptor.ts',
      'src/app/pages/login/login-page.component.ts',
      'src/app/layout/shell/shell.component.ts',
      'src/app/layout/sidebar/sidebar.component.ts',
      'src/app/shared/ui/drawer/drawer.component.ts',
      'src/app/shared/ui/data-table/data-table.component.ts',
      'src/app/shared/ui/page-header/page-header.component.ts',
    ];

    staticFiles.forEach(f => this.log(chalk.dim(`  ${path.join(dest, f)}`)));

    this.ir.modules.forEach(mod => {
      const base = `src/app/features/${mod.nameKebab}`;
      [
        `${base}/data-access/models/${mod.nameKebab}.model.ts`,
        `${base}/data-access/models/${mod.nameKebab}-api.types.ts`,
        `${base}/data-access/services/${mod.nameKebab}-api.service.ts`,
        `${base}/data-access/store/${mod.nameKebab}.store.ts`,
        `${base}/data-access/${mod.nameKebab}.facade.ts`,
        `${base}/data-access/index.ts`,
        `${base}/ui/${mod.nameKebab}-page.component.ts`,
        `${base}/ui/${mod.nameKebab}-form.component.ts`,
        `${base}/ui/${mod.nameKebab}-table.component.ts`,
        `${base}/ui/${mod.nameKebab}-detail.component.ts`,
        `${base}/${mod.nameKebab}.routes.ts`,
      ].forEach(f => this.log(chalk.dim(`  ${path.join(dest, f)}`)));
    });

    this.log('');
  }
}
