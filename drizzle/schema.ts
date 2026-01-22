// drizzle/schema.ts
import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const forms = pgTable("forms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("active"),

  // Backlog config (prévu J4)
  backlogSpaceUrl: text("backlog_space_url"),
  backlogApiKeyEnc: text("backlog_api_key_enc"),
  backlogProjectId: integer("backlog_project_id"),
  backlogIssueTypeId: integer("backlog_issue_type_id"),
  backlogPriorityId: integer("backlog_priority_id"),
  backlogAssigneeId: integer("backlog_assignee_id"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const formFields = pgTable("form_fields", {
  id: text("id").primaryKey(),
  formId: text("form_id").notNull(),
  key: text("key").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(), // text|textarea|select
  required: boolean("required").notNull().default(false),
  options: jsonb("options"),
  order: integer("order").notNull().default(0),
});

export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  formId: text("form_id").notNull(),
  payload: jsonb("payload").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
