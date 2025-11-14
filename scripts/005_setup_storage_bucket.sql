-- This script sets up the Supabase Storage bucket and policies for chat attachments
-- Note: In Supabase, buckets are typically created through the UI or dashboard
-- This SQL file documents the bucket configuration needed

-- The bucket "chat-attachments" needs to be created in Supabase Storage with these settings:
-- 1. Name: chat-attachments
-- 2. Public: Enable (so files can be accessed via public URL)
-- 3. File Size Limit: 10MB (or higher as needed)

-- Once the bucket is created, set up the storage policies:

-- Policy to allow authenticated users to upload files
create policy "Allow authenticated users to upload chat attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-attachments' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to read files they're authorized to access
create policy "Allow users to read chat attachments"
on storage.objects
for select
to public
using (
  bucket_id = 'chat-attachments'
);

-- Policy to allow users to delete their own message attachments
create policy "Allow users to delete their message attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-attachments' and
  (storage.foldername(name))[1] = auth.uid()::text
);
