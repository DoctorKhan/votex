/**
 * API Route for Persona Monitor Integration
 * 
 * This API route triggers the Jamie Developer persona to monitor conversations,
 * suggest improvements, and implement approved proposals using test-driven development.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PersonaMonitorIntegration } from '../../../lib/personaMonitorIntegration';
import { initDB } from '../../../lib/db';

/**
 * GET handler - Returns the status of the persona monitor integration
 */
export async function GET() {
  try {
    // Create a simple status response
    return NextResponse.json({
      status: 'active',
      service: 'persona-monitor',
      persona: 'Jamie Developer',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in persona monitor GET route:', error);
    return NextResponse.json(
      { error: 'Failed to get persona monitor status' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Triggers the persona monitor integration
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize the database
    await initDB();
    
    // Get request body if needed
    const body = await request.json().catch(() => ({}));
    const intervalMinutes = body.intervalMinutes || 60; // Default interval in minutes
    
    // Create an instance of the persona monitor integration
    const personaMonitor = new PersonaMonitorIntegration();
    
    // Run the integration
    const result = await personaMonitor.runIntegration();
    
    // Return the result
    return NextResponse.json({
      success: result.success,
      newProposals: result.newProposals?.length || 0,
      implementedProposals: result.implementedProposals?.length || 0,
      intervalMinutes,
      requestBody: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in persona monitor POST route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run persona monitor integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Schedules periodic runs of the persona monitor integration
 */
export async function PUT(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json().catch(() => ({}));
    const intervalMinutes = body.intervalMinutes || 60; // Default interval in minutes
    
    // Create an instance of the persona monitor integration
    const personaMonitor = new PersonaMonitorIntegration();
    
    // Schedule periodic runs
    personaMonitor.schedulePeriodicRuns(intervalMinutes);
    
    // Return the result
    return NextResponse.json({
      success: true,
      message: `Scheduled persona monitor integration to run every ${intervalMinutes} minutes`,
      intervalMinutes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in persona monitor PUT route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to schedule persona monitor integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}