-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text not null,
  role text not null default 'member' check (role in ('member', 'artist', 'admin')),
  avatar_url text,
  bio text,
  subscription_tier text not null default 'basic' check (subscription_tier in ('basic', 'premium', 'vip')),
  subscription_expiry timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Artists table
create table if not exists public.artists (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  stage_name text not null unique,
  description text,
  banner_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Messages table (one-to-one messaging between members and artists)
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Content posts table (artist updates, announcements)
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  content text not null,
  media_url text,
  visibility text not null default 'all' check (visibility in ('all', 'premium', 'vip')),
  created_at timestamptz default now()
);

-- Comments table
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Likes table
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('message', 'comment', 'like', 'new_post', 'system')),
  title text not null,
  content text,
  link_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.messages enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Artists policies
create policy "artists_select_all"
  on public.artists for select
  using (is_active = true);

create policy "artists_insert_own"
  on public.artists for insert
  with check (auth.uid() = profile_id);

create policy "artists_update_own"
  on public.artists for update
  using (auth.uid() = profile_id);

-- Messages policies
create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages_insert_authenticated"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "messages_update_own"
  on public.messages for update
  using (auth.uid() = recipient_id);

-- Posts policies
create policy "posts_select_by_subscription"
  on public.posts for select
  using (
    visibility = 'all' or 
    (visibility = 'premium' and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and subscription_tier in ('premium', 'vip')
    )) or
    (visibility = 'vip' and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and subscription_tier = 'vip'
    ))
  );

create policy "posts_insert_artist"
  on public.posts for insert
  with check (exists (
    select 1 from public.artists 
    where id = artist_id 
    and profile_id = auth.uid()
  ));

create policy "posts_update_artist"
  on public.posts for update
  using (exists (
    select 1 from public.artists 
    where id = artist_id 
    and profile_id = auth.uid()
  ));

create policy "posts_delete_artist"
  on public.posts for delete
  using (exists (
    select 1 from public.artists 
    where id = artist_id 
    and profile_id = auth.uid()
  ));

-- Comments policies
create policy "comments_select_all"
  on public.comments for select
  using (true);

create policy "comments_insert_authenticated"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "comments_update_own"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Likes policies
create policy "likes_select_all"
  on public.likes for select
  using (true);

create policy "likes_insert_authenticated"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "likes_delete_own"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Notifications policies
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);
