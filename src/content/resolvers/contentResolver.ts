/**
 * Content Resolver
 * 
 * Hybrid CMS resolution system that:
 * 1. First checks database for admin content
 * 2. Falls back to default premium content
 * 3. Returns source metadata with each item
 * 
 * This ensures a beautiful website even without database setup,
 * while allowing admin overrides when connected.
 */

import type {
  ContentSource,
  ContentItem,
  ContentResolution,
  SingleItemResolution,
  ContentMetadata,
} from '../types';

// Import default content
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_DESTINATIONS,
  DEFAULT_HOTELS,
  DEFAULT_PACKAGES,
  DEFAULT_EXPERIENCES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_ADDONS,
  DEFAULT_PARTNERS,
} from '../defaults';

// Database connection status
let isDbConnected = false;
const databaseCache: Map<string, ContentItem<unknown>[]> = new Map();

/**
 * Initialize content resolver
 * Call this on app startup after database connection
 */
export function initContentResolver(dbConnected: boolean): void {
  isDbConnected = dbConnected;
  if (!dbConnected) {
    databaseCache.clear();
  }
}

/**
 * Check if database content is available
 */
export function hasDatabaseContent(key: string): boolean {
  if (!isDbConnected) return false;
  const items = databaseCache.get(key);
  return items !== undefined && items.length > 0;
}

/**
 * Create metadata for default content
 */
function createDefaultMetadata(id: string): ContentMetadata {
  return {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    isPublished: true,
  };
}

/**
 * Wrap content with source metadata
 */
function wrapWithSource<T>(data: T, source: ContentSource): ContentItem<T> {
  const id = typeof data === 'object' && data !== null && 'id' in data 
    ? (data as Record<string, unknown>).id as string 
    : `default-${Date.now()}`;
  
  return {
    id: String(id),
    source,
    data,
    metadata: createDefaultMetadata(String(id)),
  };
}

/**
 * Resolve hero content
 */
export function resolveHeroContent(): ContentItem<typeof DEFAULT_HERO_CONTENT> {
  // Check database first
  if (hasDatabaseContent('hero')) {
    const dbItems = databaseCache.get('hero') as ContentItem<typeof DEFAULT_HERO_CONTENT>[];
    if (dbItems.length > 0) {
      return dbItems[0];
    }
  }
  
  // Return default
  return wrapWithSource(DEFAULT_HERO_CONTENT, 'default');
}

/**
 * Resolve destinations
 */
