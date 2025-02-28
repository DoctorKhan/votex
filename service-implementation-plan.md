# Service Implementation Plan for Votex

This document outlines the implementation plan for the services required to make the tests in the TDD Test Plan pass. It provides a structured approach to developing the core functionality of the Votex application.

## 1. Proposal Service

The Proposal Service will handle all operations related to creating, retrieving, updating, and managing proposals.

### Implementation Steps:

1. Create a `proposalService.ts` file in the `src/lib` directory
2. Implement the following functions:

```typescript
// src/lib/proposalService.ts

import { db } from './db';
import { id as generateId } from '@instantdb/react';
import { ProposalEntity, RevisionEntity } from './db';

/**
 * Creates a new proposal
 * @param title The proposal title
 * @param description The proposal description
 * @returns The created proposal object
 */
export async function createProposal(title: string, description: string) {
  // Validate inputs
  if (!title.trim()) {
    throw new Error('Title cannot be empty');
  }
  
  if (!description.trim()) {
    throw new Error('Description cannot be empty');
  }
  
  try {
    const newId = generateId();
    
    // Create proposal in database
    await db.transact(
      db.tx.proposals[newId].update({
        title,
        description,
        votes: 0,
        smartCreated: false,
        intelligentVoted: false,
        createdAt: Date.now()
      })
    );
    
    // Return the created proposal
    return {
      id: newId,
      title,
      description,
      votes: 0,
      smartCreated: false,
      intelligentVoted: false,
      revisions: []
    };
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw new Error('Failed to create proposal');
  }
}

/**
 * Retrieves all proposals
 * @returns Array of proposal objects
 */
export async function getProposals() {
  try {
    const { data, error, isLoading } = db.useQuery({
      proposals: {},
      revisions: {}
    });
    
    if (isLoading) {
      return [];
    }
    
    if (error) {
      throw error;
    }
    
    if (!data?.proposals) {
      return [];
    }
    
    // Convert InstantDB data to our Proposal format
    return Object.entries(data.proposals).map(([id, proposal]) => {
      // Find revisions for this proposal
      const proposalRevisions = data.revisions
        ? Object.values(data.revisions)
            .filter(rev => rev.proposalId === id)
            .map(rev => ({
              id: parseInt(rev.id.split('-')[1] || '0'),
              description: rev.description,
              timestamp: rev.timestamp
            }))
        : [];
        
      return {
        id,
        title: proposal.title,
        description: proposal.description,
        votes: proposal.votes || 0,
        smartCreated: proposal.smartCreated || false,
        intelligentVoted: proposal.intelligentVoted || false,
        smartFeedback: proposal.smartFeedback,
        revisions: proposalRevisions
      };
    });
  } catch (error) {
    console.error('Error retrieving proposals:', error);
    throw new Error('Failed to retrieve proposals');
  }
}

/**
 * Retrieves a specific proposal by ID
 * @param id The proposal ID
 * @returns The proposal object or null if not found
 */
export async function getProposalById(id: string) {
  try {
    const { data, error, isLoading } = db.useQuery({
      proposals: {
        [id]: {}
      },
      revisions: {}
    });
    
    if (isLoading) {
      return null;
    }
    
    if (error) {
      throw error;
    }
    
    if (!data?.proposals || !data.proposals[id]) {
      return null;
    }
    
    // Find revisions for this proposal
    const proposalRevisions = data.revisions
      ? Object.values(data.revisions)
          .filter(rev => rev.proposalId === id)
          .map(rev => ({
            id: parseInt(rev.id.split('-')[1] || '0'),
            description: rev.description,
            timestamp: rev.timestamp
          }))
      : [];
    
    return {
      id,
      title: data.proposals[id].title,
      description: data.proposals[id].description,
      votes: data.proposals[id].votes || 0,
      smartCreated: data.proposals[id].smartCreated || false,
      intelligentVoted: data.proposals[id].intelligentVoted || false,
      smartFeedback: data.proposals[id].smartFeedback,
      revisions: proposalRevisions
    };
  } catch (error) {
    console.error(`Error retrieving proposal ${id}:`, error);
    throw new Error('Failed to retrieve proposal');
  }
}

/**
 * Adds a revision to an existing proposal
 * @param proposalId The ID of the proposal to revise
 * @param revisionText The text of the revision
 * @returns The created revision object
 */
export async function addRevision(proposalId: string, revisionText: string) {
  if (!revisionText.trim()) {
    throw new Error('Revision text cannot be empty');
  }
  
  try {
    const revisionId = generateId();
    const timestamp = new Date().toISOString();
    
    await db.transact(
      db.tx.revisions[revisionId].update({
        proposalId,
        description: revisionText,
        timestamp
      })
    );
    
    return {
      id: revisionId,
      proposalId,
      description: revisionText,
      timestamp
    };
  } catch (error) {
    console.error('Error adding revision:', error);
    throw new Error('Failed to add revision');
  }
}

/**
 * Retrieves all revisions for a specific proposal
 * @param proposalId The ID of the proposal
 * @returns Array of revision objects
 */
export async function getRevisions(proposalId: string) {
  try {
    const { data, error, isLoading } = db.useQuery({
      revisions: {}
    });
    
    if (isLoading) {
      return [];
    }
    
    if (error) {
      throw error;
    }
    
    if (!data?.revisions) {
      return [];
    }
    
    return Object.entries(data.revisions)
      .filter(([_, revision]) => revision.proposalId === proposalId)
      .map(([id, revision]) => ({
        id,
        proposalId: revision.proposalId,
        description: revision.description,
        timestamp: revision.timestamp
      }));
  } catch (error) {
    console.error(`Error retrieving revisions for proposal ${proposalId}:`, error);
    throw new Error('Failed to retrieve revisions');
  }
}
```

## 2. Voting Service

The Voting Service will handle all operations related to voting on proposals, including vote validation and vote status.

### Implementation Steps:

1. Create a `votingService.ts` file in the `src/lib` directory
2. Implement the following functions:

```typescript
// src/lib/votingService.ts

import { db } from './db';
import { id as generateId } from '@instantdb/react';
import { validateVote } from './securityService';
import { logAction } from './loggingService';

/**
 * Records a vote for a proposal
 * @param proposalId The ID of the proposal to vote for
 * @param userId The ID of the user casting the vote
 * @returns Object with success status and vote ID
 */
export async function voteForProposal(proposalId: string, userId: string) {
  try {
    // Check if user has already voted
    const hasVoted = await hasUserVoted(userId);
    if (hasVoted) {
      throw new Error('User has already voted');
    }
    
    // Create vote object
    const voteData = {
      userId,
      proposalId,
      timestamp: Date.now()
    };
    
    // Validate the vote
    const validation = validateVote(voteData);
    if (!validation.valid) {
      throw new Error(`Invalid vote: ${validation.reason}`);
    }
    
    // Get the proposal to update its vote count
    const { data, error } = db.useQuery({
      proposals: {
        [proposalId]: {}
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (!data?.proposals || !data.proposals[proposalId]) {
      throw new Error('Proposal not found');
    }
    
    const proposal = data.proposals[proposalId];
    
    // Create a vote record
    const voteId = generateId();
    
    await db.transact([
      db.tx.votes[voteId].update({
        userId,
        proposalId,
        timestamp: Date.now()
      }),
      // Update the proposal's vote count
      db.tx.proposals[proposalId].update({
        votes: (proposal.votes || 0) + 1
      })
    ]);
    
    // Log the vote action
    await logAction({
      type: 'VOTE',
      userId,
      proposalId,
      timestamp: Date.now()
    });
    
    return {
      success: true,
      voteId
    };
  } catch (error) {
    console.error('Error recording vote:', error);
    throw error;
  }
}

/**
 * Checks if a user has already voted
 * @param userId The ID of the user
 * @returns Boolean indicating if the user has voted
 */
export async function hasUserVoted(userId: string) {
  try {
    const { data, error, isLoading } = db.useQuery({
      votes: {}
    });
    
    if (isLoading) {
      return false;
    }
    
    if (error) {
      throw error;
    }
    
    if (!data?.votes) {
      return false;
    }
    
    return Object.values(data.votes).some(vote => vote.userId === userId);
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    throw new Error('Failed to check voting status');
  }
}

/**
 * Gets the proposal ID that a user voted for
 * @param userId The ID of the user
 * @returns The proposal ID or null if the user hasn't voted
 */
export async function getUserVotedProposalId(userId: string) {
  try {
    const { data, error, isLoading } = db.useQuery({
      votes: {}
    });
    
    if (isLoading) {
      return null;
    }
    
    if (error) {
      throw error;
    }
    
    if (!data?.votes) {
      return null;
    }
    
    const userVote = Object.values(data.votes).find(vote => vote.userId === userId);
    return userVote ? userVote.proposalId : null;
  } catch (error) {
    console.error('Error getting user voted proposal:', error);
    throw new Error('Failed to get user vote');
  }
}

/**
 * Resets all votes
 * @returns Object with success status and number of votes reset
 */
export async function resetVotes() {
  try {
    const { data, error, isLoading } = db.useQuery({
      votes: {},
      proposals: {}
    });
    
    if (isLoading) {
      return { success: true, votesReset: 0 };
    }
    
    if (error) {
      throw error;
    }
    
    if (!data?.votes || !data?.proposals) {
      return { success: true, votesReset: 0 };
    }
    
    // Delete all votes
    const deleteVoteTxs = Object.keys(data.votes).map(voteId =>
      db.tx.votes[voteId].delete()
    );
    
    // Reset vote counts for all proposals
    const resetProposalVotesTxs = Object.keys(data.proposals).map(proposalId =>
      db.tx.proposals[proposalId].update({ votes: 0, intelligentVoted: false })
    );
    
    await db.transact([...deleteVoteTxs, ...resetProposalVotesTxs]);
    
    // Log the reset action
    await logAction({
      type: 'RESET_VOTES',
      timestamp: Date.now()
    });
    
    return {
      success: true,
      votesReset: Object.keys(data.votes).length
    };
  } catch (error) {
    console.error('Error resetting votes:', error);
    throw new Error('Failed to reset votes');
  }
}
```

