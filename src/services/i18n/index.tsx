/**
 * i18n Service
 * 
 * Internationalization framework for IDENT AFRICA.
 * 
 * Features:
 * - Multi-language support (en, fr, de, es, ar, sw, zh)
 * - RTL support for Arabic
 * - Database localization utilities
 * - SEO-friendly URLs
 * - AI language detection
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Supported languages
export type Language = 'en' | 'fr' | 'de' | 'es' | 'ar' | 'sw' | 'zh';

// Language metadata
export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

// Language configurations
export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇬🇧' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  sw: { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', flag: '🇰🇪' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', flag: '🇨🇳' },
};

// Translations cache
const translationsCache: Record<Language, Record<string, unknown>> = {} as Record<Language, Record<string, unknown>>;

// Translation function result
export interface TranslationResult {
  text: string;
  language: Language;
}

// Context type
interface I18nContextType {
  language: Language;
  direction: 'ltr' | 'rtl';
  translations: Record<string, unknown>;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

// Context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider props
interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

// Load translations
async function loadTranslations(language: Language): Promise<Record<string, unknown>> {
  if (translationsCache[language]) {
    return translationsCache[language];
  }

  try {
    const translations = await import(`../../locales/${language}.json`);
    translationsCache[language] = translations.default || translations;
    return translationsCache[language];
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Fallback to English
    if (language !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

// Get nested value from object
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

// Interpolation helper
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() || `{{${key}}}`;
  });
}

/**
 * i18n Provider
 */
export function I18nProvider({ children, initialLanguage = 'en' }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [translations, setTranslations] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const loaded = await loadTranslations(language);
      setTranslations(loaded);
      setIsLoading(false);
    };

    load();
  }, [language]);

  // Set language and persist
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ident_language', lang);
      
      // Update document direction
      document.documentElement.dir = LANGUAGES[lang].direction;
      document.documentElement.lang = lang;
    }
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ident_language') as Language | null;
      if (saved && LANGUAGES[saved]) {
        setLanguageState(saved);
      }
    }
  }, []);

  // Translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations, key);
    
    if (value === undefined) {
      // Try English fallback
      const fallback = getNestedValue(translationsCache['en'] || {}, key);
      if (fallback !== undefined) {
        return interpolate(fallback, params);
      }
      
      // Return key as last resort
      console.warn(`Missing translation: ${key}`);
      return key;
    }

    return interpolate(value, params);
  }, [translations]);

  const value: I18nContextType = {
    language,
    direction: LANGUAGES[language].direction,
    translations,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to use i18n
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}

/**
 * Hook to get current language
 */
export function useLanguage(): Language {
  const { language } = useI18n();
  return language;
}

/**
 * Hook to get text translation
 */
export function useTranslation() {
  const { t, language } = useI18n();
  return { t, language };
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGES);
}

/**
 * Detect user language from browser
 */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0];
  
  // Match to supported language
  const langMap: Record<string, Language> = {
    en: 'en',
    fr: 'fr',
    de: 'de',
    es: 'es',
    ar: 'ar',
    sw: 'sw',
    zh: 'zh',
  };
  
  return langMap[browserLang] || 'en';
}

/**
 * Format number for locale
 */
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  const { language } = useI18n();
  return new Intl.NumberFormat(language).format(num);
}

/**
 * Format currency for locale
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const { language } = useI18n();
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const { language } = useI18n();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(language, options).format(dateObj);
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const { language } = useI18n();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

  if (diffDays > 0) return rtf.format(-diffDays, 'day');
  if (diffHours > 0) return rtf.format(-diffHours, 'hour');
  if (diffMins > 0) return rtf.format(-diffMins, 'minute');
  return rtf.format(-diffSecs, 'second');
}

// Export service
export const i18n = {
  provider: I18nProvider,
  useI18n,
  useLanguage,
  useTranslation,
  getAvailableLanguages,
  detectBrowserLanguage,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
};
