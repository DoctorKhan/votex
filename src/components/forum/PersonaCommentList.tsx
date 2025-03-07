'use client';

import React, { useState, useEffect } from 'react';

interface PersonaComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  parentId: string | null;
  threadId: string;
}

const PersonaCommentList: React.FC = () => {
  const [comments, setComments] = useState<PersonaComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load comments from localStorage
  useEffect(() => {
    const loadComments = () => {
      try {
        const storedComments = localStorage.getItem('personaComments');
        if (storedComments) {
          setComments(JSON.parse(storedComments));
        } else {
          setComments([]);
        }
        setLoading(false);
      } catch (e) {
        console.error('Error loading comments:', e);
        setComments([]);
        setLoading(false);
      }
    };

    loadComments();

    // Listen for changes to localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'personaComments' && e.newValue) {
        setComments(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Set up a refresh interval to periodically check for new comments
    const refreshInterval = setInterval(loadComments, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(refreshInterval);
    };
  }, []);

  // Format date/time
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group comments by thread
  const commentsByThread = comments.reduce((acc, comment) => {
    if (!acc[comment.threadId]) {
      acc[comment.threadId] = [];
    }
    acc[comment.threadId].push(comment);
    return acc;
  }, {} as Record<string, PersonaComment[]>);

  // Sort threads by the most recent comment
  const sortedThreadIds = Object.keys(commentsByThread).sort((a, b) => {
    const aLatest = Math.max(...commentsByThread[a].map(c => c.createdAt));
    const bLatest = Math.max(...commentsByThread[b].map(c => c.createdAt));
    return bLatest - aLatest;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {comments.length > 0 ? (
        sortedThreadIds.map((threadId) => (
          <div 
            key={threadId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Thread {threadId.replace('thread-', '')}
            </h3>
            
            <div className="space-y-4 mt-4">
              {commentsByThread[threadId]
                .sort((a, b) => a.createdAt - b.createdAt) // Sort comments by timestamp (oldest first)
                .map((comment) => (
                  <div 
                    key={comment.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-dashed border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Comments Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No persona-generated comments available. Activate personas in the Admin Panel to generate comments.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonaCommentList;