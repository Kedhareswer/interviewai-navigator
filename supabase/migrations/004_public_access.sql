-- Allow anon role to access core tables for unauthenticated marketing site flows
ALTER POLICY authenticated_users_can_view_jobs ON jobs
  USING (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_create_jobs ON jobs
  WITH CHECK (auth.role() IN ('authenticated','service_role','anon') AND (created_by IS NULL OR created_by = auth.uid()));

ALTER POLICY users_can_update_own_jobs ON jobs
  USING (auth.role() IN ('authenticated','service_role','anon') AND (created_by = auth.uid() OR created_by IS NULL))
  WITH CHECK (auth.role() IN ('authenticated','service_role','anon') AND (created_by = auth.uid() OR created_by IS NULL));

ALTER POLICY users_can_delete_own_jobs ON jobs
  USING (auth.role() IN ('authenticated','service_role','anon') AND (created_by = auth.uid() OR created_by IS NULL));

ALTER POLICY authenticated_users_can_view_candidates ON candidates
  USING (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_create_candidates ON candidates
  WITH CHECK (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_update_candidates ON candidates
  USING (auth.role() IN ('authenticated','service_role','anon'))
  WITH CHECK (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_delete_candidates ON candidates
  USING (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_view_interviews ON interviews
  USING (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_create_interviews ON interviews
  WITH CHECK (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_update_interviews ON interviews
  USING (auth.role() IN ('authenticated','service_role','anon'))
  WITH CHECK (auth.role() IN ('authenticated','service_role','anon'));

ALTER POLICY authenticated_users_can_delete_interviews ON interviews
  USING (auth.role() IN ('authenticated','service_role','anon'));