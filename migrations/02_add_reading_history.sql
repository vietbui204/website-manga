-- Create reading_history table
create table if not exists reading_history (
  user_id uuid references auth.users not null,
  manga_id uuid references mangas not null,
  last_read_at timestamptz default now(),
  primary key (user_id, manga_id)
);

-- Enable RLS
alter table reading_history enable row level security;

-- Policy: Users can view their own history
create policy "Users can view own history" 
  on reading_history for select 
  using (auth.uid() = user_id);

-- Policy: Users can insert/update their own history
create policy "Users can insert own history" 
  on reading_history for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own history" 
  on reading_history for update
  using (auth.uid() = user_id);
