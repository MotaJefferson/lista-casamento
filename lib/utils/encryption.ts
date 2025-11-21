import crypto from 'crypto';

export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    const [salt, storedHash] = hash.split(':');
    if (!salt || !storedHash) {
      console.log('[v0] Invalid hash format:', hash);
      return false;
    }
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return testHash === storedHash;
  } catch (error) {
    console.error('[v0] Password verification error:', error);
    return false;
  }
};
