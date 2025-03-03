'use client';

import { useEffect } from 'react';
import ErrorMessage from '../components/ErrorMessage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
      <div className="max-w-xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <ErrorMessage 
          message={error.message || 'An unexpected error occurred'} 
          suggestion="Please try again. If the problem persists, contact support."
          onRetry={reset}
        />
        <div className="mt-6 text-sm text-foreground/70">
          <p>Error ID: {error.digest}</p>
          <p className="mt-2">
            You can try refreshing the page or navigating back to the home page.
          </p>
          <div className="mt-4">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
