/**
 * IDENT AFRICA - Hybrid CMS Content System
 * 
 * A fallback content architecture that ensures a beautiful website
 * even without database setup, while allowing admin overrides.
 * 
 * Priority: Database > Admin Uploaded > Default Premium Content
 * 
 * Usage:
 * 
 * // Get all destinations (mix of database and default)
 * const { items, sources } = resolveDestinations();
 * 
 * // Get featured destinations only
 * const { items } = resolveDestinations({ featured: true });
 * 
 * // Get single destination by ID
 * const { item, source } = resolveDestination('dest-masai-mara');
 * 
 * // Check content stats
 * const stats = getContentStats();
 * console.log(`Database: ${stats.databaseConnected}`);
 */

// Types
export * from './types';

// Defaults
export * from './defaults';

// Resolvers
export * from './resolvers';

/**
 * Quick Access Functions
 * 
 * These provide convenience wrappers for common use cases.
 */
import { resolveDestinations, resolveHotels, resolvePackages, resolveTestimonials } from './resolvers';

// Get featured destinations for homepage
export function getFeaturedDestinations(limit = 4) {
  return resolveDestinations({ featured: true, limit });
}

// Get featured hotels for homepage
export function getFeaturedHotels(limit = 3) {
  return resolveHotels({ featured: true, limit });
}

// Get featured packages for homepage
export function getFeaturedPackages(limit = 3) {
  return resolvePackages({ featured: true, limit });
}

// Get featured testimonials
export function getFeaturedTestimonials(limit = 3) {
  return resolveTestimonials({ featured: true, limit });
}

// Get destinations by country
export function getDestinationsByCountry(country: string) {
  return resolveDestinations({ country });
}

// Get hotels by country
export function getHotelsByCountry(country: string) {
  return resolveHotels({ country });
}

// Search destinations
export function searchDestinations(query: string) {
  return resolveDestinations({ search: query });
}

// Search hotels
export function searchHotels(query: string) {
  return resolveHotels({ search: query });
}
