import { VotingService } from '../../lib/votingService';
import { ProposalEntity } from '../../lib/proposalService';
import { addOrUpdateItem, getAllItems, deleteItem, generateId } from '../../lib/db';
import { validateVote } from '../../lib/securityService';
import { logAction } from '../../lib/loggingService';

// Mock dependencies
jest.mock('../../lib/db', () => ({
  addOrUpdateItem: jest.fn().mockResolvedValue('mock-id'),
  getAllItems: jest.fn(),
  deleteItem: jest.fn().mockResolvedValue(undefined),
  generateId: jest.fn().mockReturnValue('mock-id'),
}));

jest.mock('../../lib/securityService', () => ({
  validateVote: jest.fn().mockReturnValue({ valid: true, reason: null }),
}));

jest.mock('../../lib/loggingService', () => ({
  logAction: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Voting Service', () => {
  let votingService: VotingService;
  
  beforeEach(() => {
    // Create a mock IDBDatabase
    const mockDb = {} as IDBDatabase;
    
    // Create an instance of VotingService with the mock database
    votingService = new VotingService(mockDb);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementation
    (getAllItems as jest.Mock).mockResolvedValue([]);
    (addOrUpdateItem as jest.Mock).mockResolvedValue('mock-id');
    (deleteItem as jest.Mock).mockResolvedValue(undefined);
    (generateId as jest.Mock).mockReturnValue('mock-id');
    (validateVote as jest.Mock).mockReturnValue({ valid: true, reason: null });
    (logAction as jest.Mock).mockResolvedValue({ success: true });
  });
  
  describe('voteForProposal', () => {
    test('should record a vote for a proposal', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const mockUserId = 'user-456';
      const mockVoteId = 'vote-789';
      
      const mockProposal: ProposalEntity = {
        id: mockProposalId,
        title: 'Test Proposal',
        description: 'Test Description',
        votes: 5,
        createdAt: Date.now()
      };
      
      (getAllItems as jest.Mock)
        .mockResolvedValueOnce([]) // No existing votes
        .mockResolvedValueOnce([mockProposal]); // Proposals
      
      (generateId as jest.Mock).mockReturnValue(mockVoteId);
      
      // Act
      const result = await votingService.voteForProposal(mockProposalId, mockUserId);
      
      // Assert
      expect(result).toEqual({
        success: true,
        voteId: mockVoteId
      });
      expect(addOrUpdateItem).toHaveBeenCalledTimes(2); // Once for the vote, once for the proposal update
      expect(logAction).toHaveBeenCalled();
      expect(validateVote).toHaveBeenCalled();
    });
    
    test('should prevent a user from voting twice', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const mockUserId = 'user-456';
      
      // Mock that the user has already voted for any proposal
      const mockVotes = [
        {
          id: 'vote-existing',
          userId: mockUserId,
          proposalId: 'proposal-999', // Voted for a different proposal
          timestamp: Date.now()
        }
      ];
      
      (getAllItems as jest.Mock)
        .mockResolvedValueOnce(mockVotes); // Existing votes
      
      // Act
      const result = await votingService.voteForProposal(mockProposalId, mockUserId);
      
      // Assert
      expect(result).toEqual({
        success: false,
        voteId: null
      });
      expect(addOrUpdateItem).not.toHaveBeenCalled();
    });
    
    test('should reject vote for non-existent proposal', async () => {
      // Arrange
      const mockProposalId = 'non-existent-id';
      const mockUserId = 'user-456';
      
      (getAllItems as jest.Mock)
        .mockResolvedValueOnce([]) // No existing votes
        .mockResolvedValueOnce([]); // No proposals
      
      // Act
      const result = await votingService.voteForProposal(mockProposalId, mockUserId);
      
      // Assert
      expect(result).toEqual({
        success: false,
        voteId: null
      });
      expect(addOrUpdateItem).not.toHaveBeenCalled();
    });
    
    test('should reject vote that fails validation', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const mockUserId = 'user-456';
      
      const mockProposal: ProposalEntity = {
        id: mockProposalId,
        title: 'Test Proposal',
        description: 'Test Description',
        votes: 5,
        createdAt: Date.now()
      };
      
      (getAllItems as jest.Mock)
        .mockResolvedValueOnce([]) // No existing votes
        .mockResolvedValueOnce([mockProposal]); // Proposals
      
      (validateVote as jest.Mock).mockReturnValue({ 
        valid: false, 
        reason: 'Suspicious voting pattern detected' 
      });
      
      // Act
      const result = await votingService.voteForProposal(mockProposalId, mockUserId);
      
      // Assert
      expect(result).toEqual({
        success: false,
        voteId: null
      });
      expect(addOrUpdateItem).not.toHaveBeenCalled();
    });
  });
  
  describe('hasUserVoted', () => {
    test('should return true if user has voted', async () => {
      // Arrange
      const mockUserId = 'user-456';
      
      // Mock that the user has already voted
      const mockVotes = [
        { 
          id: 'vote-existing',
          userId: mockUserId,
          proposalId: 'proposal-123',
          timestamp: Date.now()
        }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockVotes);
      
      // Act
      const result = await votingService.hasUserVoted(mockUserId);
      
      // Assert
      expect(result).toBe(true);
    });
    
    test('should return false if user has not voted', async () => {
      // Arrange
      const mockUserId = 'user-456';
      
      // Mock that no votes exist
      (getAllItems as jest.Mock).mockResolvedValueOnce([]);
      
      // Act
      const result = await votingService.hasUserVoted(mockUserId);
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('hasUserVotedForProposal', () => {
    test('should return true if user has voted for the proposal', async () => {
      // Arrange
      const mockUserId = 'user-456';
      const mockProposalId = 'proposal-123';
      
      // Mock that the user has already voted for this proposal
      const mockVotes = [
        { 
          id: 'vote-existing',
          userId: mockUserId,
          proposalId: mockProposalId,
          timestamp: Date.now()
        }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockVotes);
      
      // Act
      const result = await votingService.hasUserVotedForProposal(mockUserId, mockProposalId);
      
      // Assert
      expect(result).toBe(true);
    });
    
    test('should return false if user has not voted for the proposal', async () => {
      // Arrange
      const mockUserId = 'user-456';
      const mockProposalId = 'proposal-123';
      
      // Mock that the user has voted for a different proposal
      const mockVotes = [
        { 
          id: 'vote-existing',
          userId: mockUserId,
          proposalId: 'different-proposal',
          timestamp: Date.now()
        }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockVotes);
      
      // Act
      const result = await votingService.hasUserVotedForProposal(mockUserId, mockProposalId);
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('resetVotes', () => {
    test('should reset all votes', async () => {
      // Arrange
      const mockVotes = [
        { id: 'vote-1', userId: 'user-1', proposalId: 'proposal-1', timestamp: Date.now() },
        { id: 'vote-2', userId: 'user-2', proposalId: 'proposal-2', timestamp: Date.now() }
      ];
      
      const mockProposals = [
        { id: 'proposal-1', title: 'Proposal 1', description: 'Description 1', votes: 5, createdAt: Date.now() },
        { id: 'proposal-2', title: 'Proposal 2', description: 'Description 2', votes: 3, createdAt: Date.now() }
      ];
      
      (getAllItems as jest.Mock)
        .mockResolvedValueOnce(mockVotes) // Votes
        .mockResolvedValueOnce(mockProposals); // Proposals
      
      // Act
      const result = await votingService.resetVotes();
      
      // Assert
      expect(result).toEqual({
        success: true,
        votesReset: 2
      });
      expect(addOrUpdateItem).toHaveBeenCalledTimes(2); // Once for each proposal
      expect(deleteItem).toHaveBeenCalledTimes(2); // Once for each vote
      expect(logAction).toHaveBeenCalled();
    });
    
    test('should handle no votes to reset', async () => {
      // Arrange
      (getAllItems as jest.Mock)
        .mockResolvedValueOnce([]) // No votes
        .mockResolvedValueOnce([]); // No proposals
      
      // Act
      const result = await votingService.resetVotes();
      
      // Assert
      expect(result).toEqual({
        success: true,
        votesReset: 0
      });
      expect(addOrUpdateItem).not.toHaveBeenCalled();
      expect(deleteItem).not.toHaveBeenCalled();
      expect(logAction).toHaveBeenCalled();
    });
  });
  
  describe('getVotesForProposal', () => {
    test('should return all votes for a proposal', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      
      const mockVotes = [
        { id: 'vote-1', userId: 'user-1', proposalId: mockProposalId, timestamp: Date.now() },
        { id: 'vote-2', userId: 'user-2', proposalId: mockProposalId, timestamp: Date.now() },
        { id: 'vote-3', userId: 'user-3', proposalId: 'different-proposal', timestamp: Date.now() }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockVotes);
      
      // Act
      const result = await votingService.getVotesForProposal(mockProposalId);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('vote-1');
      expect(result[1].id).toBe('vote-2');
      expect(result.every(v => v.proposalId === mockProposalId)).toBe(true);
    });
    
    test('should return empty array if no votes for the proposal', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      
      const mockVotes = [
        { id: 'vote-1', userId: 'user-1', proposalId: 'different-proposal', timestamp: Date.now() },
        { id: 'vote-2', userId: 'user-2', proposalId: 'another-proposal', timestamp: Date.now() }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockVotes);
      
      // Act
      const result = await votingService.getVotesForProposal(mockProposalId);
      
      // Assert
      expect(result).toHaveLength(0);
    });
  });
  
  describe('getVoteTotals', () => {
    test('should return vote totals for all proposals', async () => {
      // Arrange
      const mockVotes = [
        { id: 'vote-1', userId: 'user-1', proposalId: 'proposal-1', timestamp: Date.now() },
        { id: 'vote-2', userId: 'user-2', proposalId: 'proposal-1', timestamp: Date.now() },
        { id: 'vote-3', userId: 'user-3', proposalId: 'proposal-2', timestamp: Date.now() },
        { id: 'vote-4', userId: 'user-4', proposalId: 'proposal-3', timestamp: Date.now() },
        { id: 'vote-5', userId: 'user-5', proposalId: 'proposal-3', timestamp: Date.now() }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockVotes);
      
      // Act
      const result = await votingService.getVoteTotals();
      
      // Assert
      expect(result).toEqual({
        'proposal-1': 2,
        'proposal-2': 1,
        'proposal-3': 2
      });
    });
    
    test('should return empty object if no votes exist', async () => {
      // Arrange
      (getAllItems as jest.Mock).mockResolvedValueOnce([]);
      
      // Act
      const result = await votingService.getVoteTotals();
      
      // Assert
      expect(result).toEqual({});
    });
  });
});
