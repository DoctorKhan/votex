/**
 * useSimplexVoting Hook
 * React hook for using SimpleX protocol for voting
 */

import { useState, useEffect, useCallback } from 'react';
import { getSimplexVotingService } from '../lib/simplexProtocol/votingIntegration';

interface UseSimplexVotingProps {
  proposalId: string;
  userId?: string; // Make userId optional
}

interface UseSimplexVotingResult {
  isSimplexEnabled: boolean;
  isLoading: boolean;
  castSimplexVote: (choice: number | number[]) => Promise<{ success: boolean; verificationToken?: string }>;
  verifyVote: (verificationToken: string) => Promise<boolean>;
  verificationToken: string | null;
  error: string | null;
}

/**
 * React hook for using SimpleX protocol for voting
 * @param proposalId The ID of the proposal to vote for
 * @param userId The ID of the user voting
 * @returns Object with SimpleX voting functionality
 */
export function useSimplexVoting({ proposalId }: UseSimplexVotingProps): UseSimplexVotingResult {
  const [isSimplexEnabled, setIsSimplexEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if SimpleX voting is enabled
        const simplexEnabled = localStorage.getItem('useSimplexVoting') === 'true';
        setIsSimplexEnabled(simplexEnabled);

        if (simplexEnabled) {
          // Initialize the SimpleX voting service
          const simplexService = getSimplexVotingService();
          await simplexService.initialize();
          
          // Check for existing verification token
          const existingToken = simplexService.getStoredVerificationToken(proposalId);
          if (existingToken) {
            setVerificationToken(existingToken);
          }
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing SimpleX voting:', err);
        setError('Failed to initialize SimpleX voting');
      }
    };

    initialize();
    
    // Listen for changes to the SimpleX voting setting
    const handleSimplexChange = (event: CustomEvent<{ enabled: boolean }>) => {
      setIsSimplexEnabled(event.detail.enabled);
    };
    
    window.addEventListener('simplexVotingChange', handleSimplexChange as EventListener);
    return () => {
      window.removeEventListener('simplexVotingChange', handleSimplexChange as EventListener);
    };
  }, [proposalId]);

  /**
   * Cast a vote using the SimpleX protocol
   * @param choice The voting choice (single number or array for ranked choice)
   * @returns Promise that resolves with the result of the vote
   */
  const castSimplexVote = useCallback(async (
    choice: number | number[]
  ): Promise<{ success: boolean; verificationToken?: string }> => {
    if (!isSimplexEnabled || !isInitialized) {
      return { success: false };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const simplexService = getSimplexVotingService();
      const result = await simplexService.castVote(proposalId, choice);
      
      setVerificationToken(result.verificationToken);
      
      return {
        success: true,
        verificationToken: result.verificationToken
      };
    } catch (err) {
      console.error('Error casting SimpleX vote:', err);
      setError('Failed to cast vote: ' + (err instanceof Error ? err.message : String(err)));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [isSimplexEnabled, isInitialized, proposalId]);

  /**
   * Verify a vote using the SimpleX protocol
   * @param tokenToVerify The verification token to verify
   * @returns Promise that resolves with a boolean indicating if the vote was verified
   */
  const verifyVote = useCallback(async (tokenToVerify: string): Promise<boolean> => {
    if (!isSimplexEnabled || !isInitialized) {
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const simplexService = getSimplexVotingService();
      return await simplexService.verifyVote(proposalId, tokenToVerify);
    } catch (err) {
      console.error('Error verifying SimpleX vote:', err);
      setError('Failed to verify vote: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSimplexEnabled, isInitialized, proposalId]);

  return {
    isSimplexEnabled,
    isLoading,
    castSimplexVote,
    verifyVote,
    verificationToken,
    error
  };
}