import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] py-10">
      <div className="w-16 h-16 relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-xl font-medium">Loading</h3>
        <p className="text-foreground/70 mt-1">Please wait while we prepare your content...</p>
      </div>
    </div>
  );
}
