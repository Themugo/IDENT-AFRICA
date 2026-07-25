/**
 * Database Localization
 * 
 * Types and utilities for localized database content.
 */

import type { Language } from './index';

// Localized string type
export type LocalizedString = Partial<Record<Language, string>>;

// Localized content interface
export interface LocalizedContent {
  translations: LocalizedString;
}

// Helper to get localized value
export function getLocalizedValue(
  localized: LocalizedString | string | undefined,
  language: Language,
  fallbackLanguage = 'en'
): string {
  if (!localized) return '';
  
  if (typeof localized === 'string') return localized;
  
  // Try requested language first
  if (localized[language]) return localized[language]!;
  
  // Fall back to English
  if (localized[fallbackLanguage]) return localized[fallbackLanguage]!;
  
  // Return first available
  const values = Object.values(localized);
  return values[0] || '';
}

// Create localized string
export function createLocalizedString(
  value: string,
  languages: Language[] = ['en']
): LocalizedString {
  const localized: LocalizedString = {};
  languages.forEach(lang => {
    localized[lang] = value;
  });
  return localized;
}

// Localized destination
export interface LocalizedDestination {
  id: string;
  slug: Record<Language, string>;
  name: LocalizedString;
  description: LocalizedString;
  shortDescription: LocalizedString;
  highlights: LocalizedString[];
  country: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  bestMonths: number[];
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

// Localized package
export interface LocalizedPackage {
  id: string;
  slug: Record<Language, string>;
  destinationId: string;
  supplierId: string;
  name: LocalizedString;
  description: LocalizedString;
  shortDescription: LocalizedString;
  itinerary: LocalizedItineraryItem[];
  includes: LocalizedString[];
  excludes: LocalizedString[];
  price: number;
  currency: string;
  duration: number;
  groupSize: {
    min: number;
    max: number;
  };
  accommodation: string;
  activities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Localized itinerary item
export interface LocalizedItineraryItem {
  day: number;
  title: LocalizedString;
  description: LocalizedString;
  activities: LocalizedString[];
  accommodation?: LocalizedString;
  meals: ('breakfast' | 'lunch' | 'dinner')[];
}

// Localized SEO metadata
export interface LocalizedSEO {
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedString[];
}

// URL slug helper
export function getLocalizedSlug(
  slugs: Record<Language, string>,
  language: Language
): string {
  return slugs[language] || slugs.en || '';
}

// Create SEO-friendly slug
export function createSlug(title: string, language: Language): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate language-specific URL
export function generateLocalizedUrl(
  basePath: string,
  slug: string,
  language: Language
): string {
  const path = `/${language}/${slug}`;
  return path;
}

// Example: Destination URLs
export const DESTINATION_URLS = {
  en: {
    'maasai-mara': '/en/kenya-safari/maasai-mara',
    'serengeti': '/en/tanzania-safari/serengeti',
    'zanzibar': '/en/tanzibar-beach/zanzibar',
  },
  fr: {
    'maasai-mara': '/fr/safari-kenya/maasai-mara',
    'serengeti': '/fr/safari-tanzanie/serengeti',
    'zanzibar': '/fr/plage-tanzanie/zanzibar',
  },
  de: {
    'maasai-mara': '/de/kenia-safari/maasai-mara',
    'serengeti': '/de/tansania-safari/serengeti',
    'zanzibar': '/de/tansania-strand/zanzibar',
  },
};

// SEO metadata generator
export function generateSEO(
  title: string,
  description: string,
  url: string,
  language: Language,
  options?: {
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
  }
): {
  title: string;
  description: string;
  alternates: Record<Language, string>;
  og: {
    title: string;
    description: string;
    url: string;
    image?: string;
    type: string;
    publishedTime?: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image?: string;
  };
} {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://identafrica.com';
  
  return {
    title: `${title} | IDENT AFRICA`,
    description,
    alternates: {
      en: `${baseUrl}/en/${url}`,
      fr: `${baseUrl}/fr/${url}`,
      de: `${baseUrl}/de/${url}`,
      es: `${baseUrl}/es/${url}`,
      ar: `${baseUrl}/ar/${url}`,
      sw: `${baseUrl}/sw/${url}`,
      zh: `${baseUrl}/zh/${url}`,
    },
    og: {
      title: `${title} | IDENT AFRICA`,
      description,
      url: `${baseUrl}/${language}/${url}`,
      image: options?.image,
      type: options?.type || 'website',
      publishedTime: options?.publishedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | IDENT AFRICA`,
      description,
      image: options?.image,
    },
  };
}

// RTL utilities
export function isRTL(language: Language): boolean {
  return language === 'ar';
}

export function getTextDirection(language: Language): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

// Format for RTL languages
export function formatRTLText(text: string, direction: 'ltr' | 'rtl'): {
  text: string;
  dir: 'ltr' | 'rtl';
  className: string;
} {
  if (direction === 'rtl') {
    return {
      text: `\u202B${text}\u202C`, // Add RTL Unicode marks
      dir: 'rtl',
      className: 'font-arabic',
    };
  }
  
  return {
    text,
    dir: 'ltr',
    className: '',
  };
}
