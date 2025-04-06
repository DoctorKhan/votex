'use client';

import React, { useState } from 'react';
// Removed import for old Settings component
import ConversationMonitorSettings from '../../components/ConversationMonitorSettings';
import dynamic from 'next/dynamic';
import AccessibilitySettings from '../../components/AccessibilitySettings';
import AppearanceSettings from '../../components/AppearanceSettings';
import InterfaceSettings from '../../components/InterfaceSettings';
import PrivacySettings from '../../components/PrivacySettings';

// Dynamically import the PersonaController component to avoid SSR issues
const PersonaController = dynamic(() => import('../../components/PersonaController'), {
  ssr: false,
  loading: () => <div className="p-4">Loading persona management...</div>
});

type SettingsTab = 'accessibility' | 'appearance' | 'interface' | 'privacy' | 'personas' | 'persona-management';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('accessibility');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          {/* Tabs - Added Interface and Privacy */}
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {[
              { key: 'accessibility', label: 'Accessibility' },
              { key: 'appearance', label: 'Appearance' },
              { key: 'interface', label: 'Interface' },
              { key: 'privacy', label: 'Privacy' },
              { key: 'personas', label: 'Personas' },
              { key: 'persona-management', label: 'Persona Management' },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-3 font-medium text-sm transition-colors duration-150 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveTab(tab.key as SettingsTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'accessibility' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Accessibility Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure language, text size, and contrast settings to improve accessibility.
                </p>
                {/* Render the dedicated AccessibilitySettings component */}
                <div className="w-full max-w-lg"> {/* Adjusted max-width */}
                  <AccessibilitySettings />
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Customize the look and feel of the application.
                </p>
                 {/* Render the dedicated AppearanceSettings component */}
                <div className="w-full max-w-lg"> {/* Adjusted max-width */}
                  <AppearanceSettings />
                </div>
              </div>
            )}
            {/* Interface Tab */}
            {activeTab === 'interface' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Interface Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Adjust the complexity and layout of the user interface.
                </p>
                <div className="w-full max-w-lg"> {/* Adjusted max-width */}
                   <InterfaceSettings />
                </div>
              </div>
            )}

            {/* Privacy Tab */}
             {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Control privacy-related features like anonymous voting.
                </p>
                 <div className="w-full max-w-lg"> {/* Adjusted max-width */}
                   <PrivacySettings />
                 </div>
              </div>
            )}

            {/* Personas Tab */}
            {activeTab === 'personas' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Persona Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure settings for the conversation monitor and persona integration.
                </p>
                {/* Keep ConversationMonitorSettings here */}
                <ConversationMonitorSettings />
              </div>
            )}
            
            {/* Persona Management Tab */}
            {activeTab === 'persona-management' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Persona Management</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Manage personas, control their activity levels, and trigger persona actions.
                </p>
                 {/* Keep PersonaController here */}
                <PersonaController />
              </div>
            )}
            {/* Removed extra closing parenthesis and brace */}
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