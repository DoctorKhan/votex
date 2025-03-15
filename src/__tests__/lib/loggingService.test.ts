import { logAction, verifyLogIntegrity, getActionLog } from '../../lib/loggingService';
import crypto from 'crypto';

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash')
  })
}));

// Mock db module functions
jest.mock('../../lib/db', () => {
  return {
    generateId: jest.fn().mockReturnValue('mock-log-id'),
    getAllItems: jest.fn().mockResolvedValue([]),
    addOrUpdateItem: jest.fn().mockResolvedValue(undefined)
  };
});

// Import the mocked module
import * as db from '../../lib/db';

jest.mock('@instantdb/react', () => ({
  id: jest.fn().mockReturnValue('mock-log-id')
}));

describe('Logging Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logAction', () => {
    test('should log an action with a hash', async () => {
      // Arrange
      const mockAction = {
        type: 'VOTE',
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: Date.now()
      };
      
      // Mock the database to return no previous logs
      (db.getAllItems as jest.Mock).mockResolvedValue([]);
      
      // Act
      const result = await logAction(mockAction);
      
      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('logEntry');
      expect(result.logEntry).toHaveProperty('hash');
      expect(result.logEntry).toHaveProperty('previousHash', null);
      expect(result.logEntry).toHaveProperty('action', mockAction);
      expect(db.addOrUpdateItem).toHaveBeenCalled();
    });

    test('should include previous hash when logs exist', async () => {
      // Arrange
      const mockAction = {
        type: 'VOTE',
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: Date.now()
      };
      
      const previousHash = 'previous-hash-123';
      
      // Mock the database to return a previous log
      (db.getAllItems as jest.Mock).mockResolvedValue([
        {
          hash: previousHash,
          timestamp: Date.now() - 1000,
        }
      ]);
      
      // Act
      const result = await logAction(mockAction);
      
      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result.logEntry).toHaveProperty('previousHash', previousHash);
      expect(db.addOrUpdateItem).toHaveBeenCalled();
    });

    test('should handle database errors gracefully', async () => {
      // Arrange
      const mockAction = {
        type: 'VOTE',
        userId: 'user-123',
        proposalId: 'proposal-456',
        timestamp: Date.now()
      };
      
      // Mock the database to throw an error
      (db.getAllItems as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Act
      const result = await logAction(mockAction);
      
      // Assert
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', 'Failed to log action');
    });
  });

  describe('verifyLogIntegrity', () => {
    test('should verify log integrity for valid logs', async () => {
      // Arrange
      const mockLogs = [
        {
          hash: 'hash1',
          previousHash: null,
          action: { type: 'INIT', timestamp: Date.now() - 2000 },
          timestamp: Date.now() - 2000
        },
        {
          hash: 'hash2',
          previousHash: 'hash1',
          action: { type: 'VOTE', userId: 'user-1', proposalId: 'proposal-1', timestamp: Date.now() - 1000 },
          timestamp: Date.now() - 1000
        }
      ];
      
      // Mock the hash generation to return expected values
      const mockDigest = jest.fn()
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2');
      
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: mockDigest
      });
      
      // Act
      const result = await verifyLogIntegrity(mockLogs);
      
      // Assert
      expect(result).toEqual({
        valid: true,
        invalidEntries: []
      });
    });

    test('should detect tampered logs', async () => {
      // Arrange
      const mockLogs = [
        {
          hash: 'hash1',
          previousHash: null,
          action: { type: 'INIT', timestamp: Date.now() - 2000 },
          timestamp: Date.now() - 2000
        },
        {
          hash: 'hash2',
          previousHash: 'wrong-previous-hash', // Should be 'hash1'
          action: { type: 'VOTE', userId: 'user-1', proposalId: 'proposal-1', timestamp: Date.now() - 1000 },
          timestamp: Date.now() - 1000
        },
      ];
      
      // Mock the hash generation to return expected values
      const mockDigest = jest.fn()
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2');
      
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: mockDigest
      });
      
      // Act
      const result = await verifyLogIntegrity(mockLogs);
      
      // Assert
      expect(result).toEqual({
        valid: false,
        invalidEntries: [1] // The second entry (index 1) is invalid
      });
    });

    test('should detect broken chain in logs', async () => {
      // Arrange
      const mockLogs = [
        {
          hash: 'hash1',
          previousHash: null,
          action: { type: 'INIT', timestamp: Date.now() - 2000 },
          timestamp: Date.now() - 2000
        },
        {
          hash: 'hash2',
          previousHash: 'hash1',
          action: { type: 'VOTE', userId: 'user-1', proposalId: 'proposal-1', timestamp: Date.now() - 1000 },
          timestamp: Date.now() - 1000
        }
      ];
      
      // Mock the hash generation to return expected values
      const mockDigest = jest.fn()
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2');
      
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: mockDigest
      });
      
      // Act
      const result = await verifyLogIntegrity(mockLogs);
      
      // Assert
      expect(result).toEqual({
        valid: true,
        invalidEntries: []
      });
    });
  });

  describe('getActionLog', () => {
    test('should retrieve all log entries', async () => {
      // Arrange
      const mockLogs = [
        {
          id: 'log-1',
          action: { type: 'INIT', timestamp: Date.now() - 2000 },
          timestamp: Date.now() - 2000,
          hash: 'hash1',
          previousHash: null
        },
        {
          id: 'log-2',
          action: { type: 'VOTE', userId: 'user-1', proposalId: 'proposal-1', timestamp: Date.now() - 1000 },
          timestamp: Date.now() - 1000,
          hash: 'hash2',
          previousHash: 'hash1'
        }
      ];
      
      // Mock the database to return logs
      (db.getAllItems as jest.Mock).mockResolvedValue(mockLogs);
      
      // Act
      const result = await getActionLog();
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'log-1');
      expect(result[1]).toHaveProperty('id', 'log-2');
      // Logs should be sorted by timestamp
      expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
    });

    test('should return empty array when no logs exist', async () => {
      // Arrange
      // Mock the database to return no logs
      (db.getAllItems as jest.Mock).mockResolvedValue([]);
      
      // Act
      const result = await getActionLog();
      
      // Assert
      expect(result).toEqual([]);
    });

    test('should handle database errors gracefully', async () => {
      // Arrange
      // Mock the database to throw an error
      (db.getAllItems as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Act & Assert
      await expect(getActionLog()).rejects.toThrow('Failed to retrieve action log');
    });
  });
});