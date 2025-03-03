import { ProposalService, ProposalEntity, RevisionEntity } from '../../lib/proposalService';
import { addOrUpdateItem, getAllItems, generateId, deleteItem } from '../../lib/db';

// Mock the db module
jest.mock('../../lib/db', () => ({
  addOrUpdateItem: jest.fn().mockResolvedValue('mock-id'),
  getAllItems: jest.fn(),
  deleteItem: jest.fn().mockResolvedValue(undefined),
  generateId: jest.fn().mockReturnValue('mock-id'),
}));

describe('Proposal Revisions', () => {
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
  
  describe('addRevision', () => {
    test('should add a revision to an existing proposal', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const mockRevisionText = 'Updated proposal description';
      const mockRevisionId = 'revision-456';
      const mockProposal: ProposalEntity = {
        id: mockProposalId,
        title: 'Test Proposal',
        description: 'Original description',
        votes: 0,
        createdAt: Date.now()
      };
      
      (getAllItems as jest.Mock).mockResolvedValueOnce([mockProposal]);
      (generateId as jest.Mock).mockReturnValue(mockRevisionId);
      
      // Act
      const result = await proposalService.addRevision(mockProposalId, mockRevisionText);
      
      // Assert
      expect(addOrUpdateItem).toHaveBeenCalledTimes(2); // Once for the proposal update, once for the revision
      expect(result).toHaveProperty('id', mockRevisionId);
      expect(result).toHaveProperty('proposalId', mockProposalId);
      expect(result).toHaveProperty('description', mockRevisionText);
      expect(result).toHaveProperty('timestamp');
      expect(result.analysis).toBeUndefined();
    });
    
    test('should add a revision with analysis to an existing proposal', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const mockRevisionText = 'Updated proposal description with analysis';
      const mockRevisionId = 'revision-456';
      const mockAnalysis = {
        feasibility: 0.8,
        impact: 0.7,
        cost: 0.6,
        timeframe: 0.5,
        risks: ['Risk 1', 'Risk 2'],
        benefits: ['Benefit 1', 'Benefit 2'],
        recommendations: 'These are the recommendations'
      };
      
      const mockProposal: ProposalEntity = {
        id: mockProposalId,
        title: 'Test Proposal',
        description: 'Original description',
        votes: 0,
        createdAt: Date.now()
      };
      
      (getAllItems as jest.Mock).mockResolvedValueOnce([mockProposal]);
      (generateId as jest.Mock).mockReturnValue(mockRevisionId);
      
      // Act
      const result = await proposalService.addRevision(mockProposalId, mockRevisionText, mockAnalysis);
      
      // Assert
      expect(addOrUpdateItem).toHaveBeenCalledTimes(2); // Once for the proposal update, once for the revision
      expect(result).toHaveProperty('id', mockRevisionId);
      expect(result).toHaveProperty('proposalId', mockProposalId);
      expect(result).toHaveProperty('description', mockRevisionText);
      expect(result).toHaveProperty('timestamp');
      expect(result.analysis).toEqual(mockAnalysis);
    });

    test('should reject revision with empty text', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const mockRevisionText = '';
      
      // Act & Assert
      await expect(proposalService.addRevision(mockProposalId, mockRevisionText))
        .rejects.toThrow('Revision text cannot be empty');
    });
    
    test('should reject revision for non-existent proposal', async () => {
      // Arrange
      const mockProposalId = 'non-existent-id';
      const mockRevisionText = 'This is a revision';
      
      (getAllItems as jest.Mock).mockResolvedValueOnce([]); // No proposals found
      
      // Act & Assert
      await expect(proposalService.addRevision(mockProposalId, mockRevisionText))
        .rejects.toThrow(`Proposal with ID ${mockProposalId} not found`);
    });
  });

  describe('getRevisions', () => {
    test('should retrieve all revisions for a proposal', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const mockRevisions: RevisionEntity[] = [
        {
          id: 'revision-1',
          proposalId: mockProposalId,
          description: 'First revision',
          timestamp: Date.now() - 1000
        },
        {
          id: 'revision-2',
          proposalId: mockProposalId,
          description: 'Second revision',
          timestamp: Date.now()
        },
        {
          id: 'revision-3',
          proposalId: 'other-proposal-id', // Different proposal
          description: 'Other proposal revision',
          timestamp: Date.now()
        }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockRevisions);
      
      // Act
      const result = await proposalService.getRevisions(mockProposalId);
      
      // Assert
      expect(result).toHaveLength(2); // Only the revisions for the specified proposal
      expect(result[0]).toHaveProperty('id', 'revision-1');
      expect(result[1]).toHaveProperty('id', 'revision-2');
      expect(result.every(r => r.proposalId === mockProposalId)).toBe(true);
    });

    test('should return an empty array if no revisions exist', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      
      (getAllItems as jest.Mock).mockResolvedValueOnce([]);
      
      // Act
      const result = await proposalService.getRevisions(mockProposalId);
      
      // Assert
      expect(result).toEqual([]);
    });
    
    test('should sort revisions by timestamp', async () => {
      // Arrange
      const mockProposalId = 'proposal-123';
      const oldestTime = Date.now() - 2000;
      const middleTime = Date.now() - 1000; 
      const newestTime = Date.now();
      
      const mockRevisions: RevisionEntity[] = [
        {
          id: 'revision-2',
          proposalId: mockProposalId,
          description: 'Middle revision',
          timestamp: middleTime,
          analysis: {
            feasibility: 0.6,
            impact: 0.6,
            cost: 0.5,
            timeframe: 0.5,
            risks: ['Risk 1', 'Risk 2'],
            benefits: ['Benefit 1', 'Benefit 2'],
            recommendations: 'Revision 2 recommendations'
          }
        },
        {
          id: 'revision-3',
          proposalId: mockProposalId,
          description: 'Newest revision',
          timestamp: newestTime,
          analysis: {
            feasibility: 0.8,
            impact: 0.9,
            cost: 0.7,
            timeframe: 0.5,
            risks: ['Risk A', 'Risk B'],
            benefits: ['Benefit A', 'Benefit B'],
            recommendations: 'Revision 3 recommendations'
          }
        },
        {
          id: 'revision-1',
          proposalId: mockProposalId,
          description: 'Oldest revision',
          timestamp: oldestTime,
          analysis: {
            feasibility: 0.4,
            impact: 0.3,
            cost: 0.3,
            timeframe: 0.3,
            risks: ['Risk X', 'Risk Y'],
            benefits: ['Benefit X', 'Benefit Y'],
            recommendations: 'Revision 1 recommendations'
          }
        }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockRevisions);
      
      // Act
      const result = await proposalService.getRevisions(mockProposalId);
      
      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id', 'revision-1'); // Oldest first
      expect(result[1]).toHaveProperty('id', 'revision-2');
      expect(result[2]).toHaveProperty('id', 'revision-3'); // Newest last
      
      // Verify each revision has its corresponding analysis
      expect(result[0].analysis!.feasibility).toBe(0.4);
      expect(result[1].analysis!.feasibility).toBe(0.6);
      expect(result[2].analysis!.feasibility).toBe(0.8);
      
      // Check that the recommendations are correct for each revision
      expect(result[0].analysis!.recommendations).toBe('Revision 1 recommendations');
      expect(result[1].analysis!.recommendations).toBe('Revision 2 recommendations');
      expect(result[2].analysis!.recommendations).toBe('Revision 3 recommendations');
    });
  });
  
  describe('getRevision', () => {
    test('should retrieve a specific revision by ID', async () => {
      // Arrange
      const revisionId = 'revision-123';
      const mockRevision: RevisionEntity = {
        id: revisionId,
        proposalId: 'proposal-456',
        description: 'Specific revision content',
        timestamp: Date.now(),
        analysis: {
          feasibility: 0.7,
          impact: 0.8,
          cost: 0.5,
          timeframe: 0.6,
          risks: ['Risk A', 'Risk B'],
          benefits: ['Benefit A', 'Benefit B'],
          recommendations: 'Specific revision recommendations'
        }
      };
      
      // Mock that there are multiple revisions in the database
      const mockRevisions = [
        { id: 'other-revision-1', proposalId: 'proposal-456', description: 'Other revision', timestamp: Date.now() - 1000 },
        mockRevision, 
        { id: 'other-revision-2', proposalId: 'proposal-789', description: 'Another revision', timestamp: Date.now() + 1000 }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockRevisions);
      
      // Act
      const result = await proposalService.getRevision(revisionId);
      
      // Assert
      expect(result).toEqual(mockRevision);
      expect(result!.analysis!.feasibility).toBe(0.7);
      expect(result!.analysis!.recommendations).toBe('Specific revision recommendations');
    });
    
    test('should return null for non-existent revision ID', async () => {
      // Arrange
      const nonExistentId = 'non-existent-revision';
      const mockRevisions = [
        { id: 'revision-1', proposalId: 'proposal-1', description: 'Revision 1', timestamp: Date.now() },
        { id: 'revision-2', proposalId: 'proposal-2', description: 'Revision 2', timestamp: Date.now() }
      ];
      
      (getAllItems as jest.Mock).mockResolvedValueOnce(mockRevisions);
      
      // Act
      const result = await proposalService.getRevision(nonExistentId);
      
      // Assert
      expect(result).toBeNull();
    });
  });
});
