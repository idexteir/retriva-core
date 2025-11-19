-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC,
  category TEXT NOT NULL,
  area TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name) VALUES 
  ('Resort'),
  ('Chalet'),
  ('Apartment'),
  ('Villa'),
  ('Hotel')
ON CONFLICT (name) DO NOTHING;

-- Insert sample areas
INSERT INTO areas (name) VALUES 
  ('Riyadh'),
  ('Jeddah'),
  ('Dammam'),
  ('Mecca'),
  ('Medina'),
  ('Khobar')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Public access policies for Stage 1
CREATE POLICY "Public read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Public insert properties" ON properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update properties" ON properties FOR UPDATE USING (true);
CREATE POLICY "Public delete properties" ON properties FOR DELETE USING (true);

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read areas" ON areas FOR SELECT USING (true);

-- Add thumbnail_index column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS thumbnail_index INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN properties.thumbnail_index IS 'Index of the image to use as thumbnail (0-based)';

-- Add videos column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN properties.videos IS 'Array of video URIs for the property';
