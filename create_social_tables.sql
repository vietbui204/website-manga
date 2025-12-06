-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  manga_slug text REFERENCES mangas(slug) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  manga_id uuid REFERENCES mangas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, manga_id)
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Public comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for follows
CREATE POLICY "Users can view their own follows" ON follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own follows" ON follows FOR DELETE USING (auth.uid() = user_id);
