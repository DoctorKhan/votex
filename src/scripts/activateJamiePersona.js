/**
 * Activate Jamie Developer Persona
 * 
 * This script activates the Jamie Developer persona and triggers the persona monitor integration.
 * It can be run manually or scheduled to run periodically.
 */

// Use fetch to call the persona monitor API
async function activateJamiePersona() {
  try {
    console.log('Activating Jamie Developer persona...');
    
    // First, activate Jamie in the persona controller
    const activateResponse = await fetch('http://localhost:3001/api/personas/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personaId: 'jamie-dev',
        active: true,
        frequency: 'medium'
      }),
    });
    
    if (!activateResponse.ok) {
      throw new Error(`Failed to activate Jamie: ${activateResponse.statusText}`);
    }
    
    console.log('Jamie Developer persona activated successfully.');
    
    // Then, trigger the persona monitor integration
    const monitorResponse = await fetch('http://localhost:3001/api/persona-monitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intervalMinutes: 30 // Run every 30 minutes
      }),
    });
    
    if (!monitorResponse.ok) {
      throw new Error(`Failed to trigger persona monitor: ${monitorResponse.statusText}`);
    }
    
    const result = await monitorResponse.json();
    console.log('Persona monitor integration triggered successfully:', result);
    
    // Schedule periodic runs
    const scheduleResponse = await fetch('http://localhost:3001/api/persona-monitor', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intervalMinutes: 30 // Run every 30 minutes
      }),
    });
    
    if (!scheduleResponse.ok) {
      throw new Error(`Failed to schedule persona monitor: ${scheduleResponse.statusText}`);
    }
    
    const scheduleResult = await scheduleResponse.json();
    console.log('Persona monitor integration scheduled successfully:', scheduleResult);
    
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
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
  });