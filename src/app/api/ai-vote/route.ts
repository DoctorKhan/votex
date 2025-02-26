import { NextRequest, NextResponse } from 'next/server';

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Check if API key is available
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not defined in environment variables');
}

type Revision = {
  id: number;
  description: string;
  timestamp: string;
};

type Proposal = {
  id: number;
  title: string;
  description: string;
  votes: number;
  aiVoted?: boolean;
  revisions?: Revision[];
  llmFeedback?: string;
};

// Analyze proposals and decide which ones to vote for
async function analyzeAndVote(proposals: Proposal[]): Promise<number[]> {
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
            content: `You are an AI assistant that evaluates community proposals and votes for those that would 
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
      .map((v: string) => v.trim())
      .filter((v: string) => /^\d+$/.test(v))
      .map((v: string) => parseInt(v, 10));
    
    // Map the proposal numbers (1-based) to proposal IDs (from the actual data)
    return voteNumbers
      .filter((num: number) => num > 0 && num <= proposals.length)
      .map((num: number) => proposals[num - 1].id);
  } catch (error) {
    console.error('Error analyzing proposals for voting:', error);
    // Fallback to a simple algorithm if the API call fails
    // Vote for the proposal with the fewest votes to balance things out
    const sortedByVotes = [...proposals].sort((a, b) => a.votes - b.votes);
    return sortedByVotes.length > 0 ? [sortedByVotes[0].id] : [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposals = [] } = body;
    
    if (!Array.isArray(proposals) || proposals.length === 0) {
      return NextResponse.json(
        { error: 'No proposals provided for voting' },
        { status: 400 }
      );
    }
    
    const votedProposalIds = await analyzeAndVote(proposals);
    
    return NextResponse.json({ votedProposalIds });
  } catch (error) {
    console.error('Error in AI voting process:', error);
    return NextResponse.json(
      { error: 'Failed to process AI votes' },
      { status: 500 }
    );
  }
}