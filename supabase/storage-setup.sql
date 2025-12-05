-- Storage buckets for artifacts
-- Run this in Supabase SQL editor after creating the buckets in the dashboard

-- Jobs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('jobs', 'jobs', false)
ON CONFLICT (id) DO NOTHING;

-- Candidates bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidates', 'candidates', false)
ON CONFLICT (id) DO NOTHING;

-- Interviews bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('interviews', 'interviews', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload job files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'jobs' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can read job files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'jobs' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload candidate files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'candidates' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can read candidate files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'candidates' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload interview files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'interviews' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can read interview files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'interviews' AND
    auth.role() = 'authenticated'
  );


