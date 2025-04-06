import {
  generateSmartProposal,
  analyzeAndVote,
  generateProposalAnalysis,
  getSmartFeedback
} from '../../lib/intelligentService';

// Use import for node-fetch to avoid ESM issues
import fetch from 'node-fetch';

jest.mock('node-fetch', () => jest.fn());
jest.mock('../../lib/loggingService', () => ({
  logAction: jest.fn().mockResolvedValue({ success: true })
}));

describe('Intelligent Service', () => {
  let consoleErrorSpy: jest.SpyInstance; // Declare spy at the top level
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smart Proposal Generation', () => {
    test('should generate a new intelligent proposal', async () => {
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
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await generateSmartProposal([]);
      
      // Assert
      expect(result).toHaveProperty('title', 'Community Garden Expansion');
      expect(result).toHaveProperty('description');
      expect(result.description).toContain('Expand the existing community garden');
      expect(fetch).toHaveBeenCalled();
    });

    test('should generate a unique proposal when given existing proposals', async () => {
      // Arrange
      const mockProposals: { id: number, title: string, description: string, votes: number }[] = [
        { id: 1, title: 'Community Garden Project: Create a community garden in the central district', description: 'Description 1', votes: 0 },
        { id: 2, title: 'Public Transportation Expansion: Expand public transportation routes', description: 'Description 2', votes: 0 },
        { id: 3, title: 'Proposal 3', description: 'Description 3', votes: 0 }
      ];
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Title: Youth Coding Program\nDescription: Establish a coding program for youth to learn programming skills and digital literacy.'
            }
          }
        ]
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await generateSmartProposal(mockProposals.map(proposal => proposal.title));
      
      // Assert
      expect(result).toHaveProperty('title', 'Youth Coding Program');
      expect(result).toHaveProperty('description');
      expect(result.description).toContain('Establish a coding program');
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        body: expect.stringContaining('existing proposals')
      }));
    });

    test('should handle API errors gracefully', async () => {
      // Arrange
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });
      
      // Act
      const result = await generateSmartProposal([]);
      
      // Assert
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      // Should return fallback values
      expect(result.title).toBe('Community Improvement Initiative');
    });
  });

  describe('Intelligent Voting', () => {
    test('should analyze proposals and vote for the best ones', async () => {
      // Arrange
      const mockProposals: { id: number, title: string, description: string, votes: number }[] = [
        { id: 1, title: 'Proposal 1', description: 'Description 1', votes: 0 },
        { id: 2, title: 'Proposal 2', description: 'Description 2', votes: 0 },
        { id: 3, title: 'Proposal 3', description: 'Description 3', votes: 0 }
      ];
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'VOTE: 1, 3\nREASONING: Proposals 1 and 3 offer the most comprehensive solutions...'
            }
          }
        ]
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        // Use explicit Promise resolve for the json method
        json: () => Promise.resolve(mockResponse)
      });
      
      // Act
      const result = await analyzeAndVote(mockProposals);
      
      // Assert
      expect(result).toContain(1);
      expect(result).toContain(3);
      expect(result).not.toContain(2);
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        body: expect.stringContaining('evaluate the following community proposals')
      }));
    });

    test('should handle empty proposals array', async () => {
      // Arrange
      const mockProposals: { id: number, title: string, description: string, votes: number }[] = [];
      
      // Act
      const result = await analyzeAndVote(mockProposals);
      
      // Assert
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should handle API errors gracefully', async () => {
      // Arrange
      const mockTitle = 'Test Proposal';
      const mockDescription = 'Test Description';
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });
      
      // Act
      const mockProposal = { id: 1, title: mockTitle, description: mockDescription, votes: 0 };
      const result = await analyzeAndVote([mockProposal]);
      
      // Assert
      expect(result).toEqual([1]);
    });
  });

  describe('Intelligent Proposal Analysis', () => {
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
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await generateProposalAnalysis(mockTitle, mockDescription);
      
      // Assert
      expect(result).toHaveProperty('feasibility', 0.8);
      expect(result).toHaveProperty('impact', 0.7);
      expect(result).toHaveProperty('cost', 0.4);
      expect(result).toHaveProperty('timeframe', 0.3);
      expect(result).toHaveProperty('risks');
      expect(result.risks).toHaveLength(3);
      expect(result.risks).toContain('Weather dependency');
      expect(result).toHaveProperty('benefits');
      expect(result.benefits).toHaveLength(3);
      expect(result.benefits).toContain('Community building');
      expect(result).toHaveProperty('recommendations');
      expect(result.recommendations).toContain('Partner with local schools');
    });

    test('should handle API errors gracefully', async () => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // Arrange
      const mockTitle = 'Test Proposal';
      const mockDescription = 'Test Description';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is not valid JSON'
            }
          }
        ]
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await generateProposalAnalysis(mockTitle, mockDescription);
      
      // Assert
      expect(result).toHaveProperty('feasibility');
      expect(result).toHaveProperty('impact');
      // Should return fallback values
      expect(result.feasibility).toBe(0.7);
      consoleErrorSpy.mockRestore();
    });

    test('should extract JSON from response text with surrounding content', async () => {
      // Arrange
      const mockTitle = 'Community Garden Project';
      const mockDescription = 'Create a community garden in the central district';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: `Here's my analysis:
              {
                "feasibility": 0.9,
                "impact": 0.8,
                "cost": 0.5,
                "timeframe": 0.4,
                "risks": ["Weather dependency", "Volunteer availability"],
                "benefits": ["Fresh produce", "Community building"],
                "recommendations": "Partner with local schools."
              }
              I hope this helps!`
            }
          }
        ]
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await generateProposalAnalysis(mockTitle, mockDescription);
      
      // Assert
      expect(result).toHaveProperty('feasibility', 0.9);
      expect(result).toHaveProperty('impact', 0.8);
      expect(result.risks).toHaveLength(2);
      expect(result.benefits).toHaveLength(2);
    });
  });

  describe('Smart Feedback', () => {
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
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await getSmartFeedback(mockTitle, mockDescription);
      
      // Assert
      expect(result).toContain('strong community benefits');
      expect(result).toContain('funding sources');
      expect(fetch).toHaveBeenCalled();
    });

    test('should reject empty title or description', async () => {
      // Arrange
      const emptyTitle = '';
      const mockDescription = 'Test Description';
      const mockTitle = 'Test Title';
      const emptyDescription = '';
      
      // Act & Assert
      await expect(getSmartFeedback(emptyTitle, mockDescription))
        .rejects.toThrow('Title and description are required');
        
      await expect(getSmartFeedback(mockTitle, emptyDescription))
        .rejects.toThrow('Title and description are required');
      // Removed misplaced mockRestore
    });

    test('should handle API errors gracefully', async () => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // Arrange
      const mockTitle = 'Test Proposal';
      const mockDescription = 'Test Description';
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });
      
      // Act & Assert
      await expect(getSmartFeedback(mockTitle, mockDescription))
        .rejects.toThrow('Failed to get intelligent feedback');
      consoleErrorSpy.mockRestore(); // Restore the spy here
    });
  });
});