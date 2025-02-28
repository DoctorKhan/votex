import { validateVote } from '../../lib/securityService';

describe('Security Service', () => {
  describe('Vote Validation', () => {
    test('should validate a legitimate vote', () => {
      // Arrange
      const mockVote = {
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
      const mockVote = {
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
      const mockVote = {
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

    test('should reject a vote with invalid timestamp', () => {
      // Arrange
      const futureTimestamp = Date.now() + 1000 * 60 * 60; // 1 hour in the future
      const mockVote = {
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: futureTimestamp
      };
      
      // Act
      const result = validateVote(mockVote);
      
      // Assert
      expect(result).toEqual({
        valid: false,
        reason: 'Invalid timestamp'
      });
    });

    test('should detect suspicious voting patterns', () => {
      // Arrange
      const currentTime = Date.now();
      const mockVote = {
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: currentTime
      };
      
      const previousVotes = [
        {
          userId: 'user-123',
          proposalId: 'proposal-111',
          timestamp: currentTime - 10000 // 10 seconds ago
        },
        {
          userId: 'user-123',
          proposalId: 'proposal-222',
          timestamp: currentTime - 20000 // 20 seconds ago
        },
        {
          userId: 'user-123',
          proposalId: 'proposal-333',
          timestamp: currentTime - 30000 // 30 seconds ago
        }
      ];
      
      // Act
      const result = validateVote(mockVote, previousVotes);
      
      // Assert
      expect(result).toEqual({
        valid: false,
        reason: 'Suspicious voting pattern detected'
      });
    });

    test('should allow voting if previous votes are not recent', () => {
      // Arrange
      const currentTime = Date.now();
      const mockVote = {
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: currentTime
      };
      
      const previousVotes = [
        {
          userId: 'user-123',
          proposalId: 'proposal-111',
          timestamp: currentTime - 1000 * 60 * 2 // 2 minutes ago
        },
        {
          userId: 'user-123',
          proposalId: 'proposal-222',
          timestamp: currentTime - 1000 * 60 * 5 // 5 minutes ago
        }
      ];
      
      // Act
      const result = validateVote(mockVote, previousVotes);
      
      // Assert
      expect(result).toEqual({
        valid: true,
        reason: null
      });
    });

    test('should ignore previous votes from other users', () => {
      // Arrange
      const currentTime = Date.now();
      const mockVote = {
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: currentTime
      };
      
      const previousVotes = [
        {
          userId: 'user-456', // Different user
          proposalId: 'proposal-111',
          timestamp: currentTime - 10000 // 10 seconds ago
        },
        {
          userId: 'user-789', // Different user
          proposalId: 'proposal-222',
          timestamp: currentTime - 20000 // 20 seconds ago
        },
        {
          userId: 'user-abc', // Different user
          proposalId: 'proposal-333',
          timestamp: currentTime - 30000 // 30 seconds ago
        }
      ];
      
      // Act
      const result = validateVote(mockVote, previousVotes);
      
      // Assert
      expect(result).toEqual({
        valid: true,
        reason: null
      });
    });
  });
});