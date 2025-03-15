import { ConversationMonitorService } from '../../lib/conversationMonitorService';
import { ForumPostEntity, ForumThreadEntity } from '../../lib/forumService';
import { ProposalEntity } from '../../lib/proposalService';
import * as db from '../../lib/db';
import * as intelligentService from '../../lib/intelligentService';
import * as fs from 'fs';
import * as path from 'path';

// Mock the db module
jest.mock('../../lib/db', () => ({
  generateId: jest.fn().mockReturnValue('mock-id'),
  getAllItems: jest.fn(),
  addOrUpdateItem: jest.fn(),
  deleteItem: jest.fn()
}));

// Mock the intelligentService module
jest.mock('../../lib/intelligentService', () => ({
  generateSmartProposal: jest.fn(),
  analyzeAndVote: jest.fn(),
  generateProposalAnalysis: jest.fn()
}));

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn(),
    unlink: jest.fn().mockResolvedValue(undefined),
    access: jest.fn()
  },
  existsSync: jest.fn()
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

describe('ConversationMonitorService', () => {
  let service: ConversationMonitorService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConversationMonitorService();
  });
  
  describe('monitorConversations', () => {
    test('should analyze forum posts and identify potential improvements', async () => {
      // Arrange
      const mockPosts: ForumPostEntity[] = [
        {
          id: 'post1',
          threadId: 'thread1',
          userId: 'user1',
          content: 'I wish the site had a dark mode feature',
          createdAt: Date.now() - 1000
        },
        {
          id: 'post2',
          threadId: 'thread1',
          userId: 'user2',
          content: 'Yes, dark mode would be great for reducing eye strain',
          createdAt: Date.now()
        }
      ];
      
      const mockThreads: ForumThreadEntity[] = [
        {
          id: 'thread1',
          categoryId: 'category1',
          title: 'Site Improvements',
          createdBy: 'user1',
          createdAt: Date.now() - 2000,
          lastActivityAt: Date.now(),
          viewCount: 10,
          postCount: 2,
          isPinned: false,
          isLocked: false
        }
      ];
      
      (db.getAllItems as jest.Mock).mockImplementation((store) => {
        if (store === 'forumPosts') return Promise.resolve(mockPosts);
        if (store === 'forumThreads') return Promise.resolve(mockThreads);
        return Promise.resolve([]);
      });
      
      // Act
      const result = await service.monitorConversations();
      
      // Assert
      expect(result).toHaveProperty('analyzed', true);
      expect(result).toHaveProperty('potentialImprovements');
      expect(result.potentialImprovements.length).toBeGreaterThan(0);
      expect(db.getAllItems).toHaveBeenCalledWith('forumPosts');
      expect(db.getAllItems).toHaveBeenCalledWith('forumThreads');
    });
    
    test('should return empty improvements when no relevant conversations found', async () => {
      // Arrange
      const mockPosts: ForumPostEntity[] = [
        {
          id: 'post1',
          threadId: 'thread1',
          userId: 'user1',
          content: 'Hello everyone!',
          createdAt: Date.now() - 1000
        }
      ];
      
      (db.getAllItems as jest.Mock).mockImplementation((store) => {
        if (store === 'forumPosts') return Promise.resolve(mockPosts);
        if (store === 'forumThreads') return Promise.resolve([]);
        return Promise.resolve([]);
      });
      
      // Act
      const result = await service.monitorConversations();
      
      // Assert
      expect(result).toHaveProperty('analyzed', true);
      expect(result.potentialImprovements).toEqual([]);
    });
  });
  
  describe('createProposalFromImprovement', () => {
    test('should create a proposal based on identified improvement', async () => {
      // Arrange
      const improvement = {
        title: 'Add Dark Mode',
        description: 'Implement a dark mode feature to reduce eye strain',
        confidence: 0.85
      };
      
      const mockProposal = {
        title: 'Add Dark Mode Feature',
        description: 'Implement a dark mode toggle to improve user experience and reduce eye strain during nighttime usage.'
      };
      
      (intelligentService.generateSmartProposal as jest.Mock).mockResolvedValue(mockProposal);
      
      // Act
      const result = await service.createProposalFromImprovement(improvement);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title', mockProposal.title);
      expect(result).toHaveProperty('description', mockProposal.description);
      expect(result).toHaveProperty('aiCreated', true);
      expect(db.addOrUpdateItem).toHaveBeenCalledWith('proposals', expect.any(Object));
    });
  });
  
  describe('checkProposalStatus', () => {
    test('should identify approved proposals', async () => {
      // Arrange
      const mockProposals: ProposalEntity[] = [
        {
          id: 'proposal1',
          title: 'Add Dark Mode',
          description: 'Implement dark mode feature',
          votes: 10,
          aiCreated: true,
          createdAt: Date.now() - 1000
        },
        {
          id: 'proposal2',
          title: 'Improve Navigation',
          description: 'Make navigation more intuitive',
          votes: 2,
          aiCreated: true,
          createdAt: Date.now() - 2000
        }
      ];
      
      (db.getAllItems as jest.Mock).mockResolvedValue(mockProposals);
      
      // Act
      const result = await service.checkProposalStatus(5); // Threshold of 5 votes
      
      // Assert
      expect(result).toHaveProperty('approvedProposals');
      expect(result.approvedProposals).toHaveLength(1);
      expect(result.approvedProposals[0].id).toBe('proposal1');
    });
  });
  
  describe('createDesignDocument', () => {
    test('should create a design document for an approved proposal', async () => {
      // Arrange
      const proposal: ProposalEntity = {
        id: 'proposal1',
        title: 'Add Dark Mode',
        description: 'Implement dark mode feature',
        votes: 10,
        aiCreated: true,
        createdAt: Date.now()
      };
      
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);
      
      // Act
      const result = await service.createDesignDocument(proposal);
      
      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('documentPath');
      expect(fs.promises.mkdir).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });
  });
  
  describe('deleteDesignDocument', () => {
    test('should delete a design document once implemented', async () => {
      // Arrange
      const documentPath = 'designs/add-dark-mode/design.md';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      // Act
      const result = await service.deleteDesignDocument(documentPath);
      
      // Assert
      expect(result).toHaveProperty('success', true);
      expect(fs.promises.unlink).toHaveBeenCalledWith(documentPath);
    });
    
    test('should handle case when document does not exist', async () => {
      // Arrange
      const documentPath = 'designs/add-dark-mode/design.md';
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      // Act
      const result = await service.deleteDesignDocument(documentPath);
      
      // Assert
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', 'Document does not exist');
      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });
  });
  
  describe('processConversations', () => {
    test('should monitor conversations, create proposals, and handle approved proposals', async () => {
      // Arrange
      const mockImprovement = {
        title: 'Add Dark Mode',
        description: 'Implement a dark mode feature to reduce eye strain',
        confidence: 0.85
      };
      
      const mockProposal: ProposalEntity = {
        id: 'proposal1',
        title: 'Add Dark Mode',
        description: 'Implement dark mode feature',
        votes: 10,
        aiCreated: true,
        createdAt: Date.now()
      };
      
      // Mock the service methods
      jest.spyOn(service, 'monitorConversations').mockResolvedValue({
        analyzed: true,
        potentialImprovements: [mockImprovement]
      });
      
      jest.spyOn(service, 'createProposalFromImprovement').mockResolvedValue(mockProposal);
      
      jest.spyOn(service, 'checkProposalStatus').mockResolvedValue({
        approvedProposals: [mockProposal],
        pendingProposals: []
      });
      
      jest.spyOn(service, 'createDesignDocument').mockResolvedValue({
        success: true,
        documentPath: 'designs/add-dark-mode/design.md'
      });
      
      // Act
      const result = await service.processConversations();
      
      // Assert
      expect(result).toHaveProperty('processed', true);
      expect(result).toHaveProperty('newProposals');
      expect(result).toHaveProperty('approvedProposals');
      expect(service.monitorConversations).toHaveBeenCalled();
      expect(service.createProposalFromImprovement).toHaveBeenCalled();
      expect(service.checkProposalStatus).toHaveBeenCalled();
      expect(service.createDesignDocument).toHaveBeenCalled();
    });
  });
});