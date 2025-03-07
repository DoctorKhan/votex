'use client';

import React, { useState, useEffect } from 'react';

interface ProposalVote {
  personaId: string;
  personaName: string;
  vote: string;
  reasoning: string;
  timestamp: number;
}

interface PersonaProposal {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  votes: ProposalVote[];
  status: 'active' | 'completed' | 'cancelled';
}

const PersonaProposalList: React.FC = () => {
  const [proposals, setProposals] = useState<PersonaProposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load proposals from localStorage
  useEffect(() => {
    const loadProposals = () => {
      try {
        const storedProposals = localStorage.getItem('personaProposals');
        if (storedProposals) {
          setProposals(JSON.parse(storedProposals));
        } else {
          setProposals([]);
        }
        setLoading(false);
      } catch (e) {
        console.error('Error loading proposals:', e);
        setProposals([]);
        setLoading(false);
      }
    };

    loadProposals();

    // Listen for changes to localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'personaProposals' && e.newValue) {
        setProposals(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Set up a refresh interval to periodically check for new proposals
    const refreshInterval = setInterval(loadProposals, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(refreshInterval);
    };
  }, []);

  // Format date/time
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Loading proposals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {proposals.length > 0 ? (
        proposals.map((proposal) => (
          <div 
            key={proposal.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {proposal.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                proposal.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : proposal.status === 'completed'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{proposal.authorName}</span>
              <span>•</span>
              <span>{formatDate(proposal.createdAt)}</span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {proposal.description}
            </p>
            
            {proposal.votes.length > 0 && (
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Votes</h4>
                <div className="space-y-3">
                  {proposal.votes.map((vote, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {vote.personaName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            vote.vote === 'approve' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : vote.vote === 'reject'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {vote.vote.charAt(0).toUpperCase() + vote.vote.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(vote.timestamp)}
                          </span>
                        </div>
                      </div>
                      {vote.reasoning && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {vote.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-dashed border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Proposals Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No persona-generated proposals available. Activate personas in the Admin Panel to generate proposals.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonaProposalList;