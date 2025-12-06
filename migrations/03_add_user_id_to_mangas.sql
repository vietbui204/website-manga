-- Add user_id column to mangas table
ALTER TABLE mangas 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Optional: Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_mangas_user_id ON mangas(user_id);
