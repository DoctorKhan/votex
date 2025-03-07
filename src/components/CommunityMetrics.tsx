'use client';

import React, { useState } from 'react';

interface Metric {
  name: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description: string;
}

interface HistoricalEvent {
  date: string;
  title: string;
  description: string;
  impact?: string;
  category: 'governance' | 'participation' | 'technology' | 'milestone';
}

const CommunityMetrics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'history' | 'current'>('metrics');

  // Key community metrics
  const metrics: Metric[] = [
    {
      name: 'Active Community Members',
      value: 1253,
      change: '+12%',
      trend: 'up',
      description: 'Number of members who have participated in the last 30 days'
    },
    {
      name: 'Average Proposals per Week',
      value: 9.4,
      change: '+3.2%',
      trend: 'up',
      description: 'Average number of new proposals submitted weekly'
    },
    {
      name: 'Participation Rate',
      value: '67%',
      change: '+5%',
      trend: 'up',
      description: 'Percentage of eligible members who vote on proposals'
    },
    {
      name: 'Implementation Rate',
      value: '43%',
      change: '-2%',
      trend: 'down',
      description: 'Percentage of approved proposals that get implemented'
    },
    {
      name: 'Average Decision Time',
      value: '8.5 days',
      change: '-1.2 days',
      trend: 'up',
      description: 'Average time from proposal submission to final decision'
    },
    {
      name: 'Community Satisfaction',
      value: '4.2/5',
      change: '+0.3',
      trend: 'up',
      description: 'Based on quarterly community surveys'
    }
  ];

  // Historical community events
  const historyEvents: HistoricalEvent[] = [
    {
      date: 'January 2025',
      title: 'Community Governance Model Established',
      description: 'Implemented a decentralized governance framework with elected representatives and transparent decision-making processes.',
      impact: 'Increased transparency and trust in the decision-making process',
      category: 'governance'
    },
    {
      date: 'November 2024',
      title: 'Ranked Choice Voting Implemented',
      description: 'Transitioned from simple majority voting to ranked choice voting to better capture preference nuances in community decisions.',
      impact: 'More accurate representation of community preferences in voting outcomes',
      category: 'technology'
    },
    {
      date: 'September 2024',
      title: 'Community Milestone: 1,000 Active Members',
      description: 'Reached 1,000 active members participating regularly in community activities and governance.',
      impact: 'Signified growing reach and impact of the community',
      category: 'milestone'
    },
    {
      date: 'July 2024',
      title: 'Introduction of AI Assisted Proposal Analysis',
      description: 'Integrated AI tools to help analyze proposals, identify potential issues, and suggest improvements.',
      impact: 'Improved proposal quality and reduced review time by 32%',
      category: 'technology'
    },
    {
      date: 'May 2024',
      title: 'Accessibility Initiative Launched',
      description: 'Began comprehensive accessibility improvements to ensure platform usability for all community members regardless of disabilities.',
      impact: 'Increased participation from previously underrepresented groups',
      category: 'participation'
    },
    {
      date: 'March 2024',
      title: 'Community Forum Restructuring',
      description: 'Reorganized community forums with dedicated spaces for proposal discussions, implementation tracking, and general community topics.',
      impact: 'More organized discussions and improved proposal development process',
      category: 'governance'
    },
    {
      date: 'January 2024',
      title: 'Platform Launch',
      description: 'Initial launch of the community voting platform with basic proposal and voting functionality.',
      impact: 'Established the foundation for community-driven decision making',
      category: 'milestone'
    }
  ];

  // Current community state information
  const currentState = {
    activeChallenges: [
      {
        title: 'Improving Decision Speed',
        description: 'Finding ways to expedite the proposal review process without sacrificing quality of decisions'
      },
      {
        title: 'Scaling Governance',
        description: 'Adapting governance processes to work effectively as the community continues to grow'
      },
      {
        title: 'Implementation Tracking',
        description: 'Developing better systems to track and ensure implementation of approved proposals'
      }
    ],
    currentPriorities: [
      {
        title: 'Enhancing Mobile Experience',
        description: 'Improving the mobile interface to facilitate participation from all devices'
      },
      {
        title: 'Expanding Translation Support',
        description: 'Adding multi-language support to make the platform more accessible globally'
      },
      {
        title: 'Refining AI Assistance Tools',
        description: 'Improving AI tools to better support proposal development and analysis'
      }
    ],
    communityDemographics: {
      regions: [
        { name: 'North America', percentage: 42 },
        { name: 'Europe', percentage: 31 },
        { name: 'Asia', percentage: 18 },
        { name: 'Other', percentage: 9 }
      ],
      participationTrends: 'Growing engagement from younger members (18-25) and international participants over the past quarter'
    },
    successStories: [
      {
        title: 'Community-Led Website Redesign',
        description: 'Complete redesign of the community website through collaborative proposal development and implementation'
      },
      {
        title: 'Mentorship Program',
        description: 'Successful launch of peer mentorship program connecting experienced members with newcomers'
      }
    ]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive overview of community metrics, history, and current state</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'metrics'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Key Metrics
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              History
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('current')}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'current'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Current State
            </button>
          </li>
        </ul>
      </div>
      
      {/* Metrics Tab Content */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 shadow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{metric.name}</h3>
              <div className="flex items-end mb-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                {metric.change && (
                  <span className={`ml-2 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                    metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {metric.change}
                    {metric.trend === 'up' && ' ↑'}
                    {metric.trend === 'down' && ' ↓'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{metric.description}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="relative">
          {/* Timeline */}
          <div className="border-l-2 border-blue-500 dark:border-blue-400 ml-4 space-y-10 mb-6">
            {historyEvents.map((event, idx) => (
              <div key={idx} className="relative pl-8 pb-2">
                <div className="absolute -left-4 mt-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    event.category === 'governance' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' :
                    event.category === 'participation' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' :
                    event.category === 'technology' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' :
                    'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300'
                  }`}>
                    {event.category === 'governance' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {event.category === 'participation' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    {event.category === 'technology' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    )}
                    {event.category === 'milestone' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{event.date}</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-1">{event.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{event.description}</p>
                  {event.impact && (
                    <div className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                      Impact: {event.impact}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Current State Tab Content */}
      {activeTab === 'current' && (
        <div className="space-y-8">
          {/* Active Challenges */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Challenges</h3>
            <div className="space-y-4">
              {currentState.activeChallenges.map((challenge, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white">{challenge.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{challenge.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Current Priorities */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Priorities</h3>
            <div className="space-y-4">
              {currentState.currentPriorities.map((priority, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white">{priority.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{priority.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Community Demographics */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Community Demographics</h3>
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Geographic Distribution</h4>
              <div className="flex flex-wrap gap-2">
                {currentState.communityDemographics.regions.map((region, idx) => (
                  <div key={idx} className="flex-1 min-w-[120px] bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{region.percentage}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{region.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Participation Trends</h4>
              <p className="text-gray-600 dark:text-gray-300">{currentState.communityDemographics.participationTrends}</p>
            </div>
          </div>
          
          {/* Success Stories */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Success Stories</h3>
            <div className="space-y-4">
              {currentState.successStories.map((story, idx) => (
                <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white">{story.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{story.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>This data is updated monthly and provides context for community decisions and discussions.</p>
        <p className="mt-1">Last updated: March 1, 2025</p>
      </div>
    </div>
  );
};

export default CommunityMetrics;