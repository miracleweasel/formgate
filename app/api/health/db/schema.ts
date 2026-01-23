// lib/db/schema.ts
import { pgTable, uuid, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const forms = pgTable(
  "forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex("forms_slug_unique").on(t.slug),
  })
);

export type Form = InferSelectModel<typeof forms>;
export type NewForm = InferInsertModel<typeof forms>;
