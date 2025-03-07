export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'update' | 'announcement' | 'decision';
  imageUrl?: string;
  links?: {
    text: string;
    url: string;
  }[];
  metadata?: Record<string, unknown>;
  importance: 'low' | 'medium' | 'high';
}