## 3. Intelligent Service

The Intelligent Service will handle all interactions with the GROQ API for smart features.

### Implementation Steps:

1. Create an `intelligentService.ts` file in the `src/lib` directory
2. Implement the following functions:

```typescript
// src/lib/intelligentService.ts

import fetch from 'node-fetch';
import { logAction } from './loggingService';

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generates a smart proposal based on existing proposals
 * @param existingProposals Array of existing proposal strings
 * @returns Object with title and description
 */
export async function generateSmartProposal(existingProposals: string[]) {
  try {
    // Create a prompt that includes existing proposals to avoid duplication
    const existingProposalsText = existingProposals.length > 0 
      ? `Here are some existing proposals:\n${existingProposals.join('\n')}\n\nPlease generate a different proposal.` 
      : 'Please generate a new community proposal.';
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an assistant that generates thoughtful community improvement proposals. 
            Your proposals should be realistic, specific, and focused on improving community well-being, 
            infrastructure, education, environment, or social cohesion.`
          },
          {
            role: 'user',
            content: `Please generate a new community proposal with a title and detailed description.
            
            ${existingProposalsText}
            
            Format your response exactly like this:
            Title: [Your proposal title]
            Description: [Your detailed proposal description of 2-3 sentences]
            
            Make the proposal specific, actionable, and beneficial to the community.`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse the response to extract title and description
    const titleMatch = content.match(/Title:\s*(.*?)(?:\n|$)/);
    const descriptionMatch = content.match(/Description:\s*([\s\S]*?)(?:\n\n|$)/);
    
    const title = titleMatch ? titleMatch[1].trim() : 'Smart-Generated Community Proposal';
    const description = descriptionMatch 
      ? descriptionMatch[1].trim() 
      : 'A proposal to improve the community through collaborative efforts and innovative solutions.';
    
    // Log the smart proposal generation
    await logAction({
      type: 'SMART_PROPOSAL_GENERATION',
      title,
      timestamp: Date.now()
    });
    
    return { title, description };
  } catch (error) {
    console.error('Error generating smart proposal:', error);
    // Fallback to a default proposal if the API call fails
    return { 
      title: 'Community Improvement Initiative', 
      description: 'A proposal to enhance community spaces and services through collaborative planning and implementation of targeted improvements based on resident feedback.'
    };
  }
}

/**
 * Analyzes proposals and decides which ones to vote for
 * @param proposals Array of proposal objects
 * @returns Array of proposal IDs to vote for
 */
