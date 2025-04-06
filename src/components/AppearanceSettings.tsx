'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';

const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setTheme('light')}
            aria-label="Set light theme"
            className={`flex-1 flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              theme === 'light'
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="w-16 h-10 bg-white border border-gray-300 rounded-md mb-2 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-yellow-500">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </div>
            <span className="text-sm font-medium">Light</span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            aria-label="Set dark theme"
            className={`flex-1 flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              theme === 'dark'
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="w-16 h-10 bg-gray-800 border border-gray-600 rounded-md mb-2 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-400">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Dark</span>
          </button>
        </div>
         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Choose the overall color scheme for the application.</p>
      </div>
    </div>
  );
};

export default AppearanceSettings;