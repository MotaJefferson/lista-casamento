-- Add main_page_photos column to site_config table
-- This column stores an array of photo URLs to display on the main page
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS main_page_photos JSONB DEFAULT '[]'::jsonb;

-- Note: The status, purchased_by, and purchased_at columns in gifts table
-- are no longer used by the application but remain in the schema for backward compatibility

