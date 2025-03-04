'use client';

import { useState } from 'react';

interface PostEditorProps {
  initialContent?: string;
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  maxLength?: number;
  minLength?: number;
}

export default function PostEditor({
  initialContent = '',
  placeholder = 'Type your message here...',
  onSubmit,
  onCancel,
  isSubmitting = false,
  maxLength = 5000,
  minLength = 2
}: PostEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate content
    if (!content.trim()) {
      setErrorMessage('Post content cannot be empty');
      return;
    }

    if (content.trim().length < minLength) {
      setErrorMessage(`Post content must be at least ${minLength} characters`);
      return;
    }

    if (content.length > maxLength) {
      setErrorMessage(`Post content must be less than ${maxLength} characters`);
      return;
    }

    setErrorMessage(null);
    await onSubmit(content);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        placeholder={placeholder}
        rows={6}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent resize-y"
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {content.length} / {maxLength} characters
        </div>

        <div className="flex space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
          {errorMessage}
        </div>
      )}
    </div>
  );
}