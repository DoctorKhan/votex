'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initDB, getUserId } from '../../lib/db';
import { VotingService } from '../../lib/votingService';
import { ProposalService } from '../../lib/proposalService';

export default function VotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get('proposalId');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleVote = async () => {
      if (!proposalId) {
        setStatus('error');
        setErrorMessage('No proposal ID provided');
        return;
      }

      try {
        // Initialize the database
        await initDB();
        const userId = getUserId();
        
        // Create dummy IDBDatabase since we don't have direct access
        const dummyDb = {} as IDBDatabase;
        
        // Initialize services
        const votingService = new VotingService(dummyDb);
        const proposalService = new ProposalService(dummyDb);
        
        // Check if the proposal exists
        const proposal = await proposalService.getProposal(proposalId);
        if (!proposal) {
          setStatus('error');
          setErrorMessage('Proposal not found');
          return;
        }
        
        // Check if the user has already voted
        const hasVoted = await proposalService.hasUserVotedForProposal(proposalId, userId);
        if (hasVoted) {
          // If already voted, just redirect to the initiatives page
          setStatus('success');
          setTimeout(() => {
            router.push('/initiatives');
          }, 1500);
          return;
        }
        
        // Record the vote
        const result = await votingService.handleShareLinkVote(proposalId, userId);
        
        if (result.success) {
          setStatus('success');
          // Redirect to the initiatives page after a short delay
          setTimeout(() => {
            router.push('/initiatives');
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage('Failed to record your vote');
        }
      } catch (error) {
        console.error('Error handling vote:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    handleVote();
  }, [proposalId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-md w-full bg-card border border-border/60 rounded-xl shadow-lg p-8 animate-in">
        {status === 'loading' && (
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-r-4 border-l-4 border-accent/30 rounded-full animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Processing Your Vote</h2>
            <p className="text-foreground/70">Please wait while we record your vote...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Vote Recorded!</h2>
            <p className="text-foreground/70 mb-4">Thank you for participating. Your vote has been successfully recorded.</p>
            <p className="text-foreground/50 text-sm">Redirecting you to the initiatives page...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Error</h2>
            <p className="text-foreground/70 mb-4">{errorMessage || 'An error occurred while processing your vote.'}</p>
            <button
              onClick={() => router.push('/initiatives')}
              className="py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-sm hover:shadow-md"
            >
              Go to Initiatives
            </button>
          </div>
        )}
      </div>
    </div>
  );
}