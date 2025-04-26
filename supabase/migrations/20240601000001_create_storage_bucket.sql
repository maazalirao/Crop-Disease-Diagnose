-- Create a storage bucket for plant images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-images', 'plant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow public access to plant images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'plant-images');

-- Allow authenticated users to upload images
CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'plant-images');

-- Allow users to update and delete their own images
CREATE POLICY "Allow Updates" ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'plant-images');

CREATE POLICY "Allow Deletes" ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'plant-images');
