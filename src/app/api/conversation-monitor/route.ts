/**
 * API Route for Conversation Monitoring
 * 
 * This API route triggers the conversation monitoring process,
 * which analyzes forum conversations, creates proposals for improvements,
 * and manages design documents for approved proposals.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationMonitorService } from '../../../lib/conversationMonitorService';
import { initDB } from '../../../lib/db';

/**
 * GET handler - Returns the status of the conversation monitoring service
 */
export async function GET() {
  try {
    // Create a simple status response
    return NextResponse.json({
      status: 'active',
      service: 'conversation-monitor',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in conversation monitor GET route:', error);
    return NextResponse.json(
      { error: 'Failed to get conversation monitor status' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Triggers the conversation monitoring process
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize the database
    await initDB();
    
    // Get request body if needed
    const body = await request.json().catch(() => ({}));
    const threshold = body.threshold || 5; // Default vote threshold
    
    // Create an instance of the conversation monitor service
    const conversationMonitor = new ConversationMonitorService();
    
    // Process conversations
    const result = await conversationMonitor.processConversations();
    
    // Return the result
    return NextResponse.json({
      success: result.processed,
      newProposals: result.newProposals.length,
      approvedProposals: result.approvedProposals.length,
      threshold,
      requestBody: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in conversation monitor POST route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}