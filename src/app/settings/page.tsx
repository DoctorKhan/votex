'use client';

import React, { useState } from 'react';
import Settings from '../../components/Settings';
import ConversationMonitorSettings from '../../components/ConversationMonitorSettings';
import dynamic from 'next/dynamic';

// Dynamically import the PersonaController component to avoid SSR issues
const PersonaController = dynamic(() => import('../../components/PersonaController'), {
  ssr: false,
  loading: () => <div className="p-4">Loading persona management...</div>
});

type SettingsTab = 'accessibility' | 'appearance' | 'personas' | 'persona-management';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('accessibility');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'accessibility'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('accessibility')}
            >
              Accessibility
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'appearance'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('appearance')}
            >
              Appearance
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'personas'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('personas')}
            >
              Personas
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'persona-management'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('persona-management')}
            >
              Persona Management
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'accessibility' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Accessibility Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure language, text size, and contrast settings to improve accessibility.
                </p>
                <div className="w-full max-w-md">
                  <Settings />
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Customize the look and feel of the application.
                </p>
                <div className="w-full max-w-md">
                  <Settings />
                </div>
              </div>
            )}
            
            {activeTab === 'personas' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Persona Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure settings for the conversation monitor and persona integration.
                </p>
                <ConversationMonitorSettings />
              </div>
            )}
            
            {activeTab === 'persona-management' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Persona Management</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Manage personas, control their activity levels, and trigger persona actions.
                </p>
                <PersonaController />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            These settings control the appearance, accessibility, and behavior of the application.
            Changes are saved automatically and will persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
}