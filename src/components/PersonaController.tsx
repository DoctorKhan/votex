'use client';

import React, { useState, useEffect } from 'react';
import type { PersonaId } from '../../personas/persona-implementation';

// Simplified interface types
type ActivityFrequency = 'high' | 'medium' | 'low' | 'paused';
type ActionType = 'proposal' | 'vote' | 'comment';

// Import context and result interfaces from persona-implementation
import type {
  PersonaContext,
  ProposalEntity,
  VoteEntity,
  ForumPostEntity as ImportedForumPostEntity
} from '../../personas/persona-implementation';

// Result interfaces - using Partial to match the implementation
type ProposalResult = Partial<ProposalEntity>;
type VoteResult = Partial<VoteEntity>;
type CommentResult = Partial<ImportedForumPostEntity>;

// Create a local ForumPostEntity that matches the expected structure in this component
// but can be converted to/from the imported type
interface ForumPostEntity {
  content: string;
  threadId: string;
  userId: string;
  createdAt: number;
}

// Helper function to convert our ForumPostEntity to the imported type
function convertToImportedForumPost(post: ForumPostEntity): ImportedForumPostEntity {
  return {
    ...post,
    createdAt: new Date(post.createdAt)
  };
}

// Helper function to convert an array of our ForumPostEntity to the imported type
function convertToImportedForumPosts(posts: ForumPostEntity[]): ImportedForumPostEntity[] {
  return posts.map(convertToImportedForumPost);
}

interface PersonaControlState {
  id: PersonaId;
  name: string;
  isActive: boolean;
  activityFrequency: ActivityFrequency;
  lastAction?: {
    type: ActionType;
    timestamp: number;
  };
}

interface Activity {
  personaId: PersonaId;
  personaName: string;
  action: ActionType;
  description: string;
  timestamp: number;
}

interface PersonaModuleType {
  getAllPersonas: () => Array<{id: string; name: string; displayName: string}>;
  schedulePersonaActivity: (personaIds: PersonaId[], frequency?: 'high' | 'medium' | 'low') => void;
  generateProposal: (personaId: PersonaId, context: PersonaContext) => Promise<ProposalResult>;
  simulateVote: (personaId: PersonaId, proposalId: string, proposalContent: string, context: PersonaContext) => Promise<VoteResult>;
  generateForumComment: (personaId: PersonaId, threadId: string, threadContent: string, existingComments: ImportedForumPostEntity[], context: PersonaContext) => Promise<CommentResult>;
}

// Mock implementations for fallback
const mockPersonas = [
  { id: 'alex-chen', name: 'Dr. Alex Chen', displayName: 'AlexC' },
  { id: 'sophia-rodriguez', name: 'Sophia Rodriguez', displayName: 'Sophia_R' },
  { id: 'thomas-williams', name: 'Thomas Williams', displayName: 'ThomasW' },
  { id: 'jamie-dev', name: 'Jamie Developer', displayName: 'JamieD' }
];

const mockModule: PersonaModuleType = {
  getAllPersonas: () => mockPersonas,
  schedulePersonaActivity: () => console.log('Mock: schedulePersonaActivity called'),
  generateProposal: async () => ({
    title: 'Mock Proposal',
    content: 'Mock content',
    category: 'mock',
    tags: ['mock']
  }),
  simulateVote: async () => ({
    vote: 'approve',
    reasoning: 'Mock reasoning'
  }),
  generateForumComment: async () => ({
    content: 'Mock comment'
  })
};

