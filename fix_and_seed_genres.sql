-- Ensure tables exist
CREATE TABLE IF NOT EXISTS genres (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add slug column if it doesn't exist (Fix for existing table)
ALTER TABLE genres ADD COLUMN IF NOT EXISTS slug text;
-- Add unique constraint if not exists (handling gracefully is complex in pure SQL without PL/pgSQL, but we can try adding unique index)
CREATE UNIQUE INDEX IF NOT EXISTS genres_slug_idx ON genres (slug);

CREATE TABLE IF NOT EXISTS manga_genres (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  manga_id uuid REFERENCES mangas(id) ON DELETE CASCADE,
  genre_id uuid REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE(manga_id, genre_id)
);

-- Insert Genres (Upsert)
INSERT INTO genres (name, slug) VALUES 
('Action', 'action'),
('Adventure', 'adventure'),
('Comedy', 'comedy'),
('Drama', 'drama'),
('Fantasy', 'fantasy'),
('Romance', 'romance'),
('School Life', 'school-life'),
('Slice of Life', 'slice-of-life'),
('Shoujo', 'shoujo'),
('Shounen', 'shounen')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Link Genres to "Absolute Duo" (Find ID by slug)
DO $$
DECLARE
  m_id uuid;
  g_action uuid;
  g_romance uuid;
  g_school uuid;
BEGIN
  SELECT id INTO m_id FROM mangas WHERE slug = 'absolute-duo' LIMIT 1;
  SELECT id INTO g_action FROM genres WHERE slug = 'action' LIMIT 1;
  SELECT id INTO g_romance FROM genres WHERE slug = 'romance' LIMIT 1;
  SELECT id INTO g_school FROM genres WHERE slug = 'school-life' LIMIT 1;

  IF m_id IS NOT NULL THEN
    -- Clear existing for this manga to avoid duplicates if partial
    DELETE FROM manga_genres WHERE manga_id = m_id;
    
    INSERT INTO manga_genres (manga_id, genre_id) VALUES 
    (m_id, g_action),
    (m_id, g_romance),
    (m_id, g_school);
  END IF;
END $$;
