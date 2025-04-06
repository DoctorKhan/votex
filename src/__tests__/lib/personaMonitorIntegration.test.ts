import * as personaImplementation from '../../../personas/persona-implementation';
import * as db from '../../lib/db';
import * as fs from 'fs';

// Mock the persona-implementation module
jest.mock('../../../personas/persona-implementation', () => ({
  generateProposal: jest.fn()
}));

// Mock the db module
jest.mock('../../lib/db', () => ({
  getAllItems: jest.fn(),
  addOrUpdateItem: jest.fn()
}));

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn()
  },
  existsSync: jest.fn()
}));

// Mock the path module
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

// Define types for the mock responses
interface ImprovementSuggestion {
  title: string;
  description: string;
  confidence: number;
}

interface MonitoringResult {
  analyzed: boolean;
  potentialImprovements: ImprovementSuggestion[];
  error?: string;
}

interface ProposalEntity {
  id: string;
  title: string;
  description: string;
  votes: number;
  aiCreated: boolean;
  createdAt: number;
  implemented?: boolean;
}

interface DesignDocumentResult {
  success: boolean;
  documentPath?: string;
  error?: string;
}

interface ProposalStatusResult {
  approvedProposals: ProposalEntity[];
  pendingProposals: ProposalEntity[];
  error?: string;
}

// Define a type for the persona ID
type PersonaId = 'jamie-dev' | 'alex-chen' | 'sophia-rodriguez' | 'thomas-williams';

// Create a simplified version of the PersonaMonitorIntegration class for testing
class MockPersonaMonitorIntegration {
  private personaId: PersonaId = 'jamie-dev';
  private readonly DESIGNS_DIR = 'designs';
  private readonly IMPLEMENTATION_PROBABILITY = 0.3;
  
  public mockMonitorConversations: jest.Mock;
  public mockCreateProposalFromImprovement: jest.Mock;
  public mockCheckProposalStatus: jest.Mock;
  public mockCreateDesignDocument: jest.Mock;
  public mockDeleteDesignDocument: jest.Mock;
  
  constructor() {
    this.mockMonitorConversations = jest.fn();
    this.mockCreateProposalFromImprovement = jest.fn();
    this.mockCheckProposalStatus = jest.fn();
    this.mockCreateDesignDocument = jest.fn();
    this.mockDeleteDesignDocument = jest.fn();
  }
  
