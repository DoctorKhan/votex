'use client';

import React, { useState, useEffect } from 'react';

const PrivacySettings: React.FC = () => {
  const [useSimplexVoting, setUseSimplexVoting] = useState<boolean>(false);

  // Load setting from localStorage
  useEffect(() => {
    const savedUseSimplexVoting = localStorage.getItem('useSimplexVoting');
    if (savedUseSimplexVoting) {
      setUseSimplexVoting(savedUseSimplexVoting === 'true');
    }
  }, []);

  // Save setting to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('useSimplexVoting', useSimplexVoting.toString());
    
    // Dispatch an event for SimpleX voting preference change
    window.dispatchEvent(new CustomEvent('simplexVotingChange', {
      detail: { enabled: useSimplexVoting }
    }));
  }, [useSimplexVoting]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Privacy Features
        </label>
        
        {/* SimpleX Private Voting Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">SimpleX Private Voting</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enable end-to-end encrypted, anonymous voting using the SimpleX protocol.
            </div>
          </div>
          <div className="relative ml-4 inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="simplex-voting-toggle"
              checked={useSimplexVoting}
              onChange={(e) => setUseSimplexVoting(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary"></div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-lg">
          <div className="font-medium mb-1 flex items-center text-blue-700 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About SimpleX Private Voting
          </div>
          <p className="mb-1">When enabled, your votes are:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>End-to-end encrypted during transmission</li>
            <li>Not linked to your user identity</li>
            <li>Verifiable without revealing your identity</li>
            <li>Protected against server compromises</li>
          </ul>
          <p className="mt-2 text-xs italic opacity-80">This feature is experimental and may require additional setup.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;