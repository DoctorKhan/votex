import { createHash } from 'crypto';
import { addOrUpdateItem, clearStore, getAllItems, generateId, LogEntity } from './db';

/**
 * Action types that can be logged
 */
export type LogAction = {
  type: string;
  userId?: string;
  proposalId?: string;
  title?: string;
  proposalIds?: string[];
  timestamp: number;
  [key: string]: unknown;
};

/**
 * Log entry structure
 */
export interface LogEntry {
  id?: string;
  action: LogAction;
  timestamp: number;
  previousHash: string | null;
  hash?: string;
}

/**
 * Log verification result
 */
export interface VerificationResult {
  valid: boolean;
  invalidEntries: number[];
}

/**
 * Clears all log entries (for testing purposes only)
 */
export async function clearLogs(): Promise<void> {
  await clearStore('logs');
}

/**
 * Logs an action with a tamper-evident hash
 * @param action The action object to log
 * @returns Object with success status and log entry
 */
export async function logAction(action: LogAction): Promise<{ success: boolean; logEntry?: LogEntry; error?: string }> {
  try {
    // Get all existing logs to find the previous hash
    const existingLogs = await getActionLog();
    
    // Get the previous hash (if any)
    const previousHash = existingLogs.length > 0 
      ? existingLogs[existingLogs.length - 1].hash || null
      : null;
    
    // Create the log entry
    const logEntry: LogEntry = {
      id: generateId(),
      action,
      timestamp: Date.now(),
      previousHash
    };
    
    // Generate a hash of the log entry
    const hash = generateHash(logEntry);
    
    // Add the hash to the log entry
    const completeLogEntry: LogEntry = {
      ...logEntry,
      hash
    };
    
    // Store the log entry in IndexedDB
    await addOrUpdateItem('logs', completeLogEntry as LogEntity);
    
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
export async function verifyLogIntegrity(logs?: LogEntry[]): Promise<VerificationResult> {
  try {
    // If logs are not provided, get them from the database
    const logsToVerify = logs || await getActionLog();
    
    const invalidEntries: number[] = [];
    
    // Sort logs by timestamp
    const sortedLogs = [...logsToVerify].sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      
      // Verify the hash
      const logWithoutHash = {
        id: log.id,
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
export async function getActionLog(): Promise<LogEntry[]> {
  try {
    const logs = await getAllItems<LogEntry>('logs');
    return logs;
  } catch (error) {
    console.error('Error getting action log:', error);
    return [];
  }
}

/**
 * Generates a hash for a log entry
 * @param logEntry The log entry to hash
 * @returns Hash string
 */
function generateHash(logEntry: Omit<LogEntry, 'hash'>): string {
  const data = JSON.stringify(logEntry);
  return createHash('sha256').update(data).digest('hex');
}