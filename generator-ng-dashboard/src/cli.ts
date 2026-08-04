#!/usr/bin/env node
import { createEnv } from 'yeoman-environment';
import { loadFrontendSpec, loadOpenApiSpec } from './lib/specification-loader/index.js';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

const args = process.argv.slice(2);
const command = args[0] ?? 'generate';
const specFlag = args.includes('--spec') ? args[args.indexOf('--spec') + 1] : 'frontend.json';
const openApiFlag = args.includes('--openapi') ? args[args.indexOf('--openapi') + 1] : 'openapi.json';
const outputFlag = args.includes('--output') ? args[args.indexOf('--output') + 1] : './dashboard-app';
const dryRun = args.includes('--dry-run') || args.includes('-d');

async function runValidate(specPath: string, openApiPath: string) {
  console.log(chalk.blue(`Validating specs...`));
  const fRes = loadFrontendSpec(path.resolve(process.cwd(), specPath));
  if (fRes.errors.length > 0) {
    console.error(chalk.red('Frontend spec has errors:'));
    fRes.errors.forEach(e => console.error(chalk.red(`  - ${e}`)));
  } else {
    console.log(chalk.green('Frontend spec is valid.'));
  }
  const aRes = loadOpenApiSpec(path.resolve(process.cwd(), openApiPath));
  if (aRes.errors.length > 0) {
    console.error(chalk.red('OpenAPI spec has errors:'));
    aRes.errors.forEach(e => console.error(chalk.red(`  - ${e}`)));
  } else {
    console.log(chalk.green('OpenAPI spec is valid.'));
  }
}

async function runGenerate(env: any, specPath: string, openApiPath: string, outputPath: string, dry: boolean) {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const appGeneratorPath = path.resolve(dir, 'generators/app/index.js');
  env.register(appGeneratorPath, 'ng-dashboard:app');
  await env.run('ng-dashboard:app', {
    spec: specPath,
    openapi: openApiPath,
    output: outputPath,
    dryRun: dry
  });
}

async function main(): Promise<void> {
  const env = createEnv();
  switch (command) {
    case 'init': {
      const { default: runInit } = await import('./cli/init.js');
      await runInit();
      break;
    }
    case 'validate': 
      await runValidate(specFlag, openApiFlag); 
      break;
    case 'plan': 
      await runGenerate(env, specFlag, openApiFlag, outputFlag, true); 
      break;
    case 'generate':
    default: 
      await runGenerate(env, specFlag, openApiFlag, outputFlag, dryRun); 
      break;
  }
}

main().catch(err => {
  console.error(chalk.red('An error occurred:'), err);
  process.exit(1);
});
