import { addOrUpdateItem, getAllItems, generateId, deleteItem } from '../lib/db';

/**
 * Proposal entity structure
 */
export interface ProposalEntity {
  id: string;
  title: string;
  description: string;
  votes: number;
  aiCreated?: boolean;
  aiVoted?: boolean;
  llmFeedback?: string;
  createdAt: number;
  revisions?: RevisionEntity[];
  analysis?: {
    feasibility: number;
    impact: number;
    cost: number;
    timeframe: number;
    risks: string[];
    benefits: string[];
    recommendations: string;
    stakeholderImpact?: {
      group: string;
      impact: number;
      description: string;
    }[];
    resourceRequirements?: {
      resource: string;
      amount: string;
      priority: 'low' | 'medium' | 'high';
    }[];
    securityImplications?: {
      concern: string;
      severity: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
    implementationSteps?: {
      step: string;
      timeframe: string;
      dependencies: string[];
    }[];
  };
}

/**
 * Revision entity structure
 */
export interface RevisionEntity {
  id: string;
  proposalId: string;
  description: string;
  timestamp: number;
  analysis?: Record<string, unknown>;
}

/**
 * Proposal service class
 */
export class ProposalService {
  private db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  /**
   * Creates a new proposal
   * @param proposal The proposal to create
   * @returns Promise that resolves with the created proposal ID
   */
  async createProposal(proposal: ProposalEntity): Promise<string> {
    const id = generateId();
    await addOrUpdateItem('proposals', proposal);
    return id;
  }

  /**
   * Retrieves a proposal by ID
   * @param id The ID of the proposal to retrieve
   * @returns Promise that resolves with the proposal or null if not found
   */
  async getProposal(id: string): Promise<ProposalEntity | null> {
    const proposals = await getAllItems<ProposalEntity>('proposals');
    return proposals.find((proposal) => proposal.id === id) || null;
  }

  /**
   * Updates a proposal
   * @param id The ID of the proposal to update
   * @param proposal The updated proposal
   * @returns Promise that resolves when the proposal is updated
   */
  async updateProposal(id: string, proposal: ProposalEntity): Promise<void> {
    await addOrUpdateItem('proposals', proposal);
  }

  /**
   * Deletes a proposal by ID
   * @param id The ID of the proposal to delete
   * @returns Promise that resolves when the proposal is deleted
   */
  async deleteProposal(id: string): Promise<void> {
    await deleteItem('proposals', id);
  }

  /**
   * Vote for a proposal
   * @param proposalId The ID of the proposal to vote for
   * @param userId The ID of the user voting
   * @returns Promise that resolves when the vote is recorded
   */
  async voteForProposal(proposalId: string, userId: string): Promise<void> {
    // Get the current proposal
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if the user has already voted for this proposal
    const votes = await getAllItems<VoteEntity>('votes');
    const hasVoted = votes.some(vote => vote.userId === userId && vote.proposalId === proposalId);
    
    if (hasVoted) {
      throw new Error('User has already voted for this proposal');
    }

    // Create a new vote entity
    const voteEntity: VoteEntity = {
      id: generateId(),
      userId,
      proposalId,
      timestamp: Date.now()
    };

    // Save the vote
    await addOrUpdateItem('votes', voteEntity);

    // Increment the proposal's vote count
    proposal.votes += 1;
    await this.updateProposal(proposalId, proposal);
  }

  /**
   * Check if a user has voted for a proposal
   * @param proposalId The ID of the proposal
   * @param userId The ID of the user
   * @returns Promise that resolves with a boolean indicating if the user has voted
   */
  async hasUserVotedForProposal(proposalId: string, userId: string): Promise<boolean> {
    const votes = await getAllItems<VoteEntity>('votes');
    return votes.some(vote => vote.userId === userId && vote.proposalId === proposalId);
  }

  /**
   * Get all proposals
   * @returns Promise that resolves with an array of all proposals
   */
  async getAllProposals(): Promise<ProposalEntity[]> {
    return await getAllItems<ProposalEntity>('proposals');
  }
  
  /**
   * Add a revision to a proposal
   * @param proposalId The ID of the proposal to revise
   * @param revisionText The text of the revision
   * @returns Promise that resolves with the created revision
   */
  async addRevision(proposalId: string, revisionText: string): Promise<RevisionEntity> {
    if (!revisionText || revisionText.trim() === '') {
      throw new Error('Revision text cannot be empty');
    }
    
    // Get the proposal to ensure it exists
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }
    
    // Create the revision entity
    const revisionId = generateId();
    const revision: RevisionEntity = {
      id: revisionId,
      proposalId,
      description: revisionText,
      timestamp: Date.now()
    };
    
    // Add the revision to the proposal
    if (!proposal.revisions) {
      proposal.revisions = [];
    }
    
    proposal.revisions.push(revision);
    
    // Update the proposal
    await this.updateProposal(proposalId, proposal);
    
    // Also store the revision separately
    await addOrUpdateItem('revisions', revision);
    
    return revision;
  }
  
  /**
   * Get all revisions for a proposal
   * @param proposalId The ID of the proposal
   * @returns Promise that resolves with an array of revisions
   */
  async getRevisions(proposalId: string): Promise<RevisionEntity[]> {
    const allRevisions = await getAllItems<RevisionEntity>('revisions');
    return allRevisions.filter(revision => revision.proposalId === proposalId)
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp ascending
  }
  
  /**
   * Check if a user has voted for any proposal
   * @param userId The ID of the user
   * @returns Promise that resolves with a boolean indicating if the user has voted
   */
  async hasUserVoted(userId: string): Promise<boolean> {
    const votes = await getAllItems<VoteEntity>('votes');
    return votes.some(vote => vote.userId === userId);
  }
  
  /**
   * Reset all votes
   * @returns Promise that resolves with the number of votes reset
   */
  async resetVotes(): Promise<{success: boolean, votesReset: number}> {
    try {
      // Get all votes
      const votes = await getAllItems<VoteEntity>('votes');
      const voteCount = votes.length;
      
      // Get all proposals
      const proposals = await getAllItems<ProposalEntity>('proposals');
      
      // Reset vote count for each proposal
      for (const proposal of proposals) {
        proposal.votes = 0;
        await this.updateProposal(proposal.id, proposal);
      }
      
      // Clear the votes store
      for (const vote of votes) {
        await deleteItem('votes', vote.id);
      }
      
      return {
        success: true,
        votesReset: voteCount
      };
    } catch (error) {
      console.error('Error resetting votes:', error);
      return {
        success: false,
        votesReset: 0
      };
    }
  }
}

// Import the VoteEntity type
import { VoteEntity } from './db';
