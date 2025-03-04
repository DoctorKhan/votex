'use client';

import { useState } from 'react';
import { ForumPostEntity } from '../../lib/forumService';

interface PostItemProps {
  post: ForumPostEntity;
  isThreadStarter?: boolean;
  currentUserId: string;
  userRole: 'user' | 'moderator' | 'admin';
  onReaction: (emoji: string) => Promise<void>;
}

export default function PostItem({ 
  post, 
  isThreadStarter = false, 
  currentUserId, 
  userRole, 
  onReaction 
}: PostItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  const isCurrentUserPost = post.userId === currentUserId;
  const canModerate = userRole === 'moderator' || userRole === 'admin';
  
  // Common emojis for reactions
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '👏'];
  
  // Format date
  const formattedDate = new Date(post.createdAt).toLocaleString();
  const wasEdited = post.editedAt && post.editedAt > post.createdAt;
  
  // We'll calculate reactions as we go when displaying them

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-md shadow p-6 
        ${isThreadStarter ? 'border-l-4 border-blue-500 dark:border-blue-600' : ''}
        ${post.isModeratorPost ? 'border-l-4 border-green-500 dark:border-green-600' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-sm font-bold">
                {post.username?.substring(0, 2).toUpperCase() || post.userId.substring(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
          
          <div>
            <div className="font-semibold">
              {post.username || post.userId}
              {post.isModeratorPost && (
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                  Moderator
                </span>
              )}
              {isThreadStarter && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                  Author
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
              {wasEdited && <span className="ml-2 italic">(edited)</span>}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          #{post.id.substring(0, 8)}
        </div>
      </div>
      
      <div className="mt-4 prose dark:prose-invert max-w-none">
        {post.content}
      </div>
      
      {/* Reactions */}
      <div className="mt-4 flex items-center">
        <div className="flex flex-wrap gap-1 mr-2">
          {post.reactions && Object.entries(post.reactions).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => onReaction(emoji)}
              className={`px-2 py-1 text-xs rounded-full 
                ${users.includes(currentUserId) 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
            >
              {emoji} {users.length}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <span className="text-sm">+ Add Reaction</span>
          </button>
          
          {showReactionPicker && (
            <div className="absolute z-10 mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                {commonEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReaction(emoji);
                      setShowReactionPicker(false);
                    }}
                    className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 w-8 h-8 flex items-center justify-center rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      {(isCurrentUserPost || canModerate) && (
        <div className="mt-4 flex space-x-2 text-sm">
          {isCurrentUserPost && (
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Edit
            </button>
          )}
          
          {canModerate && (
            <>
              <button className="text-amber-600 dark:text-amber-400 hover:underline">
                Moderate
              </button>
              <button className="text-red-600 dark:text-red-400 hover:underline">
                Delete
              </button>
            </>
          )}
          
          {!isCurrentUserPost && (
            <button className="text-gray-600 dark:text-gray-400 hover:underline">
              Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}