/**
 * Interface for a vote object
 */
export interface Vote {
  userId: string;
  proposalId: string;
  timestamp: number;
}

/**
 * Interface for vote validation result
 */
export interface VoteValidationResult {
  valid: boolean;
  reason: string | null;
}

/**
 * Validates a vote for security and integrity
 * @param vote The vote object to validate
 * @param previousVotes Optional array of previous votes to check for suspicious patterns
 * @returns Object with validation result and reason if invalid
 */
export function validateVote(vote: Vote, previousVotes: Vote[] = []): VoteValidationResult {
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
      v => v.userId === vote.userId && 
      v.timestamp > Date.now() - 1000 * 60 // Votes in the last minute
    );
    
    if (recentVotes.length >= 3) {
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

/**
 * Validates user permissions for a specific action
 * @param userId The ID of the user
 * @param action The action to validate
 * @param resourceId Optional ID of the resource being acted upon
 * @returns Boolean indicating if the user has permission
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function validatePermission(userId: string, _action: string, _resourceId?: string): boolean {
  // This is a placeholder for a more sophisticated permission system
  // In a real application, this would check against a database of user roles and permissions
  
  // For now, all authenticated users (with a valid userId) can perform any action
  return !!userId && userId.trim() !== '';
}

/**
 * Sanitizes user input to prevent injection attacks
 * @param input The user input to sanitize
 * @returns Sanitized input string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove potentially dangerous HTML/script tags
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<img[^>]*>/gi, '[image]')
    .replace(/<[^>]*>/g, ''); // Remove all remaining HTML tags
  
  return sanitized;
}

/**
 * Validates that a string contains only alphanumeric characters and allowed symbols
 * @param input The string to validate
 * @param allowedSymbols Optional string of allowed symbols
 * @returns Boolean indicating if the string is valid
 */
export function validateAlphanumeric(input: string, allowedSymbols = '-_.'): boolean {
  if (!input) return false;
  
  const regex = new RegExp(`^[a-zA-Z0-9${allowedSymbols.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]+$`);
  return regex.test(input);
}

/**
 * Generates a secure random token
 * @param length The length of the token to generate
 * @returns Random token string
 */
export function generateSecureToken(length = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  // Use crypto.getRandomValues if available (browser environment)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
      token += characters.charAt(values[i] % characters.length);
    }
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  
  return token;
}