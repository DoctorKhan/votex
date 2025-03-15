/**
 * Activate Jamie Developer Persona (Node.js Version)
 * 
 * This script activates the Jamie Developer persona and triggers the persona monitor integration.
 * It can be run directly with Node.js without requiring the server to be running.
 */

import { schedulePersonaActivity } from '../../personas/persona-implementation';
import { PersonaMonitorIntegration } from '../lib/personaMonitorIntegration';
import { logAction } from '../lib/loggingService';
import { initDB } from '../lib/db';

// Function to activate Jamie and run the persona monitor integration
async function activateJamiePersona() {
  try {
    console.log('Initializing database...');
    await initDB();
    
    console.log('Activating Jamie Developer persona...');
    
    // Activate Jamie
    schedulePersonaActivity(['jamie-dev'], 'medium');
    
    // Log the activation
    await logAction({
      type: 'PERSONA_ACTIVATION',
      personaId: 'jamie-dev',
      frequency: 'medium',
      timestamp: Date.now()
    });
    
    console.log('Jamie Developer persona activated successfully.');
    
    // Create an instance of the persona monitor integration
    const personaMonitor = new PersonaMonitorIntegration();
    
    // Run the integration
    console.log('Running persona monitor integration...');
    const result = await personaMonitor.runIntegration();
    
    console.log('Persona monitor integration completed:', result);
    
    // Schedule periodic runs
    console.log('Scheduling periodic runs...');
    const intervalId = personaMonitor.schedulePeriodicRuns(30); // Run every 30 minutes
    
    // Keep the process running for a short time to allow logging to complete
    setTimeout(() => {
      clearInterval(intervalId);
      console.log('Activation completed successfully.');
      process.exit(0);
    }, 5000);
    
    return {
      success: true,
      message: 'Jamie Developer persona activated and persona monitor integration triggered successfully.'
    };
  } catch (error) {
    console.error('Error activating Jamie Developer persona:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the activation function
activateJamiePersona()
  .then(result => {
    if (result.success) {
      console.log(result.message);
    } else {
      console.error('Activation failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });