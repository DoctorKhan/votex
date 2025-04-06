'use client';

import React, { useState, useEffect } from 'react';

type UIComplexityType = 'simple' | 'intermediate' | 'advanced';

const InterfaceSettings: React.FC = () => {
  const [uiComplexity, setUIComplexity] = useState<UIComplexityType>('intermediate');

  // Load setting from localStorage
  useEffect(() => {
    const savedUIComplexity = localStorage.getItem('uiComplexity') as UIComplexityType | null;
    if (savedUIComplexity && ['simple', 'intermediate', 'advanced'].includes(savedUIComplexity)) {
      setUIComplexity(savedUIComplexity);
    }
  }, []);

  // Save setting to localStorage and apply class
  useEffect(() => {
    localStorage.setItem('uiComplexity', uiComplexity);
    
    const body = document.body;
    body.classList.remove('ui-simple', 'ui-intermediate', 'ui-advanced');
    body.classList.add(`ui-${uiComplexity}`);
    
    // Dispatch an event so other components can react
    window.dispatchEvent(new CustomEvent('uiComplexityChange', {
      detail: { complexity: uiComplexity }
    }));
  }, [uiComplexity]);

  const complexityOptions = [
    { 
      value: 'simple' as UIComplexityType, 
      label: 'Simple', 
      description: 'Essential features only, streamlined interface.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M9 9h6" /> <path d="M9 15h6" />
        </svg>
      )
    },
    { 
      value: 'intermediate' as UIComplexityType, 
      label: 'Intermediate', 
      description: 'Balance of features and simplicity.',
      icon: (
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
           <rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M12 8v8" /> <path d="M8 12h8" />
         </svg>
      )
    },
    { 
      value: 'advanced' as UIComplexityType, 
      label: 'Advanced', 
      description: 'Full feature set with detailed controls.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /> <circle cx="12" cy="12" r="3" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Interface Complexity
        </label>
        <div className="space-y-3">
          {complexityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setUIComplexity(option.value)}
              className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                uiComplexity === option.value
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
              </div>
              {uiComplexity === option.value && (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary ml-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Adjust the level of detail and features shown in the interface.</p>
      </div>
    </div>
  );
};

export default InterfaceSettings;