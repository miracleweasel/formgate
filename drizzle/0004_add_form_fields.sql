-- drizzle/0004_add_form_fields.sql
-- Add custom fields support to forms

ALTER TABLE forms
ADD COLUMN IF NOT EXISTS fields jsonb DEFAULT '[]'::jsonb;

-- Add a check constraint to limit array size (max 20 fields)
ALTER TABLE forms
ADD CONSTRAINT forms_fields_max_length
CHECK (jsonb_array_length(COALESCE(fields, '[]'::jsonb)) <= 20);

-- Comment for documentation
COMMENT ON COLUMN forms.fields IS 'Array of field definitions: [{name, label, type, required, placeholder, options}]';
