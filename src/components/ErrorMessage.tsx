import React from 'react';

interface ErrorMessageProps {
  message: string;
  suggestion?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, suggestion, onRetry }) => {
  return (
    <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md shadow-sm flex items-start" role="alert">
      <div className="text-red-600 dark:text-red-300 mr-3 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {suggestion && <p className="mt-1 text-sm opacity-90">{suggestion}</p>}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-3 px-3 py-1 bg-red-600 dark:bg-red-700 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
