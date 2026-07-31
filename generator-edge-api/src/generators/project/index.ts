/**
 * Project sub-generator — scaffolds the root project structure.
 * Writes: package.json, tsconfig.json, wrangler.jsonc, drizzle.config.ts,
 *         src/index.ts, src/app.ts, src/generated/, src/core/
 */
import Generator from 'yeoman-generator';
import { renderTemplate } from '../../lib/template-engine/index.js';
import { validateBudgets } from '../../lib/resource-budget/index.js';
import type { ApplicationIR } from '../../lib/ir/types.js';
import chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOpts = Record<string, any>;

export default class ProjectGenerator extends Generator {
  private ir!: ApplicationIR;

  constructor(args: string | string[], opts: AnyOpts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(args as string[], opts as any);
  }

  initializing(): void {
    const opts = this.options as AnyOpts;
    this.ir = opts['ir'] as ApplicationIR;
  }

  configuring(): void {
    const report = validateBudgets(this.ir);
    this.log(report.summary);

    if (report.violations.length > 0) {
      throw new Error(
        `Budget violations found. Generation aborted. Fix the violations or relax your budget policy in application.json.`
      );
    }
  }

  writing(): void {
    const ctx = { ir: this.ir };

    this.log(chalk.blue('\n📦 Generating project scaffold...\n'));

    // package.json — managed file
    this._writeManaged('project/package.json.ejs', 'package.json', ctx);

    // tsconfig.json — generated
    this._writeGenerated('project/tsconfig.json.ejs', 'tsconfig.json', ctx);

    // wrangler.jsonc — managed
    this._writeManaged('project/wrangler.jsonc.ejs', 'wrangler.jsonc', ctx);

    // drizzle.config.ts — generated
    this._writeGenerated('project/drizzle.config.ts.ejs', 'drizzle.config.ts', ctx);

    // src/index.ts — generated
    this._writeGenerated('project/index.ts.ejs', 'src/index.ts', ctx);

    // src/app.ts — managed
    this._writeManaged('project/app.ts.ejs', 'src/app.ts', ctx);

    // src/generated/bindings.ts — generated
    this._writeGenerated('project/bindings.ts.ejs', 'src/generated/bindings.ts', ctx);

    // src/generated/routes.ts — generated
    this._writeGenerated('project/routes.ts.ejs', 'src/generated/routes.ts', ctx);

    // Core: errors
    this._writeGenerated('core/errors/application-error.ts.ejs', 'src/core/errors/application-error.ts', ctx);
    this._writeGenerated('core/errors/error-handler.ts.ejs', 'src/core/errors/error-handler.ts', ctx);

    // Core: lifecycle
    this._writeGenerated('lifecycle/lifecycle-context.ts.ejs', 'src/core/lifecycle/lifecycle-context.ts', ctx);
    this._writeGenerated('lifecycle/lifecycle-result.ts.ejs', 'src/core/lifecycle/lifecycle-result.ts', ctx);
    this._writeGenerated('lifecycle/run-lifecycle.ts.ejs', 'src/core/lifecycle/run-lifecycle.ts', ctx);

    // Core: events
    this._writeGenerated('events/event-envelope.ts.ejs', 'src/core/events/event-envelope.ts', ctx);
    this._writeGenerated('events/event-publisher.ts.ejs', 'src/core/events/event-publisher.ts', ctx);

    // Core: observability
    this._writeGenerated('core/observability/logger.ts.ejs', 'src/core/observability/logger.ts', ctx);
    this._writeGenerated('core/observability/correlation.ts.ejs', 'src/core/observability/correlation.ts', ctx);

    // Core: auth (if configured)
    if (this.ir.authentication) {
      this._writeGenerated('core/auth/auth-port.ts.ejs', 'src/core/auth/auth-port.ts', ctx);
      this._writeGenerated('core/auth/session-cache.ts.ejs', 'src/core/auth/session-cache.ts', ctx);
    }

    // Queue consumers
    this._writeGenerated('consumers/domain-event.consumer.ts.ejs', 'src/consumers/domain-event.consumer.ts', ctx);
    this._writeGenerated('consumers/dead-letter.consumer.ts.ejs', 'src/consumers/dead-letter.consumer.ts', ctx);
    if (this.ir.email) {
      this._writeGenerated('consumers/email.consumer.ts.ejs', 'src/consumers/email.consumer.ts', ctx);
    }

    // Media routes (if configured)
    if (this.ir.storage) {
      this._writeGenerated('media/media.routes.ts.ejs', 'src/modules/media/media.routes.ts', ctx);
    }

    // Webhook handlers
    for (const webhook of this.ir.webhooks) {
      this._writeGenerated('webhooks/handler.ts.ejs', `src/webhooks/${webhook.name}/handler.ts`, { ...ctx, extra: { webhook } });
    }

    // Scheduled jobs
    for (const job of this.ir.scheduled) {
      this._writeScaffolded('scheduled/job.ts.ejs', `src/scheduled/${job.nameKebab}.ts`, { ...ctx, extra: { job } });
    }

    // .gitignore
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

  private _writeGenerated(templatePath: string, outputPath: string, ctx: object): void {
    const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
    const fullPath = this.destinationPath(outputPath);
    this.fs.write(fullPath, content);
  }

  private _writeManaged(templatePath: string, outputPath: string, ctx: object): void {
    const fullPath = this.destinationPath(outputPath);
    if (!this.fs.exists(fullPath)) {
      const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
      this.fs.write(fullPath, content);
    }
  }

  private _writeScaffolded(templatePath: string, outputPath: string, ctx: object): void {
    const fullPath = this.destinationPath(outputPath);
    if (!this.fs.exists(fullPath)) {
      const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
      this.fs.write(fullPath, content);
    }
  }

  private _writeFile(outputPath: string, content: string): void {
    const fullPath = this.destinationPath(outputPath);
    if (!this.fs.exists(fullPath)) {
      this.fs.write(fullPath, content);
    }
  }
}
