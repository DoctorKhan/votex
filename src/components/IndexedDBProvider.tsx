'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initDB, getUserId } from '../lib/db';
import ErrorBoundary from './ErrorBoundary';

interface IndexedDBProviderProps {
  children: ReactNode;
}

function DatabaseProvider({ children }: IndexedDBProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  
  // Initialize IndexedDB
  useEffect(() => {
    const dbName = 'votexDB';
    const dbVersion = 1;
    
    const initialize = async () => {
      try {
        // Initialize InstantDB
        await initDB();
        
        // Initialize IndexedDB for forums
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('forumCategories')) {
            db.createObjectStore('forumCategories', { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains('forumThreads')) {
            db.createObjectStore('forumThreads', { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains('forumPosts')) {
            db.createObjectStore('forumPosts', { keyPath: 'id' });
          }
        };
        
        request.onsuccess = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          
          // Make the database instance available to the application
          (window as Window & { __votexDB?: IDBDatabase }).__votexDB = database;
          setDb(database);
          
          // Trigger a custom event to notify other components that the database is ready
          window.dispatchEvent(new CustomEvent('votex-db-initialized'));
          
          console.log('IndexedDB initialized successfully', dbName, dbVersion);
          setIsInitialized(true);
        };
        
        request.onerror = (event) => {
          console.error('Error opening IndexedDB:', (event.target as IDBOpenDBRequest).error);
          throw new Error(`Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error?.message}`);
        };
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err as Error);
      }
    };

    // Begin initialization
    initialize();
    
    // Get user ID to make sure it's set
    const userId = getUserId();
    console.log('Current user ID:', userId);
    
    // Cleanup on unmount
    return () => {
      if (db) {
        db.close();
        console.log('IndexedDB connection closed');
      }
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
        <h2 className="text-lg font-bold">Database Error</h2>
        <p>Failed to initialize the database: {error.message}</p>
        <p className="mt-2">
          Please make sure your browser supports IndexedDB and that it&apos;s not blocked by privacy settings.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Initializing database...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function IndexedDBProvider({ children }: IndexedDBProviderProps) {
  return (
    <ErrorBoundary>
      <DatabaseProvider>{children}</DatabaseProvider>
    </ErrorBoundary>
  );
}
