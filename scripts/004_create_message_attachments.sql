-- Message attachments table for storing file metadata
create table if not exists public.message_attachments (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_name text not null,
  file_size integer not null,
  file_type text not null,
  storage_path text not null unique,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.message_attachments enable row level security;

-- Message attachments policies - users can only see attachments in messages they're part of
create policy "message_attachments_select_own_messages"
  on public.message_attachments for select
  using (
    exists (
      select 1 from public.messages
      where id = message_id
      and (sender_id = auth.uid() or recipient_id = auth.uid())
    )
  );

create policy "message_attachments_insert_authenticated"
  on public.message_attachments for insert
  with check (
    exists (
      select 1 from public.messages
      where id = message_id
      and sender_id = auth.uid()
    )
  );

create policy "message_attachments_delete_own_messages"
  on public.message_attachments for delete
  using (
    exists (
      select 1 from public.messages
      where id = message_id
      and sender_id = auth.uid()
    )
  );

-- Function to delete storage files when message is deleted
create or replace function public.cleanup_message_attachments()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Mark for cleanup - in production, you'd call a cloud function to actually delete from storage
  -- For now, the storage_path is retained for reference if needed
  delete from public.message_attachments
  where message_id = old.id;
  
  return old;
end;
$$;

-- Trigger to cleanup attachments when message is deleted
drop trigger if exists on_message_deleted on public.messages;

create trigger on_message_deleted
  before delete on public.messages
  for each row
  execute function public.cleanup_message_attachments();
