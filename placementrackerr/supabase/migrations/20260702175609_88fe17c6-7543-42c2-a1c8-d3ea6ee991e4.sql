
-- Lock down SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Storage RLS for resumes bucket (per-user folder: <user_id>/filename)
CREATE POLICY "Users read own resume files" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own resume files" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own resume files" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own resume files" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
