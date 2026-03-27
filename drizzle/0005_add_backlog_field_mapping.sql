-- drizzle/0005_add_backlog_field_mapping.sql
-- Add field mapping configuration to Backlog form settings

ALTER TABLE integration_backlog_form_settings
ADD COLUMN IF NOT EXISTS field_mapping jsonb;

-- Comment for documentation
COMMENT ON COLUMN integration_backlog_form_settings.field_mapping IS 'Field mapping config: {summary, description, issueTypeId, priorityId, customFields}';
