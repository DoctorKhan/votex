'use client';

import { useEffect, useState } from 'react';
import CategoryList from '../../components/forum/CategoryList';
import { ForumService } from '../../lib/forumService';
import { setupCommunityIssues } from '../../utils/setupSampleData';

export default function ForumPage() {
  const [databaseInstance, setDatabaseInstance] = useState<IDBDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get database instance
  useEffect(() => {
    const getDatabase = () => {
      // The database instance is available through the window object
      // This is set by the IndexedDBProvider component
      const db = (window as Window & { __votexDB?: IDBDatabase }).__votexDB;
      if (db) {
        setDatabaseInstance(db);
      } else {
        setError('Database not available');
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

  // Initialize forum with default categories if none exist
  useEffect(() => {
    const initializeForum = async () => {
      if (!databaseInstance) return;

      try {
        const forumService = new ForumService(databaseInstance);
        const categories = await forumService.getAllCategories();

        // If no categories exist, create some default ones
        if (categories.length === 0) {
          const now = Date.now();

          // Create default categories
          await forumService.createCategory({
            name: 'General Discussion',
            description: 'General topics related to our voting platform',
            sortOrder: 0,
            lastActivityAt: now
          });

          await forumService.createCategory({
            name: 'Proposals',
            description: 'Discuss current and past proposals',
            sortOrder: 1,
            lastActivityAt: now
          });

          await forumService.createCategory({
            name: 'Feedback & Suggestions',
            description: 'Share your feedback and suggestions to improve the platform',
            sortOrder: 2,
            lastActivityAt: now
          });

          await forumService.createCategory({
            name: 'Technical Support',
            description: 'Get help with technical issues',
            sortOrder: 3,
            lastActivityAt: now
          });

          // Add Community Issues category
          await forumService.createCategory({
            name: 'Community Issues',
            description: 'Report and discuss community issues that need attention',
            sortOrder: 4,
            lastActivityAt: now
          });

          console.log('Created default forum categories');
        }

        // Initialize the community issues category with sample data regardless
        // of whether we just created it or it already existed
        await setupCommunityIssues(databaseInstance);

        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing forum:', err);
        setError('Failed to initialize forum. Please try again later.');
      }
    };

    initializeForum();
  }, [databaseInstance]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
          <h2 className="text-lg font-bold">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Community Discussion Board</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Join the conversation and connect with other community members.
        </p>
      </header>

      {/* Wait for database instance before rendering forum components */}
      {databaseInstance ? (
        <main>
          {isInitialized ? (
            <CategoryList databaseInstance={databaseInstance} />
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">Initializing forum...</p>
            </div>
          )}
        </main>
      ) : (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Connecting to database...</p>
        </div>
      )}
    </div>
  );
}