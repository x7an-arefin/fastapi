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


export const userTable = pgTable(
  'users',
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 255 }).notNull().default('user'),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),

  },
  (table) => ({
    idx_users_email: uniqueIndex('idx_users_email').on(table.email),
  })
);

export type UserInsert = typeof userTable.$inferInsert;
export type UserSelect = typeof userTable.$inferSelect;
