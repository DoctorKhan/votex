/**
 * API Route for Persona Activation
 * 
 * This API route activates or deactivates a persona and sets its activity frequency.
 */

import { NextRequest, NextResponse } from 'next/server';
import { schedulePersonaActivity, PersonaId } from '../../../../../personas/persona-implementation';
import { logAction } from '../../../../lib/loggingService';

/**
 * POST handler - Activates or deactivates a persona
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Validate request body
    if (!body.personaId) {
      return NextResponse.json(
        { error: 'personaId is required' },
        { status: 400 }
      );
    }
    
    const personaId = body.personaId as PersonaId;
    const active = body.active !== false; // Default to true if not specified
    const frequency = body.frequency || 'medium';
    
    // Validate frequency
    if (!['high', 'medium', 'low', 'paused'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be one of: high, medium, low, paused' },
        { status: 400 }
      );
    }
    
    // Store active personas in localStorage
    try {
      // Get current active personas from localStorage
      let activePersonas: string[] = [];
      
      // In server-side code, we can't access localStorage directly
      // Instead, we'll use cookies or server-side storage
      // For this example, we'll simulate the behavior
      
      if (active) {
        // Add persona to active list if not already there
        if (!activePersonas.includes(personaId)) {
          activePersonas.push(personaId);
        }
        
        // Schedule persona activity if not paused
        if (frequency !== 'paused') {
          schedulePersonaActivity([personaId], frequency as 'high' | 'medium' | 'low');
        }
      } else {
        // Remove persona from active list
        activePersonas = activePersonas.filter(id => id !== personaId);
      }
      
      // Log the action
      await logAction({
        type: active ? 'PERSONA_ACTIVATION' : 'PERSONA_DEACTIVATION',
        personaId,
        frequency,
        timestamp: Date.now()
      });
      
      return NextResponse.json({
        success: true,
        personaId,
        active,
        frequency,
        message: `Persona ${personaId} ${active ? 'activated' : 'deactivated'} with ${frequency} frequency`
      });
    } catch (error) {
      console.error('Error activating persona:', error);
      return NextResponse.json(
        { error: 'Failed to activate persona' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in persona activation route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * GET handler - Returns the status of active personas
 */
export async function GET() {
  try {
    // In a real implementation, this would retrieve the active personas from a database
    // For this example, we'll return a simple response
    return NextResponse.json({
      activePersonas: ['jamie-dev'], // Assume Jamie is active for demonstration
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in persona activation GET route:', error);
    return NextResponse.json(
      { error: 'Failed to get active personas' },
      { status: 500 }
    );
  }
}