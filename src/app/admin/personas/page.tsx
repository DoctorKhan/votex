import React from 'react';
import PersonaController from '../../../components/PersonaController';

export const metadata = {
  title: 'LLM Persona Management - Votex Admin',
  description: 'Manage and control LLM personas for the Votex platform',
};

export default function PersonaManagementPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        LLM Persona Management
      </h1>
      
      <div className="mb-6 text-gray-700 dark:text-gray-300">
        <p className="mb-4">
          This admin interface allows you to control the behavior of LLM-powered community personas 
          that can participate in the platform by submitting proposals, voting, and engaging in discussions.
        </p>
        <p>
          You can activate personas individually or all at once, adjust their activity frequency, 
          and manually trigger specific actions for testing and demonstration purposes.
        </p>
      </div>
      
      <PersonaController />
    </div>
  );
}