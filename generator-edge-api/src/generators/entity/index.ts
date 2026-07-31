/**
 * Entity sub-generator — generates per-entity files:
 * schema.ts, types.ts, repository.ts, events.ts
 */
import Generator from 'yeoman-generator';
import { renderTemplate } from '../../lib/template-engine/index.js';
import type { ApplicationIR, EntityIR } from '../../lib/ir/types.js';
import chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOpts = Record<string, any>;

export default class EntityGenerator extends Generator {
  private ir!: ApplicationIR;
  private targetEntities!: EntityIR[];

  constructor(args: string | string[], opts: AnyOpts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(args as string[], opts as any);
  }

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

  writing(): void {
    this.log(chalk.blue(`\n🗂  Generating entities: ${this.targetEntities.map((e) => e.namePascal).join(', ')}\n`));

    for (const entity of this.targetEntities) {
      const ctx = { ir: this.ir, entity };
      const base = `src/modules/${entity.nameKebab}`;

      this._writeGenerated(`entity/schema.ts.ejs`, `${base}/${entity.nameKebab}.schema.ts`, ctx);
      this._writeGenerated(`entity/types.ts.ejs`, `${base}/${entity.nameKebab}.types.ts`, ctx);
      this._writeGenerated(`entity/repository.ts.ejs`, `${base}/${entity.nameKebab}.repository.ts`, ctx);
      this._writeGenerated(`entity/events.ts.ejs`, `${base}/${entity.nameKebab}.events.ts`, ctx);

      this.log(chalk.green(`  ✅ ${entity.namePascal} (${entity.table})`));
    }
  }

  private _writeGenerated(templatePath: string, outputPath: string, ctx: object): void {
    const content = renderTemplate(templatePath, ctx as Parameters<typeof renderTemplate>[1]);
    this.fs.write(this.destinationPath(outputPath), content);
  }
}
