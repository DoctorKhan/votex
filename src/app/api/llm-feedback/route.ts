import { NextRequest, NextResponse } from 'next/server';
import { ProposalEntity } from '../../../lib/proposalService';

export async function POST(request: NextRequest) {
  try {
    const { proposalId, proposal } = await request.json();

    if (!proposalId || !proposal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate feedback based on the proposal
    const feedback = await generateFeedback(proposal);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error in LLM feedback API:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

/**
 * Generate feedback for a proposal
 * This is a simple implementation that could be replaced with a real LLM call
 */
async function generateFeedback(proposal: ProposalEntity): Promise<string> {
  // In a real implementation, this would call an LLM API
  // For now, we'll just return some template feedback
  
  const feedbackTemplates = [
    `This proposal on "${proposal.title}" has some interesting points. The community might benefit from more specific details about implementation.`,
    `"${proposal.title}" is a well-structured proposal. Consider adding more information about the potential impact and benefits.`,
    `I've analyzed "${proposal.title}" and found it to be a valuable contribution. You might want to address potential challenges in your next revision.`,
    `The proposal "${proposal.title}" addresses an important topic. It could be strengthened by including examples or case studies.`,
    `"${proposal.title}" presents a clear vision. To improve it further, consider adding metrics for measuring success.`
  ];
  
  // Simulate a delay to mimic an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a random feedback template
  const randomIndex = Math.floor(Math.random() * feedbackTemplates.length);
  return feedbackTemplates[randomIndex];
}