'use client';

/**
 * Language Switcher Component
 * 
 * Dropdown language selector with flags and native names.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n, LANGUAGES, getAvailableLanguages, type Language, type LanguageConfig } from '../../services/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, direction } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES[language];
  const availableLanguages = getAvailableLanguages();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} dir={direction}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
          aria-label="Language options"
        >
          {availableLanguages.map((lang) => (
            <LanguageOption
              key={lang.code}
              language={lang}
              isSelected={lang.code === language}
              onSelect={handleSelect}
              direction={direction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Language Option Component
interface LanguageOptionProps {
  language: LanguageConfig;
  isSelected: boolean;
  onSelect: (lang: Language) => void;
  direction: 'ltr' | 'rtl';
  key?: string;
}

function LanguageOption({ language, isSelected, onSelect, direction }: LanguageOptionProps) {
  return (
    <button
      onClick={() => onSelect(language.code)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        isSelected
          ? 'bg-amber-50 text-amber-700'
          : 'text-stone-700 hover:bg-stone-50'
      } ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
      role="option"
      aria-selected={isSelected}
    >
      <span className="text-lg">{language.flag}</span>
      <span className="flex-1">{language.nativeName}</span>
      <span className="text-stone-400 text-xs">{language.name}</span>
      {isSelected && <Check className="w-4 h-4 text-amber-500" />}
    </button>
  );
}

// Compact version for mobile
export function LanguageSwitcherCompact() {
  const { language, setLanguage } = useI18n();
  const currentLanguage = LANGUAGES[language];
  const availableLanguages = getAvailableLanguages();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
      aria-label="Select language"
    >
      {availableLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  );
}

// Footer version
export function LanguageSwitcherFooter() {
  const { language, setLanguage, direction } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} dir={direction}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{LANGUAGES[language].nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-48 bg-stone-800 rounded-lg shadow-xl py-2 z-50">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                lang.code === language
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
