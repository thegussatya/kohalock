import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives a 32-byte key from a PIN (string) using PBKDF2.
 */
function deriveKey(pin: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(pin, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts a private key using a PIN.
 * Returns a string in the format: salt:iv:authTag:ciphertext (base64 encoded parts)
 */
export function encryptPrivateKey(privateKey: string, pin: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const key = deriveKey(pin, salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted
  ].join(':');
}

/**
 * Decrypts an encrypted private key string using a PIN.
 * Throws if the PIN is incorrect or data is corrupted.
 */
export function decryptPrivateKey(encryptedString: string, pin: string): string {
  const parts = encryptedString.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted string format');
  }

  const salt = Buffer.from(parts[0] as string, 'base64');
  const iv = Buffer.from(parts[1] as string, 'base64');
  const authTag = Buffer.from(parts[2] as string, 'base64');
  const ciphertext = parts[3] as string;

  const key = deriveKey(pin, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
