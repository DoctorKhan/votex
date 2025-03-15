'use client';

import React, { useEffect, useState } from 'react';

const UIComplexityExample: React.FC = () => {
  const [uiComplexity, setUIComplexity] = useState<'simple' | 'intermediate' | 'advanced'>('intermediate');
  
  // Listen for UI complexity changes
  useEffect(() => {
    const handleUIComplexityChange = (event: CustomEvent) => {
      setUIComplexity(event.detail.complexity);
    };
    
    // Add event listener
    window.addEventListener('uiComplexityChange', handleUIComplexityChange as EventListener);
    
    // Get initial value from localStorage
    const savedUIComplexity = localStorage.getItem('uiComplexity') as 'simple' | 'intermediate' | 'advanced' | null;
    if (savedUIComplexity && ['simple', 'intermediate', 'advanced'].includes(savedUIComplexity)) {
      setUIComplexity(savedUIComplexity as 'simple' | 'intermediate' | 'advanced');
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('uiComplexityChange', handleUIComplexityChange as EventListener);
    };
  }, []);
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 mode-transition">
      <h2 className="text-lg font-semibold mb-4">UI Complexity Demo</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Current mode: <span className="font-medium">{uiComplexity.charAt(0).toUpperCase() + uiComplexity.slice(1)}</span>
        </p>
      </div>
      
      {/* Basic feature - visible in all modes */}
      <div className="p-3 mb-3 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="text-sm font-medium">Basic Feature</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">This feature is visible in all UI complexity modes</p>
        <button className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded">
          Simple Action
        </button>
      </div>
      
      {/* Intermediate feature - visible in intermediate and advanced modes */}
      <div className="p-3 mb-3 bg-gray-100 dark:bg-gray-700 rounded intermediate-feature">
        <h3 className="text-sm font-medium">Intermediate Feature</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">This feature is only visible in Intermediate and Advanced modes</p>
        <div className="mt-2 flex space-x-2">
          <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded">
            Action 1
          </button>
          <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded">
            Action 2
          </button>
        </div>
      </div>
      
      {/* Advanced feature - visible only in advanced mode */}
      <div className="p-3 mb-3 bg-gray-100 dark:bg-gray-700 rounded advanced-feature">
        <h3 className="text-sm font-medium">Advanced Feature</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">This feature is only visible in Advanced mode</p>
        <div className="mt-2">
          <div className="mb-2">
            <label className="block text-xs mb-1">Advanced Setting 1</label>
            <input type="range" className="w-full" min="0" max="100" />
          </div>
          <div className="mb-2">
            <label className="block text-xs mb-1">Advanced Setting 2</label>
            <select className="w-full text-xs p-1 border rounded">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
          <button className="px-3 py-1 text-xs bg-purple-500 text-white rounded">
            Advanced Action
          </button>
        </div>
      </div>
      
      {/* Form with different options based on complexity */}
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="text-sm font-medium">Form Example</h3>
        
        {/* Simple options - only visible in simple mode */}
        <div className="mt-2 simple-options" style={{ display: 'none' }}>
          <div className="mb-2">
            <label className="block text-xs mb-1">Name</label>
            <input type="text" className="w-full text-xs p-1 border rounded" placeholder="Enter name" />
          </div>
          <button className="px-3 py-1 text-xs bg-green-500 text-white rounded">
            Submit
          </button>
        </div>
        
        {/* Full options - visible in intermediate and advanced modes */}
        <div className="mt-2 full-options">
          <div className="mb-2">
            <label className="block text-xs mb-1">Full Name</label>
            <input type="text" className="w-full text-xs p-1 border rounded" placeholder="Enter full name" />
          </div>
          <div className="mb-2">
            <label className="block text-xs mb-1">Email</label>
            <input type="email" className="w-full text-xs p-1 border rounded" placeholder="Enter email" />
          </div>
          <div className="mb-2 form-advanced-options">
            <label className="block text-xs mb-1">Preferences</label>
            <div className="flex items-center">
              <input type="checkbox" id="pref1" className="mr-1" />
              <label htmlFor="pref1" className="text-xs">Option 1</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="pref2" className="mr-1" />
              <label htmlFor="pref2" className="text-xs">Option 2</label>
            </div>
          </div>
          <div className="flex justify-between">
            <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded">
              Cancel
            </button>
            <button className="px-3 py-1 text-xs bg-green-500 text-white rounded">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIComplexityExample;