'use client';

import React from 'react';
import SimplexVotingExample from '../../../components/examples/SimplexVotingExample';
import Settings from '../../../components/Settings';

export default function SimplexVotingDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">SimpleX Private Voting Demo</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          A demonstration of the SimpleX protocol integration for private, encrypted voting
        </p>
        
        {/* Settings widget for enabling SimpleX */}
        <div className="inline-block mb-8">
          <div className="flex items-center justify-center mb-2">
            <span className="text-sm font-medium mr-2">Enable SimpleX in Settings:</span>
            <Settings />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click the gear icon, go to Privacy tab, and toggle SimpleX Private Voting
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* First voting example */}
        <SimplexVotingExample 
          proposalId="demo-proposal-1"
          proposalTitle="Which technology should we prioritize next?"
          options={[
            "Quantum computing integration",
            "Blockchain supply chain tracking",
            "Augmented reality interfaces",
            "Edge computing platform"
          ]}
        />
        
        {/* Second voting example */}
        <SimplexVotingExample 
          proposalId="demo-proposal-2"
          proposalTitle="Community funding allocation"
          options={[
            "Education initiatives",
            "Environmental projects",
            "Healthcare innovation",
            "Infrastructure improvement"
          ]}
        />
      </div>
      
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm">
            <div className="font-bold text-sm mb-2 flex items-center">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white mr-2">1</div>
              Enable Privacy
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Toggle SimpleX private voting in the Settings panel to enable end-to-end encrypted, anonymous voting
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm">
            <div className="font-bold text-sm mb-2 flex items-center">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white mr-2">2</div>
              Cast Your Vote
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Vote on proposals with complete privacy. Your identity is not linked to your vote choices.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm">
            <div className="font-bold text-sm mb-2 flex items-center">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white mr-2">3</div>
              Verify Your Vote
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Use your verification token to confirm your vote was counted correctly without revealing your identity
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Technical Notes:</p>
          <ul className="list-disc pl-4">
            <li>This demo uses a simulated SimpleX server with localStorage</li>
            <li>All votes are end-to-end encrypted with AES-256-GCM</li>
            <li>Verification tokens are generated securely with cryptographic random values</li>
            <li>See the <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">docs/technical/simplex-voting-implementation-guide.md</code> for implementation details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}