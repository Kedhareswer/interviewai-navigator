-- User roles and profile management
DO 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('hr', 'candidate');
  END IF;
END ;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'candidate',
  full_name TEXT,
  company TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS 
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS 
DECLARE
  user_role_value user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidate');
BEGIN
  INSERT INTO profiles (id, role, full_name, company, resume_url)
  VALUES (
    NEW.id,
    user_role_value,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'resume_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_hr()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS 
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hr'
  );
;

CREATE OR REPLACE FUNCTION public.is_candidate()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS 
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'candidate'
  );
;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_can_view_own_profile ON profiles;
DROP POLICY IF EXISTS hr_can_view_profiles ON profiles;
DROP POLICY IF EXISTS users_can_update_own_profile ON profiles;

CREATE POLICY users_can_view_own_profile ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY hr_can_view_profiles ON profiles
  FOR SELECT USING (is_hr());

CREATE POLICY users_can_update_own_profile ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS scheduled_by UUID REFERENCES auth.users(id);

-- Reset jobs policies
DROP POLICY IF EXISTS authenticated_users_can_view_jobs ON jobs;
DROP POLICY IF EXISTS authenticated_users_can_create_jobs ON jobs;
DROP POLICY IF EXISTS users_can_update_own_jobs ON jobs;
DROP POLICY IF EXISTS users_can_delete_own_jobs ON jobs;

CREATE POLICY jobs_select_visible ON jobs
  FOR SELECT USING (is_hr() OR is_candidate());

CREATE POLICY jobs_insert_hr ON jobs
  FOR INSERT WITH CHECK (is_hr());

CREATE POLICY jobs_update_hr ON jobs
  FOR UPDATE USING (is_hr() AND (created_by = auth.uid() OR created_by IS NULL))
  WITH CHECK (is_hr() AND (created_by = auth.uid() OR created_by IS NULL));

CREATE POLICY jobs_delete_hr ON jobs
  FOR DELETE USING (is_hr() AND (created_by = auth.uid() OR created_by IS NULL));

-- Reset candidate policies
DROP POLICY IF EXISTS authenticated_users_can_view_candidates ON candidates;
DROP POLICY IF EXISTS authenticated_users_can_create_candidates ON candidates;
DROP POLICY IF EXISTS authenticated_users_can_update_candidates ON candidates;
DROP POLICY IF EXISTS authenticated_users_can_delete_candidates ON candidates;

CREATE POLICY candidates_select_hr ON candidates
  FOR SELECT USING (is_hr());

CREATE POLICY candidates_select_self ON candidates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY candidates_insert_hr ON candidates
  FOR INSERT WITH CHECK (is_hr());

CREATE POLICY candidates_insert_self ON candidates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY candidates_update_hr ON candidates
  FOR UPDATE USING (is_hr()) WITH CHECK (is_hr());

CREATE POLICY candidates_update_self ON candidates
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY candidates_delete_hr ON candidates
  FOR DELETE USING (is_hr());

-- Reset interview policies
DROP POLICY IF EXISTS authenticated_users_can_view_interviews ON interviews;
DROP POLICY IF EXISTS authenticated_users_can_create_interviews ON interviews;
DROP POLICY IF EXISTS authenticated_users_can_update_interviews ON interviews;
DROP POLICY IF EXISTS authenticated_users_can_delete_interviews ON interviews;

CREATE POLICY interviews_select_hr ON interviews
  FOR SELECT USING (is_hr());

CREATE POLICY interviews_select_candidate ON interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = interviews.candidate_id
        AND candidates.user_id = auth.uid()
    )
  );

CREATE POLICY interviews_insert_hr ON interviews
  FOR INSERT WITH CHECK (is_hr());

CREATE POLICY interviews_update_hr ON interviews
  FOR UPDATE USING (is_hr()) WITH CHECK (is_hr());

CREATE POLICY interviews_delete_hr ON interviews
  FOR DELETE USING (is_hr());