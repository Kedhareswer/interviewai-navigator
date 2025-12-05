-- Add metadata fields to interviews and jobs for agent selection and difficulty override
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS difficulty_override TEXT CHECK (difficulty_override IN ('junior', 'mid', 'senior', 'staff') OR difficulty_override IS NULL);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS selected_agents JSONB DEFAULT NULL;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS preferred_agents JSONB DEFAULT NULL;

