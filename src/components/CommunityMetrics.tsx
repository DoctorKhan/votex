'use client';

import React, { useState } from 'react';

// Interface for a data point with value and date
interface MetricDataPoint {
  value: number;
  date: string;
}

// Interface for a full metric with name, description, current value, and history
interface CommunityMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  unit: string;
  history: MetricDataPoint[];
  trend: 'up' | 'down' | 'stable';
}

// Dummy data for demonstration
const dummyMetrics: CommunityMetric[] = [
  {
    id: 'active-users',
    name: 'Active Users',
    description: 'Monthly active users on the platform',
    currentValue: 2850,
    unit: 'users',
    trend: 'up',
    history: [
      { value: 2300, date: '2025-02-01' },
      { value: 2450, date: '2025-02-15' },
      { value: 2600, date: '2025-03-01' },
      { value: 2850, date: '2025-03-15' }
    ]
  },
  {
    id: 'proposals',
    name: 'Proposals Created',
    description: 'Total proposals submitted by the community',
    currentValue: 124,
    unit: 'proposals',
    trend: 'up',
    history: [
      { value: 85, date: '2025-02-01' },
      { value: 97, date: '2025-02-15' },
      { value: 110, date: '2025-03-01' },
      { value: 124, date: '2025-03-15' }
    ]
  },
  {
    id: 'participation-rate',
    name: 'Voting Participation',
    description: 'Percentage of eligible users who participate in votes',
    currentValue: 68,
    unit: '%',
    trend: 'up',
    history: [
      { value: 52, date: '2025-02-01' },
      { value: 55, date: '2025-02-15' },
      { value: 61, date: '2025-03-01' },
      { value: 68, date: '2025-03-15' }
    ]
  },
  {
    id: 'threads',
    name: 'Discussion Threads',
    description: 'Total discussion threads created',
    currentValue: 286,
    unit: 'threads',
    trend: 'up',
    history: [
      { value: 215, date: '2025-02-01' },
      { value: 239, date: '2025-02-15' },
      { value: 260, date: '2025-03-01' },
      { value: 286, date: '2025-03-15' }
    ]
  },
  {
    id: 'consensus',
    name: 'Consensus Rate',
    description: 'Percentage of proposals that achieve consensus',
    currentValue: 72,
    unit: '%',
    trend: 'down',
    history: [
      { value: 78, date: '2025-02-01' },
      { value: 76, date: '2025-02-15' },
      { value: 74, date: '2025-03-01' },
      { value: 72, date: '2025-03-15' }
    ]
  },
  {
    id: 'implementation',
    name: 'Implementation Rate',
    description: 'Percentage of approved proposals that get implemented',
    currentValue: 85,
    unit: '%',
    trend: 'stable',
    history: [
      { value: 84, date: '2025-02-01' },
      { value: 86, date: '2025-02-15' },
      { value: 85, date: '2025-03-01' },
      { value: 85, date: '2025-03-15' }
    ]
  }
];

// Historical events for community context
interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  category: 'governance' | 'platform' | 'community' | 'technical';
  impact: 'high' | 'medium' | 'low';
}

const communityHistory: CommunityEvent[] = [
  {
    id: 'platform-launch',
    title: 'Platform Launch',
    date: '2024-09-15',
    description: 'Initial launch of the community voting platform with basic features.',
    category: 'platform',
    impact: 'high'
  },
  {
    id: 'governance-model',
    title: 'Governance Model Approved',
    date: '2024-10-22',
    description: 'Community approved the decentralized governance model after three rounds of voting.',
    category: 'governance',
    impact: 'high'
  },
  {
    id: 'first-proposal',
    title: 'First Community Proposal Implemented',
    date: '2024-11-05',
    description: 'The first community-driven proposal for improving notification systems was successfully implemented.',
    category: 'community',
    impact: 'medium'
  },
  {
    id: 'forum-redesign',
    title: 'Discussion Forum Redesign',
    date: '2024-12-15',
    description: 'Major UI/UX improvements to the discussion forum to enhance accessibility and engagement.',
    category: 'platform',
    impact: 'medium'
  },
  {
    id: 'ranked-choice',
    title: 'Ranked Choice Voting Implemented',
    date: '2025-01-10',
    description: 'Switched from simple majority voting to ranked choice voting based on community feedback.',
    category: 'technical',
    impact: 'high'
  },
  {
    id: 'milestone-1000',
    title: 'Milestone: 1,000 Active Users',
    date: '2025-01-28',
    description: 'The platform reached 1,000 active monthly users for the first time.',
    category: 'community',
    impact: 'medium'
  },
  {
    id: 'api-release',
    title: 'Public API Released',
    date: '2025-02-15',
    description: 'Released a public API allowing third-party integrations with the platform.',
    category: 'technical',
    impact: 'medium'
  }
];

