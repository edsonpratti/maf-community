-- Create Post Categories functionality

-- Add category column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'GERAL' 
  CHECK (category IN ('GERAL', 'RESULTADOS', 'DUVIDAS', 'IDEIAS', 'MATERIAIS', 'AVISOS_OFICIAIS'));

-- Add pinned boolean to posts for Official Announcements
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;

-- Create index for filtering by category
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
