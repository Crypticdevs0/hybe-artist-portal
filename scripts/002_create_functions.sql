-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for profiles updated_at
drop trigger if exists profiles_updated_at on public.profiles;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

-- Function to create notification on new message
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  sender_name text;
begin
  select display_name into sender_name
  from public.profiles
  where id = new.sender_id;
  
  insert into public.notifications (user_id, type, title, content, link_url)
  values (
    new.recipient_id,
    'message',
    'New message from ' || sender_name,
    left(new.content, 100),
    '/messages'
  );
  
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;

create trigger on_message_created
  after insert on public.messages
  for each row
  execute function public.notify_new_message();

-- Function to create notification on new comment
create or replace function public.notify_new_comment()
returns trigger
language plpgsql
security definer
as $$
declare
  post_author_id uuid;
  commenter_name text;
begin
  select a.profile_id, p.display_name
  into post_author_id, commenter_name
  from public.posts po
  join public.artists a on a.id = po.artist_id
  cross join public.profiles p
  where po.id = new.post_id and p.id = new.user_id;
  
  if post_author_id != new.user_id then
    insert into public.notifications (user_id, type, title, content, link_url)
    values (
      post_author_id,
      'comment',
      commenter_name || ' commented on your post',
      left(new.content, 100),
      '/posts/' || new.post_id
    );
  end if;
  
  return new;
end;
$$;

drop trigger if exists on_comment_created on public.comments;

create trigger on_comment_created
  after insert on public.comments
  for each row
  execute function public.notify_new_comment();
