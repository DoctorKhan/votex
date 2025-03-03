import { generateId, getAllItems, addOrUpdateItem } from './db';
import crypto from 'crypto';

/**
 * Logs an action with a tamper-evident hash
 * @param action The action object to log
 * @returns Object with success status and log entry
 */
export interface LogAction {
  type: string;
  timestamp: number;
  [key: string]: unknown;
}

export async function logAction(action: LogAction) {
  try {
    // Get the latest log entry to get the previous hash
    const logs = await getAllItems<LogEntry>('logs');
    
    // Find the latest log entry
    let previousHash = null;
    if (logs.length > 0) {
      // Sort by timestamp descending
      const sortedEntries = logs.sort((a, b) => b.timestamp - a.timestamp);
      previousHash = sortedEntries[0].hash;
    }
    
    // Create the log entry
    const logEntry = {
      action,
      timestamp: Date.now(),
      previousHash
    };
    
    // Generate a hash of the log entry
    const hash = generateHash(logEntry);
    
    // Add the hash to the log entry
    const completeLogEntry = {
      ...logEntry,
      hash
    };
    
    // Store the log entry
    const logId = generateId();
    const logEntryWithId = {
      id: logId,
      ...completeLogEntry
    };
    await addOrUpdateItem('logs', logEntryWithId);
    
    return {
      success: true,
      logEntry: completeLogEntry
    };
  } catch (error) {
    console.error('Error logging action:', error);
    return {
      success: false,
      error: 'Failed to log action'
    };
  }
}

/**
 * Verifies the integrity of the log chain
 * @param logs Array of log entries to verify
 * @returns Object with validation result and invalid entries
 */
export interface LogEntry {
  action: LogAction;
  timestamp: number;
  previousHash: string | null;
  hash: string;
  [key: string]: unknown;
}

export async function verifyLogIntegrity(logs: LogEntry[]) {
  try {
    const invalidEntries: number[] = [];
    
    // Sort logs by timestamp
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      
      // Verify the hash
      const logWithoutHash = {
        action: log.action,
        timestamp: log.timestamp,
        previousHash: log.previousHash
      };
      
      const calculatedHash = generateHash(logWithoutHash);
      
      if (calculatedHash !== log.hash) {
        invalidEntries.push(i);
        continue;
      }
      
      // Verify the previous hash (except for the first entry)
      if (i > 0) {
        const previousLog = sortedLogs[i - 1];
        if (log.previousHash !== previousLog.hash) {
          invalidEntries.push(i);
        }
      }
    }
    
    return {
      valid: invalidEntries.length === 0,
      invalidEntries
    };
  } catch (error) {
    console.error('Error verifying log integrity:', error);
    throw new Error('Failed to verify log integrity');
  }
}

/**
 * Retrieves the action log
 * @returns Array of log entries
 */
export async function getActionLog() {
  try {
    const logs = await getAllItems<LogEntry & { id: string }>('logs');
    
    // Sort by timestamp
    return logs.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error retrieving action log:', error);
    throw new Error('Failed to retrieve action log');
  }
}

/**
 * Generates a hash for a log entry
 * @param logEntry The log entry to hash
 * @returns Hash string
 */
function generateHash(logEntry: Record<string, unknown>): string {
  const data = JSON.stringify(logEntry);
  return crypto.createHash('sha256').update(data).digest('hex');
}
