'use client';

import React, { useState, useEffect } from 'react';

// Types moved here from Settings.tsx
type LanguageType = 'english' | 'spanish' | 'french' | 'german' | 'chinese' | 'japanese' | 'arabic' | 'hindi' | 'russian' | 'portuguese' | 'bengali' | 'urdu';
type FontSizeType = 'small' | 'medium' | 'large' | 'x-large';

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

const AccessibilitySettings: React.FC = () => {
  // Accessibility settings state
  const [language, setLanguage] = useState<LanguageType>('english');
  const [fontSize, setFontSize] = useState<FontSizeType>('medium');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageType | null;
    const savedFontSize = localStorage.getItem('fontSize') as FontSizeType | null;
    const savedHighContrast = localStorage.getItem('highContrast');

    if (savedLanguage && languageNames[savedLanguage]) {
      setLanguage(savedLanguage);
    }
    if (savedFontSize && ['small', 'medium', 'large', 'x-large'].includes(savedFontSize)) {
      setFontSize(savedFontSize);
    }
    if (savedHighContrast) {
      setHighContrast(savedHighContrast === 'true');
    }
  }, []);

  // Save settings to localStorage and apply them
  useEffect(() => {
    localStorage.setItem('language', language);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('highContrast', highContrast.toString());

    // Update html lang attribute
    const langMap: Record<LanguageType, string> = {
      english: 'en', spanish: 'es', french: 'fr', german: 'de', chinese: 'zh',
      japanese: 'ja', arabic: 'ar', hindi: 'hi', russian: 'ru', portuguese: 'pt',
      bengali: 'bn', urdu: 'ur'
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

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <div>
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Language
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageType)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-primary focus:border-primary"
        >
          {Object.entries(languageNames).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select your preferred language for the interface.</p>
      </div>

      {/* Font Size Settings */}
      <div>
        <label htmlFor="font-size-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Text Size
        </label>
        <select
          id="font-size-select"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value as FontSizeType)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-primary focus:border-primary"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="x-large">Extra Large</option>
        </select>
         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Adjust the text size for better readability.</p>
      </div>

      {/* High Contrast Setting */}
      <div className="flex items-center pt-2">
        <input
          type="checkbox"
          id="high-contrast"
          checked={highContrast}
          onChange={(e) => setHighContrast(e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="high-contrast" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
          High Contrast Mode
        </label>
      </div>
       <p className="-mt-5 ml-7 text-xs text-gray-500 dark:text-gray-400">Increase text contrast for improved visibility.</p>
    </div>
  );
};

export default AccessibilitySettings;