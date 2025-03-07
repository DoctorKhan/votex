import { StoryEvent } from '@/types/story';

// Mock data for the community story events
const mockStoryEvents: StoryEvent[] = [
  {
    id: '1',
    title: 'Community Founded',
    description: 'The Votex community was established with a mission to create a transparent, fair voting platform for collective decision-making.',
    date: '2024-01-15T00:00:00Z',
    type: 'milestone',
    importance: 'high',
    links: [
      { text: 'Read Founding Principles', url: '/initiatives' }
    ]
  },
  {
    id: '2',
    title: 'First Governance Proposal',
    description: 'Community members submitted the first governance proposal to establish voting guidelines.',
    date: '2024-02-03T00:00:00Z',
    type: 'decision',
    importance: 'medium'
  },
  {
    id: '3',
    title: 'Platform Beta Launch',
    description: 'The Votex platform was launched in beta, allowing community members to participate in preliminary voting and discussions.',
    date: '2024-02-20T00:00:00Z',
    type: 'milestone',
    importance: 'high',
    imageUrl: '/globe.svg' // Using existing SVG in public directory
  },
  {
    id: '4',
    title: 'Community Guidelines Established',
    description: 'After extensive discussion and voting, the community established its first set of guidelines for participation and governance.',
    date: '2024-03-10T00:00:00Z',
    type: 'announcement',
    importance: 'medium',
    links: [
      { text: 'View Guidelines', url: '/forum' }
    ]
  },
  {
    id: '5',
    title: 'First Community Initiative',
    description: 'The community launched its first collaborative initiative focused on platform improvement.',
    date: '2024-04-05T00:00:00Z',
    type: 'update',
    importance: 'medium'
  },
  {
    id: '6',
    title: 'Milestone: 100 Members',
    description: 'Our community reached 100 active members, a significant milestone in our growth journey.',
    date: '2024-05-01T00:00:00Z',
    type: 'milestone',
    importance: 'medium'
  }
];

/**
 * Fetches story events for the community timeline
 * Currently uses mock data, but will be connected to backend API in production
 */
export async function fetchStoryEvents(): Promise<StoryEvent[]> {
  // In a real implementation, this would call an API endpoint
  // For now, we're using mock data with a simulated delay to mimic network latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockStoryEvents].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }, 800);
  });
}

/**
 * Function to be implemented when backend is ready
 * Will add a new story event to the timeline
 */
export async function addStoryEvent(event: Omit<StoryEvent, 'id'>): Promise<StoryEvent> {
  // This is a placeholder for future implementation
  console.log('Add story event to be implemented', event);
  throw new Error('Not implemented yet');
}

/**
 * Generates a unique timestamp-based ID for story events
 */
export function generateStoryEventId(): string {
  return `story-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}