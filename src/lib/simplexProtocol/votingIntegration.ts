/**
 * SimpleX Protocol Voting Integration
 * Integrates the SimpleX protocol with the existing voting system
 */

import {
  SimpleXAdapter,
  SimpleXVotePayload,
  createDefaultAdapter,
  hashVerificationToken
} from './index';

/**
 * Represents a vote cast using the SimpleX protocol
 */
export interface SimpleXVote {
  proposalId: string;
  choice: number | number[];
  verificationToken: string;
}

/**
 * SimpleX Voting Service
 * Provides methods for casting and verifying votes using the SimpleX protocol
 */
export class SimpleXVotingService {
  private adapter: SimpleXAdapter;
  private tokens: Map<string, string> = new Map();
  
  /**
   * Create a new SimpleX voting service
   * @param adapter The SimpleX adapter to use (optional, creates a default one if not provided)
   */
  constructor(adapter?: SimpleXAdapter) {
    this.adapter = adapter || createDefaultAdapter();
  }
  
  /**
   * Initialize the service
   * @returns Promise that resolves when initialized
   */
  async initialize(): Promise<boolean> {
    try {
      // Connect to the SimpleX server
      return await this.adapter.connect();
    } catch (error) {
      console.error('Error initializing SimpleX voting service:', error);
      return false;
    }
  }
  
  /**
   * Cast a vote using the SimpleX protocol
   * @param proposalId The ID of the proposal to vote on
   * @param choice The voting choice(s)
   * @returns Promise that resolves with the verification token
   */
  async castVote(
    proposalId: string, 
    choice: number | number[]
  ): Promise<SimpleXVote> {
    try {
      // Create a new voting queue
      const queue = await this.adapter.createVotingQueue();
      
      // Generate a verification token
      const verificationToken = this.adapter.generateVoteVerificationToken();
      
      // Create the vote payload
      const vote: SimpleXVotePayload = {
        voteId: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        proposalId,
        choice,
        verificationToken,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2, 15)
      };
      
      // Send the vote
      await this.adapter.sendVote(queue, vote);
      
      // Store the verification token for later use
      this.storeVerificationToken(proposalId, verificationToken);
      
      return {
        proposalId,
        choice,
        verificationToken
      };
    } catch (error) {
      console.error('Error casting vote via SimpleX:', error);
      throw new Error('Failed to cast vote via SimpleX protocol');
    }
  }
  
  /**
   * Verify a vote
   * @param proposalId The ID of the proposal voted on
   * @param verificationToken The verification token to verify
   * @returns Promise that resolves with the verification result
   */
  async verifyVote(
    proposalId: string, 
    verificationToken: string
  ): Promise<boolean> {
    try {
      const response = await this.adapter.verifyVote(verificationToken, proposalId);
      return response.verified;
    } catch (error) {
      console.error('Error verifying vote via SimpleX:', error);
      return false;
    }
  }
  
  /**
   * Store a verification token for later use
   * @param proposalId The ID of the proposal voted on
   * @param token The verification token to store
   */
  private storeVerificationToken(proposalId: string, token: string): void {
    // Store the token in memory
    this.tokens.set(proposalId, token);
    
    // Hash the token for more secure storage in localStorage
    const hashedToken = hashVerificationToken(token);
    
    // Store the mapping from hashed token to actual token in memory only
    // Store only the hashed token in localStorage for persistence
    try {
      const existingTokens = JSON.parse(localStorage.getItem('simplex_verification_tokens') || '{}');
      existingTokens[proposalId] = {
        hashed: hashedToken,
        timestamp: Date.now()
      };
      localStorage.setItem('simplex_verification_tokens', JSON.stringify(existingTokens));
    } catch (error) {
      console.error('Error storing verification token:', error);
    }
  }
  
  /**
   * Get a stored verification token
   * @param proposalId The ID of the proposal
   * @returns The stored verification token, or null if not found
   */
  getStoredVerificationToken(proposalId: string): string | null {
    // First check in-memory map which contains the actual tokens
    const token = this.tokens.get(proposalId);
    if (token) return token;
    
    // If not in memory, we can't retrieve the actual token as we only store hashed versions
    // in localStorage for security. Return null and inform of this security measure.
    try {
      const storedTokens = JSON.parse(localStorage.getItem('simplex_verification_tokens') || '{}');
      if (storedTokens[proposalId]) {
        console.warn(
          'Token found in localStorage but only hashed version is stored for security. ' +
          'The actual token is only available in memory during the current session.'
        );
      }
      return null;
    } catch (error) {
      console.error('Error retrieving verification token:', error);
      return null;
    }
  }
  
  /**
   * Clear stored verification tokens
   * @param proposalId Optional proposal ID to clear tokens for (clears all if not provided)
   */
  clearStoredVerificationTokens(proposalId?: string): void {
    if (proposalId) {
      // Clear specific token
      this.tokens.delete(proposalId);
      
      try {
        const storedTokens = JSON.parse(localStorage.getItem('simplex_verification_tokens') || '{}');
        delete storedTokens[proposalId];
        localStorage.setItem('simplex_verification_tokens', JSON.stringify(storedTokens));
      } catch (error) {
        console.error('Error clearing verification token:', error);
      }
    } else {
      // Clear all tokens
      this.tokens.clear();
      
      try {
        localStorage.removeItem('simplex_verification_tokens');
      } catch (error) {
        console.error('Error clearing all verification tokens:', error);
      }
    }
  }
}

// Create a singleton instance for use throughout the application
let simplexVotingService: SimpleXVotingService | null = null;

/**
 * Get the SimpleX voting service instance
 * @returns The SimpleX voting service singleton
 */
export function getSimplexVotingService(): SimpleXVotingService {
  if (!simplexVotingService) {
    simplexVotingService = new SimpleXVotingService();
  }
  return simplexVotingService;
}