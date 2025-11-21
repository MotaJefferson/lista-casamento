import crypto from 'crypto'

const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

async function setupAdmin() {
  const password = 'wedding123'
  const hash = await hashPassword(password)
  
  console.log('Admin User Setup')
  console.log('===============')
  console.log('Username: admin')
  console.log('Password: wedding123')
  console.log('Hash: ' + hash)
  console.log('\nRun this SQL command in your Supabase dashboard:')
  console.log(`
DELETE FROM admin_users WHERE username = 'admin';

INSERT INTO admin_users (username, email, password_hash) 
VALUES ('admin', 'admin@wedding.local', '${hash}');
  `)
}

setupAdmin()
