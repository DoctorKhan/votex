import React from 'react';
import { StoryEvent } from '@/types/story';
import StoryEventCard from './StoryEventCard';

interface StoryTimelineProps {
  events: StoryEvent[];
}

export default function StoryTimeline({ events }: StoryTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">
          No community events to display yet.
        </h3>
        <p className="mt-2">
          Our community story is just beginning. Check back soon for updates!
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border"></div>
      
      <div className="space-y-12">
        {events.map((event, index) => (
          <div 
            key={event.id}
            className={`relative flex items-center ${
              index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* Timeline dot */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary"></div>
            
            {/* Event card */}
            <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
              <StoryEventCard event={event} direction={index % 2 === 0 ? 'right' : 'left'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}