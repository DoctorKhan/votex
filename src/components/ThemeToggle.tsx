'use client';

import { useState, useEffect } from 'react';

type ThemeType = 'psychedelic' | 'light' | 'dark';

interface ThemeToggleProps {
  initialTheme?: ThemeType;
}

export default function ThemeToggle({ initialTheme = 'light' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeType>(initialTheme);

  // Apply theme class to body element
  useEffect(() => {
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('theme-psychedelic', 'theme-light', 'theme-dark');
    
    // Add the current theme class
    body.classList.add(`theme-${theme}`);
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (savedTheme && ['psychedelic', 'light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme as ThemeType);
    }
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex bg-card/50 p-1 rounded-lg border border-border/30">
        <button
          onClick={() => setTheme('psychedelic')}
          className={`px-3 py-1 rounded-md text-sm transition-all ${
            theme === 'psychedelic' 
              ? 'bg-accent text-white shadow-md pulsate-glow' 
              : 'text-foreground/70 hover:text-foreground'
          }`}
          aria-label="Switch to psychedelic theme"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg>
            <span>Psychedelic</span>
          </div>
        </button>
        
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-1 rounded-md text-sm transition-all ${
            theme === 'light' 
              ? 'bg-primary text-white shadow-md' 
              : 'text-foreground/70 hover:text-foreground'
          }`}
          aria-label="Switch to light theme"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <span>Light</span>
          </div>
        </button>
        
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-1 rounded-md text-sm transition-all ${
            theme === 'dark' 
              ? 'bg-secondary text-white shadow-md' 
              : 'text-foreground/70 hover:text-foreground'
          }`}
          aria-label="Switch to dark theme"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <span>Dark</span>
          </div>
        </button>
      </div>
    </div>
  );
}