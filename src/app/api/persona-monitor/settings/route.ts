/**
 * API Route for Conversation Monitor Settings
 * 
 * This API route handles saving and retrieving settings for the Conversation Monitor
 * and Persona Integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logAction } from '../../../../lib/loggingService';

/**
 * Default settings
 */
const defaultSettings = {
  voteThreshold: 5,
  implementationProbability: 0.3,
  monitoringInterval: 30,
  enableDesignDocuments: true,
  enableTDD: true,
  enableAutoActivation: false
};

/**
 * GET handler - Returns the current settings
 */
export async function GET() {
  try {
    // In a real implementation, this would retrieve settings from a database
    // For this example, we'll return the default settings
    return NextResponse.json({
      settings: defaultSettings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in settings GET route:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Saves the settings
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Validate request body
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }
    
    // Validate settings
    const settings = {
      voteThreshold: Number(body.voteThreshold) || defaultSettings.voteThreshold,
      implementationProbability: Number(body.implementationProbability) || defaultSettings.implementationProbability,
      monitoringInterval: Number(body.monitoringInterval) || defaultSettings.monitoringInterval,
      enableDesignDocuments: body.enableDesignDocuments !== undefined ? Boolean(body.enableDesignDocuments) : defaultSettings.enableDesignDocuments,
      enableTDD: body.enableTDD !== undefined ? Boolean(body.enableTDD) : defaultSettings.enableTDD,
      enableAutoActivation: body.enableAutoActivation !== undefined ? Boolean(body.enableAutoActivation) : defaultSettings.enableAutoActivation
    };
    
    // Ensure values are within valid ranges
    settings.voteThreshold = Math.max(1, Math.min(100, settings.voteThreshold));
    settings.implementationProbability = Math.max(0, Math.min(1, settings.implementationProbability));
    settings.monitoringInterval = Math.max(5, Math.min(1440, settings.monitoringInterval));
    
    // In a real implementation, this would save the settings to a database
    // For this example, we'll just log the action
    await logAction({
      type: 'SETTINGS_UPDATE',
      settings,
      timestamp: Date.now()
    });
    
    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in settings POST route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}