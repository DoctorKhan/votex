import { NextRequest, NextResponse } from 'next/server';

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Check if API key is available
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not defined in environment variables');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages = [], systemContext = '' } = body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided for chat' },
        { status: 400 }
      );
    }
    
    // Create a system message that includes both the general instructions and the proposal context
    const systemMessage = {
      role: 'system',
      content: `You are a helpful AI assistant that provides information about voting systems,
      democratic processes, and community engagement. You are knowledgeable, concise, and friendly.
      You should provide accurate information and avoid making things up. If you don't know something,
      admit it and suggest where the user might find more information.
      
      ${systemContext ? `Current context about the proposals:\n${systemContext}` : ''}
      
      When answering questions about specific proposals, refer to them by their titles and provide
      accurate information based on the context provided. If asked about proposals not in the system,
      politely explain that you don't have information about those specific proposals.`
    };
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          systemMessage,
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ 
      message: data.choices[0].message.content.trim(),
      role: 'assistant'
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}