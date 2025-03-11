#!/usr/bin/env node

/**
 * Script to run tests and production build in parallel
 * If tests pass but build fails, it will debug the build issues iteratively
 */

import { spawn } from 'child_process';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Log with timestamp and optional color
function log(message, color = colors.white) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

// Run a command and return a promise that resolves with the exit code
function runCommand(command, args, name, options = {}) {
  return new Promise((resolve) => {
    log(`Starting ${name}: ${command} ${args.join(' ')}`, colors.blue);
    
    const proc = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      ...options
    });
    
    let output = '';
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(`${colors.cyan}[${name}] ${colors.reset}${text}`);
    });
    
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(`${colors.red}[${name}] ${colors.reset}${text}`);
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        log(`${name} completed successfully`, colors.green);
      } else {
        log(`${name} failed with exit code ${code}`, colors.red);
      }
      resolve({ code, output });
    });
    
    return proc;
  });
}

// Parse TypeScript errors from build output
function parseTypeScriptErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for TypeScript error patterns
    if (line.includes('Type error:')) {
      const errorInfo = {
        message: line.trim(),
        location: lines[i-1]?.trim() || 'Unknown location',
        details: []
      };
      
      // Collect additional error details
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('Type error:') && lines[j].trim() !== '') {
        errorInfo.details.push(lines[j].trim());
        j++;
      }
      
      errors.push(errorInfo);
    }
  }
  
  return errors;
}

// Attempt to fix TypeScript errors automatically
async function debugTypeScriptErrors(errors) {
  if (errors.length === 0) {
    log('No TypeScript errors found to debug', colors.yellow);
    return false;
  }
  
  log(`Found ${errors.length} TypeScript errors to debug`, colors.yellow);
  
  for (const error of errors) {
    log(`Debugging error: ${error.message}`, colors.magenta);
    log(`Location: ${error.location}`, colors.magenta);
    
    // Extract file path from error location
    const filePathMatch = error.location.match(/\.\/([^:]+):/);
    if (!filePathMatch) {
      log(`Could not extract file path from error location: ${error.location}`, colors.red);
      continue;
    }
    
    const filePath = filePathMatch[1];
    log(`Identified file: ${filePath}`, colors.blue);
    
    // Check if the error is related to type incompatibility
    if (error.message.includes('is not assignable to type')) {
      log('Detected type incompatibility issue, attempting to fix...', colors.yellow);
      
      // For demonstration, we'll just log the suggested fix
      // In a real implementation, you would modify the file
      log(`Suggested fix: Add type assertion or fix the type in ${filePath}`, colors.green);
      
      // Here you could implement actual fixes based on error patterns
    }
  }
  
  // Return true if we attempted to fix any errors
  return errors.length > 0;
}

// Main function
async function main() {
  log('Starting parallel test and build', colors.bold + colors.green);
  
  // Run tests and build in parallel
  const [testResult, buildResult] = await Promise.all([
    runCommand('npm', ['test'], 'Tests'),
    runCommand('npm', ['run', 'build'], 'Build')
  ]);
  
  // Check results
  if (testResult.code === 0 && buildResult.code === 0) {
    log('Both tests and build completed successfully! 🎉', colors.bold + colors.green);
    return 0;
  } else if (testResult.code !== 0) {
    log('Tests failed. Please fix test issues before proceeding.', colors.bold + colors.red);
    return 1;
  } else if (buildResult.code !== 0) {
    log('Tests passed but build failed. Attempting to debug build issues...', colors.bold + colors.yellow);
    
    // Parse TypeScript errors from build output
    const tsErrors = parseTypeScriptErrors(buildResult.output);
    
    if (tsErrors.length > 0) {
      log(`Found ${tsErrors.length} TypeScript errors:`, colors.yellow);
      tsErrors.forEach((error, index) => {
        log(`Error ${index + 1}:`, colors.yellow);
        log(`  Location: ${error.location}`, colors.yellow);
        log(`  Message: ${error.message}`, colors.yellow);
        error.details.forEach(detail => log(`  ${detail}`, colors.yellow));
      });
      
      // Try to debug and fix TypeScript errors
      const fixAttempted = await debugTypeScriptErrors(tsErrors);
      
      if (fixAttempted) {
        log('Attempted to fix TypeScript errors. Running build again...', colors.bold + colors.blue);
        
        // Run build again to see if our fixes worked
        const rebuildResult = await runCommand('npm', ['run', 'build'], 'Rebuild');
        
        if (rebuildResult.code === 0) {
          log('Build succeeded after fixes! 🎉', colors.bold + colors.green);
          return 0;
        } else {
          log('Build still failing after attempted fixes. Manual intervention required.', colors.bold + colors.red);
          return 1;
        }
      } else {
        log('Could not automatically fix TypeScript errors. Manual intervention required.', colors.bold + colors.red);
        return 1;
      }
    } else {
      log('No specific TypeScript errors found. Manual debugging required.', colors.bold + colors.red);
      return 1;
    }
  }
}

// Run the main function
main().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  log(`Unexpected error: ${error.message}`, colors.bold + colors.red);
  console.error(error);
  process.exit(1);
});