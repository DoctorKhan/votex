'use client';

import React from 'react';
import UIComplexityExample from '../../components/UIComplexityExample';
import Settings from '../../components/Settings';

const UIComplexityDemoPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">UI Complexity Demo</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Change UI Mode:</span>
          <Settings />
        </div>
      </div>
      
      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This page demonstrates how the UI adapts to different complexity modes. 
          Use the settings menu in the top right to switch between Simple, Intermediate, and Advanced modes.
        </p>
        
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h2 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">How it works</h2>
          <ul className="list-disc pl-5 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <li><strong>Simple mode:</strong> Shows only essential features and simplified controls</li>
            <li><strong>Intermediate mode:</strong> Balances features and simplicity</li>
            <li><strong>Advanced mode:</strong> Shows all features and detailed configuration options</li>
          </ul>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIComplexityExample />
        
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4">Implementation Details</h2>
          
          <div className="space-y-3 text-sm">
            <p>
              The UI complexity system works by:
            </p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>CSS Classes:</strong> Elements are tagged with <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">.advanced-feature</code> or 
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">.intermediate-feature</code> classes
              </li>
              <li>
                <strong>Body Class:</strong> The body element gets <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">.ui-simple</code>, 
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">.ui-intermediate</code>, or 
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">.ui-advanced</code> class
              </li>
              <li>
                <strong>CSS Rules:</strong> Hide or show elements based on the body class and element class
              </li>
              <li>
                <strong>Event System:</strong> Components can listen for <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">uiComplexityChange</code> events
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-x-auto">
              <pre>{`.ui-simple .advanced-feature {
  display: none !important;
}

.ui-intermediate .advanced-feature {
  display: none !important;
}

.ui-simple .intermediate-feature {
  display: none !important;
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIComplexityDemoPage;