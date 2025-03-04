'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ForumService, ForumCategoryEntity } from '../../lib/forumService';

interface CategoryListProps {
  databaseInstance: IDBDatabase;
}

export default function CategoryList({ databaseInstance }: CategoryListProps) {
  const [categories, setCategories] = useState<ForumCategoryEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const forumService = new ForumService(databaseInstance);
        const allCategories = await forumService.getAllCategories();
        
        // Sort by sortOrder field
        const sortedCategories = [...allCategories].sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(sortedCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load forum categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [databaseInstance]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-md shadow p-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
        <p className="font-semibold">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-6 rounded-md text-center">
        <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
        <p>The forum has not been set up yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Categories</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/forum/category/${category.id}`}
            className="block"
          >
            <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {category.description}
                  </p>
                </div>
                <div className="flex flex-col items-end text-sm">
                  {category.threadCount !== undefined && (
                    <span className="text-gray-600 dark:text-gray-300">
                      {category.threadCount} {category.threadCount === 1 ? 'thread' : 'threads'}
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400 mt-1">
                    {category.lastActivityAt 
                      ? `Last activity: ${new Date(category.lastActivityAt).toLocaleDateString()}`
                      : 'No activity yet'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}