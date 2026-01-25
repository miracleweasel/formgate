// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const forms = pgTable("forms", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),

    payload: jsonb("payload").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    formIdIdx: index("submissions_form_id_idx").on(t.formId),
    createdAtIdx: index("submissions_created_at_idx").on(t.createdAt),
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey(),

    // MVP admin-only : on attache à l’admin
    userEmail: text("user_email").notNull(),

    status: text("status").notNull(), // 'active' | 'inactive'

    lsSubscriptionId: text("ls_subscription_id").unique(),
    lsCustomerId: text("ls_customer_id"),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    userEmailIdx: index("subscriptions_user_email_idx").on(t.userEmail),
    statusIdx: index("subscriptions_status_idx").on(t.status),
  })
);
