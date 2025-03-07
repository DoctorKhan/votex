'use client';

import { useState, useEffect } from 'react';
import StoryTimeline from '@/components/story/StoryTimeline';
import { fetchStoryEvents } from '@/lib/storyService';
import { StoryEvent } from '@/types/story';
import { initializeStoryUpdater, subscribeToStoryUpdates } from '@/utils/storyUpdater';

export default function StoryPage() {
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNewUpdates, setHasNewUpdates] = useState<boolean>(false);

  useEffect(() => {
    const loadStoryEvents = async () => {
      try {
        setLoading(true);
        const events = await fetchStoryEvents();
        setStoryEvents(events);
        setError(null);
        
        // Initialize the story updater with initial events
        initializeStoryUpdater(events);
      } catch (err) {
        console.error('Error loading story events:', err);
        setError('Failed to load community story events');
      } finally {
        setLoading(false);
      }
    };

    loadStoryEvents();

    // Subscribe to story updates
    const unsubscribe = subscribeToStoryUpdates((updatedEvents: StoryEvent[]) => {
      setStoryEvents(updatedEvents);
      setHasNewUpdates(true);
      
      // Clear the notification after 5 seconds
      setTimeout(() => setHasNewUpdates(false), 5000);
    });

    return () => {
      unsubscribe(); // Clean up subscription when component unmounts
    };
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Community Story</h1>
          <p className="text-muted-foreground">
            Follow the evolving story of our community as it develops and grows
          </p>
        </div>

        {/* New updates notification */}
        {hasNewUpdates && (
          <div className="fixed top-20 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span className="font-medium">New story update available!</span>
            </div>
          </div>
        )}

        {loading && storyEvents.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={() => fetchStoryEvents().then(events => setStoryEvents(events))}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <StoryTimeline events={storyEvents} />
        )}
      </div>
    </main>
  );
}