const PersonaController: React.FC = () => {
  const [personas, setPersonas] = useState<PersonaControlState[]>([]);
  const [activeIntervals, setActiveIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [personaModule, setPersonaModule] = useState<PersonaModuleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [selectedTab, setSelectedTab] = useState<'personas' | 'activities'>('personas');

  // Load the persona module
  useEffect(() => {
    const loadModule = async () => {
      setIsLoading(true);
      try {
        const importedModule = await import('../../personas/persona-implementation');
        setPersonaModule({
          getAllPersonas: importedModule.getAllPersonas,
          schedulePersonaActivity: importedModule.schedulePersonaActivity,
          generateProposal: importedModule.generateProposal,
          simulateVote: importedModule.simulateVote,
          generateForumComment: importedModule.generateForumComment
        });
      } catch (err) {
        console.error('Failed to load persona implementation:', err);
        setPersonaModule(mockModule);
        setError('Using demo personas. Real functionality limited.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
    
    // Setup sync with localStorage
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshPersonaStates();
      }
    }, 3000);
    
    // Event handlers for state sync
    window.addEventListener('focus', refreshPersonaStates);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshPersonaStates();
    });
    
    return () => {
      Object.values(activeIntervals).forEach(clearInterval);
      window.removeEventListener('focus', refreshPersonaStates);
      document.removeEventListener('visibilitychange', () => {});
      clearInterval(refreshInterval);
    };
  }, []);

  // Refresh persona states from localStorage
  const refreshPersonaStates = () => {
    if (!personaModule || isLoading) return;

    try {
      const allPersonas = personaModule.getAllPersonas();
      
      // Read from localStorage
      const activePersonas = JSON.parse(localStorage.getItem('activePersonas') || '[]');
      const savedFrequency = localStorage.getItem('personaFrequency') as ActivityFrequency || 'medium';
      
      // Update UI state
      setPersonas(
        allPersonas.map(p => ({
          id: p.id as PersonaId,
          name: p.name,
          isActive: activePersonas.includes(p.id),
          activityFrequency: savedFrequency,
        }))
      );
      
      // Load activities
      try {
        const storedActivities = JSON.parse(localStorage.getItem('personaActivities') || '[]');
        setRecentActivities(storedActivities.slice(0, 10)); // Show only 10 most recent
      } catch (e) {
        console.error('Failed to load activities:', e);
      }
      
      // Re-schedule active personas if needed
      if (activePersonas.length > 0) {
        personaModule.schedulePersonaActivity(
          activePersonas as PersonaId[],
          savedFrequency === 'high' || savedFrequency === 'medium' || savedFrequency === 'low'
            ? savedFrequency
            : 'medium'
        );
      }
    } catch (err) {
      console.error('Error refreshing personas:', err);
      setError('Could not load personas. Please refresh the page.');
    }
  };

  // Initialize personas once the module is loaded
  useEffect(() => {
    if (personaModule && !isLoading) {
      refreshPersonaStates();
    }
  }, [personaModule, isLoading]);

  // Toggle persona active state
  const togglePersonaActive = (id: PersonaId) => {
    if (!personaModule) return;
    
    setPersonas(prevPersonas =>
      prevPersonas.map(p => {
        if (p.id === id) {
          const newIsActive = !p.isActive;
          
          try {
            // Update localStorage
            const activePersonas = JSON.parse(localStorage.getItem('activePersonas') || '[]');
            
            if (newIsActive) {
              // Add to active list
              if (!activePersonas.includes(id)) {
                activePersonas.push(id);
                localStorage.setItem('activePersonas', JSON.stringify(activePersonas));
              }
              
              // Schedule if not paused
              if (p.activityFrequency !== 'paused') {
                personaModule.schedulePersonaActivity([id], p.activityFrequency);
              }
              setStatus(`${p.name} activated`);
            } else {
              // Remove from active list
              const updatedPersonas = activePersonas.filter((pid: string) => pid !== id);
              localStorage.setItem('activePersonas', JSON.stringify(updatedPersonas));
              
              // Clear interval if exists
              if (activeIntervals[id]) {
                clearInterval(activeIntervals[id]);
                const newIntervals = {...activeIntervals};
                delete newIntervals[id];
                setActiveIntervals(newIntervals);
              }
              
              setStatus(`${p.name} deactivated`);
            }
          } catch (err) {
            console.error(`Error toggling persona ${id}:`, err);
            setError(`Could not update persona status.`);
          }
          
          return {...p, isActive: newIsActive};
        }
        return p;
      })
    );
  };

  // Change activity frequency
  const changeFrequency = (id: PersonaId, frequency: ActivityFrequency) => {
    if (!personaModule) return;
    
    setPersonas(prevPersonas =>
      prevPersonas.map(p => {
        if (p.id === id) {
          try {
            // Update localStorage
            localStorage.setItem('personaFrequency', frequency);
            
            // If active, reschedule
            if (p.isActive && frequency !== 'paused') {
              personaModule.schedulePersonaActivity([id], frequency);
            }
            
            setStatus(`${p.name} set to ${frequency} activity`);
            return {...p, activityFrequency: frequency};
          } catch (err) {
            console.error(`Error changing frequency:`, err);
            setError(`Could not update activity level.`);
            return p;
          }
        }
        return p;
      })
    );
  };

  // Trigger persona action
  const triggerPersonaAction = async (id: PersonaId, action: ActionType) => {
    if (!personaModule) return;
    
    const personaName = personas.find(p => p.id === id)?.name || 'Unknown';
    setStatus(`${personaName} is generating a ${action}...`);
    
    try {
      // Create properly typed context
      const context: PersonaContext = {
        proposalContext: {
          recentTopics: ['governance', 'data privacy', 'accessibility'],
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
      
      let description: string;
      let proposalResult: ProposalResult | null = null;
      let voteResult: VoteResult | null = null;
      let commentResult: CommentResult | null = null;
      
      switch(action) {
        case 'proposal':
          proposalResult = await personaModule.generateProposal(id, context);
          description = `Created a proposal: "${proposalResult.title}"`;
          break;
        case 'vote':
          const mockProposal = {
            id: 'test-proposal-1',
            title: 'Community Forum Enhancement',
            content: 'Implement advanced search functionality and topic categorization.'
          };
          voteResult = await personaModule.simulateVote(id, mockProposal.id, mockProposal.content, context);
          description = `Voted "${voteResult.vote}" on "${mockProposal.title}"`;
          break;
        case 'comment':
          const mockThread = {
            id: 'test-thread-1',
            title: 'Thoughts on the new voting interface?',
            content: 'What do you think about the recent UI changes?'
          };
          // Create properly typed forum posts array
          const mockComments: ForumPostEntity[] = [
            {
              content: 'I think the new design looks great!',
              threadId: mockThread.id,
              userId: 'user-1',
              createdAt: Date.now() - 3600000
            }
          ];
          
          // Convert to imported type before passing to the module
          commentResult = await personaModule.generateForumComment(
            id,
            mockThread.id,
            mockThread.content,
            convertToImportedForumPosts(mockComments),
            context
          );
          description = `Commented on "${mockThread.title}"`;
          break;
        default:
          description = "Unknown action";
          break;
      }
      
      // Create new activity record
      const newActivity = {
        personaId: id,
        personaName,
        action,
        description,
        timestamp: Date.now()
      };
      
      // Update state
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setStatus(`${personaName} ${description}`);
      
      // Save to localStorage
      try {
        const storedActivities = JSON.parse(localStorage.getItem('personaActivities') || '[]');
        localStorage.setItem('personaActivities', JSON.stringify([
          newActivity,
          ...storedActivities.slice(0, 19)
        ]));
        
        // Store action-specific data
        if (action === 'proposal' && proposalResult) {
          const storedProposals = JSON.parse(localStorage.getItem('personaProposals') || '[]');
          localStorage.setItem('personaProposals', JSON.stringify([
            {
              id: `proposal-${Date.now()}`,
              title: proposalResult.title,
              description: proposalResult.content,
              authorId: id,
              authorName: personaName,
              createdAt: Date.now(),
              votes: [],
              status: 'active'
            },
            ...storedProposals
          ]));
        } else if (action === 'vote' && voteResult) {
          // Track vote data if needed
          console.log(`Vote recorded: ${voteResult.vote} with reasoning: ${voteResult.reasoning}`);
        } else if (action === 'comment' && commentResult) {
          // Track comment data if needed
          console.log(`Comment content: ${commentResult.content}`);
        }
        
        // Dispatch event to update other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'personaActivities',
          newValue: localStorage.getItem('personaActivities')
        }));
      } catch (e) {
        console.error('Failed to save activity:', e);
      }
      
      // Update last action for persona
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
      setStatus(`Could not generate ${action}.`);
      setError(`Action generation failed.`);
    }
  };

  // Activate all personas
  const activateAllPersonas = () => {
    if (!personaModule) return;
    
    try {
      const personaIds = personas.map(p => p.id);
      personaModule.schedulePersonaActivity(personaIds, 'medium');
      
      // Update localStorage
      localStorage.setItem('activePersonas', JSON.stringify(personaIds));
      localStorage.setItem('personaFrequency', 'medium');
      
      // Update UI
      setPersonas(prevPersonas =>
        prevPersonas.map(p => ({
          ...p,
          isActive: true,
          activityFrequency: 'medium'
        }))
      );
      
      setStatus(`All personas activated`);
    } catch (err) {
      console.error('Error activating personas:', err);
      setError('Could not activate all personas.');
    }
  };

  // Format time for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading personas...</div>;
  }

  // Color mapping for action types
  const actionColors = {
    'proposal': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    'vote': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    'comment': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Persona Manager</h2>
        
        {/* Tab navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setSelectedTab('personas')}
            className={`py-2 px-4 text-sm ${
              selectedTab === 'personas'
              ? 'bg-primary text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Personas
          </button>
          <button
            onClick={() => setSelectedTab('activities')}
            className={`py-2 px-4 text-sm ${
              selectedTab === 'activities'
              ? 'bg-primary text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Activities
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {status && (
        <div className="mb-4 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm">
          {status}
        </div>
      )}
      
      {selectedTab === 'personas' && (
        <>
          <div className="mb-4">
            <button
              onClick={activateAllPersonas}
              className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              disabled={!personaModule}
            >
              Activate All Personas
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map(persona => (
              <div key={persona.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">{persona.name}</h3>
                  <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-1.5 ${persona.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {persona.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Simple toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Status</span>
                    <button
                      onClick={() => togglePersonaActive(persona.id)}
                      className={`px-3 py-1 text-xs rounded font-medium ${
                        persona.isActive
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40'
                      }`}
                    >
                      {persona.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  
                  {/* Activity frequency */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Activity Level</span>
                    <select
                      value={persona.activityFrequency}
                      onChange={(e) => changeFrequency(persona.id, e.target.value as ActivityFrequency)}
                      className="text-xs p-1.5 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      disabled={!persona.isActive}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => triggerPersonaAction(persona.id, 'proposal')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Proposal
                    </button>
                    <button
                      onClick={() => triggerPersonaAction(persona.id, 'vote')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Vote
                    </button>
                    <button
                      onClick={() => triggerPersonaAction(persona.id, 'comment')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Comment
                    </button>
                  </div>
                  
                  {/* Last action */}
                  {persona.lastAction && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                      Last: {persona.lastAction.type} at {formatTime(persona.lastAction.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {selectedTab === 'activities' && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Recent Activities</h3>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-2">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800 dark:text-white">{activity.personaName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                    {activity.description}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${actionColors[activity.action]}`}>
                    {activity.action}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No activities yet. Activate personas to generate content.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonaController;