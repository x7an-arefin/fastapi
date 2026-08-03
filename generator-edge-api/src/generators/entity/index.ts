import Generator from 'yeoman-generator';
import { renderTemplate } from '../../lib/template-engine/index.js';
import type { ApplicationIR, EntityIR } from '../../lib/ir/types.js';
import chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOpts = Record<string, any>;

export default class EntityGenerator extends Generator {
  private ir!: ApplicationIR;
  private targetEntities!: EntityIR[];

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
    const targetName = opts['entityName'] as string | undefined;

    this.targetEntities = targetName
      ? this.ir.entities.filter((e) => e.name === targetName)
      : this.ir.entities;

    if (targetName && this.targetEntities.length === 0) {
      throw new Error(`Entity "${targetName}" not found in specification`);
    }
  }

  /**
   * @author arefin
   * @description Yeoman writing phase — begin code generation or print dry-run plan
   */
  writing(): void {
    this.log(chalk.blue(`\n🗂  Generating entities: ${this.targetEntities.map((e) => e.namePascal).join(', ')}\n`));

    for (const entity of this.targetEntities) {
      const ctx = { ir: this.ir, entity };
      const base = `src/modules/${entity.nameKebab}`;

      this._writeGenerated(`entity/schema.ts.ejs`, `${base}/${entity.nameKebab}.schema.ts`, ctx);
      this._writeGenerated(`entity/types.ts.ejs`, `${base}/${entity.nameKebab}.types.ts`, ctx);
      this._writeGenerated(`entity/repository.ts.ejs`, `${base}/${entity.nameKebab}.repository.ts`, ctx);
      this._writeGenerated(`entity/events.ts.ejs`, `${base}/${entity.nameKebab}.events.ts`, ctx);
      this._writeGenerated(`entity/module.ts.ejs`, `${base}/${entity.nameKebab}.module.ts`, ctx);
      this._writeGenerated(`entity/controller.ts.ejs`, `${base}/${entity.nameKebab}.controller.ts`, ctx);
      this._writeGenerated(`entity/service.ts.ejs`, `${base}/${entity.nameKebab}.service.ts`, ctx);

      this.log(chalk.green(`  ✅ ${entity.namePascal} (${entity.table})`));
    }
  }

  /**
   * @author arefin
   * @description Write a generated file from a template — always overwrites existing content
   */
  private _writeGenerated(templatePath: string, outputPath: string, ctx: object): void {
    const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
    this.fs.write(this.destinationPath(outputPath), content);
  }
}
