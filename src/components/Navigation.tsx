'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import AccessibilitySettings from './AccessibilitySettings';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40 shadow-sm">
      <nav className="flex items-center justify-between w-full max-w-4xl mx-auto py-3 px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-primary"
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
            </div>
            <span className="font-semibold text-lg psychedelic-text">Votex</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/initiatives"
            className={`px-3 py-2 rounded-lg transition-all ${
              pathname === '/initiatives'
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-background/80 hover:text-foreground'
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
                <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                <path d="M22 19H2"></path>
              </svg>
              <span>Initiatives</span>
            </div>
          </Link>
          
          <Link
            href="/chat"
            className={`px-3 py-2 rounded-lg transition-all ${
              pathname === '/chat'
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-background/80 hover:text-foreground'
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
          
          <Link
            href="/forum"
            className={`px-3 py-2 rounded-lg transition-all ${
              pathname === '/forum' || pathname?.startsWith('/forum/')
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-background/80 hover:text-foreground'
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
                <path d="M17 14v6m-3-3h6M6 9h6M3 5v4h4M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"></path>
              </svg>
              <span>Forum</span>
            </div>
          </Link>
          
          <Link
            href="/story"
            className={`px-3 py-2 rounded-lg transition-all ${
              pathname === '/story' || pathname?.startsWith('/story/')
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-background/80 hover:text-foreground'
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
                <path d="M18 6V4H6v2"></path>
                <path d="M6 10v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"></path>
                <path d="M12 3v15"></path>
              </svg>
              <span>Story</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 pl-1">
            <a
              href="https://github.com/DoctorKhan/votex"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-foreground/70 hover:text-foreground rounded-lg transition-colors"
              aria-label="View source code on GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <AccessibilitySettings />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}