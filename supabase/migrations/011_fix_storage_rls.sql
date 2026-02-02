-- Allow authenticated users to upload files to 'certificates' bucket
-- Required because creating an admin policy on storage.objects enables RLS, blocking everyone else by default.

CREATE POLICY "Users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'certificates' );

-- Allow users to update their own files (if they retry upload)
CREATE POLICY "Users can update own certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'certificates' AND owner = auth.uid() )
WITH CHECK ( bucket_id = 'certificates' AND owner = auth.uid() );

-- Allow users to view their own uploaded files (for context)
CREATE POLICY "Users can view own certificates"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'certificates' AND owner = auth.uid() );
