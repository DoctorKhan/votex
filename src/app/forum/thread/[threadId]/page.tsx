'use client';

import { useEffect, useState } from 'react';
import ThreadView from '../../../../components/forum/ThreadView';

interface ThreadPageProps {
  params: {
    threadId: string;
  };
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const [databaseInstance, setDatabaseInstance] = useState<IDBDatabase | null>(null);

  // Get database instance
  useEffect(() => {
    const getDatabase = () => {
      const db = (window as Window & { __votexDB?: IDBDatabase }).__votexDB;
      if (db) {
        setDatabaseInstance(db);
      }
    };

    // Try to get the database
    if (typeof window !== 'undefined') {
      if ((window as Window & { __votexDB?: IDBDatabase }).__votexDB) {
        getDatabase();
      } else {
        // Database might not be initialized yet, wait for event
        const handleDBInitialized = () => {
          getDatabase();
        };
        window.addEventListener('votex-db-initialized', handleDBInitialized);
        return () => {
          window.removeEventListener('votex-db-initialized', handleDBInitialized);
        };
      }
    }
  }, []);

  if (!databaseInstance) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ThreadView 
        databaseInstance={databaseInstance} 
        threadId={params.threadId} 
      />
    </div>
  );
}