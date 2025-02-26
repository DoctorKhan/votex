import { ProposalService, ProposalEntity } from '../../lib/proposalService';
import { addOrUpdateItem, getAllItems, generateId, deleteItem } from '../../lib/db';

// Mock the db module
jest.mock('../../lib/db', () => ({
  addOrUpdateItem: jest.fn().mockResolvedValue('mock-id'),
  getAllItems: jest.fn(),
  deleteItem: jest.fn().mockResolvedValue(undefined),
  generateId: jest.fn().mockReturnValue('mock-id'),
}));

describe('Proposal Service', () => {
  let proposalService: ProposalService;
  
  beforeEach(() => {
    // Create a mock IDBDatabase
    const mockDb = {} as IDBDatabase;
    
    // Create an instance of ProposalService with the mock database
    proposalService = new ProposalService(mockDb);
    
    // Reset the mock implementation
    (getAllItems as jest.Mock).mockReset();
    (addOrUpdateItem as jest.Mock).mockReset();
    (deleteItem as jest.Mock).mockReset();
    (generateId as jest.Mock).mockReset();
    
    // Default mock implementation
    (getAllItems as jest.Mock).mockResolvedValue([]);
    (addOrUpdateItem as jest.Mock).mockResolvedValue('mock-id');
    (deleteItem as jest.Mock).mockResolvedValue(undefined);
    (generateId as jest.Mock).mockReturnValue('mock-id');
  });
  
  describe('createProposal', () => {
    test('should create a new proposal', async () => {
      // Arrange
      const mockProposal: ProposalEntity = {
        id: 'mock-id',
        title: 'Test Proposal',
        description: 'This is a test proposal',
        votes: 0,
        createdAt: Date.now()
      };
      
      // Act
      const result = await proposalService.createProposal(mockProposal);
      
      // Assert
      expect(result).toBe('mock-id');
      expect(addOrUpdateItem).toHaveBeenCalledWith('proposals', mockProposal);
    });
  });
  
  describe('getProposal', () => {
    test('should return null when proposal is not found', async () => {
      // Arrange
      const proposalId = 'non-existent-id';
      (getAllItems as jest.Mock).mockResolvedValueOnce([]);
      
      // Act
      const result = await proposalService.getProposal(proposalId);
      
      // Assert
      expect(result).toBeNull();
      expect(getAllItems).toHaveBeenCalledWith('proposals');
    });
    
    test('should return the proposal when found', async () => {
      // Arrange
      const proposalId = 'existing-id';
      const mockProposal: ProposalEntity = {
        id: proposalId,
        title: 'Test Proposal',
        description: 'This is a test proposal',
        votes: 0,
        createdAt: Date.now()
      };
      
      (getAllItems as jest.Mock).mockResolvedValueOnce([mockProposal]);
      
      // Act
      const result = await proposalService.getProposal(proposalId);
      
      // Assert
      expect(result).toEqual(mockProposal);
      expect(getAllItems).toHaveBeenCalledWith('proposals');
    });
  });
  
  describe('updateProposal', () => {
    test('should update a proposal', async () => {
      // Arrange
      const proposalId = 'proposal-id';
      const mockProposal: ProposalEntity = {
        id: proposalId,
        title: 'Updated Proposal',
        description: 'This is an updated proposal',
        votes: 5,
        createdAt: Date.now()
      };
      
      // Act
      await proposalService.updateProposal(proposalId, mockProposal);
      
      // Assert
      expect(addOrUpdateItem).toHaveBeenCalledWith('proposals', mockProposal);
    });
  });
  
  describe('deleteProposal', () => {
    test('should delete a proposal by ID', async () => {
      // Arrange
      const proposalId = 'proposal-to-delete';
      
      // Act
      await proposalService.deleteProposal(proposalId);
      
      // Assert
      expect(deleteItem).toHaveBeenCalledWith('proposals', proposalId);
    });
  });
});