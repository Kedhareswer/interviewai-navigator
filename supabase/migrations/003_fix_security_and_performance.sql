-- Fix Security and Performance Issues
-- Based on Supabase Advisor recommendations

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_embeddings ENABLE ROW LEVEL SECURITY;

-- 2. Fix function search_path for security
-- Drop and recreate functions with secure search_path

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
DROP TRIGGER IF EXISTS update_evaluations_updated_at ON evaluations;
DROP TRIGGER IF EXISTS update_hr_config_updated_at ON hr_config;

DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_config_updated_at BEFORE UPDATE ON hr_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fix match_candidate_embeddings function search_path
DROP FUNCTION IF EXISTS match_candidate_embeddings(UUID, vector, float, int);

CREATE OR REPLACE FUNCTION match_candidate_embeddings(
  candidate_id UUID,
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  source TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    candidate_embeddings.id,
    candidate_embeddings.chunk_text,
    candidate_embeddings.source,
    candidate_embeddings.metadata,
    1 - (candidate_embeddings.embedding <=> query_embedding) as similarity
  FROM candidate_embeddings
  WHERE candidate_embeddings.candidate_id = match_candidate_embeddings.candidate_id
    AND candidate_embeddings.embedding IS NOT NULL
    AND 1 - (candidate_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY candidate_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. Add missing index on created_by foreign key
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);

-- 4. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_interviews_job_candidate ON interviews(job_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status_created ON interviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_events_interview_type ON interview_events(interview_id, type);
CREATE INDEX IF NOT EXISTS idx_candidate_embeddings_candidate_source ON candidate_embeddings(candidate_id, source);

-- 5. Drop and recreate RLS policies with proper security
-- Jobs policies
DROP POLICY IF EXISTS "Users can view all jobs" ON jobs;
DROP POLICY IF EXISTS "Users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;

CREATE POLICY "authenticated_users_can_view_jobs" ON jobs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_create_jobs" ON jobs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND (created_by IS NULL OR created_by = auth.uid()));

CREATE POLICY "users_can_update_own_jobs" ON jobs
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND (created_by = auth.uid() OR created_by IS NULL))
  WITH CHECK (auth.role() = 'authenticated' AND (created_by = auth.uid() OR created_by IS NULL));

CREATE POLICY "users_can_delete_own_jobs" ON jobs
  FOR DELETE
  USING (auth.role() = 'authenticated' AND (created_by = auth.uid() OR created_by IS NULL));

-- Candidates policies
DROP POLICY IF EXISTS "Users can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Users can create candidates" ON candidates;
DROP POLICY IF EXISTS "Users can update candidates" ON candidates;
DROP POLICY IF EXISTS "Users can delete candidates" ON candidates;

CREATE POLICY "authenticated_users_can_view_candidates" ON candidates
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_create_candidates" ON candidates
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_update_candidates" ON candidates
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_delete_candidates" ON candidates
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Interviews policies
DROP POLICY IF EXISTS "Users can view all interviews" ON interviews;
DROP POLICY IF EXISTS "Users can create interviews" ON interviews;
DROP POLICY IF EXISTS "Users can update interviews" ON interviews;
DROP POLICY IF EXISTS "Users can delete interviews" ON interviews;

CREATE POLICY "authenticated_users_can_view_interviews" ON interviews
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_create_interviews" ON interviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_update_interviews" ON interviews
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_delete_interviews" ON interviews
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Interview events policies
DROP POLICY IF EXISTS "Users can view all interview events" ON interview_events;
DROP POLICY IF EXISTS "Users can create interview events" ON interview_events;
DROP POLICY IF EXISTS "Users can update interview events" ON interview_events;
DROP POLICY IF EXISTS "Users can delete interview events" ON interview_events;

CREATE POLICY "authenticated_users_can_view_interview_events" ON interview_events
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_events.interview_id
    )
  );

CREATE POLICY "authenticated_users_can_create_interview_events" ON interview_events
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_events.interview_id
    )
  );

CREATE POLICY "authenticated_users_can_update_interview_events" ON interview_events
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_events.interview_id
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_events.interview_id
    )
  );

CREATE POLICY "authenticated_users_can_delete_interview_events" ON interview_events
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_events.interview_id
    )
  );

-- Evaluations policies
DROP POLICY IF EXISTS "Users can view all evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can create evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can update evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can delete evaluations" ON evaluations;

CREATE POLICY "authenticated_users_can_view_evaluations" ON evaluations
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
    )
  );

CREATE POLICY "authenticated_users_can_create_evaluations" ON evaluations
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
    )
  );

CREATE POLICY "authenticated_users_can_update_evaluations" ON evaluations
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
    )
  );

CREATE POLICY "authenticated_users_can_delete_evaluations" ON evaluations
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
    )
  );

-- HR Config policies
DROP POLICY IF EXISTS "Users can view hr config" ON hr_config;
DROP POLICY IF EXISTS "Users can manage hr config" ON hr_config;

CREATE POLICY "authenticated_users_can_view_hr_config" ON hr_config
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_insert_hr_config" ON hr_config
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_update_hr_config" ON hr_config
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_delete_hr_config" ON hr_config
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Candidate embeddings policies
DROP POLICY IF EXISTS "Users can view candidate embeddings" ON candidate_embeddings;
DROP POLICY IF EXISTS "Users can create candidate embeddings" ON candidate_embeddings;
DROP POLICY IF EXISTS "Users can update candidate embeddings" ON candidate_embeddings;
DROP POLICY IF EXISTS "Users can delete candidate embeddings" ON candidate_embeddings;

CREATE POLICY "authenticated_users_can_view_candidate_embeddings" ON candidate_embeddings
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_embeddings.candidate_id
    )
  );

CREATE POLICY "authenticated_users_can_create_candidate_embeddings" ON candidate_embeddings
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_embeddings.candidate_id
    )
  );

CREATE POLICY "authenticated_users_can_update_candidate_embeddings" ON candidate_embeddings
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_embeddings.candidate_id
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_embeddings.candidate_id
    )
  );

CREATE POLICY "authenticated_users_can_delete_candidate_embeddings" ON candidate_embeddings
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_embeddings.candidate_id
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION match_candidate_embeddings TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column TO authenticated;

