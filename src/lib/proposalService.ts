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
  revisions?: Array<{
    id: number;
    description: string;
    timestamp: string;
  }>;
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
}

// Import the VoteEntity type
import { VoteEntity } from './db';