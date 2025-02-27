'use client';

import { useState, useEffect, useCallback } from 'react';
import { Proposal, Analysis, Revision } from './ProposalItem';
import { initDB } from '../lib/db';
import { ProposalService } from '../lib/proposalService';

interface ProposalAnalysisProps {
  proposal: Proposal;
  currentRevision: Revision | null;
  onAddRevision?: (id: string, revision: string) => void;
  onAnalysisGenerated?: (analysis: Analysis) => void;
}

export default function ProposalAnalysis({
  proposal,
  currentRevision,
  onAddRevision,
  onAnalysisGenerated
}: ProposalAnalysisProps) {
  // Initialize analysis with the current revision's analysis if it exists
  const [analysis, setAnalysis] = useState<Analysis | null>(
    currentRevision?.analysis || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Automatically expand the analysis section if an analysis already exists
  const [isExpanded, setIsExpanded] = useState(!!currentRevision?.analysis);
  const [isGeneratingRevision, setIsGeneratingRevision] = useState(false);
  const [proposalService, setProposalService] = useState<ProposalService | null>(null);

  // Request analysis from the API
  const handleRequestAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the AI analysis API endpoint
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: proposal.title,
          description: proposal.description
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get analysis');
      }
      
      const data = await response.json();
      const analysisResult = data.analysis as Analysis;
      setAnalysis(analysisResult);
      
      // Notify parent component about the new analysis
      if (onAnalysisGenerated) {
        onAnalysisGenerated(analysisResult);
      }
      
      // Save the analysis to the database
      if (proposalService) {
        try {
          const fullProposal = await proposalService.getProposal(proposal.id);
          if (fullProposal) {
            // Make sure revisions array exists
            if (fullProposal.revisions) {
              // Find the current revision and update its analysis
              const currentRevisionIndex = fullProposal.revisions.findIndex(
                rev => currentRevision && rev.id === currentRevision.id
              );
              
              if (currentRevisionIndex >= 0) {
                // Use type assertion to work around the TypeScript error
                // since the Proposal type in the database service might not be updated yet
                (fullProposal.revisions[currentRevisionIndex] as Revision).analysis = analysisResult;
                await proposalService.updateProposal(proposal.id, fullProposal);
                console.log('Analysis saved successfully for revision:', currentRevision?.id);
              } else {
                console.error('Could not find revision in proposal');
              }
            } else {
              console.error('Proposal has no revisions array');
            }
          } else {
            console.error('Could not find proposal with ID:', proposal.id);
          }
        } catch (saveErr) {
          console.error('Error saving analysis to database:', saveErr);
          // We still show the analysis even if saving fails
        }
      } else {
        console.error('ProposalService not initialized');
      }
    } catch (err) {
      console.error('Error generating analysis:', err);
      setError('Failed to generate analysis. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [proposal, currentRevision, onAnalysisGenerated, proposalService]);
  
  // Initialize the database
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        
        // Create a dummy IDBDatabase since we don't have direct access to the db instance
        const dummyDb = {} as IDBDatabase;
        const service = new ProposalService(dummyDb);
        setProposalService(service);
      } catch (err) {
        console.error('Error initializing:', err);
      }
    };
    
    init();
  }, []);
  
  // Auto-generate analysis for the current revision if it doesn't have one
  useEffect(() => {
    // If we have a current revision but no analysis, automatically request one
    if (currentRevision && !currentRevision.analysis && !analysis && !isLoading) {
      // Use a small delay to avoid immediate analysis generation when switching revisions
      const timer = setTimeout(() => {
        handleRequestAnalysis();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentRevision, analysis, isLoading, handleRequestAnalysis]);

  // Generate a revision based on AI recommendations
  const handleAutoRevise = useCallback(async () => {
    if (!analysis || !onAddRevision) return;
    
    setIsGeneratingRevision(true);
    
    try {
      // Call the AI proposal API endpoint
      const response = await fetch('/api/ai-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalDescription: proposal.description,
          feedback: analysis.recommendations
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate revision');
      }
      
      const data = await response.json();
      
      // Add the revision
      onAddRevision(proposal.id, data.revisedProposal);
    } catch (err) {
      console.error('Error generating revision:', err);
    } finally {
      setIsGeneratingRevision(false);
    }
  }, [analysis, onAddRevision, proposal]);

  return (
    <div className="mt-4 border-t border-border/40 pt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <h4 className="font-semibold">ANALYST AI</h4>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          {isExpanded ? (
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
      
      {isExpanded && (
        <>
          <p className="text-foreground/70 text-sm mb-3">
            Get a detailed analysis of this proposal including feasibility, impact, and recommendations
          </p>
          
          {!analysis && !isLoading && (
            <button
              onClick={handleRequestAnalysis}
              className="py-2 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center trippy-hover pulsate-glow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span className="relative">
                Request Analysis
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/30 animate-pulse"></span>
              </span>
            </button>
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="w-10 h-10 border-t-4 border-b-4 border-accent rounded-full animate-spin"></div>
                <div className="w-10 h-10 border-r-4 border-l-4 border-primary/30 rounded-full animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                </div>
              </div>
              <span className="ml-3 text-foreground/70">Analyzing proposal...</span>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-start text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {analysis && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-4 pulsate-glow rainbow-border">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Feasibility</span>
                    <span className="text-sm">{Math.round(analysis.feasibility * 100)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent"
                      style={{ width: `${analysis.feasibility * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Impact</span>
                    <span className="text-sm">{Math.round(analysis.impact * 100)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${analysis.impact * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cost</span>
                    <span className="text-sm">{Math.round(analysis.cost * 100)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary"
                      style={{ width: `${analysis.cost * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Timeframe</span>
                    <span className="text-sm">{Math.round(analysis.timeframe * 100)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary/70"
                      style={{ width: `${analysis.timeframe * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <path d="M12 9v4"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    Potential Risks
                  </h5>
                  <ul className="text-sm space-y-1">
                    {analysis.risks.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-danger mr-1.5">•</span>
                        <span className="text-foreground/80">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-semibold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    Key Benefits
                  </h5>
                  <ul className="text-sm space-y-1">
                    {analysis.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-success mr-1.5">•</span>
                        <span className="text-foreground/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border/40">
                <h5 className="text-sm font-semibold mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                  </svg>
                  Recommendations
                </h5>
                <p className="text-sm text-foreground/80">{analysis.recommendations}</p>
                
                {/* Auto-Revise Button */}
                {onAddRevision && (
                  <div className="mt-4">
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      )}
                      Auto-Revise Based on Recommendations
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}