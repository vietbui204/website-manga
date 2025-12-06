-- Add views column to mangas table
ALTER TABLE mangas 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Function to safely increment views
-- accessible via RPC
create or replace function increment_view(manga_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update mangas
  set views = views + 1
  where id = manga_id;
end;
$$;
