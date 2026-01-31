-- Enhance materials table for versioning and themes

-- Add new columns with defaults to avoid null issues
ALTER TABLE materials ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'GERAL';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true;

-- Update existing materials (if any) to have defaults
UPDATE materials SET 
  version = '1.0',
  theme = 'GERAL',
  is_latest = true
WHERE version IS NULL;

-- Create index for filtering by theme and type
CREATE INDEX IF NOT EXISTS idx_materials_theme ON materials(theme);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
