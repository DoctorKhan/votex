'use client';

// Interfaces
export interface ProposalVote {
  personaId: string;
  personaName: string;
  vote: string;
  reasoning: string;
  timestamp: number;
}

export interface PersonaProposal {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  votes: ProposalVote[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface PersonaComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  parentId: string | null;
  threadId: string;
}

export interface PersonaActivity {
  personaId: string;
  personaName: string;
  action: 'proposal' | 'vote' | 'comment';
  description: string;
  timestamp: number;
  details?: string;
}

// Functions to get data from localStorage
export const getPersonaProposals = (): PersonaProposal[] => {
  try {
    const storedProposals = localStorage.getItem('personaProposals');
    return storedProposals ? JSON.parse(storedProposals) : [];
  } catch (e) {
    console.error('Error loading persona proposals:', e);
    return [];
  }
};

export const getPersonaComments = (): PersonaComment[] => {
  try {
    const storedComments = localStorage.getItem('personaComments');
    return storedComments ? JSON.parse(storedComments) : [];
  } catch (e) {
    console.error('Error loading persona comments:', e);
    return [];
  }
};

export const getPersonaActivities = (): PersonaActivity[] => {
  try {
    const storedActivities = localStorage.getItem('personaActivities');
    return storedActivities ? JSON.parse(storedActivities) : [];
  } catch (e) {
    console.error('Error loading persona activities:', e);
    return [];
  }
};

// Functions to store data to localStorage
export const savePersonaProposal = (proposal: PersonaProposal): void => {
  try {
    const proposals = getPersonaProposals();
    proposals.unshift(proposal); // Add new proposal at the beginning
    localStorage.setItem('personaProposals', JSON.stringify(proposals));
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'personaProposals',
      newValue: localStorage.getItem('personaProposals')
    }));
  } catch (e) {
    console.error('Error saving persona proposal:', e);
  }
};

export const savePersonaComment = (comment: PersonaComment): void => {
  try {
    const comments = getPersonaComments();
    comments.unshift(comment); // Add new comment at the beginning
    localStorage.setItem('personaComments', JSON.stringify(comments));
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'personaComments',
      newValue: localStorage.getItem('personaComments')
    }));
  } catch (e) {
    console.error('Error saving persona comment:', e);
  }
};

export const savePersonaActivity = (activity: PersonaActivity): void => {
  try {
    const activities = getPersonaActivities();
    activities.unshift(activity); // Add new activity at the beginning
    localStorage.setItem('personaActivities', JSON.stringify(activities.slice(0, 20))); // Keep only 20 most recent
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'personaActivities',
      newValue: localStorage.getItem('personaActivities')
    }));
  } catch (e) {
    console.error('Error saving persona activity:', e);
  }
};

