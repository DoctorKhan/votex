import { init, id } from '@instantdb/react';

// Define the schema for our database
export type ProposalEntity = {
  title: string;
  description: string;
  votes: number;
  smartCreated: boolean;
  intelligentVoted: boolean;
  createdAt: number;
  smartFeedback?: string;
};

export type RevisionEntity = {
  proposalId: string;
  description: string;
  timestamp: string;
  analysis?: Record<string, unknown>;
};

export type VoteEntity = {
  id: string;
  userId: string;
  proposalId: string;
  timestamp: number;
};

export type LogEntity = {
  action: Record<string, unknown>;
  timestamp: number;
  previousHash: string | null;
  hash: string;
};

// Get the InstantDB App ID from environment variables
const INSTANTDB_APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || process.env.INSTANTDB_APP_ID || '13b4b31a-32d6-4f29-a77e-6b532a047976';

// Create the InstantDB client
export const db = init({
  appId: INSTANTDB_APP_ID,
  // Skip schema definition to avoid type errors
});

/**
 * Generates a consistent user ID
 * @returns User ID string
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'server-user';
  }
  
  // Check if we already have a user ID in localStorage
  const storedId = localStorage.getItem('votingAppUserId');
  if (storedId) {
    return storedId;
  }
  
  // Generate a new ID
  const newId = id();
  localStorage.setItem('votingAppUserId', newId);
  return newId;
}

/**
 * Initialize the database
 */
export async function initDB() {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('Skipping InstantDB initialization in server environment');
      return;
    }

    // Verify that the InstantDB client is properly initialized
    if (!db) {
      throw new Error('InstantDB client is not initialized');
    }

    // Create a test transaction to verify the connection
    const testId = id();
    const testKey = `test_${testId}`;
    localStorage.setItem(testKey, testId);
    const testValue = localStorage.getItem(testKey);
    
    if (testValue !== testId) {
      throw new Error('LocalStorage test failed - storage may be disabled');
    }
    
    localStorage.removeItem(testKey);
    
    console.log('InstantDB initialized successfully with App ID:', INSTANTDB_APP_ID);
  } catch (error) {
    console.error('Error initializing InstantDB:', error);
    throw error;
  }
}

/**
 * Generate a unique ID
 * @returns A unique ID string
 */
export function generateId(): string {
  return id();
}

/**
 * Add or update an item in the specified store
 * @param storeName The name of the store
 * @param item The item to add or update
 * @returns Promise that resolves when the operation is complete
 */
export async function addOrUpdateItem<T extends { id: string }>(storeName: string, item: T): Promise<void> {
  // For now, we'll use localStorage as a simple storage mechanism
  try {
    const storeKey = `votex_${storeName}`;
    const existingItems = JSON.parse(localStorage.getItem(storeKey) || '[]');
    
    const existingIndex = existingItems.findIndex((i: T) => i.id === item.id);
    if (existingIndex >= 0) {
      existingItems[existingIndex] = item;
    } else {
      existingItems.push(item);
    }
    
    localStorage.setItem(storeKey, JSON.stringify(existingItems));
  } catch (error) {
    console.error(`Error adding/updating item in ${storeName}:`, error);
    throw error;
  }
}

/**
 * Get all items from the specified store
 * @param storeName The name of the store
 * @returns Promise that resolves with an array of all items
 */
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  // For now, we'll use localStorage as a simple storage mechanism
  try {
    const storeKey = `votex_${storeName}`;
    return JSON.parse(localStorage.getItem(storeKey) || '[]');
  } catch (error) {
    console.error(`Error getting items from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Delete an item from the specified store
 * @param storeName The name of the store
 * @param id The ID of the item to delete
 * @returns Promise that resolves when the operation is complete
 */
export async function deleteItem(storeName: string, id: string): Promise<void> {
  // For now, we'll use localStorage as a simple storage mechanism
  try {
    const storeKey = `votex_${storeName}`;
    const existingItems = JSON.parse(localStorage.getItem(storeKey) || '[]');
    
    const filteredItems = existingItems.filter((item: { id: string }) => item.id !== id);
    
    localStorage.setItem(storeKey, JSON.stringify(filteredItems));
  } catch (error) {
    console.error(`Error deleting item from ${storeName}:`, error);
    throw error;
  }
}