export async function analyzeAndVote(proposals) {
  try {
    if (proposals.length === 0) return [];

    // Format proposals for the prompt
    const proposalsText = proposals
      .map((p, index) => `Proposal ${index + 1}: ${p.title}\nDescription: ${p.description}`)
      .join('\n\n');

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an assistant that evaluates community proposals and votes for those that would 
            have the most positive impact. You should consider factors like feasibility, community benefit, 
            sustainability, inclusivity, and cost-effectiveness. You should vote for 1-3 proposals maximum.`
          },
          {
            role: 'user',
            content: `Please evaluate the following community proposals and decide which ones to vote for:

${proposalsText}

Analyze each proposal carefully and select 1-3 proposals that you believe would have the most positive impact 
on the community. Consider factors like feasibility, community benefit, sustainability, inclusivity, and cost-effectiveness.

Format your response exactly like this:
VOTE: [Proposal number(s) separated by commas if multiple]
REASONING: [Brief explanation of why you selected these proposals]

For example:
VOTE: 1, 3
REASONING: Proposals 1 and 3 offer the most comprehensive and sustainable solutions...`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse the response to extract voted proposal numbers
    const voteMatch = content.match(/VOTE:\s*(.*?)(?:\n|$)/);
    
    if (!voteMatch) {
      // If no clear vote pattern is found, default to a simple algorithm
      return [proposals[0].id]; // Vote for the first proposal as fallback
    }
    
    const voteString = voteMatch[1].trim();
    const voteNumbers = voteString.split(/\s*,\s*/)
      .map(v => v.trim())
      .filter(v => /^\d+$/.test(v))
      .map(v => parseInt(v, 10));
    
    // Map the proposal numbers (1-based) to proposal IDs (from the actual data)
    const votedIds = voteNumbers
      .filter(num => num > 0 && num <= proposals.length)
      .map(num => proposals[num - 1].id);
    
    // Log the intelligent voting
    await logAction({
      type: 'INTELLIGENT_VOTE',
      proposalIds: votedIds,
      timestamp: Date.now()
    });
    
    return votedIds;
  } catch (error) {
    console.error('Error analyzing proposals for voting:', error);
    // Fallback to a simple algorithm if the API call fails
    // Vote for the proposal with the fewest votes to balance things out
    const sortedByVotes = [...proposals].sort((a, b) => a.votes - b.votes);
    return sortedByVotes.length > 0 ? [sortedByVotes[0].id] : [];
  }
}

/**
 * Generates an analysis of a proposal
 * @param title The proposal title
 * @param description The proposal description
 * @returns Analysis object with metrics and recommendations
 */
export async function generateProposalAnalysis(title, description) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an assistant that specializes in analyzing community proposals. 
            You will be given a proposal title and description, and you need to analyze it in terms of:
            1. Feasibility (how realistic and achievable it is)
            2. Impact (potential positive effects on the community)
            3. Cost (relative resource requirements)
            4. Timeframe (how long it might take to implement)
            5. Risks (potential challenges or negative outcomes)
            6. Benefits (specific positive outcomes)
            7. Recommendations (suggestions for improvement or implementation)
            
            For feasibility, impact, cost, and timeframe, provide a score between 0 and 1 (where higher means more feasible, 
            higher impact, higher cost, or longer timeframe).
            
            For risks and benefits, provide 3-5 bullet points each.
            
            For recommendations, provide a concise paragraph with actionable advice.`
          },
          {
            role: 'user',
            content: `Please analyze this community proposal:
            
            Title: ${title}
            Description: ${description}
            
            Format your response as a JSON object with the following structure:
            {
              "feasibility": number between 0-1,
              "impact": number between 0-1,
              "cost": number between 0-1,
              "timeframe": number between 0-1,
              "risks": ["risk1", "risk2", "risk3"],
              "benefits": ["benefit1", "benefit2", "benefit3"],
              "recommendations": "Your recommendations here"
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    try {
      // Find the JSON object in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[0];
      const analysis = JSON.parse(jsonStr);
      
      // Log the analysis generation
      await logAction({
        type: 'PROPOSAL_ANALYSIS',
        proposalTitle: title,
        timestamp: Date.now()
      });
      
      // Validate the analysis object
      return {
        feasibility: typeof analysis.feasibility === 'number' ? analysis.feasibility : 0.7,
        impact: typeof analysis.impact === 'number' ? analysis.impact : 0.7,
        cost: typeof analysis.cost === 'number' ? analysis.cost : 0.5,
        timeframe: typeof analysis.timeframe === 'number' ? analysis.timeframe : 0.5,
        risks: Array.isArray(analysis.risks) ? analysis.risks : ['Implementation challenges', 'Resource constraints', 'Community adoption'],
        benefits: Array.isArray(analysis.benefits) ? analysis.benefits : ['Community improvement', 'Enhanced quality of life', 'Long-term sustainability'],
        recommendations: typeof analysis.recommendations === 'string' ? analysis.recommendations : 'Consider refining the proposal with more specific details and implementation steps.'
      };
    } catch (parseError) {
      console.error('Error parsing analysis JSON:', parseError);
      throw new Error('Failed to parse analysis response');
    }
  } catch (error) {
    console.error('Error generating proposal analysis:', error);
    // Fallback to a default analysis if the API call fails
    return { 
      feasibility: 0.7,
      impact: 0.7,
      cost: 0.5,
      timeframe: 0.5,
      risks: ['Implementation challenges', 'Resource constraints', 'Community adoption'],
      benefits: ['Community improvement', 'Enhanced quality of life', 'Long-term sustainability'],
      recommendations: 'Consider refining the proposal with more specific details and implementation steps.'
    };
  }
}

/**
 * Gets smart feedback on a proposal
 * @param title The proposal title
 * @param description The proposal description
 * @returns Feedback string
 */
export async function getSmartFeedback(title: string, description: string) {
  if (!title.trim() || !description.trim()) {
    throw new Error('Title and description are required');
  }
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an assistant that provides constructive feedback on community proposals. 
            Your feedback should be balanced, highlighting strengths and suggesting improvements.`
          },
          {
            role: 'user',
            content: `Please provide feedback on this community proposal:
            
            Title: ${title}
            Description: ${description}
            
            Your feedback should:
            1. Highlight the strengths of the proposal
            2. Identify potential areas for improvement
            3. Suggest specific enhancements or considerations
            4. Be constructive and actionable
            
            Keep your feedback concise (3-5 sentences).`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content.trim();
    
    // Log the feedback generation
    await logAction({
      type: 'SMART_FEEDBACK',
      proposalTitle: title,
      timestamp: Date.now()
    });
    
    return feedback;
  } catch (error) {
    console.error('Error getting smart feedback:', error);
    throw new Error('Failed to get intelligent feedback');
  }
}
```

## 4. Security Service

The Security Service will handle vote validation and security-related functionality.

### Implementation Steps:

1. Create a `securityService.ts` file in the `src/lib` directory
2. Implement the following functions:

```typescript
// src/lib/securityService.ts

