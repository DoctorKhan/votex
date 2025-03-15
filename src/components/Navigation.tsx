'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Settings from './Settings';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Simplified navigation items
  const navItems = [
    { href: "/initiatives", label: "Initiatives", icon: "M5 8h14M5 12h14M5 16h14" },
    { href: "/chat", label: "Discussion", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { href: "/forum", label: "Forum", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
    { href: "/community/metrics", label: "Metrics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ];

  // Determine if a path is active
  const isActive = (path: string) => {
    if (path === pathname) return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40 shadow-sm">
      <nav className="flex items-center justify-between w-full max-w-5xl mx-auto py-2 px-4">
        {/* Logo */}
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
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
            </svg>
          </div>
          <span className="font-semibold text-lg">Votex</span>
        </Link>
        
        {/* Mobile menu button (hidden on larger screens) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md transition-all ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/70 hover:bg-background hover:text-foreground'
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
                  <path d={item.icon}></path>
                </svg>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-background border-b ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col p-2 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md transition-all ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/70 hover:bg-background hover:text-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
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
                    <path d={item.icon}></path>
                  </svg>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right-side controls */}
        <div className="flex items-center gap-1">
          {/* Settings Component */}
          <Settings />
        </div>
      </nav>
    </div>
  );
}