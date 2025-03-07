'use client';

import React, { useState, useEffect } from 'react';
import type { PersonaId } from '../../personas/persona-implementation';

// Context interfaces for type safety
interface ProposalContext {
  recentTopics?: string[];
  communityNeeds?: string[];
  ongoingDiscussions?: string[];
}

interface VotingContext {
  recentProposals?: Array<{id: string; title: string; content: string}>;
  userVotingHistory?: Record<string, 'approve' | 'reject' | 'abstain'>;
}

interface ForumContext {
  activeThreads?: Array<{id: string; title: string; content: string}>;
  recentDiscussions?: string[];
  controversialTopics?: string[];
}

interface PersonaActionContext {
  proposalContext?: ProposalContext;
  votingContext?: VotingContext;
  forumContext?: ForumContext;
}

// Result interfaces
interface ProposalResult {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface VoteResult {
  vote: 'approve' | 'reject' | 'abstain';
  reasoning: string;
}

interface CommentResult {
  content: string;
  tags?: string[];
}

type ActivityFrequency = 'high' | 'medium' | 'low' | 'paused';

interface PersonaControlState {
  id: PersonaId;
  name: string;
  isActive: boolean;
  activityFrequency: ActivityFrequency;
  lastAction?: {
    type: 'proposal' | 'vote' | 'comment';
    timestamp: number;
  };
}

interface PersonaModuleType {
  getAllPersonas: () => Array<{id: string; name: string; displayName: string}>;
  schedulePersonaActivity: (personaIds: PersonaId[], frequency?: 'high' | 'medium' | 'low') => void;
  generateProposal: (personaId: PersonaId, context: PersonaActionContext) => Promise<ProposalResult>;
  simulateVote: (personaId: PersonaId, proposalId: string, proposalContent: string, context: PersonaActionContext) => Promise<VoteResult>;
  generateForumComment: (personaId: PersonaId, threadId: string, threadContent: string, existingComments: Array<{content: string}>, context: PersonaActionContext) => Promise<CommentResult>;
}

// Mock implementations for fallback
const mockPersonas = [
  { id: 'alex-chen', name: 'Dr. Alex Chen', displayName: 'AlexC' },
  { id: 'sophia-rodriguez', name: 'Sophia Rodriguez', displayName: 'Sophia_R' },
  { id: 'thomas-williams', name: 'Thomas Williams', displayName: 'ThomasW' }
];

const mockModule: PersonaModuleType = {
  getAllPersonas: () => mockPersonas,
  schedulePersonaActivity: () => console.log('Mock: schedulePersonaActivity called'),
  generateProposal: async () => ({ title: 'Mock Proposal', content: 'Mock content', category: 'mock', tags: ['mock'] }),
  simulateVote: async () => ({ vote: 'approve', reasoning: 'Mock reasoning' }),
  generateForumComment: async () => ({ content: 'Mock comment' })
};

const PersonaController: React.FC = () => {
  const [personas, setPersonas] = useState<PersonaControlState[]>([]);
  const [activeIntervals, setActiveIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [activationStatus, setActivationStatus] = useState<string>('');
  const [actionStatus, setActionStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [personaModule, setPersonaModule] = useState<PersonaModuleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Array<{
    personaId: PersonaId;
    personaName: string;
    action: 'proposal' | 'vote' | 'comment';
    description: string;
    timestamp: number;
  }>>([]);

  // Load the persona module
  useEffect(() => {
    const loadModule = async () => {
      setIsLoading(true);
      try {
        const importedModule = await import('../../personas/persona-implementation');
        setPersonaModule({
          getAllPersonas: importedModule.getAllPersonas,
          schedulePersonaActivity: importedModule.schedulePersonaActivity,
          generateProposal: importedModule.generateProposal as unknown as PersonaModuleType['generateProposal'],
          simulateVote: importedModule.simulateVote as unknown as PersonaModuleType['simulateVote'],
          generateForumComment: importedModule.generateForumComment as unknown as PersonaModuleType['generateForumComment']
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load persona implementation:', err);
        setPersonaModule(mockModule);
        setError('Failed to load persona module. Using mock implementation.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
    
    // Setup auto-refresh to periodically check for persona state changes
    // (this is needed because the background activity might be running in a different tab/window)
    const refreshInterval = setInterval(() => {
      const activePersonasStr = localStorage.getItem('activePersonas');
      if (activePersonasStr) {
        try {
          const storedPersonas = JSON.parse(activePersonasStr);
          console.log('Checking active personas from localStorage:', storedPersonas);
          // This will trigger the visibilitychange handler
          if (document.visibilityState === 'visible') {
            refreshPersonaStates();
          }
        } catch (e) {
          console.error('Failed to parse active personas from localStorage:', e);
        }
      }
    }, 3000); // Check every 3 seconds
    
    // Add focus event handler
    const handleFocus = () => refreshPersonaStates();
    window.addEventListener('focus', handleFocus);
    
    // Cleanup function
    return () => {
      // Clear any active intervals on unmount
      Object.values(activeIntervals).forEach(interval => clearInterval(interval));
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval); // Clean up our refresh interval
    };
  }, []);

  // Function to refresh persona states from localStorage
  const refreshPersonaStates = () => {
    if (!personaModule || isLoading) return;

    try {
      const allPersonas = personaModule.getAllPersonas();
      
      // Read active personas from localStorage
      let activePersonas: string[] = [];
      let savedFrequency: ActivityFrequency = 'medium';
      
      try {
        activePersonas = JSON.parse(localStorage.getItem('activePersonas') || '[]');
        savedFrequency = localStorage.getItem('personaFrequency') as ActivityFrequency || 'medium';
        console.log('Refreshing from localStorage:', { activePersonas, savedFrequency });
      } catch (e) {
        console.error('Failed to read from localStorage:', e);
      }
      
      // Update UI state
      setPersonas(
        allPersonas.map(p => ({
          id: p.id as PersonaId,
          name: p.name,
          isActive: activePersonas.includes(p.id),
          activityFrequency: savedFrequency,
        }))
      );
      
      // Re-schedule active personas
      if (activePersonas.length > 0) {
        personaModule.schedulePersonaActivity(
          activePersonas as PersonaId[],
          savedFrequency === 'high' || savedFrequency === 'medium' || savedFrequency === 'low'
            ? savedFrequency
            : 'medium'
        );
        setActivationStatus(`Restored ${activePersonas.length} active personas with ${savedFrequency} frequency`);
      }
    } catch (err) {
      console.error('Error refreshing personas:', err);
      setError('Error refreshing personas. Check console for details.');
    }
  };

  // Listen for visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible - refreshing persona states');
        refreshPersonaStates();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [personaModule, isLoading]);

  // Initialize personas once the module is loaded
  useEffect(() => {
    if (personaModule && !isLoading) {
      refreshPersonaStates();
    }
  }, [personaModule, isLoading]);

  // Activate or deactivate a persona
  const togglePersonaActive = (id: PersonaId) => {
    if (!personaModule) return;
    
    setPersonas(prevPersonas => 
      prevPersonas.map(p => {
        if (p.id === id) {
          try {
            // If we're turning it on, schedule activity
            if (!p.isActive) {
              // Only schedule if not paused
              if (p.activityFrequency !== 'paused') {
                personaModule.schedulePersonaActivity(
                  [id], 
                  p.activityFrequency === 'high' || p.activityFrequency === 'medium' || p.activityFrequency === 'low' 
                    ? p.activityFrequency 
                    : 'medium'
                );
              }
              setActivationStatus(`Activated ${p.name} with ${p.activityFrequency} activity frequency`);
            } else {
              // If we're turning it off, clear any intervals
              if (activeIntervals[id]) {
                clearInterval(activeIntervals[id]);
                const newIntervals = {...activeIntervals};
                delete newIntervals[id];
                setActiveIntervals(newIntervals);
              }
              
              // Remove from localStorage when deactivating
              try {
                const activePersonas = JSON.parse(localStorage.getItem('activePersonas') || '[]');
                const updatedPersonas = activePersonas.filter((pid: string) => pid !== id);
                localStorage.setItem('activePersonas', JSON.stringify(updatedPersonas));
              } catch (e) {
                console.error('Failed to update localStorage:', e);
              }
              
              setActivationStatus(`Deactivated ${p.name}`);
            }
          } catch (err) {
            console.error(`Error toggling persona ${id}:`, err);
            setError(`Failed to toggle ${p.name}. Check console for details.`);
          }
          
          return {...p, isActive: !p.isActive};
        }
        return p;
      })
    );
  };

  // Change activity frequency for a persona
  const changeFrequency = (id: PersonaId, frequency: ActivityFrequency) => {
    if (!personaModule) return;
    
    setPersonas(prevPersonas => 
      prevPersonas.map(p => {
        if (p.id === id) {
          try {
            const newPersona = {...p, activityFrequency: frequency};
            
            // If active, handle scheduling based on frequency
            if (p.isActive) {
              // Clear existing schedule
              if (activeIntervals[id]) {
                clearInterval(activeIntervals[id]);
                const newIntervals = {...activeIntervals};
                delete newIntervals[id];
                setActiveIntervals(newIntervals);
              }
              
              // Set new schedule if not paused
              if (frequency !== 'paused') {
                personaModule.schedulePersonaActivity(
                  [id], 
                  frequency === 'high' || frequency === 'medium' || frequency === 'low' 
                    ? frequency 
                    : 'medium'
                );
              }
              
              setActivationStatus(`Updated ${p.name} to ${frequency} activity frequency`);
            }
            
            return newPersona;
          } catch (err) {
            console.error(`Error changing frequency for persona ${id}:`, err);
            setError(`Failed to change frequency for ${p.name}. Check console for details.`);
            return p;
          }
        }
        return p;
      })
    );
  };

  // Manually trigger persona actions
  const triggerPersonaAction = async (id: PersonaId, action: 'proposal' | 'vote' | 'comment') => {
    if (!personaModule) {
      setActionStatus('Persona module not loaded');
      return;
    }
    
    const personaName = personas.find(p => p.id === id)?.name || 'Unknown persona';
    setActionStatus(`Triggering ${action} for ${personaName}...`);
    
    try {
      let result;
      let actionDescription = '';
      
      const mockContext = {
        proposalContext: {
          recentTopics: ['governance', 'data privacy', 'community accessibility'],
          communityNeeds: ['improved voting mechanisms', 'transparent auditing'],
          ongoingDiscussions: ['AI in decision making', 'inclusive participation']
        },
        votingContext: {
          recentProposals: [],
          userVotingHistory: {}
        },
        forumContext: {
          activeThreads: [],
          recentDiscussions: ['Platform improvements', 'New feature requests'],
          controversialTopics: ['Data privacy levels', 'Moderation procedures']
        }
      };
      
      if (action === 'proposal') {
        result = await personaModule.generateProposal(id, mockContext);
        actionDescription = `Created a proposal: "${result.title}"`;
        setActionStatus(`${personaName} ${actionDescription}`);
      } else if (action === 'vote') {
        // Mock a proposal to vote on
        const mockProposal = {
          id: 'test-proposal-1',
          title: 'Community Forum Enhancement',
          content: 'This proposal suggests implementing advanced search functionality and topic categorization in the community forum to improve navigation and content discovery.'
        };
        
        result = await personaModule.simulateVote(id, mockProposal.id, mockProposal.content, mockContext);
        actionDescription = `Voted "${result.vote}" on "${mockProposal.title}"`;
        setActionStatus(`${personaName} ${actionDescription}`);
      } else if (action === 'comment') {
        // Mock a thread to comment on
        const mockThread = {
          id: 'test-thread-1',
          title: 'Thoughts on the new voting interface?',
          content: 'I\'ve been using the new voting interface and have some thoughts about the usability. What do others think about the recent changes?'
        };
        
        result = await personaModule.generateForumComment(id, mockThread.id, mockThread.content, [], mockContext);
        actionDescription = `Commented on "${mockThread.title}"`;
        setActionStatus(`${personaName} ${actionDescription}`);
      }
      
      // Add to recent activities
      // Get details based on the action type
      let details = '';
      if (action === 'proposal' && result) {
        details = (result as ProposalResult).title || '';
      } else if (action === 'vote' && result) {
        details = (result as VoteResult).reasoning || '';
      } else if (action === 'comment' && result) {
        details = (result as CommentResult).content?.substring(0, 100) || '';
      }
      
      const newActivity = {
        personaId: id,
        personaName: personaName,
        action,
        description: actionDescription,
        timestamp: Date.now(),
        details
      };
      
      // Update local state
      setRecentActivities(prev => [
        newActivity,
        ...prev.slice(0, 9) // Keep only the last 10 activities
      ]);
      
      // Save to localStorage for the dedicated activities page
      try {
        const storedActivities = JSON.parse(localStorage.getItem('personaActivities') || '[]');
        localStorage.setItem('personaActivities', JSON.stringify([
          newActivity,
          ...storedActivities.slice(0, 19) // Keep only last 20 activities in storage
        ]));
        
        // Also save the actual content to the appropriate collection
        if (action === 'proposal' && result) {
          const proposal = result as ProposalResult; // Use proper type
          const storedProposals = JSON.parse(localStorage.getItem('personaProposals') || '[]');
          const newProposal = {
            id: `persona-proposal-${Date.now()}`,
            title: proposal.title || 'Untitled Proposal',
            description: proposal.content || 'No description provided',
            authorId: id,
            authorName: personaName,
            createdAt: Date.now(),
            votes: [],
            status: 'active'
          };
          
          localStorage.setItem('personaProposals', JSON.stringify([
            newProposal,
            ...storedProposals
          ]));
        } else if (action === 'vote' && result) {
          const vote = result as VoteResult;
          const storedProposals = JSON.parse(localStorage.getItem('personaProposals') || '[]');
          
          // Find the proposal to vote on - randomly select one if available
          if (storedProposals.length > 0) {
            const randomIndex = Math.floor(Math.random() * storedProposals.length);
            const targetProposal = storedProposals[randomIndex];
            
            // Add vote to the proposal
            targetProposal.votes.push({
              personaId: id,
              personaName: personaName,
              vote: vote.vote || 'approve',
              reasoning: vote.reasoning || '',
              timestamp: Date.now()
            });
            
            localStorage.setItem('personaProposals', JSON.stringify(storedProposals));
          }
        } else if (action === 'comment' && result) {
          const comment = result as CommentResult;
          const storedComments = JSON.parse(localStorage.getItem('personaComments') || '[]');
          
          const newComment = {
            id: `persona-comment-${Date.now()}`,
            content: comment.content || '',
            authorId: id,
            authorName: personaName,
            createdAt: Date.now(),
            parentId: null, // Random thread or top-level comment
            threadId: `thread-${Math.floor(Math.random() * 5) + 1}` // Assign to a random thread
          };
          
          localStorage.setItem('personaComments', JSON.stringify([
            newComment,
            ...storedComments
          ]));
        }
        
        // Dispatch storage event to notify other tabs/components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'personaActivities',
          newValue: localStorage.getItem('personaActivities')
        }));
      } catch (e) {
        console.error('Failed to save activity to localStorage:', e);
      }
      
      // Update last action
      setPersonas(prevPersonas =>
        prevPersonas.map(p => {
          if (p.id === id) {
            return {
              ...p,
              lastAction: {
                type: action,
                timestamp: Date.now()
              }
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error(`Error triggering ${action}:`, error);
      setActionStatus(`Error triggering ${action}: ${error instanceof Error ? error.message : String(error)}`);
      setError(`Failed to trigger ${action}. Check console for details.`);
    }
  };

  // Enable all personas with default settings
  const activateAllPersonas = () => {
    if (!personaModule) return;
    
    try {
      const personaIds = personas.map(p => p.id);
      personaModule.schedulePersonaActivity(personaIds, 'medium');
      
      // Update localStorage directly, in case schedulePersonaActivity doesn't do it properly
      try {
        localStorage.setItem('activePersonas', JSON.stringify(personaIds));
        localStorage.setItem('personaFrequency', 'medium');
      } catch (e) {
        console.error('Failed to update localStorage:', e);
      }
      
      setPersonas(prevPersonas =>
        prevPersonas.map(p => ({
          ...p,
          isActive: true,
          activityFrequency: 'medium'
        }))
      );
      
      setActivationStatus(`Activated all personas with medium activity frequency`);
    } catch (err) {
      console.error('Error activating all personas:', err);
      setError('Failed to activate all personas. Check console for details.');
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading persona controller...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Persona Control Panel</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <button 
          onClick={activateAllPersonas}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={!personaModule}
        >
          Activate All Personas
        </button>
        {activationStatus && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{activationStatus}</div>
        )}
      </div>
      
      <div className="space-y-6">
        {personas.map(persona => (
          <div key={persona.id} className="border dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{persona.name}</h3>
              <div className="flex items-center">
                <span className={`h-3 w-3 rounded-full mr-2 ${persona.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {persona.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity Status
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => togglePersonaActive(persona.id)}
                    className={`px-3 py-1 rounded text-white ${
                      persona.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    } transition-colors`}
                    disabled={!personaModule}
                  >
                    {persona.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity Frequency
                </label>
                <select
                  value={persona.activityFrequency}
                  onChange={(e) => changeFrequency(persona.id, e.target.value as ActivityFrequency)}
                  className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  disabled={!persona.isActive || !personaModule}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manual Actions
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => triggerPersonaAction(persona.id, 'proposal')}
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  disabled={!personaModule}
                >
                  Generate Proposal
                </button>
                <button
                  onClick={() => triggerPersonaAction(persona.id, 'vote')}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  disabled={!personaModule}
                >
                  Simulate Vote
                </button>
                <button
                  onClick={() => triggerPersonaAction(persona.id, 'comment')}
                  className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                  disabled={!personaModule}
                >
                  Generate Comment
                </button>
              </div>
            </div>
            
            {persona.lastAction && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Last action: {persona.lastAction.type} at {formatTime(persona.lastAction.timestamp)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {actionStatus && (
        <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <h4 className="font-medium text-gray-800 dark:text-white mb-1">Action Status</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300">{actionStatus}</div>
        </div>
      )}
      
      {/* Recent Persona Activities Feed */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Persona Activities</h3>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 dark:text-white">{activity.personaName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {activity.description}
                </p>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.action === 'proposal'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      : activity.action === 'vote'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
                  }`}>
                    {activity.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No activities yet. Activate personas and they will automatically generate content over time.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You can also manually trigger actions using the buttons on each persona card.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaController;