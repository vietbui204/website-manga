-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('manga-images', 'manga-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of files in this bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'manga-images' );

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'manga-images' );

-- Policy to allow users to update their own files (optional, but good)
-- Note: 'owner' column in storage.objects tracks the user ID automatically
CREATE POLICY "User Update Own File" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'manga-images' AND auth.uid() = owner );

CREATE POLICY "User Delete Own File" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'manga-images' AND auth.uid() = owner );
