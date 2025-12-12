-- Add updated_at column to mangas
ALTER TABLE mangas ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for mangas (on edit)
DROP TRIGGER IF EXISTS update_mangas_timestamp ON mangas;
CREATE TRIGGER update_mangas_timestamp
BEFORE UPDATE ON mangas
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Function to touch parent manga updated_at
CREATE OR REPLACE FUNCTION touch_manga_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mangas SET updated_at = now() WHERE id = NEW.manga_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chapters (on insert/delete) - updates parent manga
DROP TRIGGER IF EXISTS on_chapter_change_touch_manga ON chapters;
CREATE TRIGGER on_chapter_change_touch_manga
AFTER INSERT OR DELETE ON chapters
FOR EACH ROW
EXECUTE PROCEDURE touch_manga_updated_at();
