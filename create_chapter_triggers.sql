-- Add chapters_count column to mangas table
ALTER TABLE mangas ADD COLUMN IF NOT EXISTS chapters_count integer DEFAULT 0;

-- Function to handle new chapter
CREATE OR REPLACE FUNCTION handle_new_chapter()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mangas
  SET chapters_count = chapters_count + 1
  WHERE id = NEW.manga_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle deleted chapter
CREATE OR REPLACE FUNCTION handle_deleted_chapter()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mangas
  SET chapters_count = chapters_count - 1
  WHERE id = OLD.manga_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for chapters
DROP TRIGGER IF EXISTS on_chapter_added ON chapters;
CREATE TRIGGER on_chapter_added
AFTER INSERT ON chapters
FOR EACH ROW
EXECUTE PROCEDURE handle_new_chapter();

DROP TRIGGER IF EXISTS on_chapter_deleted ON chapters;
CREATE TRIGGER on_chapter_deleted
AFTER DELETE ON chapters
FOR EACH ROW
EXECUTE PROCEDURE handle_deleted_chapter();

-- Initial backfill for correct counts
UPDATE mangas m
SET chapters_count = (SELECT count(*) FROM chapters c WHERE c.manga_id = m.id);
