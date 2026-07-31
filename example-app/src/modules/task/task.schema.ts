// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task                                                   ║
// ╚══════════════════════════════════════════════════════════════════════╝
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

export const statusEnum = pgEnum('tasks_status', ['todo', 'in_progress', 'completed', 'archived']);


export const taskTable = pgTable(
  'tasks',
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    status: statusEnum('status').default('todo'),
    priority: integer("priority").notNull().default(1),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  },
  (table) => ({
    tasks_user_status_idx: index('tasks_user_status_idx').on(table.userId, table.status),
  })
);

export type TaskInsert = typeof taskTable.$inferInsert;
export type TaskSelect = typeof taskTable.$inferSelect;
