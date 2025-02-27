'use client';

import { useState, useEffect } from 'react';

type LanguageType = 'english' | 'spanish' | 'french' | 'german' | 'chinese' | 'japanese' | 'arabic' | 'hindi' | 'russian' | 'portuguese' | 'bengali' | 'urdu';
type FontSizeType = 'small' | 'medium' | 'large' | 'x-large';

interface AccessibilitySettingsProps {
  initialLanguage?: LanguageType;
  initialFontSize?: FontSizeType;
  initialHighContrast?: boolean;
}

export default function AccessibilitySettings({ 
  initialLanguage = 'english', 
  initialFontSize = 'medium',
  initialHighContrast = false
}: AccessibilitySettingsProps) {
  const [language, setLanguage] = useState<LanguageType>(initialLanguage);
  const [fontSize, setFontSize] = useState<FontSizeType>(initialFontSize);
  const [highContrast, setHighContrast] = useState<boolean>(initialHighContrast);
  const [isOpen, setIsOpen] = useState(false);

  // Load preferences from localStorage on component mount
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

  // Save preferences to localStorage
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-background/50 hover:bg-background border border-border/30 transition-colors"
        aria-label="Accessibility and language settings"
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
          <circle cx="12" cy="12" r="10" />
          <path d="m8 12 8 0" />
          <path d="m12 8 0 8" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-background border border-border/30 z-50">
          <div className="py-2 px-3 border-b border-border/30">
            <h3 className="text-sm font-medium">Accessibility Settings</h3>
          </div>
          
          {/* Language Settings */}
          <div className="py-2 px-3 border-b border-border/30">
            <label htmlFor="language-select" className="block text-xs text-foreground/60 mb-1">Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageType)}
              className="w-full text-sm bg-background border border-border/50 rounded px-2 py-1"
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
          
          {/* Font Size Settings */}
          <div className="py-2 px-3 border-b border-border/30">
            <label htmlFor="font-size-select" className="block text-xs text-foreground/60 mb-1">Text Size:</label>
            <select
              id="font-size-select"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSizeType)}
              className="w-full text-sm bg-background border border-border/50 rounded px-2 py-1"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="x-large">Extra Large</option>
            </select>
          </div>
          
          {/* High Contrast Setting */}
          <div className="py-2 px-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="high-contrast"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="rounded border-border/50 mr-2"
              />
              <label htmlFor="high-contrast" className="text-sm">High Contrast Mode</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}