const CommunityMetrics: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'metrics' | 'history'>('metrics');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') {
      return <span className="text-green-600 dark:text-green-400">↑</span>;
    } else if (trend === 'down') {
      return <span className="text-red-600 dark:text-red-400">↓</span>;
    } else {
      return <span className="text-gray-600 dark:text-gray-400">→</span>;
    }
  };
  
  const renderMetricsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dummyMetrics.map(metric => (
        <div 
          key={metric.id}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedMetric(metric.id)}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{metric.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{metric.description}</p>
          
          <div className="flex items-baseline mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metric.currentValue}{metric.unit}</span>
            <span className="ml-2 text-xl">{renderTrendIcon(metric.trend)}</span>
          </div>
          
          {selectedMetric === metric.id && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Historical Data</h4>
              <div className="space-y-2">
                {metric.history.map((dataPoint, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{new Date(dataPoint.date).toLocaleDateString()}</span>
                    <span className="text-xs font-medium">{dataPoint.value}{metric.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  const renderHistoryTimeline = () => (
    <div className="max-w-4xl mx-auto">
      <div className="border-l-2 border-blue-500 ml-6">
        {communityHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(event => (
          <div key={event.id} className="mb-10 ml-6 relative">
            <div className={`absolute -left-8 h-6 w-6 rounded-full flex items-center justify-center 
              ${event.impact === 'high' 
                ? 'bg-blue-600 dark:bg-blue-500' 
                : event.impact === 'medium' 
                  ? 'bg-blue-400 dark:bg-blue-400' 
                  : 'bg-blue-300 dark:bg-blue-300'}`}
            >
              <span className="text-white text-xs">•</span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <div className="flex flex-wrap items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{event.title}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-2">{event.description}</p>
              
              <div className="flex items-center mt-2">
                <span className={`px-2 py-1 text-xs rounded-full
                  ${event.category === 'governance' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : 
                    event.category === 'platform' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                    event.category === 'community' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'}`}
                >
                  {event.category}
                </span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full
                  ${event.impact === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 
                    event.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}
                >
                  {event.impact} impact
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Community Metrics & History</h2>
        <p className="text-gray-600 dark:text-gray-300">Track the growth and activity of our community over time.</p>
      </div>
      
      <div className="mb-6 flex space-x-4">
        <button 
          onClick={() => setSelectedView('metrics')}
          className={`px-4 py-2 rounded-md ${
            selectedView === 'metrics' 
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
          }`}
        >
          Current Metrics
        </button>
        <button 
          onClick={() => setSelectedView('history')}
          className={`px-4 py-2 rounded-md ${
            selectedView === 'history' 
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
          }`}
        >
          Historical Timeline
        </button>
      </div>
      
      {selectedView === 'metrics' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Current Community Metrics</h3>
            {selectedMetric && (
              <button 
                onClick={() => setSelectedMetric(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All Metrics
              </button>
            )}
          </div>
          {renderMetricsGrid()}
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Community Timeline</h3>
          {renderHistoryTimeline()}
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Information for Personas</h3>
        <p className="text-gray-600 dark:text-gray-300">
          This data is available to all community personas to better understand the current state and history of the community.
          Use this information to inform your proposals, discussions, and voting decisions.
        </p>
      </div>
    </div>
  );
};

export default CommunityMetrics;