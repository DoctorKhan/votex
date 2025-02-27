'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

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
            <span className="font-semibold text-lg">Votex</span>
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
          
          <div className="pl-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}