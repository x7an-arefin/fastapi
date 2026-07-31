import Generator from 'yeoman-generator';
import { renderTemplate } from '../../lib/template-engine/index.js';
import type { ApplicationIR, EntityIR, OperationIR } from '../../lib/ir/types.js';
import chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOpts = Record<string, any>;

export default class EndpointGenerator extends Generator {
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
   * @description Yeoman writing phase — begin code generation or print dry-run plan
   */
  writing(): void {
    const opts = this.options as AnyOpts;
    const targetEntityName = opts['entityName'] as string | undefined;
    const targetOperation = opts['operation'] as string | undefined;

    const entities = targetEntityName
      ? this.ir.entities.filter((e) => e.name === targetEntityName)
      : this.ir.entities;

    this.log(chalk.blue('\n📡 Generating endpoints...\n'));

    for (const entity of entities) {
      const operations = targetOperation
        ? entity.operations.filter((op) => op.operation === targetOperation)
        : entity.operations;

      for (const operation of operations) {
        this._generateEndpoint(entity, operation);
      }
    }
  }

  /**
   * @author arefin
   * @description Generate all lifecycle endpoint files (route, input, output) for a single entity operation
   */
  private _generateEndpoint(entity: EntityIR, operation: OperationIR): void {
    const ctx = { ir: this.ir, entity, operation };
    const base = `src/modules/${entity.nameKebab}/${operation.operation}`;
    const fileBase = `${operation.operation}-${entity.nameKebab}`;

    this._writeGenerated(`endpoint/route.ts.ejs`, `${base}/${fileBase}.route.ts`, ctx);
    this._writeGenerated(`endpoint/input.ts.ejs`, `${base}/${fileBase}.input.ts`, ctx);
    this._writeGenerated(`endpoint/output.ts.ejs`, `${base}/${fileBase}.output.ts`, ctx);

    this._writeScaffolded(`endpoint/pre.ts.ejs`, `${base}/${fileBase}.pre.ts`, ctx);
    this._writeScaffolded(`endpoint/process.ts.ejs`, `${base}/${fileBase}.process.ts`, ctx);
    this._writeScaffolded(`endpoint/post.ts.ejs`, `${base}/${fileBase}.post.ts`, ctx);
    this._writeScaffolded(`endpoint/test.ts.ejs`, `${base}/${fileBase}.test.ts`, ctx);

    this.log(chalk.green(`  ✅ ${operation.method} ${operation.fullPath} → ${base}/`));
  }

  /**
   * @author arefin
   * @description Write a generated file from a template — always overwrites existing content
   */
  private _writeGenerated(templatePath: string, outputPath: string, ctx: object): void {
    const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
    this.fs.write(this.destinationPath(outputPath), content);
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
}
