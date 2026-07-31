import Generator from 'yeoman-generator';
import { loadSpecification } from '../../lib/specification-loader/index.js';
import { validateSemantics } from '../../lib/semantic-validator/index.js';
import { normalizeSpecification } from '../../lib/normalizer/index.js';
import type { ApplicationIR } from '../../lib/ir/types.js';
import chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOpts = Record<string, any>;

export default class SpecificationGenerator extends Generator {
  declare ir: ApplicationIR;

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
    });
  }

  /**
   * @author arefin
   * @description Yeoman initializing phase — display banner, parse options, and load/validate the specification
   */
  async initializing(): Promise<void> {
    const opts = this.options as AnyOpts;
    const specPath = (opts['spec'] as string) ?? 'application.json';
    this.log(chalk.blue(`\n📋 Loading specification: ${specPath}\n`));

    const { raw, errors: schemaErrors } = loadSpecification(specPath);

    if (schemaErrors.length > 0) {
      this.log(chalk.red('\n❌ JSON Schema validation failed:\n'));
      for (const err of schemaErrors) {
        this.log(chalk.red(`  • ${err}`));
      }
      throw new Error(`Specification validation failed with ${schemaErrors.length} error(s)`);
    }

    this.log(chalk.green('  ✅ JSON Schema validation passed'));

    const semanticErrors = validateSemantics(raw);
    const hardErrors = semanticErrors.filter((e) => e.severity === 'error');
    const warnings = semanticErrors.filter((e) => e.severity === 'warning');

    if (warnings.length > 0) {
      this.log(chalk.yellow('\n⚠️  Warnings:'));
      for (const w of warnings) {
        this.log(chalk.yellow(`  • [${w.path}] ${w.message}`));
      }
    }

    if (hardErrors.length > 0) {
      this.log(chalk.red('\n❌ Semantic validation failed:\n'));
      for (const err of hardErrors) {
        this.log(chalk.red(`  • [${err.path}] ${err.message}`));
      }
      throw new Error(`Semantic validation failed with ${hardErrors.length} error(s)`);
    }

    this.log(chalk.green('  ✅ Semantic validation passed'));

    this.ir = normalizeSpecification(raw);
    this.log(chalk.green(`  ✅ Normalized ${this.ir.entities.length} entities\n`));
  }
}
