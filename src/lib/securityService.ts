/**
 * Vote object structure
 */
export interface Vote {
  userId: string;
  proposalId: string;
  timestamp: number;
}

/**
 * Vote validation result
 */
export interface ValidationResult {
  valid: boolean;
  reason: string | null;
}

/**
 * Validates a vote for security and integrity
 * @param vote The vote object to validate
 * @param previousVotes Optional array of previous votes to check for suspicious patterns
 * @returns Object with validation result and reason if invalid
 */
export function validateVote(vote: Vote, previousVotes: Vote[] = []): ValidationResult {
  // Check for required fields
  if (!vote.userId || vote.userId.trim() === '') {
    return {
      valid: false,
      reason: 'Missing user ID'
    };
  }
  
  if (!vote.proposalId || vote.proposalId.trim() === '') {
    return {
      valid: false,
      reason: 'Missing proposal ID'
    };
  }
  
  // Check for valid timestamp
  if (!vote.timestamp || vote.timestamp > Date.now()) {
    return {
      valid: false,
      reason: 'Invalid timestamp'
    };
  }
  
  // Check for suspicious voting patterns if previous votes are provided
  if (previousVotes.length > 0) {
    // Check for rapid voting (multiple votes in a short time period)
    const recentVotes = previousVotes.filter(
      v => v.userId === vote.userId
    );
    
    // If the user already has 2 or more votes and is trying to vote again, consider it suspicious
    if (recentVotes.length >= 2) {
      return {
        valid: false,
        reason: 'Suspicious voting pattern detected'
      };
    }
  }
  
  return {
    valid: true,
    reason: null
  };
}