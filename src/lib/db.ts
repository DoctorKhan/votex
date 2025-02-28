import { createClient, id } from '@instantdb/react';

// Define the schema for our database
export type ProposalEntity = {
  title: string;
  description: string;
  votes: number;
  smartCreated: boolean;
  intelligentVoted: boolean;
  createdAt: number;
  smartFeedback?: string;
};

export type RevisionEntity = {
  proposalId: string;
  description: string;
  timestamp: string;
  analysis?: any;
};

export type VoteEntity = {
  userId: string;
  proposalId: string;
  timestamp: number;
};

export type LogEntity = {
  action: any;
  timestamp: number;
  previousHash: string | null;
  hash: string;
};

// Create the InstantDB client
export const db = createClient({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || 'votex',
  schema: {
    proposals: {
      title: 'string',
      description: 'string',
      votes: 'number',
      smartCreated: 'boolean',
      intelligentVoted: 'boolean',
      createdAt: 'number',
      smartFeedback: 'string?'
    },
    revisions: {
      proposalId: 'string',
      description: 'string',
      timestamp: 'string',
      analysis: 'any?'
    },
    votes: {
      userId: 'string',
      proposalId: 'string',
      timestamp: 'number'
    },
    logs: {
      action: 'any',
      timestamp: 'number',
      previousHash: 'string?',
      hash: 'string'
    }
  }
});

/**
 * Generates a consistent user ID
 * @returns User ID string
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'server-user';
  }
  
  // Check if we already have a user ID in localStorage
  const storedId = localStorage.getItem('votingAppUserId');
  if (storedId) {
    return storedId;
  }
  
  // Generate a new ID
  const newId = id();
  localStorage.setItem('votingAppUserId', newId);
  return newId;
}

/**
 * Initialize the database
 */
export async function initDB() {
  try {
    await db.auth.signIn();
    console.log('InstantDB initialized successfully');
  } catch (error) {
    console.error('Error initializing InstantDB:', error);
    throw error;
  }
}