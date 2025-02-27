'use client';

import { useState, useEffect } from 'react';
import ProposalChat from './ProposalChat';
import ProposalAnalysis from './ProposalAnalysis';
import { formatMarkdownText } from '../utils/formatText';

export type Proposal = {
  id: string;
  title: string;
  description: string;
  votes: number;
  llmFeedback?: string;
  aiCreated?: boolean;
  aiVoted?: boolean;
  revisions: {
    id: number;
    description: string;
    timestamp: string;
  }[];
  analysis?: {
    feasibility: number;
    impact: number;
    cost: number;
    timeframe: number;
    risks: string[];
    benefits: string[];
    recommendations: string;
    stakeholderImpact?: {
      group: string;
      impact: number;
      description: string;
    }[];
    resourceRequirements?: {
      resource: string;
      amount: string;
      priority: 'low' | 'medium' | 'high';
    }[];
    securityImplications?: {
      concern: string;
      severity: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
    implementationSteps?: {
      step: string;
      timeframe: string;
      dependencies: string[];
    }[];
  };
};

type ProposalItemProps = {
  proposal: Proposal;
  onVote: (id: string) => void;
  onRequestLlmFeedback: (id: string) => void;
  onAddRevision: (id: string, revision: string) => void;
  hasVoted: boolean;
};

export default function ProposalItem({
  proposal,
  onVote,
  onRequestLlmFeedback,
  onAddRevision,
  hasVoted
}: ProposalItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newRevision, setNewRevision] = useState('');
  const [isAddingRevision, setIsAddingRevision] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  
  // Revision history for undo/redo functionality
  const [revisionHistory, setRevisionHistory] = useState<string[]>([]);
  const [currentRevisionIndex, setCurrentRevisionIndex] = useState(-1);
  const [isGeneratingRevision, setIsGeneratingRevision] = useState(false);

  // Initialize revision history with all revisions when component mounts or revisions change
  useEffect(() => {
    if (proposal.revisions.length > 0 && revisionHistory.length === 0) {
      // Initialize with all existing revisions
      const descriptions = proposal.revisions.map(rev => rev.description);
      setRevisionHistory(descriptions);
      setCurrentRevisionIndex(descriptions.length - 1); // Start at the latest revision
    }
  }, [proposal.revisions, revisionHistory.length]);

  const handleAddRevision = () => {
    if (!newRevision.trim()) return;
    
    // Add to revision history for undo/redo
    // Remove any future revisions if we're not at the end of the history
    const newHistory = currentRevisionIndex >= 0
      ? revisionHistory.slice(0, currentRevisionIndex + 1)
      : [];
    
    // Add the new revision to history
    newHistory.push(newRevision);
    setRevisionHistory(newHistory);
    setCurrentRevisionIndex(newHistory.length - 1);
    
    // Update the actual proposal revision
    onAddRevision(proposal.id, newRevision);
    setNewRevision('');
    setIsAddingRevision(false);
  };

  // Generate a revision based on AI feedback
  const handleAutoRevise = async () => {
    if (!proposal.llmFeedback) return;
    
    setIsGeneratingRevision(true);
    
    try {
      // Call an API to generate a revised proposal based on the feedback
      const response = await fetch('/api/ai-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalDescription: proposal.description,
          feedback: proposal.llmFeedback
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate revision');
      }
      
      const data = await response.json();
      
      // Update revision history - remove any future revisions
      const newHistory = currentRevisionIndex >= 0
        ? revisionHistory.slice(0, currentRevisionIndex + 1)
        : [];
      
      // Add the new AI-generated revision to history
      newHistory.push(data.revisedProposal);
      setRevisionHistory(newHistory);
      setCurrentRevisionIndex(newHistory.length - 1);
      
      // Update the actual proposal revision
      onAddRevision(proposal.id, data.revisedProposal);
    } catch (err) {
      console.error('Error generating revision:', err);
    } finally {
      setIsGeneratingRevision(false);
    }
  };

  // Undo revision - go to previous revision in history
  const handleUndoRevision = () => {
    if (currentRevisionIndex > 0 && revisionHistory.length > 1) {
      const newIndex = currentRevisionIndex - 1;
      setCurrentRevisionIndex(newIndex);
      
      // Update the displayed revision
      const revisionText = revisionHistory[newIndex];
      if (revisionText) {
        onAddRevision(proposal.id, revisionText);
      }
    }
  };

  // Redo revision - go to next revision in history
  const handleRedoRevision = () => {
    if (currentRevisionIndex < revisionHistory.length - 1) {
      const newIndex = currentRevisionIndex + 1;
      setCurrentRevisionIndex(newIndex);
      
      // Update the displayed revision
      const revisionText = revisionHistory[newIndex];
      if (revisionText) {
        onAddRevision(proposal.id, revisionText);
      }
    }
  };

  return (
    <div className={`border border-border/60 rounded-xl bg-card shadow-sm hover:shadow-md transition-all duration-200 group distort-hover rainbow-border ${isExpanded ? 'p-5' : 'p-4'}`}>
      <div className={`flex justify-between items-start ${isExpanded ? 'mb-3' : 'mb-2'}`}>
        <div>
          <h3 className={`font-bold group-hover:text-primary transition-colors psychedelic-text ${isExpanded ? 'text-lg' : 'text-base'}`}>{proposal.title}</h3>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {proposal.aiCreated && (
              <span className="inline-flex items-center bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full pulsate-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
                AI Created
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 12 2 2 4-4"></path>
              <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
              <path d="M22 19H2"></path>
            </svg>
            <span className="font-medium">
              {proposal.votes} vote{proposal.votes !== 1 ? 's' : ''}
            </span>
          </div>
          {proposal.aiVoted && (
            <span className="text-xs text-accent mt-1.5 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
              AI voted for this
            </span>
          )}
        </div>
      </div>
      
      <div className={`bg-background/50 rounded-lg border border-border/40 mb-4 ${isExpanded ? 'p-3' : 'p-2'}`}>
        <div
          className={`text-foreground/90 proposal-content ${isExpanded ? '' : 'text-sm'}`}
          dangerouslySetInnerHTML={{ __html: formatMarkdownText(proposal.description) }}
        />
      </div>
      <div className={`flex flex-wrap mb-4 ${isExpanded ? 'gap-2' : 'gap-1.5'}`}>
        <button
          onClick={() => onVote(proposal.id)}
          disabled={hasVoted}
          className={`rounded-lg text-white font-medium transition-all shadow-sm flex items-center trippy-hover ${
            isExpanded ? 'py-2 px-4' : 'py-1 px-2'
          } ${
            hasVoted
              ? 'bg-gray-400 cursor-not-allowed opacity-70'
              : 'bg-primary hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 pulsate-glow'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`animate-pulse ${isExpanded ? 'w-4 h-4 mr-1.5' : 'w-3.5 h-3.5 mr-1'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 12 2 2 4-4"></path>
            <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
            <path d="M22 19H2"></path>
          </svg>
          <span className={`relative ${isExpanded ? 'text-base' : 'text-sm'}`}>
            {hasVoted ? 'Voted' : 'Vote'}
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/30 animate-pulse"></span>
          </span>
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-lg bg-background hover:bg-background/80 border border-border/60 transition-all hover:shadow-sm flex items-center trippy-hover ${
            isExpanded ? 'py-2 px-4' : 'py-1 px-2'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`transition-transform ${isExpanded ? 'w-4 h-4 mr-1.5 rotate-180' : 'w-3.5 h-3.5 mr-1'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
          <span className={`relative ${isExpanded ? 'text-base' : 'text-sm'}`}>
            {isExpanded ? 'Hide Details' : 'Show Details'}
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground/30 animate-pulse"></span>
          </span>
        </button>
        
        {!proposal.llmFeedback && (
          <button
            onClick={() => onRequestLlmFeedback(proposal.id)}
            className={`rounded-lg bg-accent hover:bg-accent-hover text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center trippy-hover pulsate-glow ${
              isExpanded ? 'py-2 px-4' : 'py-1 px-2'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`animate-pulse ${isExpanded ? 'w-4 h-4 mr-1.5' : 'w-3.5 h-3.5 mr-1'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <span className={`relative ${isExpanded ? 'text-base' : 'text-sm'}`}>
              Get AI Feedback
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/30 animate-pulse"></span>
            </span>
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-5 space-y-5 animate-in">
          {proposal.llmFeedback && (
            <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg pulsate-glow rainbow-border">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent mr-2 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
                <h4 className="font-semibold psychedelic-text">AI Feedback</h4>
              </div>
              <p className="text-foreground/90">{proposal.llmFeedback}</p>
              
              {/* Revision control buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleAutoRevise}
                  disabled={isGeneratingRevision}
                  className={`py-2 px-4 rounded-lg text-white font-medium transition-all shadow-sm flex items-center ${
                    isGeneratingRevision
                      ? 'bg-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-accent hover:bg-accent-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 trippy-hover'
                  }`}
                >
                  {isGeneratingRevision ? (
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8V4H8"></path>
                      <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                      <path d="M2 14h2"></path>
                      <path d="M20 14h2"></path>
                    </svg>
                  )}
                  Auto-Revise
                </button>
                
                <div className="flex rounded-lg overflow-hidden border border-border/60">
                  <button
                    onClick={handleUndoRevision}
                    disabled={currentRevisionIndex <= 0 || revisionHistory.length <= 1}
                    className={`py-2 px-3 flex items-center justify-center transition-colors ${
                      currentRevisionIndex <= 0 || revisionHistory.length <= 1
                        ? 'bg-background/50 text-foreground/30 cursor-not-allowed'
                        : 'bg-background hover:bg-background/80 text-foreground/70 hover:text-foreground'
                    }`}
                    title="Undo revision"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7v6h6"></path>
                      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleRedoRevision}
                    disabled={currentRevisionIndex >= revisionHistory.length - 1}
                    className={`py-2 px-3 flex items-center justify-center transition-colors ${
                      currentRevisionIndex >= revisionHistory.length - 1
                        ? 'bg-background/50 text-foreground/30 cursor-not-allowed'
                        : 'bg-background hover:bg-background/80 text-foreground/70 hover:text-foreground'
                    }`}
                    title="Redo revision"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 7v6h-6"></path>
                      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {proposal.revisions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-foreground/70 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <h4 className="font-semibold text-foreground/90">Revisions</h4>
                  <span className="ml-2 text-xs text-foreground/50 bg-background/50 px-2 py-0.5 rounded-full">
                    {proposal.revisions.length} {proposal.revisions.length === 1 ? 'revision' : 'revisions'}
                  </span>
                </div>
                
                {/* Toggle button for showing/hiding revisions */}
                <button
                  onClick={() => setShowRevisions(!showRevisions)}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  {showRevisions ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Revision history controls */}
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-foreground/70">
                  {currentRevisionIndex >= 0 && (
                    <span>Viewing revision {currentRevisionIndex + 1} of {revisionHistory.length}</span>
                  )}
                </div>
                
                <div className="flex rounded-lg overflow-hidden border border-border/60">
                  <button
                    onClick={handleUndoRevision}
                    disabled={currentRevisionIndex <= 0 || revisionHistory.length <= 1}
                    className={`py-1 px-3 flex items-center justify-center transition-colors ${
                      currentRevisionIndex <= 0 || revisionHistory.length <= 1
                        ? 'bg-background/50 text-foreground/30 cursor-not-allowed'
                        : 'bg-background hover:bg-background/80 text-foreground/70 hover:text-foreground'
                    }`}
                    title="Previous revision"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7v6h6"></path>
                      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleRedoRevision}
                    disabled={currentRevisionIndex >= revisionHistory.length - 1}
                    className={`py-1 px-3 flex items-center justify-center transition-colors ${
                      currentRevisionIndex >= revisionHistory.length - 1
                        ? 'bg-background/50 text-foreground/30 cursor-not-allowed'
                        : 'bg-background hover:bg-background/80 text-foreground/70 hover:text-foreground'
                    }`}
                    title="Next revision"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 7v6h-6"></path>
                      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {showRevisions ? (
                <ul className="space-y-3">
                  {proposal.revisions.map(revision => (
                    <li key={revision.id} className="bg-background p-4 rounded-lg border border-border/50">
                      <div
                        className="text-foreground/90 proposal-content"
                        dangerouslySetInnerHTML={{ __html: formatMarkdownText(revision.description) }}
                      />
                      <div className="flex items-center mt-2 text-xs text-foreground/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {revision.timestamp}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                // Show only the currently selected revision when revisions are hidden
                <div className="bg-background p-4 rounded-lg border border-border/50">
                  <div
                    className="text-foreground/90 proposal-content"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdownText(
                        currentRevisionIndex >= 0 && currentRevisionIndex < revisionHistory.length
                          ? revisionHistory[currentRevisionIndex]
                          : proposal.revisions[proposal.revisions.length - 1].description
                      )
                    }}
                  />
                  <div className="flex items-center mt-2 text-xs text-foreground/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {currentRevisionIndex === revisionHistory.length - 1 ? (
                      <>
                        {proposal.revisions[proposal.revisions.length - 1].timestamp}
                        <span className="ml-2 text-accent">Latest revision</span>
                      </>
                    ) : (
                      <>
                        {proposal.revisions[Math.min(currentRevisionIndex, proposal.revisions.length - 1)].timestamp}
                        <span className="ml-2 text-warning">Revision {currentRevisionIndex + 1} of {revisionHistory.length}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="pt-3 border-t border-border/40">
            {isAddingRevision ? (
              <div className="space-y-3">
                <textarea
                  value={newRevision}
                  onChange={(e) => setNewRevision(e.target.value)}
                  placeholder="Enter your revision..."
                  className="w-full px-4 py-3 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRevision}
                    className="py-2 px-4 rounded-lg bg-secondary hover:bg-secondary-hover text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center trippy-hover pulsate-glow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                    <span className="relative">
                      Submit Revision
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/30 animate-pulse"></span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingRevision(false);
                      setNewRevision('');
                    }}
                    className="py-2 px-4 rounded-lg bg-background hover:bg-background/80 border border-border/60 transition-all hover:shadow-sm flex items-center trippy-hover"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    <span className="relative">
                      Cancel
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground/30 animate-pulse"></span>
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingRevision(true)}
                className="py-2 px-4 rounded-lg bg-secondary hover:bg-secondary-hover text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Add Revision
              </button>
            )}
          </div>
          {/* Analysis for this proposal */}
          <ProposalAnalysis
            proposal={proposal}
            onAddRevision={onAddRevision}
          />
          
          {/* Chat for this proposal - renamed to avoid confusion */}
          <div className="mt-4 border-t border-border/40 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h4 className="font-semibold">MEDIATOR AI Discussion</h4>
              </div>
            </div>
            <p className="text-foreground/70 text-sm mb-3">
              Ask questions about this specific proposal or get more information
            </p>
            <ProposalChat proposal={proposal} />
          </div>
        </div>
      )}
    </div>
  );
}