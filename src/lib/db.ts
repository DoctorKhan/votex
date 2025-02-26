/**
 * Database service using IndexedDB for data persistence
 */

// Define the schema types
export interface ProposalEntity {
  id: string;
  title: string;
  description: string;
  votes: number;
  aiCreated?: boolean;
  aiVoted?: boolean;
  llmFeedback?: string;
  createdAt: number;
}

export interface RevisionEntity {
  id: string;
  proposalId: string;
  description: string;
  timestamp: string;
}

export interface VoteEntity {
  id: string;
  userId: string;
  proposalId: string;
  timestamp: number;
}

export interface MessageEntity {
  id: string;
  proposalId: string;
  role: string;
  content: string;
  timestamp: number;
}

export interface LogEntity {
  id: string;
  action: {
    type: string;
    userId?: string;
    proposalId?: string;
    title?: string;
    proposalIds?: string[];
    timestamp: number;
    [key: string]: unknown;
  };
  timestamp: number;
  previousHash: string | null;
  hash: string;
}

// Database name and version
const DB_NAME = 'votex-db';
const DB_VERSION = 1;

// IndexedDB instance
let db: IDBDatabase | null = null;

/**
 * Initialize the database
 * @returns Promise that resolves when the database is ready
 */
export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    // Open the database
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (called when the database is created or version is changed)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores with indexes
      if (!db.objectStoreNames.contains('proposals')) {
        const proposalsStore = db.createObjectStore('proposals', { keyPath: 'id' });
        proposalsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('revisions')) {
        const revisionsStore = db.createObjectStore('revisions', { keyPath: 'id' });
        revisionsStore.createIndex('proposalId', 'proposalId', { unique: false });
      }

      if (!db.objectStoreNames.contains('votes')) {
        const votesStore = db.createObjectStore('votes', { keyPath: 'id' });
        votesStore.createIndex('userId', 'userId', { unique: false });
        votesStore.createIndex('proposalId', 'proposalId', { unique: false });
      }

      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
        messagesStore.createIndex('proposalId', 'proposalId', { unique: false });
      }

      if (!db.objectStoreNames.contains('logs')) {
        const logsStore = db.createObjectStore('logs', { keyPath: 'id' });
        logsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    // Handle success
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    // Handle error
    request.onerror = (event) => {
      console.error('Error opening database:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Generate a unique ID
 * @returns A unique ID string
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Get an object store for the specified store name
 * @param storeName The name of the object store
 * @param mode The transaction mode ('readonly' or 'readwrite')
 * @returns The object store
 */
const getObjectStore = (storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

/**
 * Add or update an item in the specified object store
 * @param storeName The name of the object store
 * @param item The item to add or update
 * @returns Promise that resolves with the item ID
 */
export const addOrUpdateItem = <T extends { id: string }>(storeName: string, item: T): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName, 'readwrite');

      // Ensure the item has an ID
      if (!item.id) {
        item.id = generateId();
      }

      // Add or update the item
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item.id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get an item from the specified object store by ID
 * @param storeName The name of the object store
 * @param id The ID of the item to get
 * @returns Promise that resolves with the item or null if not found
 */
export const getItem = <T>(storeName: string, id: string): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName);

      // Get the item
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get all items from the specified object store
 * @param storeName The name of the object store
 * @returns Promise that resolves with an array of items
 */
export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName);

      // Get all items
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete an item from the specified object store by ID
 * @param storeName The name of the object store
 * @param id The ID of the item to delete
 * @returns Promise that resolves when the item is deleted
 */
export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName, 'readwrite');

      // Delete the item
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Clear all items from the specified object store
 * @param storeName The name of the object store
 * @returns Promise that resolves when the store is cleared
 */
export const clearStore = (storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName, 'readwrite');

      // Clear the store
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get items from the specified object store by index
 * @param storeName The name of the object store
 * @param indexName The name of the index
 * @param value The value to search for
 * @returns Promise that resolves with an array of items
 */
export const getItemsByIndex = <T>(storeName: string, indexName: string, value: IDBValidKey | IDBKeyRange): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName);

      // Get the index
      const index = store.index(indexName);

      // Get items by index
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a unique user ID for the current session
 * @returns A unique user ID string
 */
export const getUserId = (): string => {
  if (typeof window === 'undefined') return generateId();
  
  const storedId = localStorage.getItem('votingAppUserId');
  if (storedId) return storedId;
  
  const newId = generateId();
  localStorage.setItem('votingAppUserId', newId);
  return newId;
};