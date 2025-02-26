#!/usr/bin/env node

import { execSync } from 'child_process';
import net from 'net';

/**
 * Checks if a port is in use
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - True if the port is available, false otherwise
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      // Type assertion for TypeScript
      const nodeError = /** @type {NodeJS.ErrnoException} */ (err);
      if (nodeError.code === 'EADDRINUSE') {
        // Port is in use
        resolve(false);
      } else {
        // Other error, assume port is not available
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      // Close the server and resolve with true (port is available)
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}

/**
 * Finds an available port starting from the given port
 * @param {number} startPort - The port to start checking from
 * @param {number} maxAttempts - Maximum number of ports to check
 * @returns {Promise<number>} - The first available port
 */
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    
    if (available) {
      return port;
    }
  }
  
  // If no port is found after maxAttempts, return a default fallback
  return startPort + 1000; // Fallback to a port that's likely available
}

/**
 * Main function to check port and start Next.js
 */
async function main() {
  const defaultPort = 3000;
  const args = process.argv.slice(2);
  
  // Check if port 3000 is available
  const isDefaultPortAvailable = await isPortAvailable(defaultPort);
  
  if (isDefaultPortAvailable) {
    // Default port is available, start Next.js normally
    console.log(`\x1b[32m✓ Port ${defaultPort} is available\x1b[0m`);
    
    // Determine if we're in dev or production mode
    const isDev = args.includes('dev');
    const command = isDev ? `next dev ${args.filter(arg => arg !== 'dev').join(' ')}` : `next start ${args.join(' ')}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      process.exit(error.status);
    }
  } else {
    // Find an available port
    const availablePort = await findAvailablePort(defaultPort + 1);
    console.log(`\x1b[33m⚠ Port ${defaultPort} is in use. Using port ${availablePort} instead.\x1b[0m`);
    
    // Determine if we're in dev or production mode
    const isDev = args.includes('dev');
    const portFlag = `-p ${availablePort}`;
    const command = isDev 
      ? `next dev ${portFlag} ${args.filter(arg => arg !== 'dev').join(' ')}` 
      : `next start ${portFlag} ${args.join(' ')}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      process.exit(error.status);
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});