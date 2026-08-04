#!/usr/bin/env node
import { createEnv } from 'yeoman-environment';
const args = process.argv.slice(2);
const command = args[0] ?? 'generate';
const specFlag = args.includes('--spec') ? args[args.indexOf('--spec') + 1] : 'application.json';
const dryRun = args.includes('--dry-run') || args.includes('-d');
/**
 * @author arefin
 * @description CLI entry point — parse arguments and dispatch to the appropriate command handler
 */
async function main() {
    const env = createEnv();
    switch (command) {
        case 'init': {
            const { initWizard } = await import('./cli/init.js');
            await initWizard(specFlag);
            break;
        }
        case 'diff': {
            const specB = args[2] ?? 'application.json';
            const { diffSpecs } = await import('./cli/diff.js');
            await diffSpecs(specFlag, specB);
            break;
        }
        case 'validate':
            await runValidate(env, specFlag);
            break;
        case 'plan':
            await runGenerate(env, specFlag, true);
            break;
        case 'generate':
        default:
            await runGenerate(env, specFlag, dryRun);
            break;
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * @author arefin
 * @description Load and validate the application specification against semantic rules
 */
async function runValidate(env, specPath) {
    const { loadSpecification } = await import('./lib/specification-loader/index.js');
    const { validateSemantics } = await import('./lib/semantic-validator/index.js');
    const { normalizeSpecification } = await import('./lib/normalizer/index.js');
    const chalk = (await import('chalk')).default;
    console.log(chalk.blue(`\n📋 Validating: ${specPath}\n`));
    const { raw, errors } = loadSpecification(specPath);
    if (errors.length > 0) {
        console.log(chalk.red('❌ Schema errors:'));
        errors.forEach((e) => console.log(chalk.red(`  • ${e}`)));
        process.exit(1);
    }
    const semanticErrors = validateSemantics(raw);
    const hardErrors = semanticErrors.filter((e) => e.severity === 'error');
    const warnings = semanticErrors.filter((e) => e.severity === 'warning');
    warnings.forEach((w) => console.log(chalk.yellow(`  ⚠️  [${w.path}] ${w.message}`)));
    if (hardErrors.length > 0) {
        console.log(chalk.red('❌ Semantic errors:'));
        hardErrors.forEach((e) => console.log(chalk.red(`  • [${e.path}] ${e.message}`)));
        process.exit(1);
    }
    const ir = normalizeSpecification(raw);
    console.log(chalk.green(`✅ Specification is valid`));
    console.log(`   Entities: ${ir.entities.map((e) => e.name).join(', ')}`);
    console.log(`   Operations: ${ir.entities.reduce((n, e) => n + e.operations.length, 0)} total`);
    if (ir.authentication)
        console.log(`   Auth: ${ir.authentication.provider}`);
    if (ir.storage)
        console.log(`   Storage: ${ir.storage.provider}`);
    if (ir.webhooks.length)
        console.log(`   Webhooks: ${ir.webhooks.map((w) => w.name).join(', ')}`);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * @author arefin
 * @description Execute the full code generation pipeline from the application specification
 */
async function runGenerate(env, specPath, dryRun) {
    const AppGenerator = (await import('./generators/app/index.js')).default;
    env.registerStub(AppGenerator, 'edge-api:app');
    await env.run('edge-api:app', { spec: specPath, dryRun, force: true });
}
main().catch((err) => {
    if (err instanceof SyntaxError) {
        console.error('\n❌ JSON parse error in specification file:', err.message);
        console.error('   Hint: Check for trailing commas, missing quotes, or unmatched braces.');
    }
    else {
        console.error('\n❌ Generator failed:', err instanceof Error ? err.message : String(err));
    }
    if (process.env['DEBUG'] && err instanceof Error)
        console.error(err.stack);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map