-- Create a public bucket named 'sweets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('sweets', 'sweets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Storage policies to allow anyone to read and upload images
-- (Since this is a personal app without auth yet, we allow anon access)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'sweets');

CREATE POLICY "Allow anon upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sweets');

CREATE POLICY "Allow anon update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sweets');

CREATE POLICY "Allow anon delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'sweets');
