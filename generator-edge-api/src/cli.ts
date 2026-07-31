#!/usr/bin/env node
/**
 * CLI entry point for edge-api generator commands.
 * Dispatches to the appropriate Yeoman sub-generator.
 *
 * Usage:
 *   yo edge-api --spec application.json            # Full generation
 *   yo edge-api:validate --spec application.json   # Validate spec only
 *   yo edge-api:plan --spec application.json       # Dry-run plan
 *   yo edge-api:entity product                     # Single entity
 *   yo edge-api:openapi                            # OpenAPI only
 *   yo edge-api:doctor                             # Health check
 */
import { createEnv } from 'yeoman-environment';

const args = process.argv.slice(2);
const command = args[0] ?? 'generate';
const specFlag = args.includes('--spec') ? args[args.indexOf('--spec') + 1] : 'application.json';
const dryRun = args.includes('--dry-run') || args.includes('-d');

async function main(): Promise<void> {
  const env = createEnv();

  switch (command) {
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
async function runValidate(env: any, specPath: string): Promise<void> {
  const { loadSpecification } = await import('./lib/specification-loader/index.js');
  const { validateSemantics } = await import('./lib/semantic-validator/index.js');
  const { normalizeSpecification } = await import('./lib/normalizer/index.js');
  const chalk = (await import('chalk')).default;

  console.log(chalk.blue(`\n📋 Validating: ${specPath}\n`));

  const { raw, errors } = loadSpecification(specPath);
  if (errors.length > 0) {
    console.log(chalk.red('❌ Schema errors:'));
    errors.forEach((e: string) => console.log(chalk.red(`  • ${e}`)));
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
  if (ir.authentication) console.log(`   Auth: ${ir.authentication.provider}`);
  if (ir.storage) console.log(`   Storage: ${ir.storage.provider}`);
  if (ir.webhooks.length) console.log(`   Webhooks: ${ir.webhooks.map((w) => w.name).join(', ')}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runGenerate(env: any, specPath: string, dryRun: boolean): Promise<void> {
  const AppGenerator = (await import('./generators/app/index.js')).default;
  env.registerStub(AppGenerator, 'edge-api:app');
  await env.run('edge-api:app', { spec: specPath, dryRun, force: true });
}

main().catch((err: Error) => {
  console.error('\n❌ Generator failed:', err.message);
  if (process.env['DEBUG']) console.error(err.stack);
  process.exit(1);
});
