'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ForumService, ForumThreadEntity, ForumCategoryEntity } from '../../lib/forumService';
import SuggestedProposals from './SuggestedProposals';

interface ThreadListProps {
  databaseInstance: IDBDatabase;
  categoryId: string;
  className?: string;
}

type SortOption = 'latest' | 'oldest' | 'views' | 'posts';

export default function ThreadList({ databaseInstance, categoryId, className = '' }: ThreadListProps) {
  const [category, setCategory] = useState<ForumCategoryEntity | null>(null);
  const [threads, setThreads] = useState<ForumThreadEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const pageSize = 10;

  // Fetch category
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const forumService = new ForumService(databaseInstance);
        const fetchedCategory = await forumService.getCategory(categoryId);
        if (!fetchedCategory) {
          setError('Category not found');
          return;
        }
        setCategory(fetchedCategory);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category. Please try again later.');
      }
    };

    fetchCategory();
  }, [databaseInstance, categoryId]);

  // Fetch threads
  useEffect(() => {
    const fetchThreads = async () => {
      if (!categoryId) return;

      try {
        setIsLoading(true);
        const forumService = new ForumService(databaseInstance);
        
        // Get all threads for this category
        const fetchedThreads = await forumService.getCategoryThreads(categoryId, {
          page,
          pageSize
        });

        // Sort threads based on the selected option
        const sortedThreads = sortThreads(fetchedThreads, sortOption);
        
        // Update state
        setThreads(page === 0 ? sortedThreads : [...threads, ...sortedThreads]);
        setHasMore(sortedThreads.length === pageSize); // Assume there's more if we got a full page
        setError(null);
      } catch (err) {
        console.error('Error fetching threads:', err);
        setError('Failed to load threads. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [databaseInstance, categoryId, page, sortOption]);

  // Sort threads based on the selected option
  const sortThreads = (threadsToSort: ForumThreadEntity[], option: SortOption): ForumThreadEntity[] => {
    // Create a copy to avoid mutating the original array
    const sorted = [...threadsToSort];
    
    // First sort by pinned status (pinned threads always on top)
    sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by the selected option
      switch (option) {
        case 'latest':
          return b.lastActivityAt - a.lastActivityAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'views':
          return b.viewCount - a.viewCount;
        case 'posts':
          return b.postCount - a.postCount;
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  const handleSortChange = (option: SortOption) => {
    if (option !== sortOption) {
      setSortOption(option);
      setPage(0); // Reset to first page when changing sort
      setThreads([]); // Clear existing threads
    }
  };

  const loadMoreThreads = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (isLoading && page === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-md shadow p-4 animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md ${className}`}>
        <p className="font-semibold">{error}</p>
        <Link 
          href="/forum"
          className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Return to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category header */}
      {category && (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            </div>
            <button
              onClick={() => setShowNewThreadForm(!showNewThreadForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showNewThreadForm ? 'Cancel' : 'New Thread'}
            </button>
          </div>
          
          {/* New thread form (toggled by button) */}
          {showNewThreadForm && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              {/* Form would go here */}
              <p className="text-center text-gray-500 dark:text-gray-400">
                Thread creation form will be implemented here
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Show suggested proposals only for Community Issues category */}
      {category && category.name === 'Community Issues' && (
        <SuggestedProposals threads={threads} isLoading={isLoading && page === 0} />
      )}
      
      {/* Sorting options */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Threads</h2>
        <div className="flex space-x-2 text-sm">
          <button
            onClick={() => handleSortChange('latest')}
            className={`px-3 py-1 rounded ${
              sortOption === 'latest'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => handleSortChange('oldest')}
            className={`px-3 py-1 rounded ${
              sortOption === 'oldest'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Oldest
          </button>
          <button
            onClick={() => handleSortChange('views')}
            className={`px-3 py-1 rounded ${
              sortOption === 'views'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Most Views
          </button>
          <button
            onClick={() => handleSortChange('posts')}
            className={`px-3 py-1 rounded ${
              sortOption === 'posts'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Most Replies
          </button>
        </div>
      </div>
      
      {/* Thread list */}
      {threads.length === 0 && !isLoading ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-6 rounded-md text-center">
          <h3 className="text-lg font-semibold mb-2">No Threads Found</h3>
          <p>Be the first to start a discussion in this category!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map(thread => (
            <Link 
              key={thread.id} 
              href={`/forum/thread/${thread.id}`}
              className="block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  {/* Left side - thread indicators */}
                  <div className="flex flex-col items-center mr-4 text-center">
                    <div className="w-12 h-12 flex flex-col items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <span className="text-lg font-bold">{thread.postCount - 1}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {thread.postCount - 1 === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {thread.viewCount} {thread.viewCount === 1 ? 'view' : 'views'}
                    </div>
                  </div>
                  
                  {/* Right side - thread content */}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">
                        {thread.isPinned && (
                          <span className="mr-2 text-amber-600 dark:text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9z" />
                            </svg>
                          </span>
                        )}
                        {thread.isLocked && (
                          <span className="mr-2 text-red-600 dark:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                        {thread.title}
                      </h3>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {thread.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Started by {thread.createdBy}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Last activity: {new Date(thread.lastActivityAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {isLoading && page > 0 && (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            </div>
          )}
          
          {hasMore && !isLoading && (
            <div className="pt-4 text-center">
              <button
                onClick={loadMoreThreads}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Load More Threads
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <Link
          href="/forum"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Categories
        </Link>
      </div>
    </div>
  );
}