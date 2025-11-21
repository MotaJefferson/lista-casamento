import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function setupAdmin() {
  console.log('[v0] Starting admin setup...');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[v0] Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const password = 'wedding123';
  const passwordHash = await hashPassword(password);

  console.log('[v0] Generated password hash:', passwordHash);

  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      username: 'admin',
      email: 'admin@wedding-registry.local',
      password_hash: passwordHash,
    })
    .select();

  if (error) {
    console.error('[v0] Error creating admin user:', error);
    process.exit(1);
  }

  console.log('[v0] Admin user created successfully');
  console.log('[v0] Username: admin');
  console.log('[v0] Password: wedding123');
  console.log('[v0] User data:', data);
}

setupAdmin();