export function resolveDestinations(options?: {
  country?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): ContentResolution<typeof DEFAULT_DESTINATIONS[number]> {
  const items: ContentItem<typeof DEFAULT_DESTINATIONS[number]>[] = [];
  
  // Get database items if available
  if (hasDatabaseContent('destinations')) {
    const dbItems = databaseCache.get('destinations') as ContentItem<typeof DEFAULT_DESTINATIONS[number]>[];
    items.push(...dbItems);
  }
  
  // Track database IDs for deduplication
  const dbIds = new Set(items.map(i => i.id));
  
  // Add default items not in database
  const defaultItems = DEFAULT_DESTINATIONS
    .filter(dest => !dbIds.has(dest.id))
    .map(dest => wrapWithSource(dest, 'default'));
  
  let allItems = [...items, ...defaultItems];
  
  // Apply filters
  if (options?.country) {
    allItems = allItems.filter(item => item.data.country === options.country);
  }
  
  if (options?.featured !== undefined) {
    allItems = allItems.filter(item => item.data.featured === options.featured);
  }
  
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    allItems = allItems.filter(item =>
      item.data.name.toLowerCase().includes(searchLower) ||
      item.data.tagline.toLowerCase().includes(searchLower) ||
      item.data.country.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply limit
  if (options?.limit) {
    allItems = allItems.slice(0, options.limit);
  }
  
  return {
    items: allItems,
    total: allItems.length,
    sources: {
      database: items.length,
      default: defaultItems.length,
    },
    hasDatabaseContent: hasDatabaseContent('destinations'),
  };
}

/**
 * Resolve single destination
 */
export function resolveDestination(id: string): SingleItemResolution<typeof DEFAULT_DESTINATIONS[number]> {
  // Check database first
  if (hasDatabaseContent('destinations')) {
    const dbItems = databaseCache.get('destinations') as ContentItem<typeof DEFAULT_DESTINATIONS[number]>[];
    const found = dbItems.find(item => item.id === id);
    if (found) {
      return { item: found, source: 'database', found: true };
    }
  }
  
  // Check defaults
  const defaultDest = DEFAULT_DESTINATIONS.find(dest => dest.id === id);
  if (defaultDest) {
    return {
      item: wrapWithSource(defaultDest, 'default'),
      source: 'default',
      found: true,
    };
  }
  
  return { item: null, source: 'default', found: false };
}

/**
 * Resolve hotels/lodges
 */
export function resolveHotels(options?: {
  country?: string;
  tier?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
}): ContentResolution<typeof DEFAULT_HOTELS[number]> {
  const items: ContentItem<typeof DEFAULT_HOTELS[number]>[] = [];
  
  if (hasDatabaseContent('hotels')) {
    const dbItems = databaseCache.get('hotels') as ContentItem<typeof DEFAULT_HOTELS[number]>[];
    items.push(...dbItems);
  }
  
  const dbIds = new Set(items.map(i => i.id));
  const defaultItems = DEFAULT_HOTELS
    .filter(hotel => !dbIds.has(hotel.id))
    .map(hotel => wrapWithSource(hotel, 'default'));
  
  let allItems = [...items, ...defaultItems];
  
  if (options?.country) {
    allItems = allItems.filter(item => item.data.country === options.country);
  }
  
  if (options?.tier) {
    allItems = allItems.filter(item => item.data.tier === options.tier);
  }
  
  if (options?.featured !== undefined) {
    allItems = allItems.filter(item => item.data.featured === options.featured);
  }
  
  if (options?.minPrice !== undefined) {
    allItems = allItems.filter(item => item.data.pricePerNight >= options.minPrice!);
  }
  
  if (options?.maxPrice !== undefined) {
    allItems = allItems.filter(item => item.data.pricePerNight <= options.maxPrice!);
  }
  
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    allItems = allItems.filter(item =>
      item.data.name.toLowerCase().includes(searchLower) ||
      item.data.location.toLowerCase().includes(searchLower)
    );
  }
  
  if (options?.limit) {
    allItems = allItems.slice(0, options.limit);
  }
  
  return {
    items: allItems,
    total: allItems.length,
    sources: {
      database: items.length,
      default: defaultItems.length,
    },
    hasDatabaseContent: hasDatabaseContent('hotels'),
  };
}

/**
 * Resolve single hotel
 */
export function resolveHotel(id: string): SingleItemResolution<typeof DEFAULT_HOTELS[number]> {
  if (hasDatabaseContent('hotels')) {
    const dbItems = databaseCache.get('hotels') as ContentItem<typeof DEFAULT_HOTELS[number]>[];
    const found = dbItems.find(item => item.id === id);
    if (found) {
      return { item: found, source: 'database', found: true };
    }
  }
  
  const defaultHotel = DEFAULT_HOTELS.find(hotel => hotel.id === id);
  if (defaultHotel) {
    return {
      item: wrapWithSource(defaultHotel, 'default'),
      source: 'default',
      found: true,
    };
  }
  
  return { item: null, source: 'default', found: false };
}

/**
 * Resolve safari packages/itineraries
 */
export function resolvePackages(options?: {
  country?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): ContentResolution<typeof DEFAULT_PACKAGES[number]> {
  const items: ContentItem<typeof DEFAULT_PACKAGES[number]>[] = [];
  
  if (hasDatabaseContent('packages')) {
    const dbItems = databaseCache.get('packages') as ContentItem<typeof DEFAULT_PACKAGES[number]>[];
    items.push(...dbItems);
  }
  
  const dbIds = new Set(items.map(i => i.id));
  const defaultItems = DEFAULT_PACKAGES
    .filter(pkg => !dbIds.has(pkg.id))
    .map(pkg => wrapWithSource(pkg, 'default'));
  
  let allItems = [...items, ...defaultItems];
  
  if (options?.country) {
    const countryFilter = options.country;
    allItems = allItems.filter(item => 
      item.data.countries.some(c => c === countryFilter)
    );
  }
  
  if (options?.featured !== undefined) {
    allItems = allItems.filter(item => item.data.featured === options.featured);
  }
  
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    allItems = allItems.filter(item =>
      item.data.title.toLowerCase().includes(searchLower) ||
      item.data.subtitle.toLowerCase().includes(searchLower)
    );
  }
  
  if (options?.limit) {
    allItems = allItems.slice(0, options.limit);
  }
  
  return {
    items: allItems,
    total: allItems.length,
    sources: {
      database: items.length,
      default: defaultItems.length,
    },
    hasDatabaseContent: hasDatabaseContent('packages'),
  };
}

/**
 * Resolve single package
 */
export function resolvePackage(id: string): SingleItemResolution<typeof DEFAULT_PACKAGES[number]> {
  if (hasDatabaseContent('packages')) {
    const dbItems = databaseCache.get('packages') as ContentItem<typeof DEFAULT_PACKAGES[number]>[];
    const found = dbItems.find(item => item.id === id);
    if (found) {
      return { item: found, source: 'database', found: true };
    }
  }
  
  const defaultPkg = DEFAULT_PACKAGES.find(pkg => pkg.id === id);
  if (defaultPkg) {
    return {
      item: wrapWithSource(defaultPkg, 'default'),
      source: 'default',
      found: true,
    };
  }
  
  return { item: null, source: 'default', found: false };
}

/**
 * Resolve experiences/activities
 */
export function resolveExperiences(options?: {
  category?: string;
  destinationId?: string;
  limit?: number;
}): ContentResolution<typeof DEFAULT_EXPERIENCES[number]> {
  const items: ContentItem<typeof DEFAULT_EXPERIENCES[number]>[] = [];
  
  if (hasDatabaseContent('experiences')) {
    const dbItems = databaseCache.get('experiences') as ContentItem<typeof DEFAULT_EXPERIENCES[number]>[];
    items.push(...dbItems);
  }
  
  const dbIds = new Set(items.map(i => i.id));
  const defaultItems = DEFAULT_EXPERIENCES
    .filter(exp => !dbIds.has(exp.id))
    .map(exp => wrapWithSource(exp, 'default'));
  
  let allItems = [...items, ...defaultItems];
  
  if (options?.category) {
    allItems = allItems.filter(item => item.data.category === options.category);
  }
  
  if (options?.destinationId) {
    allItems = allItems.filter(item => item.data.destinationId === options.destinationId);
  }
  
  if (options?.limit) {
    allItems = allItems.slice(0, options.limit);
  }
  
  return {
    items: allItems,
    total: allItems.length,
    sources: {
      database: items.length,
      default: defaultItems.length,
    },
    hasDatabaseContent: hasDatabaseContent('experiences'),
  };
}

/**
 * Resolve testimonials
 */
export function resolveTestimonials(options?: {
  featured?: boolean;
  limit?: number;
}): ContentResolution<typeof DEFAULT_TESTIMONIALS[number]> {
  const items: ContentItem<typeof DEFAULT_TESTIMONIALS[number]>[] = [];
  
  if (hasDatabaseContent('testimonials')) {
    const dbItems = databaseCache.get('testimonials') as ContentItem<typeof DEFAULT_TESTIMONIALS[number]>[];
    items.push(...dbItems);
  }
  
  const dbIds = new Set(items.map(i => i.id));
  const defaultItems = DEFAULT_TESTIMONIALS
    .filter(t => !dbIds.has(t.id))
    .map(t => wrapWithSource(t, 'default'));
  
  let allItems = [...items, ...defaultItems];
  
  if (options?.featured !== undefined) {
    allItems = allItems.filter(item => item.data.featured === options.featured);
  }
  
  if (options?.limit) {
    allItems = allItems.slice(0, options.limit);
  }
  
  return {
    items: allItems,
    total: allItems.length,
    sources: {
      database: items.length,
      default: defaultItems.length,
    },
    hasDatabaseContent: hasDatabaseContent('testimonials'),
  };
}

/**
 * Resolve addons
 */
export function resolveAddons(options?: {
  category?: string;
  available?: boolean;
  limit?: number;
}): ContentResolution<typeof DEFAULT_ADDONS[number]> {
  const items: ContentItem<typeof DEFAULT_ADDONS[number]>[] = [];
  
  if (hasDatabaseContent('addons')) {
    const dbItems = databaseCache.get('addons') as ContentItem<typeof DEFAULT_ADDONS[number]>[];
    items.push(...dbItems);
  }
  
  const dbIds = new Set(items.map(i => i.id));
  const defaultItems = DEFAULT_ADDONS
    .filter(addon => !dbIds.has(addon.id))
    .map(addon => wrapWithSource(addon, 'default'));
  
  let allItems = [...items, ...defaultItems];
  
  if (options?.category) {
    allItems = allItems.filter(item => item.data.category === options.category);
  }
  
  if (options?.available !== undefined) {
    allItems = allItems.filter(item => item.data.available === options.available);
  }
  
  if (options?.limit) {
    allItems = allItems.slice(0, options.limit);
  }
  
  return {
    items: allItems,
    total: allItems.length,
    sources: {
      database: items.length,
      default: defaultItems.length,
    },
    hasDatabaseContent: hasDatabaseContent('addons'),
  };
}

/**
 * Resolve partners
 */
export function resolvePartners(options?: {
  type?: string;
  tier?: string;
  featured?: boolean;
  limit?: number;
}): ContentResolution<typeof DEFAULT_PARTNERS[number]> {
  const items: ContentItem<typeof DEFAULT_PARTNERS[number]>[] = [];
  
  if (hasDatabaseContent('partners')) {
    const dbItems = databaseCache.get('partners') as ContentItem<typeof DEFAULT_PARTNERS[number]>[];
    items.push(...dbItems);
  }
  
  const dbIds = new Set(items.map(i => i.id));
  const defaultItems = DEFAULT_PARTNERS
    .filter(p => !dbIds.has(p.id))
    .map(p => wrapWithSource(p, 'default'));
  
  let allItems = [...items, ...defaultItems];
  
  if (options?.type) {
    allItems = allItems.filter(item => item.data.type === options.type);
  }
  
  if (options?.tier) {
    allItems = allItems.filter(item => item.data.tier === options.tier);
  }
  
  if (options?.featured !== undefined) {
    allItems = allItems.filter(item => item.data.featured === options.featured);
  }
  
  if (options?.limit) {
    allItems = allItems.slice(0, options.limit);
  }
  
  return {
    items: allItems,
    total: allItems.length,
    sources: {
      database: items.length,
      default: defaultItems.length,
    },
    hasDatabaseContent: hasDatabaseContent('partners'),
  };
}

/**
 * Get all content statistics
 */
export function getContentStats(): {
  databaseConnected: boolean;
  contentCounts: Record<string, { database: number; default: number }>;
} {
  const keys = ['destinations', 'hotels', 'packages', 'experiences', 'testimonials', 'addons', 'partners', 'hero'];
  const counts: Record<string, { database: number; default: number }> = {};
  
  for (const key of keys) {
    const dbItems = databaseCache.get(key);
    let defaultCount = 0;
    
    switch (key) {
      case 'destinations': defaultCount = DEFAULT_DESTINATIONS.length; break;
      case 'hotels': defaultCount = DEFAULT_HOTELS.length; break;
      case 'packages': defaultCount = DEFAULT_PACKAGES.length; break;
      case 'experiences': defaultCount = DEFAULT_EXPERIENCES.length; break;
      case 'testimonials': defaultCount = DEFAULT_TESTIMONIALS.length; break;
      case 'addons': defaultCount = DEFAULT_ADDONS.length; break;
      case 'partners': defaultCount = DEFAULT_PARTNERS.length; break;
      case 'hero': defaultCount = 1; break;
    }
    
    counts[key] = {
      database: dbItems?.length ?? 0,
      default: defaultCount,
    };
  }
  
  return {
    databaseConnected: isDbConnected,
    contentCounts: counts,
  };
}
