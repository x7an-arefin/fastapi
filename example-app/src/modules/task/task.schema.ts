import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  decimal,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


export const taskTable = pgTable(
  'tasks',
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    status: varchar("status", { length: 255 }).notNull().default('pending'),
    priority: varchar("priority", { length: 255 }).notNull().default('medium'),
    userId: uuid("user_id").notNull(),

  },
  (table) => ({
    idx_tasks_status: index('idx_tasks_status').on(table.status),
  })
);

export type TaskInsert = typeof taskTable.$inferInsert;
export type TaskSelect = typeof taskTable.$inferSelect;
