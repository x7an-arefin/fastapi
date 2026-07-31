import Generator from 'yeoman-generator';
import { resolve } from 'node:path';
import { loadSpecification } from '../../lib/specification-loader/index.js';
import { validateSemantics } from '../../lib/semantic-validator/index.js';
import { normalizeSpecification } from '../../lib/normalizer/index.js';
import { validateBudgets } from '../../lib/resource-budget/index.js';
import { GENERATOR_VERSION } from '../../lib/manifest/index.js';
import type { ApplicationIR } from '../../lib/ir/types.js';
import chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOpts = Record<string, any>;

export default class AppGenerator extends Generator {
  private ir!: ApplicationIR;

  /**
   * @author arefin
   * @description Initialize the class instance with required dependencies and configuration
   */
  constructor(args: string | string[], opts: AnyOpts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(args as string[], opts as any);

    this.option('spec', {
      type: String,
      description: 'Path to application.json',
      default: 'application.json',
    });
    this.option('dryRun', {
      type: Boolean,
      description: 'Show what would be generated without writing files',
      default: false,
      alias: 'd',
    });
    this.option('outputDir', {
      type: String,
      description: 'Output directory for the generated project',
      default: '.',
    });
  }

  /**
   * @author arefin
   * @description Yeoman initializing phase — display banner, parse options, and load/validate the specification
   */
  initializing(): void {
    this.log(chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════╗
║           generator-edge-api  v${GENERATOR_VERSION}               ║
║    Full-Feature Event-Driven CRUD on Cloudflare Workers  ║
╚══════════════════════════════════════════════════════════╝
`));

    const opts = this.options as AnyOpts;
    const specPath = (opts['spec'] as string) ?? 'application.json';
    const outputDir = (opts['outputDir'] as string) ?? '.';

    if (outputDir !== '.') {
      this.destinationRoot(resolve(process.cwd(), outputDir));
    }

    this.log(chalk.blue(`📋 Specification: ${resolve(process.cwd(), specPath)}`));
    this.log(chalk.blue(`📁 Output: ${this.destinationRoot()}`));

    const { raw, errors: schemaErrors } = loadSpecification(specPath);

    if (schemaErrors.length > 0) {
      this.log(chalk.red('\n❌ JSON Schema validation failed:\n'));
      for (const err of schemaErrors) this.log(chalk.red(`  • ${err}`));
      throw new Error('Specification validation failed');
    }

    const semanticErrors = validateSemantics(raw);
    const hardErrors = semanticErrors.filter((e) => e.severity === 'error');
    const warnings = semanticErrors.filter((e) => e.severity === 'warning');

    for (const w of warnings) {
      this.log(chalk.yellow(`  ⚠️  [${w.path}] ${w.message}`));
    }
    if (hardErrors.length > 0) {
      this.log(chalk.red('\n❌ Semantic validation failed:\n'));
      for (const err of hardErrors) this.log(chalk.red(`  • [${err.path}] ${err.message}`));
      throw new Error('Semantic validation failed');
    }

    this.ir = normalizeSpecification(raw);
    this.log(chalk.green(`  ✅ Specification valid — ${this.ir.entities.length} entities\n`));
  }

  /**
   * @author arefin
   * @description Yeoman configuring phase — validate resource budgets and prepare generation context
   */
  configuring(): void {

    const report = validateBudgets(this.ir);
    this.log(report.summary);

    if (report.violations.length > 0) {
      this.log(chalk.red('\n❌ Budget violations found. Generation aborted.\n'));
      throw new Error('Resource budget policy violated');
    }
  }

  /**
   * @author arefin
   * @description Yeoman writing phase — begin code generation or print dry-run plan
   */
  writing(): void {
    const opts = this.options as AnyOpts;
    if (opts['dryRun']) {
      this._printPlan();
      return;
    }

    this.log(chalk.bold('\n🚀 Starting code generation...\n'));
  }

  /**
   * @author arefin
   * @description Yeoman default phase — compose and run all sub-generators for project scaffold, entities, endpoints, and OpenAPI
   */
  async default(): Promise<void> {
    const opts = this.options as AnyOpts;
    if (opts['dryRun']) return;

    const ir = this.ir;
    const subOpts = { ir, dryRun: opts['dryRun'] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compose = (this as any).composeWith.bind(this);

    const ProjectGen = (await import('../project/index.js')).default;
    await compose({ Generator: ProjectGen, path: 'generator-edge-api:project' }, subOpts);

    const EntityGen = (await import('../entity/index.js')).default;
    await compose({ Generator: EntityGen, path: 'generator-edge-api:entity' }, subOpts);

    const EndpointGen = (await import('../endpoint/index.js')).default;
    await compose({ Generator: EndpointGen, path: 'generator-edge-api:endpoint' }, subOpts);

    const OpenApiGen = (await import('../openapi/index.js')).default;
    await compose({ Generator: OpenApiGen, path: 'generator-edge-api:openapi' }, subOpts);
  }

  /**
   * @author arefin
   * @description Yeoman end phase — display completion message with next steps and generated file summary
   */
  end(): void {
    const opts = this.options as AnyOpts;
    if (opts['dryRun']) return;

    this.log(chalk.bold.green(`
╔══════════════════════════════════════════════════════════╗
║              ✅ Generation Complete!                      ║
╚══════════════════════════════════════════════════════════╝

Next steps:
  1. cd ${this.destinationRoot()}
  2. npm install
  3. Edit wrangler.jsonc — fill in YOUR_HYPERDRIVE_ID and YOUR_KV_NAMESPACE_ID
  4. wrangler dev
  5. Open http://localhost:8787/health

Generated files:
  • src/modules/**/  — Entity schemas, repos, CRUD routes
  • src/core/        — Lifecycle engine, events, auth, observability
  • src/consumers/   — Queue consumers (domain events, email, DLQ)
  • src/generated/   — Auto-generated bindings and route registry
  • openapi.json     — API documentation

Scaffolded files (edit these — they won't be overwritten):
  • src/modules/**/*.pre.ts
  • src/modules/**/*.process.ts
  • src/modules/**/*.post.ts
  • src/modules/**/*.test.ts
`));
  }

  /**
   * @author arefin
   * @description Print a dry-run plan showing which files would be generated without actually writing them
   */
  private _printPlan(): void {
    this.log(chalk.bold.yellow('\n📋 DRY RUN — files that would be generated:\n'));
    this.log(chalk.cyan('Generated (always overwritten):'));

    for (const entity of this.ir.entities) {
      this.log(`  src/modules/${entity.nameKebab}/${entity.nameKebab}.schema.ts`);
      this.log(`  src/modules/${entity.nameKebab}/${entity.nameKebab}.types.ts`);
      this.log(`  src/modules/${entity.nameKebab}/${entity.nameKebab}.repository.ts`);
      this.log(`  src/modules/${entity.nameKebab}/${entity.nameKebab}.events.ts`);

      for (const op of entity.operations) {
        const base = `src/modules/${entity.nameKebab}/${op.operation}`;
        const file = `${op.operation}-${entity.nameKebab}`;
        this.log(`  ${base}/${file}.route.ts`);
        this.log(`  ${base}/${file}.input.ts`);
        this.log(`  ${base}/${file}.output.ts`);
      }
    }

    this.log(chalk.yellow('\nScaffolded (created once, never overwritten):'));
    for (const entity of this.ir.entities) {
      for (const op of entity.operations) {
        const base = `src/modules/${entity.nameKebab}/${op.operation}`;
        const file = `${op.operation}-${entity.nameKebab}`;
        this.log(`  ${base}/${file}.pre.ts`);
        this.log(`  ${base}/${file}.process.ts`);
        this.log(`  ${base}/${file}.post.ts`);
        this.log(`  ${base}/${file}.test.ts`);
      }
    }

    this.log(chalk.cyan('\nManaged (created if missing, never overwritten by generator):'));
    this.log('  package.json');
    this.log('  wrangler.jsonc');
    this.log('  src/app.ts');
    this.log('  openapi.json (generated)');
    this.log('');
  }
}
