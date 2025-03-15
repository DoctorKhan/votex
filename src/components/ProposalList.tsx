'use client';

import { useState, useEffect } from 'react';
import { ProposalEntity } from '../lib/proposalService';
import ProposalItem from './ProposalItem';
import { initDB, getUserId } from '../lib/db';
import { ProposalService } from '../lib/proposalService';

export default function ProposalList() {
  const [proposals, setProposals] = useState<ProposalEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [proposalService, setProposalService] = useState<ProposalService | null>(null);
  const [userId, setUserId] = useState<string>('');
  
  // State variables for create initiative modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInitiativeTitle, setNewInitiativeTitle] = useState('');
  const [newInitiativeDescription, setNewInitiativeDescription] = useState('');
  const [isTitleError, setIsTitleError] = useState(false);
  const [isDescriptionError, setIsDescriptionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareNotification, setShareNotification] = useState<string | null>(null);

  // Initialize the database and load proposals
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await initDB();
        const uid = getUserId();
        setUserId(uid);
        
        // Create a dummy IDBDatabase since we don't have direct access to the db instance
        // The actual db instance is managed inside the db.ts module
        const dummyDb = {} as IDBDatabase;
        
        const service = new ProposalService(dummyDb);
        setProposalService(service);
        
        // Load proposals
        const allProposals = await service.getAllProposals();
        setProposals(allProposals);
        
        // Check which proposals the user has voted for
        const votedProposals: Record<string, boolean> = {};
        for (const proposal of allProposals) {
          votedProposals[proposal.id] = await service.hasUserVotedForProposal(proposal.id, uid);
        }
        setUserVotes(votedProposals);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing:', err);
        setError('Failed to load proposals. Please try again.');
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  // Handle voting for a proposal
  const handleVote = async (proposalId: string) => {
    if (!proposalService || !userId) return;
    
    try {
      // Check if user has already voted
      if (userVotes[proposalId]) {
        return;
      }
      
      // Record the vote
      await proposalService.voteForProposal(proposalId, userId);
      
      // Update the proposals list
      const updatedProposals = await proposalService.getAllProposals();
      setProposals(updatedProposals);
      
      // Update the user votes
      setUserVotes(prev => ({
        ...prev,
        [proposalId]: true
      }));
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to record your vote. Please try again.');
    }
  };

  // Handle requesting LLM feedback for a proposal
  const handleRequestLlmFeedback = async (proposalId: string) => {
    if (!proposalService) return;
    
    try {
      const proposal = await proposalService.getProposal(proposalId);
      if (!proposal) return;
      
      // Make API call to get LLM feedback
      const response = await fetch('/api/llm-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId, proposal }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI feedback');
      }
      
      const data = await response.json();
      
      // Update the proposal with the feedback
      proposal.llmFeedback = data.feedback;
      await proposalService.updateProposal(proposalId, proposal);
      
      // Update the proposals list
      const updatedProposals = await proposalService.getAllProposals();
      setProposals(updatedProposals);
    } catch (err) {
      console.error('Error getting LLM feedback:', err);
      setError('Failed to get AI feedback. Please try again.');
    }
  };

  // Handle adding a revision to a proposal
  const handleAddRevision = async (proposalId: string, revisionText: string) => {
    if (!proposalService) return;
    
    try {
      // Get the current proposal
      const proposal = await proposalService.getProposal(proposalId);
      if (!proposal) return;
      
      // Create a revision entity
      const revision = {
        id: Date.now().toString(), // Use timestamp as a string ID
        proposalId: proposalId, // Add the required proposalId property
        description: revisionText,
        timestamp: Date.now()  // Use numeric timestamp to match the interface
      };
      
      // Add the revision to the proposal
      if (!proposal.revisions) {
        proposal.revisions = [];
      }
      
      proposal.revisions.push(revision);
      
      // Update the proposal
      await proposalService.updateProposal(proposalId, proposal);
      
      // Update the proposals list
      const updatedProposals = await proposalService.getAllProposals();
      setProposals(updatedProposals);
    } catch (err) {
      console.error('Error adding revision:', err);
      setError('Failed to add revision. Please try again.');
    }
  };

  // Create a new proposal
  const handleCreateProposal = async (title: string, description: string) => {
    if (!proposalService) return;
    
    try {
      const newProposal: ProposalEntity = {
        id: Math.random().toString(36).substring(2, 15),
        title,
        description,
        votes: 0,
        createdAt: Date.now(),
        revisions: []
      };
      
      await proposalService.createProposal(newProposal);
      
      // Update the proposals list
      const updatedProposals = await proposalService.getAllProposals();
      setProposals(updatedProposals);
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError('Failed to create proposal. Please try again.');
    }
  };

  // Handle create initiative form submission
  const handleSubmitInitiative = async () => {
    // Validate inputs
    let hasError = false;
    if (!newInitiativeTitle.trim()) {
      setIsTitleError(true);
      hasError = true;
    }
    if (!newInitiativeDescription.trim()) {
      setIsDescriptionError(true);
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsSubmitting(true);
    
    try {
      await handleCreateProposal(newInitiativeTitle, newInitiativeDescription);
      // Reset form and close modal on success
      setNewInitiativeTitle('');
      setNewInitiativeDescription('');
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating initiative:', err);
      setError('Failed to create initiative. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle share action
  const handleShare = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setShareNotification(`Share link for "${proposal.title}" copied to clipboard!`);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setShareNotification(null);
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12 animate-in">
        <div className="relative">
          <div className="w-12 h-12 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-r-4 border-l-4 border-accent/30 rounded-full animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-start animate-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{error}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold psychedelic-text">Initiatives</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          Create Initiative
        </button>
      </div>
      
      {/* Share notification */}
      {shareNotification && (
        <div className="fixed top-4 right-4 z-50 bg-accent text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-4 fade-in">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <span>{shareNotification}</span>
          </div>
        </div>
      )}
      
      {/* Create Initiative Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border/60 p-6 mx-4 md:mx-0 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary">Create New Initiative</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full p-1.5 text-foreground/70 hover:text-foreground bg-background/50 hover:bg-background transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="initiative-title" className="block text-sm font-medium mb-1.5 text-foreground/90">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  id="initiative-title"
                  type="text"
                  value={newInitiativeTitle}
                  onChange={(e) => {
                    setNewInitiativeTitle(e.target.value);
                    setIsTitleError(false);
                  }}
                  placeholder="Enter a clear, concise title"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors 
                    ${isTitleError ? 'border-danger text-danger' : 'border-border/60 text-foreground'}`}
                />
                {isTitleError && (
                  <p className="text-danger text-sm mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Title is required
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="initiative-description" className="block text-sm font-medium mb-1.5 text-foreground/90">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="initiative-description"
                  value={newInitiativeDescription}
                  onChange={(e) => {
                    setNewInitiativeDescription(e.target.value);
                    setIsDescriptionError(false);
                  }}
                  placeholder="Describe your initiative in detail. What problem does it solve? Why is it important?"
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors 
                    ${isDescriptionError ? 'border-danger text-danger' : 'border-border/60 text-foreground'}`}
                />
                {isDescriptionError && (
                  <p className="text-danger text-sm mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Description is required
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="py-2.5 px-4 rounded-lg border border-border/60 hover:bg-background/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInitiative}
                disabled={isSubmitting}
                className={`py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all flex items-center
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                    Create Initiative
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {proposals.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
              <path d="M22 19H2"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No initiatives yet</h3>
          <p className="text-foreground/70 mb-4">Be the first to create an initiative for the community to vote on.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => (
            <ProposalItem
              key={proposal.id}
              proposal={{
                id: proposal.id,
                title: proposal.title,
                description: proposal.description,
                votes: proposal.votes,
                llmFeedback: proposal.llmFeedback,
                aiCreated: proposal.aiCreated,
                aiVoted: proposal.aiVoted,
                revisions: proposal.revisions || [],
                analysis: proposal.analysis
              }}
              onVote={handleVote}
              onRequestLlmFeedback={handleRequestLlmFeedback}
              onAddRevision={handleAddRevision}
              hasVoted={userVotes[proposal.id] || false}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}