  async runIntegration() {
    try {
      // Step 1: Monitor conversations
      console.log('Jamie Developer is monitoring conversations...');
      const monitoringResults = await this.mockMonitorConversations();
      
      if (!monitoringResults.analyzed) {
        return {
          success: false,
          error: monitoringResults.error || 'Failed to analyze conversations'
        };
      }

      // Step 2: Create proposals for identified improvements
      console.log('Jamie Developer is creating proposals for identified improvements...');
      const newProposals: ProposalEntity[] = [];
      
      for (const improvement of monitoringResults.potentialImprovements) {
        // Generate a proposal using the Jamie Developer persona
        await personaImplementation.generateProposal(this.personaId, {
          proposalContext: {
            recentTopics: [improvement.title],
            communityNeeds: [improvement.description],
            ongoingDiscussions: []
          }
        });
        
        // Create a proposal using the Conversation Monitor Service
        const proposal = await this.mockCreateProposalFromImprovement(improvement);
        newProposals.push(proposal);
      }
      
      // Step 3: Check for approved proposals
      console.log('Jamie Developer is checking for approved proposals...');
      const statusResult = await this.mockCheckProposalStatus();
      
      // Step 4: Create design documents for approved proposals
      console.log('Jamie Developer is creating design documents for approved proposals...');
      const designDocuments: string[] = [];
      
      for (const proposal of statusResult.approvedProposals) {
        const documentResult = await this.mockCreateDesignDocument(proposal);
        if (documentResult && documentResult.success && documentResult.documentPath) {
          designDocuments.push(documentResult.documentPath);
        }
      }
      
      // Step 5: Implement approved proposals using test-driven development
      console.log('Jamie Developer is implementing approved proposals...');
      const implementedProposals: ProposalEntity[] = [];
      
      // Check all design documents in the designs directory
      try {
        if (fs.existsSync(this.DESIGNS_DIR)) {
          const designDirs = await fs.promises.readdir(this.DESIGNS_DIR);
          
          for (const dir of designDirs) {
            const documentPath = `${this.DESIGNS_DIR}/${dir}/design.md`;
            
            // Check if the design document exists
            if (fs.existsSync(documentPath)) {
              // Simulate implementation using test-driven development
              const implemented = Math.random() < this.IMPLEMENTATION_PROBABILITY;
              
              if (implemented) {
                // Get the proposal ID from the design document
                const designContent = await fs.promises.readFile(documentPath, 'utf8');
                const proposalIdMatch = designContent.match(/Proposal ID: ([a-zA-Z0-9-]+)/);
                const proposalId = proposalIdMatch ? proposalIdMatch[1] : 'unknown';
                
                // Find the proposal in the database
                const proposals = await db.getAllItems('proposals') as ProposalEntity[];
                const proposal = proposals.find(p => p.id === proposalId);
                
                if (proposal) {
                  implementedProposals.push(proposal);
                  
                  // Update the proposal status
                  const updatedProposal = {
                    ...proposal,
                    implemented: true
                  };
                  await db.addOrUpdateItem('proposals', updatedProposal);
                  
                  // Delete the design document
                  await this.mockDeleteDesignDocument(documentPath);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error implementing proposals:', error);
      }
      
      return {
        success: true,
        monitoringResults,
        newProposals,
        implementedProposals
      };
    } catch (error) {
      console.error('Error in persona monitor integration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  schedulePeriodicRuns(intervalMinutes = 60) {
    console.log(`Scheduling persona monitor integration to run every ${intervalMinutes} minutes`);
    
    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Schedule the integration to run periodically
    const intervalId = setInterval(async () => {
      console.log('Running scheduled persona monitor integration...');
      await this.runIntegration();
    }, intervalMs);
    
    return intervalId;
  }
  
  // Methods to set up mock responses
  setMonitorConversationsResponse(response: MonitoringResult) {
    this.mockMonitorConversations.mockResolvedValue(response);
    return this;
  }
  
  setCreateProposalFromImprovementResponse(response: ProposalEntity) {
    this.mockCreateProposalFromImprovement.mockResolvedValue(response);
    return this;
  }
  
  setCheckProposalStatusResponse(response: ProposalStatusResult) {
    this.mockCheckProposalStatus.mockResolvedValue(response);
    return this;
  }
  
  setCreateDesignDocumentResponse(response: DesignDocumentResult) {
    this.mockCreateDesignDocument.mockResolvedValue(response);
    return this;
  }
  
  setDeleteDesignDocumentResponse(response: DesignDocumentResult) {
    this.mockDeleteDesignDocument.mockResolvedValue(response);
    return this;
  }
}

describe('PersonaMonitorIntegration', () => {
  let integration: MockPersonaMonitorIntegration;
  
  beforeEach(() => {
    jest.clearAllMocks();
    integration = new MockPersonaMonitorIntegration();
  });
  
  describe('runIntegration', () => {
    test('should monitor conversations and create proposals', async () => {
      // Arrange
      const mockImprovements = [
        {
          title: 'Add Dark Mode',
          description: 'Implement a dark mode feature',
          confidence: 0.85
        }
      ];
      
      const mockProposal = {
        id: 'proposal1',
        title: 'Add Dark Mode',
        description: 'Implement a dark mode feature',
        votes: 0,
        aiCreated: true,
        createdAt: Date.now()
      };
      
      // Setup mocks
      integration
        .setMonitorConversationsResponse({
          analyzed: true,
          potentialImprovements: mockImprovements
        })
        .setCreateProposalFromImprovementResponse(mockProposal)
        .setCheckProposalStatusResponse({
          approvedProposals: [],
          pendingProposals: [mockProposal]
        });
      
      // Act
      const result = await integration.runIntegration();
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.newProposals).toHaveLength(1);
      expect(personaImplementation.generateProposal).toHaveBeenCalled();
    });
    
    test('should handle approved proposals and create design documents', async () => {
      // Arrange
      const mockImprovements = [
        {
          title: 'Add Dark Mode',
          description: 'Implement a dark mode feature',
          confidence: 0.85
        }
      ];
      
      const mockProposal = {
        id: 'proposal1',
        title: 'Add Dark Mode',
        description: 'Implement a dark mode feature',
        votes: 10,
        aiCreated: true,
        createdAt: Date.now()
      };
      
      // Setup mocks directly on the mock functions
      integration.mockMonitorConversations.mockResolvedValue({
          analyzed: true,
          potentialImprovements: mockImprovements
      });
      integration.mockCheckProposalStatus.mockResolvedValue({
          approvedProposals: [mockProposal],
          pendingProposals: []
      });
      integration.mockCreateDesignDocument.mockResolvedValue({
          success: true,
          documentPath: 'designs/add-dark-mode/design.md'
      });
      
      // Mock the actual generateProposal function called in step 2
      (personaImplementation.generateProposal as jest.Mock).mockResolvedValue({ success: true });
      
      // Act
      const result = await integration.runIntegration();
      
      // Assert
      expect(result.success).toBe(true);
      // Check that the createDesignDocument mock was called, indicating step 4 was reached
      expect(integration.mockCreateDesignDocument).toHaveBeenCalledWith(mockProposal);
    });
    
    test('should handle implementation of approved proposals', async () => {
      // Arrange
      const mockProposal = {
        id: 'proposal1',
        title: 'Add Dark Mode',
        description: 'Implement a dark mode feature',
        votes: 10,
        aiCreated: true,
        createdAt: Date.now()
      };
      
      // Setup mocks
      integration
        .setMonitorConversationsResponse({
          analyzed: true,
          potentialImprovements: []
        })
        .setCheckProposalStatusResponse({
          approvedProposals: [],
          pendingProposals: []
        })
        .setCreateDesignDocumentResponse({
          success: true,
          documentPath: 'designs/add-dark-mode/design.md'
        })
        .setDeleteDesignDocumentResponse({
          success: true
        });
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['add-dark-mode']);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(`# Design Document: Add Dark Mode
Created: 2025-03-14
Proposal ID: proposal1`);
      
      (db.getAllItems as jest.Mock).mockResolvedValue([mockProposal]);
      
      // Mock the random implementation to always return true
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      
      // Act
      const result = await integration.runIntegration();
      
      // Assert
      expect(result.success).toBe(true);
      expect(db.addOrUpdateItem).toHaveBeenCalled();
    });
    
    test('should handle errors during monitoring', async () => {
      // Arrange
      integration
        .setMonitorConversationsResponse({
          analyzed: false,
          potentialImprovements: [],
          error: 'Failed to analyze conversations'
        });
      
      // Act
      const result = await integration.runIntegration();
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to analyze conversations');
    });
  });
  
  describe('schedulePeriodicRuns', () => {
    test('should schedule periodic runs', () => {
      // Arrange
      jest.useFakeTimers();
      jest.spyOn(global, 'setInterval');
      
      // Act
      const intervalId = integration.schedulePeriodicRuns(30);
      
      // Assert
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30 * 60 * 1000);
      
      // Cleanup
      clearInterval(intervalId);
      jest.useRealTimers();
    });
  });
});