import { validateVote, Vote } from '../../lib/securityService';

describe('Security Service', () => {
  describe('validateVote', () => {
    test('should validate a legitimate vote', () => {
      // Arrange
      const mockVote: Vote = {
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: Date.now()
      };
      
      // Act
      const result = validateVote(mockVote);
      
      // Assert
      expect(result).toEqual({
        valid: true,
        reason: null
      });
    });

    test('should reject a vote with missing userId', () => {
      // Arrange
      const mockVote: Vote = {
        userId: '',
        proposalId: 'proposal-456',
        timestamp: Date.now()
      };
      
      // Act
      const result = validateVote(mockVote);
      
      // Assert
      expect(result).toEqual({
        valid: false,
        reason: 'Missing user ID'
      });
    });

    test('should reject a vote with missing proposalId', () => {
      // Arrange
      const mockVote: Vote = {
        userId: 'user-123',
        proposalId: '',
        timestamp: Date.now()
      };
      
      // Act
      const result = validateVote(mockVote);
      
      // Assert
      expect(result).toEqual({
        valid: false,
        reason: 'Missing proposal ID'
      });
    });

    test('should reject a vote with future timestamp', () => {
      // Arrange
      const futureTime = Date.now() + 1000 * 60 * 60; // 1 hour in the future
      const mockVote: Vote = {
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: futureTime
      };
      
      // Act
      const result = validateVote(mockVote);
      
      // Assert
      expect(result).toEqual({
        valid: false,
        reason: 'Invalid timestamp'
      });
    });

    test('should reject a vote with suspicious rapid voting pattern', () => {
      // Arrange
      const now = Date.now();
      const mockVotes: Vote[] = [
        {
          userId: 'user-123',
          proposalId: 'proposal-1',
          timestamp: now - 1000 // 1 second ago
        },
        {
          userId: 'user-123',
          proposalId: 'proposal-2',
          timestamp: now - 500 // 0.5 seconds ago
        }
      ];
      
      const newVote: Vote = {
        userId: 'user-123',
        proposalId: 'proposal-3',
        timestamp: now
      };
      
      // Act
      const result = validateVote(newVote, mockVotes);
      
      // Assert
      expect(result).toEqual({
        valid: false,
        reason: 'Suspicious voting pattern detected'
      });
    });

    test('should allow votes from different users in rapid succession', () => {
      // Arrange
      const now = Date.now();
      const mockVotes: Vote[] = [
        {
          userId: 'user-1',
          proposalId: 'proposal-1',
          timestamp: now - 1000 // 1 second ago
        },
        {
          userId: 'user-2',
          proposalId: 'proposal-2',
          timestamp: now - 500 // 0.5 seconds ago
        }
      ];
      
      const newVote: Vote = {
        userId: 'user-3',
        proposalId: 'proposal-3',
        timestamp: now
      };
      
      // Act
      const result = validateVote(newVote, mockVotes);
      
      // Assert
      expect(result).toEqual({
        valid: true,
        reason: null
      });
    });
  });
});