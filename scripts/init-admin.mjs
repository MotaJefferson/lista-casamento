import crypto from 'crypto';

// Generate password hash using the same algorithm as encryption.ts
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const password = 'wedding123';
const hash = hashPassword(password);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('ADMIN USER SETUP');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Run this SQL in your Supabase SQL Editor:\n');
console.log('───────────────────────────────────────────────────────────────');
console.log(`DELETE FROM admin_users WHERE username = 'admin';`);
console.log(`INSERT INTO admin_users (username, email, password_hash, created_at, updated_at)`);
console.log(`VALUES ('admin', 'admin@wedding.local', '${hash}', NOW(), NOW());`);
console.log('───────────────────────────────────────────────────────────────\n');

console.log('Admin Credentials:');
console.log(`  Username: admin`);
console.log(`  Password: ${password}\n`);

console.log('═══════════════════════════════════════════════════════════════\n');
