'use client';

import { useState } from "react";
import VotingApp from "../../components/VotingApp";
import ProposalList from "../../components/ProposalList";
import PersonaProposalList from "../../components/PersonaProposalList";

export default function InitiativesPage() {
  const [activeTab, setActiveTab] = useState<'community' | 'personas'>('community');

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-[calc(100vh-64px)] p-4 md:p-8 gap-6 md:gap-8 bg-gradient-to-b from-background to-background/80">
      <header className="text-center animate-in py-6 mt-4">
        <div className="inline-block mb-4 bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-primary"
          >
            <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
            <path d="M22 19H2"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Initiatives
        </h1>
        <p className="text-foreground/70 max-w-md mx-auto text-lg">
          Propose, vote, and collaborate on ideas with community feedback
        </p>
      </header>
      
      <main className="w-full max-w-4xl mx-auto px-4">
        {/* Proposal Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg focus:z-10 ${
                activeTab === 'community'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } border border-gray-200 dark:border-gray-600`}
            >
              Community Proposals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('personas')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg focus:z-10 ${
                activeTab === 'personas'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } border border-gray-200 dark:border-gray-600 border-l-0`}
            >
              AI Persona Proposals
            </button>
          </div>
        </div>

        {activeTab === 'community' ? (
          <VotingApp>
            <ProposalList />
          </VotingApp>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Persona Generated Proposals</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                These proposals are created by AI personas to simulate community activity.
              </p>
            </div>
            <PersonaProposalList />
          </div>
        )}
      </main>
      
      <footer className="text-center text-sm text-foreground/60 py-6 border-t border-border/40 mt-8">
        <div className="flex items-center justify-center gap-2">
          <span>Powered by</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">Community</span>
        </div>
      </footer>
    </div>
  );
}