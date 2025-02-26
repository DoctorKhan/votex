'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="flex items-center justify-between w-full max-w-4xl mx-auto py-4 px-6">
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
            <circle cx="12" cy="12" r="4"></circle>
          </svg>
          <span className="font-medium">AI Voting App</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className={`text-sm font-medium transition-colors ${
            pathname === '/'
              ? 'text-primary'
              : 'text-foreground/70 hover:text-foreground'
          }`}
        >
          Voting
        </Link>
        
        <Link
          href="/chat"
          className={`text-sm font-medium transition-colors ${
            pathname === '/chat'
              ? 'text-primary'
              : 'text-foreground/70 hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Discussion</span>
          </div>
        </Link>
        
        <ThemeToggle />
      </div>
    </nav>
  );
}