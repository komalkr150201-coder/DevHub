import crypto from 'crypto';
import { Octokit } from '@octokit/rest';
import { config } from './env.js';

const ALGORITHM = 'aes-256-cbc';
// Ensure key is 32 bytes
const getKey = () => {
  const hash = crypto.createHash('sha256');
  hash.update(config.encryptionKey);
  return hash.digest();
};

/**
 * Encrypt a string using AES-256-CBC
 */
export const encryptToken = (plainText) => {
  if (!plainText) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt an AES-256-CBC encrypted string
 */
export const decryptToken = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const [ivHex, cipherText] = encryptedText.split(':');
    if (!ivHex || !cipherText) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return null;
  }
};

/**
 * Get an Octokit instance for an encrypted user access token
 */
export const getOctokitForUser = (encryptedToken) => {
  const token = decryptToken(encryptedToken);
  if (!token) {
    throw new Error('Invalid or unreadable GitHub access token');
  }
  return new Octokit({ auth: token });
};
