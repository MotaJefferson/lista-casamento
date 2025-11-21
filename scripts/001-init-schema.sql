-- Create gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'purchased')),
  purchased_by VARCHAR(255),
  purchased_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  guest_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_id VARCHAR(255) UNIQUE,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create guest_sessions table (for OTP authentication)
CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create site_config table (singleton pattern)
CREATE TABLE IF NOT EXISTS site_config (
  id INT PRIMARY KEY DEFAULT 1,
  couple_name VARCHAR(255),
  wedding_date DATE,
  venue_name VARCHAR(255),
  venue_address TEXT,
  venue_latitude DECIMAL(10,8),
  venue_longitude DECIMAL(11,8),
  mercadopago_access_token TEXT,
  notification_email VARCHAR(255),
  smtp_host VARCHAR(255),
  smtp_port INT,
  smtp_user VARCHAR(255),
  smtp_password TEXT,
  primary_color VARCHAR(7) DEFAULT '#e91e63',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON gifts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_guest_email ON purchases(guest_email);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_email ON guest_sessions(email);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires_at ON guest_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gifts (public read, admin write)
CREATE POLICY "Public can read gifts" ON gifts FOR SELECT USING (true);
CREATE POLICY "Anyone can create gifts" ON gifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gifts" ON gifts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete gifts" ON gifts FOR DELETE USING (true);

-- RLS Policies for purchases (public can see all, admins can manage)
CREATE POLICY "Anyone can create purchase" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Admins can update purchases" ON purchases FOR UPDATE USING (true);
CREATE POLICY "Admins can delete purchases" ON purchases FOR DELETE USING (true);

-- RLS Policies for site_config (public read, admin write)
CREATE POLICY "Public can read config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Admins can update config" ON site_config FOR UPDATE USING (true);

-- Insert default config
INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
