-- Note: This seed data can only be inserted after users are created via Supabase auth
-- For demo purposes, we'll create sample artists that can be linked to real users later

-- Insert some sample data (will need real user IDs from auth.users)
insert into public.artists (id, stage_name, description, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Artist Demo', 'This is a demo artist profile. Link this to a real user after signup.', true)
on conflict do nothing;

-- Sample post (will need real artist_id)
insert into public.posts (artist_id, title, content, visibility) values
  ('11111111-1111-1111-1111-111111111111', 'Welcome to HYBE Artist Portal', 'Thank you for joining! Stay tuned for exclusive content and updates.', 'all')
on conflict do nothing;
