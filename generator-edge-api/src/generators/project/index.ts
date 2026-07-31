import Generator from 'yeoman-generator';
import { renderTemplate } from '../../lib/template-engine/index.js';
import { validateBudgets } from '../../lib/resource-budget/index.js';
import type { ApplicationIR } from '../../lib/ir/types.js';
import chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOpts = Record<string, any>;

export default class ProjectGenerator extends Generator {
  private ir!: ApplicationIR;

  /**
   * @author arefin
   * @description Initialize the class instance with required dependencies and configuration
   */
  constructor(args: string | string[], opts: AnyOpts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(args as string[], opts as any);
  }

  /**
   * @author arefin
   * @description Yeoman initializing phase — display banner, parse options, and load/validate the specification
   */
  initializing(): void {
    const opts = this.options as AnyOpts;
    this.ir = opts['ir'] as ApplicationIR;
  }

  /**
   * @author arefin
   * @description Yeoman configuring phase — validate resource budgets and prepare generation context
   */
  configuring(): void {
    const report = validateBudgets(this.ir);
    this.log(report.summary);

    if (report.violations.length > 0) {
      throw new Error(
        `Budget violations found. Generation aborted. Fix the violations or relax your budget policy in application.json.`
      );
    }
  }

  /**
   * @author arefin
   * @description Yeoman writing phase — begin code generation or print dry-run plan
   */
  writing(): void {
    const ctx = { ir: this.ir };

    this.log(chalk.blue('\n📦 Generating project scaffold...\n'));

    this._writeManaged('project/package.json.ejs', 'package.json', ctx);

    this._writeGenerated('project/tsconfig.json.ejs', 'tsconfig.json', ctx);

    this._writeManaged('project/wrangler.jsonc.ejs', 'wrangler.jsonc', ctx);

    this._writeGenerated('project/drizzle.config.ts.ejs', 'drizzle.config.ts', ctx);

    this._writeGenerated('project/index.ts.ejs', 'src/index.ts', ctx);

    this._writeManaged('project/app.ts.ejs', 'src/app.ts', ctx);

    this._writeGenerated('project/bindings.ts.ejs', 'src/generated/bindings.ts', ctx);

    this._writeGenerated('project/routes.ts.ejs', 'src/generated/routes.ts', ctx);

    this._writeGenerated('core/errors/application-error.ts.ejs', 'src/core/errors/application-error.ts', ctx);
    this._writeGenerated('core/errors/error-handler.ts.ejs', 'src/core/errors/error-handler.ts', ctx);

    this._writeGenerated('lifecycle/lifecycle-context.ts.ejs', 'src/core/lifecycle/lifecycle-context.ts', ctx);
    this._writeGenerated('lifecycle/lifecycle-result.ts.ejs', 'src/core/lifecycle/lifecycle-result.ts', ctx);
    this._writeGenerated('lifecycle/run-lifecycle.ts.ejs', 'src/core/lifecycle/run-lifecycle.ts', ctx);

    this._writeGenerated('events/event-envelope.ts.ejs', 'src/core/events/event-envelope.ts', ctx);
    this._writeGenerated('events/event-publisher.ts.ejs', 'src/core/events/event-publisher.ts', ctx);

    this._writeGenerated('core/observability/logger.ts.ejs', 'src/core/observability/logger.ts', ctx);
    this._writeGenerated('core/observability/correlation.ts.ejs', 'src/core/observability/correlation.ts', ctx);

    if (this.ir.authentication) {
      this._writeGenerated('core/auth/auth-port.ts.ejs', 'src/core/auth/auth-port.ts', ctx);
      this._writeGenerated('core/auth/session-cache.ts.ejs', 'src/core/auth/session-cache.ts', ctx);
    }

    this._writeGenerated('consumers/domain-event.consumer.ts.ejs', 'src/consumers/domain-event.consumer.ts', ctx);
    this._writeGenerated('consumers/dead-letter.consumer.ts.ejs', 'src/consumers/dead-letter.consumer.ts', ctx);
    if (this.ir.email) {
      this._writeGenerated('consumers/email.consumer.ts.ejs', 'src/consumers/email.consumer.ts', ctx);
    }

    if (this.ir.storage) {
      this._writeGenerated('media/media.routes.ts.ejs', 'src/modules/media/media.routes.ts', ctx);
    }

    for (const webhook of this.ir.webhooks) {
      this._writeGenerated('webhooks/handler.ts.ejs', `src/webhooks/${webhook.name}/handler.ts`, { ...ctx, extra: { webhook } });
    }

    for (const job of this.ir.scheduled) {
      this._writeScaffolded('scheduled/job.ts.ejs', `src/scheduled/${job.nameKebab}.ts`, { ...ctx, extra: { job } });
    }

    this._writeFile('.gitignore', [
      'node_modules/',
      'dist/',
      '.wrangler/',
      '*.local',
      '.env',
      '.env.*',
      '!.env.example',
    ].join('\n'));

    this.log(chalk.green('  ✅ Project scaffold written\n'));
  }

  /**
   * @author arefin
   * @description Write a generated file from a template — always overwrites existing content
   */
  private _writeGenerated(templatePath: string, outputPath: string, ctx: object): void {
    const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
    const fullPath = this.destinationPath(outputPath);
    this.fs.write(fullPath, content);
  }

  /**
   * @author arefin
   * @description Write a managed file from a template — creates if missing, merges if existing
   */
  private _writeManaged(templatePath: string, outputPath: string, ctx: object): void {
    const fullPath = this.destinationPath(outputPath);
    if (!this.fs.exists(fullPath)) {
      const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
      this.fs.write(fullPath, content);
    }
  }

  /**
   * @author arefin
   * @description Write a scaffolded file from a template — only creates if the file does not already exist
   */
  private _writeScaffolded(templatePath: string, outputPath: string, ctx: object): void {
    const fullPath = this.destinationPath(outputPath);
    if (!this.fs.exists(fullPath)) {
      const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
      this.fs.write(fullPath, content);
    }
  }

  /**
   * @author arefin
   * @description Write content to a file on disk, creating parent directories as needed
   */
  private _writeFile(outputPath: string, content: string): void {
    const fullPath = this.destinationPath(outputPath);
    if (!this.fs.exists(fullPath)) {
      this.fs.write(fullPath, content);
    }
  }
}
