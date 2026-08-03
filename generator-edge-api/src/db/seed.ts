import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { Env } from '@generated/bindings.js';
import { logger } from '@core/observability/logger.js';

declare const process: { env: Record<string, string | undefined> };

import {  } from '@modules/user/user.schema.js';

import {  } from '@modules/task/task.schema.js';


/**
 * @author arefin
 * @description Spec-driven seed script — populates initial database records in topological dependency order
 */
export async function seedDatabase(connectionString?: string): Promise<void> {
  const connStr = connectionString ?? process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/postgres';
  const queryClient = postgres(connStr);
  const db = drizzle(queryClient);

  logger.info({ action: 'db_seed_start', note: 'Seeding mock data for entities' });

  try {

    logger.info({ action: 'db_seed_entity', entity: 'user' });

    logger.info({ action: 'db_seed_entity', entity: 'task' });

    logger.info({ action: 'db_seed_completed', note: 'Mock data seeding finished successfully' });
  } catch (err) {
    logger.error({ action: 'db_seed_failed', error: String(err) });
    throw err;
  } finally {
    await queryClient.end();
  }
}
