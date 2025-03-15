/**
 * SimpleX Protocol Cryptographic Utilities
 * Handles encryption, decryption, and verification of SimpleX messages
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv, createHmac } from 'crypto';

/**
 * Generate a random verification token for vote verification
 * @returns A random hex string to use as verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Encrypt a data payload with AES-256-GCM
 * @param data The data to encrypt (as string)
 * @param key The encryption key (hex string)
 * @returns Object containing the encrypted data and IV
 */
export function encryptPayload(data: string, key: string): { encryptedData: string, iv: string } {
  // Convert the hex key to Buffer
  const keyBuffer = Buffer.from(key, 'hex');
  
  // Generate a random IV
  const iv = randomBytes(16);
  
  // Create cipher with AES-256-GCM
  const cipher = createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the auth tag
  const authTag = cipher.getAuthTag();
  
  // Concatenate the auth tag to the encrypted data
  const encryptedWithTag = Buffer.concat([
    Buffer.from(encrypted, 'base64'),
    authTag
  ]).toString('base64');
  
  return {
    encryptedData: encryptedWithTag,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt a data payload with AES-256-GCM
 * @param encryptedData The encrypted data (base64 string)
 * @param key The encryption key (hex string)
 * @param ivHex The IV used for encryption (hex string)
 * @returns The decrypted data as a string
 */
export function decryptPayload(encryptedData: string, key: string, ivHex: string): string {
  try {
    // Convert the hex key to Buffer
    const keyBuffer = Buffer.from(key, 'hex');
    
    // Convert the hex IV to Buffer
    const iv = Buffer.from(ivHex, 'hex');
    
    // Convert the base64 encrypted data to Buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    
    // Extract the auth tag (last 16 bytes)
    const authTag = encryptedBuffer.slice(encryptedBuffer.length - 16);
    const encryptedContent = encryptedBuffer.slice(0, encryptedBuffer.length - 16);
    
    // Create decipher with AES-256-GCM
    const decipher = createDecipheriv('aes-256-gcm', keyBuffer, iv);
    
    // Set the auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedContent);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Error decrypting payload:', error);
    throw new Error('Failed to decrypt payload. Data may be corrupted or tampered with.');
  }
}

/**
 * Generate a signature for data integrity
 * @param data The data to sign
 * @param key The key to use for signing
 * @returns The signature as a hex string
 */
export function generateSignature(data: string, key: string): string {
  return createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Verify a signature for data integrity
 * @param data The data that was signed
 * @param signature The signature to verify
 * @param key The key used for signing
 * @returns Boolean indicating if the signature is valid
 */
export function verifySignature(data: string, signature: string, key: string): boolean {
  const computedSignature = createHmac('sha256', key).update(data).digest('hex');
  return computedSignature === signature;
}

/**
 * Hash a verification token for secure storage
 * @param token The verification token to hash
 * @returns The hash as a hex string
 */
export function hashVerificationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a random encryption key
 * @returns A random encryption key as a hex string
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate a blind token for anonymous authentication
 * This uses a simplified blinding scheme - not for production use
 * @param userId The user ID to blind
 * @param electionId The election ID to include in the token
 * @param blindingFactor Optional blinding factor, generated randomly if not provided
 * @returns The blinded token as a hex string
 */
export function generateBlindToken(
  userId: string, 
  electionId: string, 
  blindingFactor?: Buffer
): { token: string, blindingFactor: Buffer } {
  // Create a blinding factor if not provided
  const bf = blindingFactor || randomBytes(32);
  
  // Hash the user ID with the election ID
  const userHash = createHash('sha256')
    .update(`${userId}:${electionId}`)
    .digest();
  
  // Apply the blinding factor (simplified blinding)
  const result = Buffer.alloc(userHash.length);
  for (let i = 0; i < userHash.length; i++) {
    result[i] = userHash[i] ^ bf[i % bf.length];
  }
  
  return {
    token: result.toString('hex'),
    blindingFactor: bf
  };
}