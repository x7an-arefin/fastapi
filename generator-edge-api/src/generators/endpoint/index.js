import Generator from 'yeoman-generator';
import { renderTemplate } from '../../lib/template-engine/index.js';
import chalk from 'chalk';
export default class EndpointGenerator extends Generator {
    ir;
    /**
     * @author arefin
     * @description Initialize the class instance with required dependencies and configuration
     */
    constructor(args, opts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super(args, opts);
    }
    /**
     * @author arefin
     * @description Yeoman initializing phase — display banner, parse options, and load/validate the specification
     */
    initializing() {
        const opts = this.options;
        this.ir = opts['ir'];
    }
    /**
     * @author arefin
     * @description Yeoman writing phase — begin code generation or print dry-run plan
     */
    writing() {
        const opts = this.options;
        const targetEntityName = opts['entityName'];
        const targetOperation = opts['operation'];
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
     * @description Generate all lifecycle files (input, output, pre, process, post, test) for a single entity operation
     */
    _generateEndpoint(entity, operation) {
        const ctx = { ir: this.ir, entity, operation };
        const base = `src/modules/${entity.nameKebab}/${operation.operation}`;
        const fileBase = `${operation.operation}-${entity.nameKebab}`;
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
    _writeGenerated(templatePath, outputPath, ctx) {
        const content = renderTemplate(templatePath, ctx);
        this.fs.write(this.destinationPath(outputPath), content);
    }
    /**
     * @author arefin
     * @description Write a scaffolded file from a template — only creates if the file does not already exist
     */
    _writeScaffolded(templatePath, outputPath, ctx) {
        const fullPath = this.destinationPath(outputPath);
        if (!this.fs.exists(fullPath)) {
            const content = renderTemplate(templatePath, ctx);
            this.fs.write(fullPath, content);
        }
    }
}
//# sourceMappingURL=index.js.map