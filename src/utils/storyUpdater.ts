import { StoryEvent } from '@/types/story';
import { generateStoryEventId } from '@/lib/storyService';

// Queue of upcoming story events to be added periodically
const upcomingEvents: Omit<StoryEvent, 'id'>[] = [
  {
    title: 'Community Feedback Initiative',
    description: 'Launch of our first formal feedback collection initiative to gather insights from community members.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    type: 'update',
    importance: 'medium'
  },
  {
    title: 'Governance Structure Proposal',
    description: 'A comprehensive proposal for the community governance structure was submitted for review and voting.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    type: 'decision',
    importance: 'high',
    links: [
      { text: 'View Proposal', url: '/initiatives' }
    ]
  },
  {
    title: 'Platform Feature Enhancement',
    description: 'Several new features were added to the platform based on community feedback, including improved voting analytics and user profiles.',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    type: 'milestone',
    importance: 'medium',
    imageUrl: '/window.svg'
  }
];

/**
 * Mock server-side function to add new events to the community story
 * In a real implementation, this would be connected to a database
 */
let mockStoryEventsStorage: StoryEvent[] = [];

export function initializeStoryUpdater(initialEvents: StoryEvent[]) {
  mockStoryEventsStorage = [...initialEvents];
  
  // For demo purposes, we'll set up a simulated event that adds a new story event
  // every few minutes to demonstrate the auto-updating feature
  
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    console.log('Initializing story updater...');
    
    // Set up periodic updates every 2-5 minutes (random)
    const scheduleNextUpdate = () => {
      const minutesDelay = Math.floor(Math.random() * 3) + 2; // 2-5 minutes
      const msDelay = minutesDelay * 60 * 1000;
      
      console.log(`Next story update scheduled in ${minutesDelay} minutes`);
      
      setTimeout(() => {
        addRandomStoryEvent();
        // Schedule next update
        scheduleNextUpdate();
      }, msDelay);
    };
    
    // Start the update cycle
    scheduleNextUpdate();
  }
}

/**
 * Add a new random story event from the queue
 */
function addRandomStoryEvent() {
  if (upcomingEvents.length === 0) {
    console.log('No more upcoming events to add');
    return;
  }
  
  // Get a random event from the queue and remove it
  const randomIndex = Math.floor(Math.random() * upcomingEvents.length);
  const eventData = upcomingEvents.splice(randomIndex, 1)[0];
  
  // Set the date to current time for demonstration purposes
  const now = new Date();
  const eventWithCurrentDate = {
    ...eventData,
    date: now.toISOString()
  };
  
  // Create new event with ID
  const newEvent: StoryEvent = {
    id: generateStoryEventId(),
    ...eventWithCurrentDate
  };
  
  // Add to mock storage
  mockStoryEventsStorage.unshift(newEvent);
  
  // Dispatch custom event to notify components
  if (typeof window !== 'undefined') {
    const updateEvent = new CustomEvent('storyUpdated', { 
      detail: { newEvent, allEvents: [...mockStoryEventsStorage] } 
    });
    window.dispatchEvent(updateEvent);
    
    // Also show a notification
    showStoryNotification(newEvent);
  }
  
  console.log('Added new story event:', newEvent.title);
}

/**
 * Show a browser notification for a new story event
 */
function showStoryNotification(event: StoryEvent) {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    // Check if browser supports notifications
    if (Notification.permission === 'granted') {
      new Notification('Community Story Update', {
        body: event.title,
        icon: '/globe.svg'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Community Story Update', {
            body: event.title,
            icon: '/globe.svg'
          });
        }
      });
    }
  }
}

/**
 * Get all story events from mock storage
 */
export function getAllStoryEvents(): StoryEvent[] {
  return [...mockStoryEventsStorage].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Subscribe to story update events
 */
export function subscribeToStoryUpdates(callback: (events: StoryEvent[]) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // Server-side, return no-op
  }
  
  const handleUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail.allEvents);
  };
  
  window.addEventListener('storyUpdated', handleUpdate);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('storyUpdated', handleUpdate);
  };
}