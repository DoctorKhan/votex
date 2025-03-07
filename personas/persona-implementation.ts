/**
 * LLM Persona Implementation
 * This module provides utilities for simulating community member personas
 * in the Votex platform.
 */

// Define persona ID type
export type PersonaId = 'alex-chen' | 'sophia-rodriguez' | 'thomas-williams';

// Context interfaces
export interface ProposalContext {
  recentTopics: string[];
  communityNeeds: string[];
  ongoingDiscussions: string[];
}

export interface VotingContext {
  recentProposals: Array<{id: string; title: string; content: string}>;
  userVotingHistory: Record<string, 'approve' | 'reject' | 'abstain'>;
}

export interface ForumContext {
  activeThreads: Array<{id: string; title: string; content: string}>;
  recentDiscussions: string[];
  controversialTopics: string[];
}

export interface PersonaContext {
  proposalContext?: ProposalContext;
  votingContext?: VotingContext;
  forumContext?: ForumContext;
}

// Result interfaces
export interface ProposalEntity {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface VoteEntity {
  vote: 'approve' | 'reject' | 'abstain';
  reasoning: string;
}

export interface ForumPostEntity {
  threadId: string;
  userId: string;
  content: string;
  createdAt: Date;
  tags?: string[];
}

/**
 * Get all available personas
 */
export function getAllPersonas(): Array<{id: PersonaId; name: string; displayName: string}> {
  return [
    { id: 'alex-chen', name: 'Dr. Alex Chen', displayName: 'AlexC' },
    { id: 'sophia-rodriguez', name: 'Sophia Rodriguez', displayName: 'Sophia_R' },
    { id: 'thomas-williams', name: 'Thomas Williams', displayName: 'ThomasW' }
  ];
}

/**
 * Schedule periodic activities for persona(s)
 */
export function schedulePersonaActivity(personaIds: PersonaId[], frequency: 'high' | 'medium' | 'low' = 'medium'): void {
  console.log('Scheduled persona activity:', { personaIds, frequency });
  
  // In a real implementation, this would set up scheduled tasks for each persona
  // based on their frequency settings
  
  // Store active personas in localStorage to persist between page reloads and focus changes
  try {
    const activePersonas = JSON.parse(localStorage.getItem('activePersonas') || '[]');
    const updatedPersonas = [...new Set([...activePersonas, ...personaIds])];
    localStorage.setItem('activePersonas', JSON.stringify(updatedPersonas));
    localStorage.setItem('personaFrequency', frequency);
  } catch (e) {
    console.error('Failed to store active personas in localStorage:', e);
  }
}

/**
 * Generate a proposal from a given persona
 */
export async function generateProposal(personaId: PersonaId, context: PersonaContext): Promise<Partial<ProposalEntity>> {
  const persona = getPersonaDetails(personaId);
  
  // In a real implementation, this would use an LLM to generate a proposal
  // based on the persona's characteristics and the provided context
  return {
    title: `${persona.name}'s Proposal on ${persona.focusAreas[0]}`,
    content: `As an expert in ${persona.expertise}, I propose we implement changes to improve ${persona.focusAreas[0]}.`,
    category: persona.focusAreas[0],
    tags: [persona.expertise, ...persona.focusAreas.slice(0, 2)]
  };
}

/**
 * Simulate a vote from a given persona on a proposal
 */
export async function simulateVote(
  personaId: PersonaId, 
  proposalId: string, 
  proposalContent: string, 
  context: PersonaContext
): Promise<Partial<VoteEntity>> {
  const persona = getPersonaDetails(personaId);
  
  // Simplified vote simulation
  // In a real implementation, this would analyze the proposal content
  // and make a decision based on the persona's preferences
  const hasPositiveMatch = persona.positiveTerms.some(term => 
    proposalContent.toLowerCase().includes(term.toLowerCase())
  );
  
  const hasNegativeMatch = persona.negativeTerms.some(term => 
    proposalContent.toLowerCase().includes(term.toLowerCase())
  );
  
  let vote: 'approve' | 'reject' | 'abstain';
  let reasoning: string;
  
  if (hasPositiveMatch && !hasNegativeMatch) {
    vote = 'approve';
    reasoning = `This aligns with my focus on ${persona.focusAreas[0]}.`;
  } else if (hasNegativeMatch) {
    vote = 'reject';
    reasoning = `This conflicts with my principles regarding ${persona.focusAreas[0]}.`;
  } else {
    vote = 'abstain';
    reasoning = 'I need more information before making a decision.';
  }
  
  return { vote, reasoning };
}

/**
 * Generate a forum comment from a given persona
 */
export async function generateForumComment(
  personaId: PersonaId, 
  threadId: string, 
  threadContent: string, 
  existingComments: ForumPostEntity[], 
  context: PersonaContext
): Promise<Partial<ForumPostEntity>> {
  const persona = getPersonaDetails(personaId);
  
  // In a real implementation, this would use an LLM to generate a comment
  // based on the persona's characteristics, the thread content, and existing comments
  return {
    threadId,
    userId: personaId,
    content: `As someone with expertise in ${persona.expertise}, I believe ${threadContent.length > 100 ? 'this topic' : threadContent} has important implications for our community.`,
    createdAt: new Date(),
    tags: [persona.expertise]
  };
}

/**
 * Get detailed information about a persona
 */
function getPersonaDetails(personaId: PersonaId): {
  name: string;
  expertise: string;
  focusAreas: string[];
  positiveTerms: string[];
  negativeTerms: string[];
  communicationStyle: string;
} {
  switch (personaId) {
    case 'alex-chen':
      return {
        name: 'Dr. Alex Chen',
        expertise: 'AI ethics',
        focusAreas: ['data privacy', 'algorithmic transparency', 'ethical technology'],
        positiveTerms: ['privacy', 'transparency', 'ethics', 'accountability', 'consent'],
        negativeTerms: ['surveillance', 'centralization', 'monopoly', 'data harvesting'],
        communicationStyle: 'analytical'
      };
    case 'sophia-rodriguez':
      return {
        name: 'Sophia Rodriguez',
        expertise: 'community organizing',
        focusAreas: ['inclusion', 'accessibility', 'community engagement'],
        positiveTerms: ['inclusive', 'accessible', 'diverse', 'equity', 'participation'],
        negativeTerms: ['exclusion', 'barrier', 'discrimination', 'inaccessible'],
        communicationStyle: 'empathetic'
      };
    case 'thomas-williams':
      return {
        name: 'Thomas Williams',
        expertise: 'public administration',
        focusAreas: ['fiscal responsibility', 'governance', 'operational efficiency'],
        positiveTerms: ['accountability', 'transparency', 'efficiency', 'sustainability'],
        negativeTerms: ['wasteful', 'costly', 'risky', 'untested', 'hasty'],
        communicationStyle: 'pragmatic'
      };
    default:
      throw new Error(`Unknown persona ID: ${personaId}`);
  }
}