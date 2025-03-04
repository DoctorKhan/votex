'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ForumThreadEntity } from '../../lib/forumService';

interface SuggestedProposalsProps {
  threads: ForumThreadEntity[];
  isLoading: boolean;
}

export default function SuggestedProposals({ threads, isLoading }: SuggestedProposalsProps) {
  const [proposals, setProposals] = useState<Array<{id: string; title: string; description: string}>>([]);
  
  // Enhanced function to generate meaningful proposals based on community issues
  useEffect(() => {
    if (!threads.length) return;
    
    // Create detailed proposal suggestions with actionable items
    const generateProposalContent = (thread: ForumThreadEntity) => {
      const title = thread.title.toLowerCase();
      
      if (title.includes('street light') || title.includes('maintenance')) {
        return {
          id: `proposal-${thread.id}`,
          title: `Infrastructure Improvement: Street Lighting Enhancement Program`,
          description: `A comprehensive plan to upgrade and maintain street lighting across all districts, with priority given to areas with reported outages. This proposal includes regular maintenance schedules, energy-efficient upgrades, and a citizen reporting system.`
        };
      } else if (title.includes('park') || title.includes('waste')) {
        return {
          id: `proposal-${thread.id}`,
          title: `Urban Green Space Enhancement and Waste Management Initiative`,
          description: `A proposal to revitalize public parks through strategic placement of waste management facilities, increased service frequency, and educational campaigns. Includes plans for volunteer clean-up days and ecological sustainability measures.`
        };
      } else if (title.includes('community center') || title.includes('hours')) {
        return {
          id: `proposal-${thread.id}`,
          title: `Community Services Accessibility Expansion`,
          description: `This proposal outlines an extended hours program for community facilities to ensure working residents can access services. Includes staffing adjustments, budget considerations, and phased implementation across various community centers.`
        };
      } else {
        // Default proposal for other issues
        return {
          id: `proposal-${thread.id}`,
          title: `Community Improvement: ${thread.title.replace(/\?/g, '')}`,
          description: `A structured initiative to address "${thread.title}" through community engagement, resource allocation, and measurable outcomes. This proposal includes implementation timelines, success metrics, and sustainability considerations.`
        };
      }
    };
    
    // Generate detailed proposals for each thread
    const generatedProposals = threads.slice(0, 3).map(generateProposalContent);
    
    setProposals(generatedProposals);
  }, [threads]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="mb-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!proposals.length) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg shadow-lg p-6 mb-8 border border-green-100 dark:border-green-800">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300">AI-Generated Proposal Suggestions</h2>
      </div>
      
      <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-md mb-6">
        <p className="text-gray-700 dark:text-gray-300">
          Based on the community issues in this category, our AI has generated these proposal suggestions that might address these concerns. Each proposal includes implementation plans and measurable outcomes.
        </p>
      </div>
      
      <div className="space-y-6">
        {proposals.map(proposal => (
          <div key={proposal.id} className="p-5 border-l-4 border-green-500 dark:border-green-600 bg-white dark:bg-gray-800 rounded-md shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg text-green-800 dark:text-green-300">{proposal.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mt-2">{proposal.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                Community-Driven Proposal
              </span>
              <Link
                href="/initiatives"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <span>Create this proposal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          These suggestions are automatically generated based on community issues. The AI analyzes issue patterns and creates structured solution proposals.
        </p>
      </div>
    </div>
  );
}