import { AIService } from '../../lib/aiService';
import { addOrUpdateItem, getAllItems, deleteItem } from '../../lib/db';
import { ProposalEntity } from '../../lib/proposalService';

// Mock the db module
jest.mock('../../lib/db', () => ({
  addOrUpdateItem: jest.fn().mockResolvedValue('mock-id'),
  getAllItems: jest.fn(),
  deleteItem: jest.fn().mockResolvedValue(undefined),
  generateId: jest.fn().mockReturnValue('mock-id'),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AI Service', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    // Create a mock IDBDatabase
    const mockDb = {} as IDBDatabase;
    
    // Create an instance of AIService with the mock database
    aiService = new AIService(mockDb);
    
    // Reset the mock implementation
    (getAllItems as jest.Mock).mockReset();
    (addOrUpdateItem as jest.Mock).mockReset();
    (deleteItem as jest.Mock).mockReset();
    
    // Default mock implementation
    (getAllItems as jest.Mock).mockResolvedValue([]);
    (addOrUpdateItem as jest.Mock).mockResolvedValue('mock-id');
    (deleteItem as jest.Mock).mockResolvedValue(undefined);
  });
  
  describe('getProposal', () => {
    test('should return null when proposal is not found', async () => {
      // Arrange
      const proposalId = 'non-existent-id';
      (getAllItems as jest.Mock).mockResolvedValueOnce([]);

      // Act
      const result = await aiService.getProposal(proposalId);

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
        createdAt: Date.now().toString()
      };
      
      (getAllItems as jest.Mock).mockResolvedValueOnce([mockProposal]);
      
      // Act
      const result = await aiService.getProposal(proposalId);

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
        votes: 0,
        createdAt: Date.now().toString()
      };
      
      // Act
      await aiService.updateProposal(proposalId, mockProposal);
      
      // Assert
      expect(addOrUpdateItem).toHaveBeenCalledWith('proposals', mockProposal);
    });
  });
  
  describe('deleteProposal', () => {
    test('should delete a proposal by ID', async () => {
      // Arrange
      const proposalId = 'proposal-to-delete';
      
      // Act
      await aiService.deleteProposal(proposalId);
      
      // Assert
      expect(deleteItem).toHaveBeenCalledWith('proposals', proposalId);
    });
  });
  
  describe('generateAiProposal', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockReset();
    });
    
    test('should generate a new AI proposal', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Title: Community Garden Expansion\nDescription: Expand the existing community garden to include educational areas for schools and additional plots for residents.'
            }
          }
        ]
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await aiService.generateAiProposal();

      // Assert
      expect(result).toHaveProperty('title', 'Community Garden Expansion');
      expect(result).toHaveProperty('description');
      expect(result.description).toContain('Expand the existing community garden');
      expect(result).toHaveProperty('aiCreated', true);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai-proposal', expect.anything());
    });
    
    test('should handle API errors gracefully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Act
      const result = await aiService.generateAiProposal();

      // Assert
      expect(result).toHaveProperty('title', 'Community Improvement Initiative');
      expect(result).toHaveProperty('description', 'A default proposal to address community needs.');
      expect(result).toHaveProperty('aiCreated', true);
    });
  });
  
  describe('analyzeAndVote', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockReset();
    });
    
    test('should analyze proposals and vote for the best ones', async () => {
      // Arrange
      const mockProposals: ProposalEntity[] = [
        { id: 'proposal-1', title: 'Proposal 1', description: 'Description 1', votes: 0, createdAt: Date.now().toString() },
        { id: 'proposal-2', title: 'Proposal 2', description: 'Description 2', votes: 0, createdAt: Date.now().toString() },
        { id: 'proposal-3', title: 'Proposal 3', description: 'Description 3', votes: 0, createdAt: Date.now().toString() }
      ];
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'VOTE: proposal-1, proposal-3\nREASONING: Proposals 1 and 3 offer the most comprehensive solutions...'
            }
          }
        ]
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await aiService.analyzeAndVote(mockProposals);
      
      // Assert
      expect(result).toContain('proposal-1');
      expect(result).toContain('proposal-3');
      expect(result).not.toContain('proposal-2');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai-vote', expect.anything());
    });
    
    test('should handle empty proposals array', async () => {
      // Arrange
      const mockProposals: ProposalEntity[] = [];
      
      // Act
      const result = await aiService.analyzeAndVote(mockProposals);
      
      // Assert
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    test('should handle API errors gracefully', async () => {
      // Arrange
      const mockProposals: ProposalEntity[] = [
        { id: 'proposal-1', title: 'Proposal 1', description: 'Description 1', votes: 0, createdAt: Date.now().toString() }
      ];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Act
      const result = await aiService.analyzeAndVote(mockProposals);
      
      // Assert
      expect(result).toEqual(['proposal-1']); // Should fall back to voting for the first proposal
    });
  });
  
  describe('generateProposalAnalysis', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockReset();
    });
    
    test('should analyze a proposal and return metrics', async () => {
      // Arrange
      const mockTitle = 'Community Garden Project';
      const mockDescription = 'Create a community garden in the central district';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                feasibility: 0.8,
                impact: 0.7,
                cost: 0.4,
                timeframe: 0.3,
                risks: ['Weather dependency', 'Volunteer availability', 'Maintenance costs'],
                benefits: ['Fresh produce', 'Community building', 'Educational opportunities'],
                recommendations: 'Partner with local schools and businesses for resources and volunteers.'
              })
            }
          }
        ]
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await aiService.generateProposalAnalysis(mockTitle, mockDescription);
      
      // Assert
      expect(result).toHaveProperty('feasibility', 0.8);
      expect(result).toHaveProperty('impact', 0.7);
      expect(result).toHaveProperty('cost', 0.4);
      expect(result).toHaveProperty('timeframe', 0.3);
      expect(result).toHaveProperty('risks');
      expect(result.risks).toHaveLength(3);
      expect(result).toHaveProperty('benefits');
      expect(result.benefits).toHaveLength(3);
      expect(result).toHaveProperty('recommendations');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai-analysis', expect.anything());
    });
    
    test('should handle API errors gracefully', async () => {
      // Arrange
      const mockTitle = 'Test Proposal';
      const mockDescription = 'Test Description';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Act
      const result = await aiService.generateProposalAnalysis(mockTitle, mockDescription);
      
      // Assert
      expect(result).toHaveProperty('feasibility', 0.7);
      expect(result).toHaveProperty('impact', 0.7);
      expect(result).toHaveProperty('risks');
      expect(result.risks).toContain('Implementation challenges');
    });
  });
  
  describe('getLlmFeedback', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockReset();
    });
    
    test('should generate feedback for a proposal', async () => {
      // Arrange
      const mockTitle = 'Community Garden Project';
      const mockDescription = 'Create a community garden in the central district';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This proposal has strong community benefits but could be improved by adding details about funding sources and maintenance plans.'
            }
          }
        ]
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await aiService.getLlmFeedback(mockTitle, mockDescription);
      
      // Assert
      expect(result).toContain('strong community benefits');
      expect(result).toContain('funding sources');
      expect(global.fetch).toHaveBeenCalledWith('/api/llm-feedback', expect.anything());
    });
    
    test('should handle API errors gracefully', async () => {
      // Arrange
      const mockTitle = 'Test Proposal';
      const mockDescription = 'Test Description';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Act & Assert
      await expect(aiService.getLlmFeedback(mockTitle, mockDescription))
        .rejects.toThrow('Failed to get AI feedback');
    });
  });
});