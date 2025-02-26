import { NextRequest, NextResponse } from 'next/server';

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Check if API key is available
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not defined in environment variables');
}

type AnalysisResult = {
  feasibility: number;
  impact: number;
  cost: number;
  timeframe: number;
  risks: string[];
  benefits: string[];
  recommendations: string;
};

// Generate a proposal analysis using the GROQ API
async function generateProposalAnalysis(title: string, description: string): Promise<AnalysisResult> {
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
            content: `You are an AI assistant that specializes in analyzing community proposals. 
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title and description' },
        { status: 400 }
      );
    }
    
    const analysis = await generateProposalAnalysis(title, description);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating proposal analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}