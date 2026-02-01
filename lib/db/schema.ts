// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";

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

// --- Backlog integration (MVP) ---

export const integrationBacklogConnections = pgTable(
  "integration_backlog_connections",
  {
    id: uuid("id").primaryKey(),
    userEmail: text("user_email").notNull(),

    spaceUrl: text("space_url").notNull(),
    apiKey: text("api_key").notNull(), // MVP: stored in clear, NEVER returned to client
    defaultProjectKey: text("default_project_key").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    userEmailIdx: index("ibc_user_email_idx").on(t.userEmail),
  })
);

export const integrationBacklogFormSettings = pgTable(
  "integration_backlog_form_settings",
  {
    formId: uuid("form_id")
      .primaryKey()
      .references(() => forms.id, { onDelete: "cascade" }),

    enabled: boolean("enabled").notNull().default(false),
    projectKey: text("project_key"), // nullable override, else use connection.defaultProjectKey

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    enabledIdx: index("ibfs_enabled_idx").on(t.enabled),
  })
);
