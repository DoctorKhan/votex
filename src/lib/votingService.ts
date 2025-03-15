import { addOrUpdateItem, getAllItems, deleteItem, generateId } from './db';
import { validateVote } from './securityService';
import { logAction } from './loggingService';
import { ProposalEntity } from './proposalService';

/**
 * Vote entity structure
 */
export interface VoteEntity {
  id: string;
  userId: string;
  proposalId: string;
  timestamp: number;
  verificationHash?: string;
}

/**
 * Voting service class
 */
export class VotingService {
  private db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  /**
   * Generate a shareable vote link for a proposal
   * @param proposalId The ID of the proposal to vote for
   * @returns A shareable link that can be used to vote for the proposal
   */
  generateShareLink(proposalId: string): string {
    // Create a base URL - this should be the domain of your application
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Generate the share link with the proposal ID
    return `${baseUrl}/vote?proposalId=${proposalId}`;
  }

  /**
   * Handle a vote from a share link
   * @param proposalId The ID of the proposal to vote for
   * @param userId The ID of the user voting
   * @returns Promise that resolves with the vote result
   */
  async handleShareLinkVote(proposalId: string, userId: string): Promise<{ success: boolean; voteId: string | null }> {
    // This is essentially the same as voteForProposal, but we might want to add
    // additional tracking or validation specific to shared links in the future
    return this.voteForProposal(proposalId, userId);
  }

  /**
   * Vote for a proposal
   * @param proposalId The ID of the proposal to vote for
   * @param userId The ID of the user voting
   * @returns Promise that resolves with the vote result
   */
  async voteForProposal(proposalId: string, userId: string): Promise<{ success: boolean; voteId: string | null }> {
    try {
      // Check if the user has already voted
      if (await this.hasUserVoted(userId)) {
        throw new Error('User has already voted');
      }

      // Get the proposal to ensure it exists
      const proposals = await getAllItems<ProposalEntity>('proposals');
      const proposal = proposals.find(p => p.id === proposalId);
      
      if (!proposal) {
        throw new Error(`Proposal with ID ${proposalId} not found`);
      }

      // Create the vote object
      const voteId = generateId();
      const vote: VoteEntity = {
        id: voteId,
        userId,
        proposalId,
        timestamp: Date.now()
      };

      // Validate the vote for security
      const previousVotes = await getAllItems<VoteEntity>('votes');
      const validationResult = validateVote(vote, previousVotes);
      
      if (!validationResult.valid) {
        throw new Error(validationResult.reason || 'Vote validation failed');
      }

      // Record the vote
      await addOrUpdateItem('votes', vote);

      // Increment the proposal's vote count
      proposal.votes += 1;
      await addOrUpdateItem('proposals', proposal);

      // Log the voting action
      await logAction({
        type: 'VOTE',
        userId,
        proposalId,
        timestamp: Date.now()
      });

      return {
        success: true,
        voteId
      };
    } catch (error) {
      console.error('Error voting for proposal:', error);
      return {
        success: false,
        voteId: null
      };
    }
  }

  /**
   * Check if a user has voted
   * @param userId The ID of the user
   * @returns Promise that resolves with a boolean indicating if the user has voted
   */
  async hasUserVoted(userId: string): Promise<boolean> {
    const votes = await getAllItems<VoteEntity>('votes');
    return votes.some(vote => vote.userId === userId);
  }

  /**
   * Check if a user has voted for a specific proposal
   * @param userId The ID of the user
   * @param proposalId The ID of the proposal
   * @returns Promise that resolves with a boolean indicating if the user has voted for the proposal
   */
  async hasUserVotedForProposal(userId: string, proposalId: string): Promise<boolean> {
    const votes = await getAllItems<VoteEntity>('votes');
    return votes.some(vote => vote.userId === userId && vote.proposalId === proposalId);
  }

  /**
   * Reset all votes
   * @returns Promise that resolves with the result of the reset operation
   */
  async resetVotes(): Promise<{ success: boolean; votesReset: number }> {
    try {
      // Get all votes
      const votes = await getAllItems<VoteEntity>('votes');
      const voteCount = votes.length;

      // Get all proposals
      const proposals = await getAllItems<ProposalEntity>('proposals');

      // Reset vote count for each proposal
      for (const proposal of proposals) {
        proposal.votes = 0;
        await addOrUpdateItem('proposals', proposal);
      }

      // Clear the votes store
      for (const vote of votes) {
        await deleteItem('votes', vote.id);
      }

      // Log the reset action
      await logAction({
        type: 'RESET_VOTES',
        votesReset: voteCount,
        timestamp: Date.now()
      });

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

  /**
   * Get all votes for a proposal
   * @param proposalId The ID of the proposal
   * @returns Promise that resolves with an array of votes
   */
  async getVotesForProposal(proposalId: string): Promise<VoteEntity[]> {
    const votes = await getAllItems<VoteEntity>('votes');
    return votes.filter(vote => vote.proposalId === proposalId);
  }

  /**
   * Get vote totals for all proposals
   * @returns Promise that resolves with an object mapping proposal IDs to vote counts
   */
  async getVoteTotals(): Promise<Record<string, number>> {
    const votes = await getAllItems<VoteEntity>('votes');
    const totals: Record<string, number> = {};

    votes.forEach(vote => {
      const proposalId = vote.proposalId;
      totals[proposalId] = (totals[proposalId] || 0) + 1;
    });

    return totals;
  }
}
