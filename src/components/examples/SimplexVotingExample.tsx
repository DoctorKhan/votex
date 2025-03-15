'use client';

import React, { useState } from 'react';
import { useSimplexVoting } from '../../hooks/useSimplexVoting';

interface SimplexVotingExampleProps {
  proposalId: string;
  proposalTitle: string;
  options: string[];
}

/**
 * Example component demonstrating SimpleX private voting
 */
export const SimplexVotingExample: React.FC<SimplexVotingExampleProps> = ({ 
  proposalId, 
  proposalTitle,
  options 
}) => {
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [inputToken, setInputToken] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  // Use the SimpleX voting hook
  const {
    isSimplexEnabled,
    isLoading,
    castSimplexVote,
    verifyVote,
    verificationToken,
    error
  } = useSimplexVoting({ proposalId });
  
  // Handle vote submission
  const handleVoteSubmit = async () => {
    if (selectedOption === -1) {
      alert('Please select an option to vote');
      return;
    }
    
    // Cast the vote using SimpleX
    const result = await castSimplexVote(selectedOption);
    
    if (result.success) {
      alert(`Vote cast successfully! Your verification token is:\n${result.verificationToken}\n\nPlease save this token to verify your vote later.`);
    }
  };
  
  // Handle vote verification
  const handleVerifyVote = async () => {
    if (!inputToken.trim()) {
      alert('Please enter a verification token');
      return;
    }
    
    const isVerified = await verifyVote(inputToken.trim());
    setVerificationResult(isVerified);
  };
  
  return (
    <div className="border rounded-lg p-6 max-w-md mx-auto bg-white dark:bg-gray-800 shadow-md">
      <h2 className="text-xl font-bold mb-4">{proposalTitle}</h2>
      
      {/* SimpleX Status Indicator */}
      <div className="mb-4 flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isSimplexEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <span className="text-sm font-medium">
          {isSimplexEnabled ? 'Private Voting Enabled' : 'Standard Voting'}
        </span>
        
        {isSimplexEnabled && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-auto text-xs text-blue-500 hover:underline"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>
      
      {/* SimpleX Details */}
      {isSimplexEnabled && showDetails && (
        <div className="mb-4 text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
          <p className="font-medium mb-1">How Private Voting Works:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Your vote is end-to-end encrypted</li>
            <li>Your identity is not linked to your vote</li>
            <li>You&apos;ll receive a verification token after voting</li>
            <li>Use this token later to verify your vote was counted</li>
          </ul>
        </div>
      )}
      
      {/* Voting Options */}
      <div className="space-y-3 mb-6">
        <p className="font-medium">Select an option:</p>
        {options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`option-${index}`}
              name="vote-option"
              checked={selectedOption === index}
              onChange={() => setSelectedOption(index)}
              disabled={isLoading || !!verificationToken}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <label htmlFor={`option-${index}`} className="ml-2 text-sm">
              {option}
            </label>
          </div>
        ))}
      </div>
      
      {/* Vote Button */}
      <button
        onClick={handleVoteSubmit}
        disabled={isLoading || selectedOption === -1 || !!verificationToken}
        className="w-full py-2 mb-4 bg-primary hover:bg-primary/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Casting Vote...' : verificationToken ? 'Vote Cast' : 'Cast Vote'}
      </button>
      
      {/* Display Verification Token */}
      {verificationToken && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded">
          <p className="text-xs font-medium mb-1">Your Verification Token:</p>
          <div className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 break-all text-xs font-mono">
            {verificationToken}
          </div>
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            Save this token to verify your vote later
          </p>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      
      {/* Verification Section */}
      <div className="mt-8 pt-4 border-t">
        <h3 className="text-sm font-bold mb-2">Verify Your Vote</h3>
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Enter verification token"
            className="flex-1 p-2 text-xs border rounded mr-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
          <button
            onClick={handleVerifyVote}
            disabled={isLoading || !inputToken.trim()}
            className="px-3 py-2 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Verify
          </button>
        </div>
        
        {/* Verification Result */}
        {verificationResult !== null && (
          <div className={`p-2 text-xs rounded mt-2 ${
            verificationResult 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {verificationResult 
              ? 'Vote verified! Your vote has been counted.' 
              : 'Verification failed. Token may be invalid or vote not found.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplexVotingExample;