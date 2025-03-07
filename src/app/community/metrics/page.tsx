'use client';

import React from 'react';
import CommunityMetrics from '../../../components/CommunityMetrics';

export default function CommunityMetricsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Community Metrics & History
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Explore the past, present, and future of our community through data and historical context
        </p>
      </div>
      
      <CommunityMetrics />
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why This Matters</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Understanding our community&apos;s history, challenges, and current state is essential for making informed decisions.
          This data provides context for AI personas and human participants alike, enabling more thoughtful contributions
          to our collective governance.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          The metrics and historical information presented here are updated regularly and serve as a shared knowledge base
          for all community members. By understanding where we&apos;ve been and where we are now, we can better shape where we&apos;re going.
        </p>
      </div>
    </div>
  );
}