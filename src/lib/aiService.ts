import { addOrUpdateItem, getAllItems, deleteItem, generateId } from '../lib/db';
import { ProposalEntity } from '../lib/proposalService';

/**
 * AI Service class
 */
export class AIService {
  private db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
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
   * Generates a new AI proposal
   * @param existingProposals Array of existing proposal titles and descriptions
   * @returns Promise that resolves with the generated proposal
   */
  async generateAiProposal(existingProposals: string[]): Promise<ProposalEntity> {
    try {
      const response = await fetch('/api/ai-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ existingProposals }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const title = data.choices[0].message.content.match(/Title: (.*)/)?.[1] || 'AI Generated Proposal';
      const description = data.choices[0].message.content.match(/Description: (.*)/)?.[1] || 'This is an AI-generated proposal.';

      return {
        id: generateId(),
        title,
        description,
        votes: 0,
        aiCreated: true,
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('Error generating AI proposal:', error);
      // Return fallback values
      return {
        id: generateId(),
        title: 'AI Generated Proposal',
        description: 'This is an AI-generated proposal. The AI service encountered an error.',
        votes: 0,
        aiCreated: true,
        createdAt: Date.now(),
      };
    }
  }

  /**
   * Analyzes proposals and votes for the best ones
   * @param proposals Array of proposals to analyze
   * @returns Promise that resolves with an array of proposal IDs to vote for
   */
  async analyzeAndVote(proposals: ProposalEntity[]): Promise<string[]> {
    if (proposals.length === 0) {
      return [];
    }

    try {
      const response = await fetch('/api/ai-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposals }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const voteText = data.choices[0].message.content;
      const voteMatch = voteText.match(/VOTE: (.*)/);
      
      if (voteMatch && voteMatch[1]) {
        const voteIds = voteMatch[1].split(',').map((id: string) => id.trim());
        return proposals
          .filter(p => voteIds.includes(p.id))
          .map(p => p.id);
      }

      // Fallback: vote for the first proposal
      return [proposals[0].id];
    } catch (error) {
      console.error('Error analyzing and voting:', error);
      // Fallback: vote for the first proposal
      return [proposals[0].id];
    }
  }

  /**
   * Generates an analysis for a proposal
   * @param title The proposal title
   * @param description The proposal description
   * @returns Promise that resolves with the analysis
   */
  async generateProposalAnalysis(title: string, description: string): Promise<{
    feasibility: number;
    impact: number;
    cost: number;
    timeframe: number;
    risks: string[];
    benefits: string[];
    recommendations: string;
  }> {
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Error generating proposal analysis:', error);
      // Return fallback values
      return {
        feasibility: 0.5,
        impact: 0.5,
        cost: 0.5,
        timeframe: 0.5,
        risks: ['Unable to analyze risks due to an error'],
        benefits: ['Unable to analyze benefits due to an error'],
        recommendations: 'Unable to provide recommendations due to an error'
      };
    }
  }

  /**
   * Gets LLM feedback for a proposal
   * @param title The proposal title
   * @param description The proposal description
   * @returns Promise that resolves with the feedback
   */
  async getLlmFeedback(title: string, description: string): Promise<string> {
    try {
      const response = await fetch('/api/llm-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting LLM feedback:', error);
      throw new Error('Failed to get AI feedback');
    }
  }
}