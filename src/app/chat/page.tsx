'use client';

import ChatInterface from '../../components/ChatInterface';
import ProposalList from '../../components/ProposalList';
import { useState } from 'react';

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'proposals'>('proposals');

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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Community Discussion
        </h1>
        <p className="text-foreground/70 max-w-md mx-auto text-lg">
          Vote on ideas. Get insights. Resolve disputes.
        </p>
      </header>
      
      <div className="flex justify-center mb-6">
        <div className="bg-card border border-border/60 rounded-lg p-1 flex h-12">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-4 py-2 h-10 rounded-md transition-colors ${
              activeTab === 'proposals'
                ? 'bg-primary text-white'
                : 'hover:bg-background/80'
            }`}
          >
            Proposals
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 h-10 rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-primary text-white'
                : 'hover:bg-background/80'
            }`}
          >
            Mediation
          </button>
        </div>
      </div>
      
      <main className="w-full max-w-4xl mx-auto px-4">
        {activeTab === 'chat' ? (
          <ChatInterface proposals={[]} />
        ) : (
          <ProposalList />
        )}
      </main>
      
      <footer className="text-center text-sm text-foreground/60 py-6 border-t border-border/40 mt-8">
        <div className="flex items-center justify-center gap-2">
          <span>Powered by</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">GROQ LLM</span>
        </div>
      </footer>
    </div>
  );
}