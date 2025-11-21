-- Add guest_name column to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255);

-- Add more configuration fields to site_config
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS footer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS footer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS footer_text TEXT,
ADD COLUMN IF NOT EXISTS ceremony_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS reception_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS dress_code TEXT;

