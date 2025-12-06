-- Insert Genres
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
ON CONFLICT (slug) DO NOTHING;

-- Link Genres to Absolute Duo (assuming ID or finding it)
-- First, finding ID of Absolute Duo
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
    INSERT INTO manga_genres (manga_id, genre_id) VALUES 
    (m_id, g_action),
    (m_id, g_romance),
    (m_id, g_school)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