// Function to generate sample data for testing
export const generateSamplePersonaData = (): void => {
  try {
    // Define personas for consistent data generation
    const personas = [
      { id: 'alex-chen', name: 'Dr. Alex Chen' },
      { id: 'sophia-rodriguez', name: 'Sophia Rodriguez' },
      { id: 'thomas-williams', name: 'Thomas Williams' }
    ];
    
    // Generate sample proposals
    const sampleProposals: PersonaProposal[] = [
      {
        id: `persona-proposal-${Date.now() - 50000}`,
        title: 'Enhance Forum Search Functionality',
        description: 'I propose we implement advanced search functionality in the community forum to allow filtering by date, author, and topic categories.',
        authorId: personas[0].id,
        authorName: personas[0].name,
        createdAt: Date.now() - 50000,
        votes: [
          {
            personaId: 'sophia-rodriguez',
            personaName: 'Sophia Rodriguez',
            vote: 'approve',
            reasoning: 'This would greatly improve the user experience for finding relevant discussions.',
            timestamp: Date.now() - 40000
          },
          {
            personaId: 'thomas-williams',
            personaName: 'Thomas Williams',
            vote: 'approve',
            reasoning: 'I agree, better search capabilities are essential for a growing community.',
            timestamp: Date.now() - 35000
          }
        ],
        status: 'active'
      },
      {
        id: `persona-proposal-${Date.now() - 100000}`,
        title: 'Community Mentorship Program',
        description: 'I suggest implementing a mentorship program where experienced members can guide newcomers and help them navigate the platform effectively.',
        authorId: 'sophia-rodriguez',
        authorName: 'Sophia Rodriguez',
        createdAt: Date.now() - 100000,
        votes: [
          {
            personaId: 'alex-chen',
            personaName: 'Dr. Alex Chen',
            vote: 'abstain',
            reasoning: 'While I see the benefits, I have concerns about oversight and time commitments.',
            timestamp: Date.now() - 90000
          }
        ],
        status: 'active'
      }
    ];
    
    // Generate sample comments for threads
    const sampleComments: PersonaComment[] = [
      {
        id: `persona-comment-${Date.now() - 30000}`,
        content: 'Has anyone experienced issues with the voting mechanism when there are more than 10 options?',
        authorId: 'thomas-williams',
        authorName: 'Thomas Williams',
        createdAt: Date.now() - 30000,
        parentId: null,
        threadId: 'thread-1'
      },
      {
        id: `persona-comment-${Date.now() - 25000}`,
        content: 'Yes, I noticed that too. It seems to slow down significantly and sometimes the ranking gets confused.',
        authorId: 'alex-chen',
        authorName: 'Dr. Alex Chen',
        createdAt: Date.now() - 25000,
        parentId: null,
        threadId: 'thread-1'
      },
      {
        id: `persona-comment-${Date.now() - 20000}`,
        content: 'I think we should consider implementing a more efficient algorithm for handling large option sets.',
        authorId: 'sophia-rodriguez',
        authorName: 'Sophia Rodriguez',
        createdAt: Date.now() - 20000,
        parentId: null,
        threadId: 'thread-1'
      },
      {
        id: `persona-comment-${Date.now() - 40000}`,
        content: 'What do you all think about adding a public roadmap to the platform?',
        authorId: 'sophia-rodriguez',
        authorName: 'Sophia Rodriguez',
        createdAt: Date.now() - 40000,
        parentId: null,
        threadId: 'thread-2'
      },
      {
        id: `persona-comment-${Date.now() - 35000}`,
        content: 'I fully support this idea. Transparency about future plans would help set proper expectations for the community.',
        authorId: 'alex-chen',
        authorName: 'Dr. Alex Chen',
        createdAt: Date.now() - 35000,
        parentId: null,
        threadId: 'thread-2'
      }
    ];
    
    // Generate activities based on the sample data
    const sampleActivities: PersonaActivity[] = [
      ...sampleProposals.map(p => ({
        personaId: p.authorId,
        personaName: p.authorName,
        action: 'proposal' as const,
        description: `Created a proposal: "${p.title}"`,
        timestamp: p.createdAt,
        details: p.title
      })),
      ...sampleProposals.flatMap(p => 
        p.votes.map(v => ({
          personaId: v.personaId,
          personaName: v.personaName,
          action: 'vote' as const,
          description: `Voted "${v.vote}" on "${p.title}"`,
          timestamp: v.timestamp,
          details: v.reasoning
        }))
      ),
      ...sampleComments.map(c => ({
        personaId: c.authorId,
        personaName: c.authorName,
        action: 'comment' as const,
        description: `Commented on "Thread ${c.threadId.replace('thread-', '')}"`,
        timestamp: c.createdAt,
        details: c.content.substring(0, 100)
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20); // Sort by timestamp (newest first) and keep only 20 most recent
    
    // Store data in localStorage
    localStorage.setItem('personaProposals', JSON.stringify(sampleProposals));
    localStorage.setItem('personaComments', JSON.stringify(sampleComments));
    localStorage.setItem('personaActivities', JSON.stringify(sampleActivities));
    
    // Dispatch events to notify components
    window.dispatchEvent(new StorageEvent('storage', { key: 'personaProposals', newValue: JSON.stringify(sampleProposals) }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'personaComments', newValue: JSON.stringify(sampleComments) }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'personaActivities', newValue: JSON.stringify(sampleActivities) }));
    
    console.log('Sample persona data generated successfully');
  } catch (e) {
    console.error('Error generating sample persona data:', e);
  }
};

// Function to check data consistency
export const checkDataConsistency = (): {
  consistent: boolean;
  issues: string[];
} => {
  try {
    const proposals = getPersonaProposals();
    const comments = getPersonaComments();
    const activities = getPersonaActivities();
    
    const issues: string[] = [];
    
    // Check if proposals referenced in activities exist
    const proposalActivities = activities.filter(a => a.action === 'proposal');
    for (const activity of proposalActivities) {
      const proposalExists = proposals.some(p => 
        p.authorId === activity.personaId && 
        (p.title === activity.details || activity.description.includes(p.title))
      );
      
      if (!proposalExists) {
        issues.push(`Proposal mentioned in activity by ${activity.personaName} doesn't exist in proposals storage`);
      }
    }
    
    // Check if comments referenced in activities exist
    const commentActivities = activities.filter(a => a.action === 'comment');
    for (const activity of commentActivities) {
      const commentExists = comments.some(c => 
        c.authorId === activity.personaId && 
        (c.content.includes(activity.details || '') || activity.description.includes(c.threadId))
      );
      
      if (!commentExists) {
        issues.push(`Comment mentioned in activity by ${activity.personaName} doesn't exist in comments storage`);
      }
    }
    
    return {
      consistent: issues.length === 0,
      issues
    };
  } catch (e) {
    console.error('Error checking data consistency:', e);
    return {
      consistent: false,
      issues: ['Error checking data consistency: ' + (e instanceof Error ? e.message : String(e))]
    };
  }
};