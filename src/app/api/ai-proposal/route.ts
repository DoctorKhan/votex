import { NextRequest, NextResponse } from 'next/server';

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Check if API key is available
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not defined in environment variables');
}

// Generate a proposal using the GROQ API
async function generateAiProposal(existingProposals: string[]): Promise<{ title: string; description: string }> {
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
            content: `You are an AI assistant that generates thoughtful community improvement proposals. 
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
    
    const title = titleMatch ? titleMatch[1].trim() : 'AI-Generated Community Proposal';
    const description = descriptionMatch 
      ? descriptionMatch[1].trim() 
      : 'A proposal to improve the community through collaborative efforts and innovative solutions.';
    
    return { title, description };
  } catch (error) {
    console.error('Error generating AI proposal:', error);
    // Fallback to a default proposal if the API call fails
    return { 
      title: 'Community Improvement Initiative', 
      description: 'A proposal to enhance community spaces and services through collaborative planning and implementation of targeted improvements based on resident feedback.'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { existingProposals = [] } = body;
    
    const proposal = await generateAiProposal(existingProposals);
    
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Error in AI proposal generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI proposal' },
      { status: 500 }
    );
  }
}