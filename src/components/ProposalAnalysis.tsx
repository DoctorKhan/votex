'use client';

import { useState } from 'react';
import { Proposal } from './ProposalItem';

interface ProposalAnalysisProps {
  proposal: Proposal;
}

type AnalysisResult = {
  feasibility: number;
  impact: number;
  cost: number;
  timeframe: number;
  risks: string[];
  benefits: string[];
  recommendations: string;
  stakeholderImpact: {
    group: string;
    impact: number;
    description: string;
  }[];
  resourceRequirements: {
    resource: string;
    amount: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  securityImplications: {
    concern: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  implementationSteps: {
    step: string;
    timeframe: string;
    dependencies: string[];
  }[];
};

export default function ProposalAnalysis({ proposal }: ProposalAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRequestAnalysis = async () => {
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
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Error generating analysis:', err);
      setError('Failed to generate analysis. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
                    {analysis.risks.map((risk, index) => (
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
                    {analysis.benefits.map((benefit, index) => (
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}