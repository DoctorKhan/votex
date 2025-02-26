import React from 'react';

interface ErrorMessageProps {
  message: string;
  suggestion?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, suggestion }) => {
  return (
    <div className="error-container" role="alert">
      <div className="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </div>
      <div className="error-content">
        <p className="error-message">{message}</p>
        {suggestion && <p className="error-suggestion">{suggestion}</p>}
      </div>
    </div>
  );
};
