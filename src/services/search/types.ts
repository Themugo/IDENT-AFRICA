/**
 * Search Types
 * 
 * Type definitions for AI-powered search functionality.
 */

// Search filters extracted from natural language
export interface SearchFilters {
  // Text query
  query: string;
  raw: string;
  
  // Location
  location?: {
    country?: string;
    region?: string;
    nearCity?: string;
    maxDistance?: number; // km
  };
  
  // Budget
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  
  // Duration
  duration?: {
    min?: number; // days
    max?: number;
  };
  
  // Travel style
  travelStyle?: TravelStyle[];
  
  // Activities
  activities?: string[];
  
  // Season/months
  season?: {
    preferred?: number[]; // 1-12
    exact?: number;
  };
  
  // Accommodation
  accommodation?: AccommodationLevel[];
  
  // Group composition
  group?: {
    type?: GroupType;
    adults?: number;
    children?: number;
    total?: number;
  };
  
  // Special requirements
  requirements?: {
    wheelchair?: boolean;
    vegetarian?: boolean;
    safari?: boolean;
    beach?: boolean;
    cultural?: boolean;
    adventure?: boolean;
    romantic?: boolean;
    family?: boolean;
    solo?: boolean;
  };
}

// Travel styles
export type TravelStyle = 
  | 'luxury'
  | 'budget'
  | 'adventure'
  | 'family'
  | 'romantic'
  | 'cultural'
  | 'eco'
  | 'solo'
  | 'safari'
  | 'backpack';

// Accommodation levels
export type AccommodationLevel =
  | 'luxury_lodge'
  | 'boutique_hotel'
  | 'mid_range'
  | 'budget'
  | 'camping'
  | 'homestay'
  | 'resort';

// Group types
export type GroupType = 
  | 'solo'
  | 'couple'
  | 'family'
  | 'friends'
  | 'group';

// Search result types
export type SearchResultType = 
  | 'destination'
  | 'package'
  | 'supplier'
  | 'experience';

// Search result
export interface SearchResult<T = Record<string, unknown>> {
  id: string;
  type: SearchResultType;
  item: T;
  
  // Relevance scoring
  score: number;
  matchedFilters: string[];
  
  // Highlights
  highlights: {
    field: string;
    snippet: string;
  }[];
}

// Search response
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  filters: SearchFilters;
  processingTime: number; // ms
  
  // Suggestions
  suggestions?: string[];
  relatedSearches?: string[];
  
  // Facets for filtering
  facets?: SearchFacets;
}

// Search facets (for filtering UI)
export interface SearchFacets {
  countries?: { value: string; count: number }[];
  regions?: { value: string; count: number }[];
  priceRanges?: { min: number; max: number; count: number }[];
  durations?: { min: number; max: number; count: number }[];
  travelStyles?: { value: string; count: number }[];
  activities?: { value: string; count: number }[];
  ratings?: { value: number; count: number }[];
}

// Search history entry
export interface SearchHistoryEntry {
  id: string;
  userId: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: string;
  clickedResults?: string[];
}

// Saved search
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  filters: SearchFilters;
  notifyNewResults: boolean;
  notifyPriceChange: boolean;
  createdAt: string;
  lastNotifiedAt?: string;
}

// Popular search
export interface PopularSearch {
  query: string;
  count: number;
  recentTrend: 'rising' | 'stable' | 'declining';
  category?: string;
}

// Search suggestion
export interface SearchSuggestion {
  text: string;
  type: 'popular' | 'recent' | 'trending' | 'autocomplete';
  icon?: string;
  category?: string;
}

// Example searches
export interface ExampleSearch {
  query: string;
  description: string;
  filters: Partial<SearchFilters>;
  icon?: string;
}

// Default examples
export const EXAMPLE_SEARCHES: ExampleSearch[] = [
  {
    query: 'luxury safari with elephants and photography',
    description: 'High-end wildlife photography experience',
    filters: { travelStyle: ['luxury'], activities: ['photography', 'safari'] },
    icon: '🦁',
  },
  {
    query: 'family beach vacation under $3000',
    description: 'Budget-friendly beach trip for families',
    filters: { budget: { max: 3000 }, requirements: { family: true, beach: true } },
    icon: '🏖️',
  },
  {
    query: 'romantic getaway Zanzibar honeymoon',
    description: 'Couples retreat on tropical island',
    filters: { travelStyle: ['romantic'], location: { country: 'Tanzania' }, requirements: { romantic: true } },
    icon: '💑',
  },
  {
    query: 'adventure 7 days Uganda gorilla trekking',
    description: 'Active mountain gorilla expedition',
    filters: { duration: { min: 5, max: 10 }, requirements: { adventure: true }, activities: ['gorilla'] },
    icon: '🦍',
  },
  {
    query: 'cultural immersion Maasai village',
    description: 'Authentic tribal cultural experience',
    filters: { travelStyle: ['cultural'], activities: ['cultural'] },
    icon: '🏕️',
  },
];

// Filter presets
export const SEARCH_PRESETS: Record<string, Partial<SearchFilters>> = {
  'last-minute': {
    season: { preferred: [1, 2, 3, 11, 12] },
    budget: { max: 2000 },
  },
  'budget-safari': {
    travelStyle: ['budget'],
    activities: ['safari'],
    budget: { max: 1500 },
  },
  'luxury-escape': {
    travelStyle: ['luxury'],
    accommodation: ['luxury_lodge'],
    budget: { min: 3000 },
  },
  'family-adventure': {
    requirements: { family: true },
    group: { type: 'family' },
  },
  'solo-travel': {
    requirements: { solo: true },
    group: { type: 'solo' },
  },
  'honeymoon': {
    requirements: { romantic: true },
    travelStyle: ['romantic'],
    accommodation: ['luxury_lodge', 'resort'],
    budget: { min: 2000 },
  },
};
