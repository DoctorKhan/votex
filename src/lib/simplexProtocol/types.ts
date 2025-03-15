/**
 * SimpleX Protocol Types
 * Type definitions for the SimpleX protocol implementation
 */

/**
 * One-time message queue for sending or receiving votes
 */
export interface SimpleXQueue {
  id: string;
  serverUrl: string;
  encryptionKey: string;
  expiresAt: number;
  purpose: 'vote' | 'verification' | 'result';
}

/**
 * Vote payload structure before encryption
 */
export interface SimpleXVotePayload {
  voteId: string;
  proposalId: string;
  choice: number | number[]; // Single choice or ranked choices
  verificationToken: string;
  timestamp: number;
  nonce: string; // Random value to prevent replay attacks
}

/**
 * Encrypted vote package for transmission
 */
export interface EncryptedVotePacket {
  payload: string; // Base64 encoded encrypted data
  queueId: string;
  iv: string; // Initialization vector
  signature?: string;
}

/**
 * Vote verification request
 */
export interface VerificationRequest {
  token: string;
  proposalId: string;
}

/**
 * Vote verification response
 */
export interface VerificationResponse {
  verified: boolean;
  counted: boolean;
  timestamp?: number;
}

/**
 * Enhanced vote entity for storing anonymous votes
 */
export interface AnonymousVoteEntity {
  id: string;
  proposalId: string;
  verificationHash: string; // Hashed verification token, not the token itself
  choice: number | number[];
  timestamp: number;
}