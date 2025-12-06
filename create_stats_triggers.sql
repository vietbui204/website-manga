-- Add comments column to mangas table
ALTER TABLE mangas ADD COLUMN IF NOT EXISTS comments integer DEFAULT 0;

-- Function to handle new comment
CREATE OR REPLACE FUNCTION handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mangas
  SET comments = comments + 1
  WHERE slug = NEW.manga_slug; -- Assuming linked by slug
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle deleted comment
CREATE OR REPLACE FUNCTION handle_deleted_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mangas
  SET comments = comments - 1
  WHERE slug = OLD.manga_slug;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for comments
DROP TRIGGER IF EXISTS on_comment_added ON comments;
CREATE TRIGGER on_comment_added
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE PROCEDURE handle_new_comment();

DROP TRIGGER IF EXISTS on_comment_deleted ON comments;
CREATE TRIGGER on_comment_deleted
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE PROCEDURE handle_deleted_comment();


-- Function to handle new follow
CREATE OR REPLACE FUNCTION handle_new_follow()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mangas
  SET follows = follows + 1
  WHERE id = NEW.manga_id; -- Linked by id
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle deleted follow
CREATE OR REPLACE FUNCTION handle_deleted_follow()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mangas
  SET follows = follows - 1
  WHERE id = OLD.manga_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for follows
DROP TRIGGER IF EXISTS on_follow_added ON follows;
CREATE TRIGGER on_follow_added
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE PROCEDURE handle_new_follow();

DROP TRIGGER IF EXISTS on_follow_deleted ON follows;
CREATE TRIGGER on_follow_deleted
AFTER DELETE ON follows
FOR EACH ROW
EXECUTE PROCEDURE handle_deleted_follow();

-- Initial backfill for correct counts
UPDATE mangas m
SET 
    comments = (SELECT count(*) FROM comments c WHERE c.manga_slug = m.slug),
    follows = (SELECT count(*) FROM follows f WHERE f.manga_id = m.id);
