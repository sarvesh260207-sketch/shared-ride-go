CREATE POLICY "Users can view their own presentation"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-presentations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload their own presentation"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-presentations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can replace their own presentation"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-presentations'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-presentations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can remove their own presentation"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-presentations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);