/**
 * Validates a vote for security and integrity
 * @param vote The vote object to validate
 * @param previousVotes Optional array of previous votes to check for suspicious patterns
 * @returns Object with validation result and reason if invalid
 */
export function validateVote(vote, previousVotes = []) {
  // Check for required fields
  if (!vote.userId || vote.userId.trim() === '') {
    return {
      valid: false,
      reason: 'Missing user ID'
    };
  }
  
  if (!vote.proposalId || vote.proposalId.trim() === '') {
    return {
      valid: false,
      reason: 'Missing proposal ID'
    };
  }
  
  // Check for valid timestamp
  if (!vote.timestamp || vote.timestamp > Date.now()) {
    return {
      valid: false,
      reason: 'Invalid timestamp'
    };
  }
  
  // Check for suspicious voting patterns if previous votes are provided
  if (previousVotes.length > 0) {
    // Check for rapid voting (multiple votes in a short time period)
    const recentVotes = previousVotes.filter(
      v => v.userId === vote.userId && 
      v.timestamp > Date.now() - 1000 * 60 // Votes in the last minute
    );
    
    if (recentVotes.length >= 3) {
      return {
        valid: false,
        reason: 'Suspicious voting pattern detected'
      };
    }
  }
  
  return {
    valid: true,
    reason: null
  };
}
```

## 5. Logging Service

The Logging Service will provide tamper-evident logging for important actions in the system.

### Implementation Steps:

1. Create a `loggingService.ts` file in the `src/lib` directory
2. Implement the following functions:

```typescript
// src/lib/loggingService.ts

import { db } from './db';
import { id as generateId } from '@instantdb/react';
import crypto from 'crypto';

/**
 * Logs an action with a tamper-evident hash
 * @param action The action object to log
 * @returns Object with success status and log entry
 */
export async function logAction(action) {
  try {
    // Get the latest log entry to get the previous hash
    const { data, error } = db.useQuery({
      logs: {}
    });
    
    if (error) {
      throw error;
    }
    
    // Find the latest log entry
    let previousHash = null;
    if (data?.logs) {
      const logEntries = Object.values(data.logs);
      if (logEntries.length > 0) {
        // Sort by timestamp descending
        const sortedEntries = logEntries.sort((a, b) => b.timestamp - a.timestamp);
        previousHash = sortedEntries[0].hash;
      }
    }
    
    // Create the log entry
    const logEntry = {
      action,
      timestamp: Date.now(),
      previousHash
    };
    
    // Generate a hash of the log entry
    const hash = generateHash(logEntry);
    
    // Add the hash to the log entry
    const completeLogEntry = {
      ...logEntry,
      hash
    };
    
    // Store the log entry
    const logId = generateId();
    await db.transact(
      db.tx.logs[logId].update(completeLogEntry)
    );
    
    return {
      success: true,
      logEntry: completeLogEntry
    };
  } catch (error) {
    console.error('Error logging action:', error);
    return {
      success: false,
      error: 'Failed to log action'
    };
  }
}

/**
 * Verifies the integrity of the log chain
 * @param logs Array of log entries to verify
 * @returns Object with validation result and invalid entries
 */
export async function verifyLogIntegrity(logs) {
  try {
    const invalidEntries = [];
    
    // Sort logs by timestamp
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      
      // Verify the hash
      const logWithoutHash = {
        action: log.action,
        timestamp: log.timestamp,
        previousHash: log.previousHash
      };
      
      const calculatedHash = generateHash(logWithoutHash);
      
      if (calculatedHash !== log.hash) {
        invalidEntries.push(i);
        continue;
      }
      
      // Verify the previous hash (except for the first entry)
      if (i > 0) {
        const previousLog = sortedLogs[i - 1];
        if (log.previousHash !== previousLog.hash) {
          invalidEntries.push(i);
        }
      }
    }
    
    return {
      valid: invalidEntries.length === 0,
      invalidEntries
    };
  } catch (error) {
    console.error('Error verifying log integrity:', error);
    throw new Error('Failed to verify log integrity');
  }
}

/**
 * Retrieves the action log
 * @returns Array of log entries
 */
export async function getActionLog() {
  try {
    const { data, error } = db.useQuery({
      logs: {}
    });
    
    if (error) {
      throw error;
    }
    
    if (!data?.logs) {
      return [];
    }
    
    // Convert to array and sort by timestamp
    return Object.entries(data.logs)
      .map(([id, log]) => ({
        id,
        ...log
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error retrieving action log:', error);
    throw new Error('Failed to retrieve action log');
  }
}

/**
 * Generates a hash for a log entry
 * @param logEntry The log entry to hash
 * @returns Hash string
 */
function generateHash(logEntry) {
  const data = JSON.stringify(logEntry);
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

## 6. Storage Service

The Storage Service will handle localStorage fallback for when InstantDB is not available.

### Implementation Steps:

1. Create a `storageService.ts` file in the `src/lib` directory
2. Implement the following functions:

```typescript
// src/lib/storageService.ts

/**
 * Saves data to localStorage
 * @param key The key to store the data under
 * @param data The data to store
 */
export function saveToLocalStorage(key: string, data: any) {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
  }
}

/**
 * Loads data from localStorage
 * @param key The key to retrieve data from
 * @returns The stored data or null if not found
 */
export function loadFromLocalStorage(key: string) {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`Error loading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Removes data from localStorage
 * @param key The key to remove
 */
export function removeFromLocalStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
  }
}
```

## Implementation Order

To implement the services in a logical order that allows for incremental testing and development, follow this sequence:

1. **Storage Service**: Implement basic data persistence first
2. **Security Service**: Implement validation functions needed by other services
3. **Logging Service**: Implement logging functionality needed by other services
4. **Proposal Service**: Implement core proposal management functionality
5. **Voting Service**: Implement voting functionality that depends on proposals
6. **Intelligent Service**: Implement smart features that depend on proposals and voting

This order ensures that each service builds on the previously implemented services, allowing for incremental testing and development.

## Conclusion

This implementation plan provides a structured approach to developing the core services needed for the Votex application. By following this plan and the TDD Test Plan, developers can build a robust, secure, and feature-rich voting platform that meets the requirements specified in the vision document.

The services are designed to be modular and maintainable, with clear separation of concerns and comprehensive error handling. The implementation also includes fallback mechanisms for when external services (like the GROQ API) are unavailable, ensuring the application remains functional even in degraded conditions.