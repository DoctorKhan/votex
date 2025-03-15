/**
 * SimpleX Protocol Adapter
 * Main interface for the SimpleX protocol implementation
 */

import { 
  SimpleXQueue, 
  SimpleXVotePayload, 
  EncryptedVotePacket,
  VerificationRequest,
  VerificationResponse
} from './types';
import { 
  encryptPayload, 
  decryptPayload, 
  generateSignature, 
  verifySignature, 
  generateVerificationToken 
} from './crypto';
import { 
  createQueue, 
  deleteQueue, 
  sendMessage, 
  receiveMessage, 
  connectToSimplexServer 
} from './queue';

/**
 * SimpleX Protocol Adapter
 * Provides a high-level interface for interacting with the SimpleX protocol
 */
export class SimpleXAdapter {
  private serverUrl: string;
  private isConnected: boolean = false;
  
  /**
   * Create a new SimpleX adapter
   * @param serverUrl The URL of the SimpleX relay server
   */
  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }
  
  /**
   * Connect to the SimpleX server
   * @returns Promise that resolves when connected
   */
  async connect(): Promise<boolean> {
    try {
      this.isConnected = await connectToSimplexServer(this.serverUrl);
      return this.isConnected;
    } catch (error) {
      console.error('Error connecting to SimpleX server:', error);
      this.isConnected = false;
      throw new Error('Failed to connect to SimpleX server');
    }
  }
  
  /**
   * Check if we're connected to the SimpleX server
   * @returns Boolean indicating connection status
   */
  isServerConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Create a new ephemeral queue for vote transmission
   * @returns Promise that resolves with the created queue
   */
  async createVotingQueue(): Promise<SimpleXQueue> {
    return createQueue(this.serverUrl, 'vote', 30 * 60 * 1000); // 30 minute expiry
  }
  
  /**
   * Create a new ephemeral queue for vote verification
   * @returns Promise that resolves with the created queue
   */
  async createVerificationQueue(): Promise<SimpleXQueue> {
    return createQueue(this.serverUrl, 'verification', 5 * 60 * 1000); // 5 minute expiry
  }
  
  /**
   * Generate a verification token for a vote
   * @returns A new verification token
   */
  generateVoteVerificationToken(): string {
    return generateVerificationToken();
  }
  
  /**
   * Send a vote through the SimpleX protocol
   * @param queue The queue to send the vote through
   * @param vote The vote payload to send
   * @returns Promise that resolves with a receipt
   */
  async sendVote(
    queue: SimpleXQueue, 
    vote: SimpleXVotePayload
  ): Promise<string> {
    // Encrypt the vote payload
    const { encryptedData, iv } = encryptPayload(JSON.stringify(vote), queue.encryptionKey);
    
    // Create signature for vote integrity
    const signature = generateSignature(encryptedData, queue.encryptionKey);
    
    // Prepare the packet
    const packet: EncryptedVotePacket = {
      payload: encryptedData,
      queueId: queue.id,
      iv,
      signature
    };
    
    // Send through the queue
    const receipt = await sendMessage(queue, packet);
    
    // Delete the queue after use to prevent tracking
    await deleteQueue(queue);
    
    return receipt;
  }
  
  /**
   * Request verification of a vote
   * @param verificationToken The token to verify
   * @param proposalId The ID of the proposal voted on
   * @returns Promise that resolves with the verification response
   */
  async verifyVote(
    verificationToken: string, 
    proposalId: string
  ): Promise<VerificationResponse> {
    // Create a new temporary queue for verification
    const verificationQueue = await this.createVerificationQueue();
    
    // Prepare verification request
    const request: VerificationRequest = {
      token: verificationToken,
      proposalId
    };
    
    // Encrypt the request
    const { encryptedData, iv } = encryptPayload(
      JSON.stringify(request), 
      verificationQueue.encryptionKey
    );
    
    // Send verification request
    const packet: EncryptedVotePacket = {
      payload: encryptedData,
      queueId: verificationQueue.id,
      iv
    };
    
    await sendMessage(verificationQueue, packet);
    
    try {
      // Wait for response
      const response = await receiveMessage(verificationQueue, 10000); // 10 second timeout
      
      // Verify signature if present
      if (response.signature && !verifySignature(
        response.payload,
        response.signature,
        verificationQueue.encryptionKey
      )) {
        throw new Error('Invalid signature on verification response');
      }
      
      // Decrypt the response
      const decryptedResponse = decryptPayload(
        response.payload,
        verificationQueue.encryptionKey,
        response.iv
      );
      
      // Delete the verification queue
      await deleteQueue(verificationQueue);
      
      return JSON.parse(decryptedResponse) as VerificationResponse;
    } catch (error) {
      console.error('Error receiving verification response:', error);
      
      // Clean up the queue even if there's an error
      await deleteQueue(verificationQueue).catch(console.error);
      
      // Return a default response indicating failure
      return {
        verified: false,
        counted: false
      };
    }
  }
}

/**
 * Get the default SimpleX server URL
 * In a real implementation, this would be configurable
 * @returns The default SimpleX server URL
 */
export function getDefaultServerUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SIMPLEX_SERVER_URL || 
    'https://simplex-relay.example.com'
  );
}