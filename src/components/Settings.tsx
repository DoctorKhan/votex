'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

// Types from AccessibilitySettings
type LanguageType = 'english' | 'spanish' | 'french' | 'german' | 'chinese' | 'japanese' | 'arabic' | 'hindi' | 'russian' | 'portuguese' | 'bengali' | 'urdu';
type FontSizeType = 'small' | 'medium' | 'large' | 'x-large';

const Settings: React.FC = () => {
  // State for settings dropdown
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'accessibility' | 'appearance' | 'personas'>('accessibility');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Theme settings
  const { theme, setTheme } = useTheme();
  
  // Accessibility settings
  const [language, setLanguage] = useState<LanguageType>('english');
  const [fontSize, setFontSize] = useState<FontSizeType>('medium');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Load accessibility settings from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageType | null;
    const savedFontSize = localStorage.getItem('fontSize') as FontSizeType | null;
    const savedHighContrast = localStorage.getItem('highContrast');

    if (savedLanguage && [
      'english', 'spanish', 'french', 'german', 'chinese', 'japanese', 
      'arabic', 'hindi', 'russian', 'portuguese', 'bengali', 'urdu'
    ].includes(savedLanguage)) {
      setLanguage(savedLanguage as LanguageType);
    }

    if (savedFontSize && ['small', 'medium', 'large', 'x-large'].includes(savedFontSize)) {
      setFontSize(savedFontSize as FontSizeType);
    }

    if (savedHighContrast) {
      setHighContrast(savedHighContrast === 'true');
    }
  }, []);

  // Save accessibility settings to localStorage and apply them
  useEffect(() => {
    localStorage.setItem('language', language);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('highContrast', highContrast.toString());
    
    // Update html lang attribute
    const langMap: Record<LanguageType, string> = {
      english: 'en',
      spanish: 'es',
      french: 'fr',
      german: 'de',
      chinese: 'zh',
      japanese: 'ja',
      arabic: 'ar',
      hindi: 'hi',
      russian: 'ru',
      portuguese: 'pt',
      bengali: 'bn',
      urdu: 'ur'
    };
    
    document.documentElement.lang = langMap[language] || 'en';
    
    // Apply font size to body
    const body = document.body;
    body.classList.remove('text-small', 'text-medium', 'text-large', 'text-x-large');
    body.classList.add(`text-${fontSize}`);
    
    // Apply high contrast if enabled
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }, [language, fontSize, highContrast]);

  const languageNames: Record<LanguageType, string> = {
    english: 'English',
    spanish: 'Spanish (Español)',
    french: 'French (Français)',
    german: 'German (Deutsch)',
    chinese: 'Chinese (中文)',
    japanese: 'Japanese (日本語)',
    arabic: 'Arabic (العربية)',
    hindi: 'Hindi (हिन्दी)',
    russian: 'Russian (Русский)',
    portuguese: 'Portuguese (Português)',
    bengali: 'Bengali (বাংলা)',
    urdu: 'Urdu (اردو)'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-background/50 hover:bg-background border border-border/30 transition-colors"
        aria-label="Open settings"
        aria-expanded={isOpen}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4 text-foreground/70"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 px-4 py-2 font-medium text-xs ${
                activeTab === 'accessibility'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('accessibility')}
            >
              Accessibility
            </button>
            <button
              className={`flex-1 px-4 py-2 font-medium text-xs ${
                activeTab === 'appearance'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('appearance')}
            >
              Appearance
            </button>
            <button
              className={`flex-1 px-4 py-2 font-medium text-xs ${
                activeTab === 'personas'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('personas')}
            >
              Personas
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            {/* Accessibility Settings */}
            {activeTab === 'accessibility' && (
              <div className="p-4 space-y-4">
                {/* Language Settings */}
                <div>
                  <label htmlFor="language-select" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language:
                  </label>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageType)}
                    className="w-full p-1.5 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    {Object.entries(languageNames).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Font Size Settings */}
                <div>
                  <label htmlFor="font-size-select" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Text Size:
                  </label>
                  <select
                    id="font-size-select"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as FontSizeType)}
                    className="w-full p-1.5 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="x-large">Extra Large</option>
                  </select>
                </div>
                
                {/* High Contrast Setting */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="high-contrast"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="high-contrast" className="ml-2 text-xs">
                    High Contrast Mode
                  </label>
                </div>
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="p-4 space-y-4">
                {/* Theme Settings */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme:
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex flex-col items-center p-2 rounded-lg border ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-md mb-1 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-800">
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
                      </div>
                      <span className="text-xs font-medium">Light</span>
                    </button>
                    
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex flex-col items-center p-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-md mb-1 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-200">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium">Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Personas Settings */}
            {activeTab === 'personas' && (
              <div className="p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Configure persona settings in the full settings page.
                </div>
                <Link
                  href="/settings"
                  className="block w-full text-center px-3 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Open Persona Settings
                </Link>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Link
              href="/settings"
              className="text-xs text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Advanced Settings
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;