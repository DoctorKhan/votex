'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 bg-background/80">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-foreground/60">© {new Date().getFullYear()} Votex</span>
            <span className="text-foreground/60">•</span>
            <span className="text-sm text-foreground/60">
              <Link href="https://github.com/DoctorKhan/votex/blob/main/LICENSE" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                MIT License
              </Link>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/DoctorKhan/votex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span>Open Source on GitHub</span>
            </a>
            <a 
              href="https://github.com/DoctorKhan/votex/issues"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-foreground/60 hover:text-primary transition-colors text-sm"
            >
              Report an Issue
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}