'use client';

import { useEffect, useState } from 'react';
import { ForumThreadEntity, ForumPostEntity, ForumService } from '../../lib/forumService';
import { getUserId } from '../../lib/db';
import Link from 'next/link';
import PostItem from '../forum/PostItem';
import PostEditor from '../forum/PostEditor';

interface ThreadViewProps {
  databaseInstance: IDBDatabase;
  threadId: string;
  className?: string;
}

export default function ThreadView({ databaseInstance, threadId, className = '' }: ThreadViewProps) {
  const [thread, setThread] = useState<ForumThreadEntity | null>(null);
  const [posts, setPosts] = useState<ForumPostEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTotalPosts] = useState(0); // We store but don't directly use this value
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Current user info
  const userId = getUserId();
  const [userRole, setUserRole] = useState<'user' | 'moderator' | 'admin'>('user');

  useEffect(() => {
    const fetchUserRole = async () => {
      // In a real app, fetch this from auth system
      // For now, just use user
      setUserRole('user');
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const forumService = new ForumService(databaseInstance);
        const fetchedThread = await forumService.getThread(threadId);
        
        if (!fetchedThread) {
          setError('Thread not found');
          return;
        }
        
        setThread(fetchedThread);
        
        // Increment view count
        await forumService.viewThread(threadId);
        
        // Check if user is subscribed
        setIsSubscribed(
          fetchedThread.subscribedUsers?.includes(userId) || false
        );
      } catch (err) {
        console.error('Error fetching thread:', err);
        setError('Failed to load the thread. Please try again later.');
      }
    };

    fetchThread();
  }, [databaseInstance, threadId, userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const forumService = new ForumService(databaseInstance);
        const result = await forumService.getThreadPosts(threadId, {
          page,
          pageSize: 20,
          sortOrder: 'asc'
        });
        
        if (page === 0) {
          setPosts(result.posts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...result.posts]);
        }
        
        setTotalPosts(result.total);
        setHasMore(result.hasMore);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load thread posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [databaseInstance, threadId, page]);

  const handleReply = async (content: string) => {
    if (!thread) return;
    
    try {
      setIsSubmitting(true);
      const forumService = new ForumService(databaseInstance);
      await forumService.createPost(threadId, content, userId);
      
      // Refresh posts after posting
      const result = await forumService.getThreadPosts(threadId, {
        pageSize: posts.length + 1, // Make sure we get all current posts plus the new one
        sortOrder: 'asc'
      });
      
      setPosts(result.posts);
      setTotalPosts(result.total);
      setShowReplyEditor(false);
      
      // Auto-subscribe user after posting if not already subscribed
      if (!isSubscribed) {
        await forumService.subscribeToThread(threadId, userId);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      alert('Failed to post your reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (postId: string, emoji: string) => {
    try {
      const forumService = new ForumService(databaseInstance);
      
      // Find post
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      // Check if user already reacted with this emoji
      const hasReacted = post.reactions?.[emoji]?.includes(userId);
      
      if (hasReacted) {
        // Remove reaction
        await forumService.removeReaction(postId, userId, emoji);
      } else {
        // Add reaction
        await forumService.addReaction(postId, userId, emoji);
      }
      
      // Update local state for immediate feedback
      const updatedPosts = posts.map(p => {
        if (p.id !== postId) return p;
        
        const reactions = { ...(p.reactions || {}) };
        
        if (hasReacted) {
          // Remove user from emoji reactions
          reactions[emoji] = (reactions[emoji] || []).filter(id => id !== userId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          // Add user to emoji reactions
          reactions[emoji] = [...(reactions[emoji] || []), userId];
        }
        
        return { ...p, reactions };
      });
      
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error updating reaction:', err);
    }
  };

  const toggleSubscription = async () => {
    if (!thread) return;
    
    try {
      const forumService = new ForumService(databaseInstance);
      
      if (isSubscribed) {
        await forumService.unsubscribeFromThread(threadId, userId);
      } else {
        await forumService.subscribeToThread(threadId, userId);
      }
      
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      console.error('Error toggling subscription:', err);
    }
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (isLoading && page === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mt-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className} bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md`}>
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

  if (!thread) {
    return null;
  }

  const canReply = !thread.isLocked || userRole !== 'user';
  const showModControls = userRole === 'moderator' || userRole === 'admin';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Thread Header */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{thread.title}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Started by {thread.createdBy} on {new Date(thread.createdAt).toLocaleDateString()}
            </div>
            {thread.tags && thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {thread.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleSubscription}
              className={`px-3 py-1 rounded text-sm ${
                isSubscribed 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
            
            {showModControls && (
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded text-sm">
                  {thread.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-sm">
                  {thread.isLocked ? 'Unlock' : 'Lock'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {thread.isLocked && (
          <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded text-sm">
            This thread is locked. No new replies can be posted.
          </div>
        )}
      </div>
      
      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <PostItem
            key={post.id}
            post={post}
            isThreadStarter={index === 0}
            currentUserId={userId}
            userRole={userRole}
            onReaction={(emoji: string) => handleReaction(post.id, emoji)}
          />
        ))}
        
        {isLoading && page > 0 && (
          <div className="py-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        )}
        
        {hasMore && !isLoading && (
          <div className="pt-4 text-center">
            <button
              onClick={loadMore}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}
      </div>
      
      {/* Reply Area */}
      {canReply && (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow p-6">
          {showReplyEditor ? (
            <PostEditor
              onSubmit={handleReply}
              onCancel={() => setShowReplyEditor(false)}
              isSubmitting={isSubmitting}
              placeholder="Write your reply here..."
            />
          ) : (
            <button
              onClick={() => setShowReplyEditor(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              Click to Reply
            </button>
          )}
        </div>
      )}
      
      {/* Navigation */}
      <div className="mt-4 flex justify-between">
        <Link
          href={`/forum/category/${thread.categoryId}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to Thread List
        </Link>
        
        <Link
          href="/forum"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Forum Home
        </Link>
      </div>
    </div>
  );
}