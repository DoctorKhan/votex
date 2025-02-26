import { NextRequest, NextResponse } from 'next/server';

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Check if API key is available
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not defined in environment variables');
}

// Generate a revised proposal using the GROQ API
async function generateRevisedProposal(originalDescription: string, feedback: string): Promise<string> {
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
            content: `You are an AI assistant that specializes in improving community proposals based on feedback.
            You will be given an original proposal description and feedback on that proposal.
            Your task is to create a revised version of the proposal that addresses the feedback while maintaining the original intent.
            
            IMPORTANT FORMATTING REQUIREMENTS:
            1. Do not include any explanations, notes, or prefixes like "Here is the revised proposal:"
            2. Just provide the revised proposal text directly
            3. Format the proposal in a clean, professional way with:
               - Proper paragraphs with line breaks between them
               - Bullet points for lists of items or steps
               - Numbered lists for sequential steps if appropriate
               - Section headings in bold if the proposal is complex
            4. Use Markdown formatting:
               - Use blank lines between paragraphs
               - Use "- " or "* " for bullet points
               - Use "1. ", "2. ", etc. for numbered lists
               - Use "**text**" for bold text (section headings)
            5. Do not use quotation marks around the proposal`
          },
          {
            role: 'user',
            content: `Here is the original proposal description:
            
            "${originalDescription}"
            
            Here is the feedback on this proposal:
            
            "${feedback}"
            
            Please provide a revised version of the proposal that addresses this feedback.`
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
    let revisedProposal = data.choices[0].message.content.trim();
    
    // Remove common prefixes that might be included despite instructions
    const prefixesToRemove = [
      "Here is the revised proposal:",
      "Revised proposal:",
      "Here's the revised proposal:",
      "The revised proposal:"
    ];
    
    for (const prefix of prefixesToRemove) {
      if (revisedProposal.startsWith(prefix)) {
        revisedProposal = revisedProposal.substring(prefix.length).trim();
      }
    }
    
    // Remove quotation marks if they wrap the entire proposal
    if (revisedProposal.startsWith('"') && revisedProposal.endsWith('"')) {
      revisedProposal = revisedProposal.substring(1, revisedProposal.length - 1);
    }
    
    return revisedProposal;
  } catch (error) {
    console.error('Error generating revised proposal:', error);
    // Return a fallback message if the API call fails
    return "Unable to generate a revised proposal at this time. Please try again later.";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalDescription, feedback } = body;
    
    if (!originalDescription || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: originalDescription and feedback' },
        { status: 400 }
      );
    }
    
    const revisedProposal = await generateRevisedProposal(originalDescription, feedback);
    
    return NextResponse.json({ revisedProposal });
  } catch (error) {
    console.error('Error generating revised proposal:', error);
    return NextResponse.json(
      { error: 'Failed to generate revised proposal' },
      { status: 500 }
    );
  }
}