import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Hash function matching lib/utils/encryption.ts
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function setupAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[v0] Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const username = 'admin';
  const password = 'wedding123';
  const email = 'admin@wedding-registry.local';

  const passwordHash = hashPassword(password);

  console.log('[v0] Creating admin user with hash:', passwordHash);

  const { data, error } = await supabase
    .from('admin_users')
    .upsert(
      [
        {
          username,
          password_hash: passwordHash,
          email,
        },
      ],
      { onConflict: 'username' }
    )
    .select();

  if (error) {
    console.error('[v0] Error creating admin user:', error);
    process.exit(1);
  }

  console.log('[v0] Admin user created successfully:', data);
  console.log(`[v0] Login with username: ${username}`);
  console.log(`[v0] Login with password: ${password}`);
}

setupAdmin().catch(console.error);
