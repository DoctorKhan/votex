'use client';

import React, { useState, useEffect } from 'react';

/**
 * Settings for the Conversation Monitor and Persona Integration
 */
interface ConversationMonitorSettings {
  voteThreshold: number;
  implementationProbability: number;
  monitoringInterval: number;
  enableDesignDocuments: boolean;
  enableTDD: boolean;
  enableAutoActivation: boolean;
}

/**
 * Default settings
 */
const defaultSettings: ConversationMonitorSettings = {
  voteThreshold: 5,
  implementationProbability: 0.3,
  monitoringInterval: 30,
  enableDesignDocuments: true,
  enableTDD: true,
  enableAutoActivation: false
};

/**
 * Component for configuring the Conversation Monitor and Persona Integration
 */
const ConversationMonitorSettings: React.FC = () => {
  const [settings, setSettings] = useState<ConversationMonitorSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('conversationMonitorSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Save to localStorage
      localStorage.setItem('conversationMonitorSettings', JSON.stringify(settings));
      
      // Call the API to update server-side settings
      const response = await fetch('/api/persona-monitor/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setSaveStatus('Settings saved successfully');
      
      // If auto-activation is enabled, activate Jamie
      if (settings.enableAutoActivation) {
        await activateJamie();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Activate Jamie Developer persona
  const activateJamie = async () => {
    try {
      const response = await fetch('/api/personas/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personaId: 'jamie-dev',
          active: true,
          frequency: 'medium'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to activate Jamie');
      }
      
      // Trigger the persona monitor integration
      const monitorResponse = await fetch('/api/persona-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intervalMinutes: settings.monitoringInterval
        })
      });
      
      if (!monitorResponse.ok) {
        throw new Error('Failed to trigger persona monitor');
      }
      
      setSaveStatus('Settings saved and Jamie activated');
    } catch (error) {
      console.error('Error activating Jamie:', error);
      setSaveStatus('Settings saved but failed to activate Jamie');
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
    setSaveStatus('Settings reset to defaults');
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading settings...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Conversation Monitor Settings</h2>
      
      {saveStatus && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          saveStatus.includes('Error') 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        }`}>
          {saveStatus}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Vote Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vote Threshold
          </label>
          <input
            type="number"
            name="voteThreshold"
            value={settings.voteThreshold}
            onChange={handleInputChange}
            min="1"
            max="100"
            className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Number of votes required for a proposal to be approved
          </p>
        </div>
        
        {/* Implementation Probability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Implementation Probability
          </label>
          <input
            type="number"
            name="implementationProbability"
            value={settings.implementationProbability}
            onChange={handleInputChange}
            min="0"
            max="1"
            step="0.1"
            className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Probability of implementing a design document in test mode (0-1)
          </p>
        </div>
        
        {/* Monitoring Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monitoring Interval (minutes)
          </label>
          <input
            type="number"
            name="monitoringInterval"
            value={settings.monitoringInterval}
            onChange={handleInputChange}
            min="5"
            max="1440"
            className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            How often Jamie should monitor conversations (in minutes)
          </p>
        </div>
        
        {/* Enable Design Documents */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="enableDesignDocuments"
            checked={settings.enableDesignDocuments}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Design Documents
          </label>
        </div>
        
        {/* Enable TDD */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="enableTDD"
            checked={settings.enableTDD}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Test-Driven Development
          </label>
        </div>
        
        {/* Enable Auto Activation */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="enableAutoActivation"
            checked={settings.enableAutoActivation}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Auto Activation of Jamie
          </label>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={resetSettings}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={activateJamie}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Activate Jamie Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationMonitorSettings;