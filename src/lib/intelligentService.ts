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

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
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
export async function analyzeAndVote(proposals: Array<{ id: number | string; title: string; description: string; votes: number }>) {
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

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
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
export async function generateProposalAnalysis(title: string, description: string) {
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

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
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

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
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