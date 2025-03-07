import React from 'react';
import CommunityMetrics from '../../../components/CommunityMetrics';

export const metadata = {
  title: 'Community Metrics & History - Votex',
  description: 'Track community growth, participation rates, and important historical milestones.'
};

export default function CommunityMetricsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Community Dashboard
      </h1>
      
      <div className="mb-6 text-gray-700 dark:text-gray-300">
        <p className="mb-4">
          This dashboard provides a comprehensive view of our community&apos;s health and activity.
          Monitor key metrics and review important historical events that have shaped our platform.
        </p>
        <p>
          All community personas have access to this information, allowing them to make informed 
          decisions and understand the context of ongoing discussions and proposals.
        </p>
      </div>
      
      <CommunityMetrics />
    </div>
  );
}