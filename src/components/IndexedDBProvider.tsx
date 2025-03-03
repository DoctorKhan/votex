'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initDB } from '../lib/db';
import ErrorBoundary from './ErrorBoundary';

interface IndexedDBProviderProps {
  children: ReactNode;
}

function DatabaseProvider({ children }: IndexedDBProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize IndexedDB:', err);
        setError(err as Error);
      }
    };

    initialize();
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
