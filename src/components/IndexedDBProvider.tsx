'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initDB } from '../lib/db';

interface IndexedDBProviderProps {
  children: ReactNode;
}

export default function IndexedDBProvider({ children }: IndexedDBProviderProps) {
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
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        <h2 className="text-lg font-bold">Database Error</h2>
        <p>Failed to initialize the database: {error.message}</p>
        <p className="mt-2">
          Please make sure your browser supports IndexedDB and that it&apos;s not blocked by privacy settings.
        </p>
      </div>
    );
  }

  if (!isInitialized) {
    return <div className="p-4">Initializing database...</div>;
  }

  return <>{children}</>;
}