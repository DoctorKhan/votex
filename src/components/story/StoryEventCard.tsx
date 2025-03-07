import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoryEvent } from '@/types/story';

interface StoryEventCardProps {
  event: StoryEvent;
  direction: 'left' | 'right';
}

export default function StoryEventCard({ event, direction }: StoryEventCardProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Icon based on event type
  const renderEventTypeIcon = () => {
    switch (event.type) {
      case 'milestone':
        return (
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      case 'update':
        return (
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        );
      case 'announcement':
        return (
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
            <path d="M19 4v16H5V4h14Z"></path>
            <path d="M16 4v1H8V4"></path>
            <path d="M12 7v7"></path>
            <path d="M12 17.01 12.01 17"></path>
          </svg>
        );
      case 'decision':
        return (
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
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // CSS classes based on importance
  const getImportanceClasses = () => {
    switch (event.importance) {
      case 'high':
        return 'border-l-4 border-primary';
      case 'medium':
        return 'border-l-4 border-amber-500';
      case 'low':
      default:
        return 'border-l-4 border-muted';
    }
  };

  return (
    <div 
      className={`bg-card text-card-foreground shadow-sm rounded-lg p-5 
        ${getImportanceClasses()} hover:shadow-md transition-shadow
        ${direction === 'left' ? 'text-right' : 'text-left'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`flex gap-2 items-center ${direction === 'left' ? 'flex-row-reverse' : ''}`}>
          <div className={`p-1.5 rounded-full bg-primary/10 text-primary`}>
            {renderEventTypeIcon()}
          </div>
          <h3 className="font-semibold text-lg">{event.title}</h3>
        </div>
        <time className="text-sm text-muted-foreground">
          {formatDate(event.date)}
        </time>
      </div>

      <p className="mt-2 text-muted-foreground">{event.description}</p>

      {event.imageUrl && (
        <div className="mt-4 relative w-full h-40 rounded-md overflow-hidden">
          <Image 
            src={event.imageUrl} 
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {event.links && event.links.length > 0 && (
        <div className={`mt-4 flex gap-2 ${direction === 'left' ? 'justify-end' : 'justify-start'}`}>
          {event.links.map((link, index) => (
            <Link 
              key={index}
              href={link.url}
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              {link.text}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-3 h-3 ml-1"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}