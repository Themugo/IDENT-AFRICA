/**
 * Search Service
 * 
 * Core search functionality with AI-powered filtering.
 */

import { aiSearchParser } from './parser';
import {
  SearchFilters,
  SearchResult,
  SearchResponse,
  SearchFacets,
  SearchHistoryEntry,
  SavedSearch,
  PopularSearch,
  SearchSuggestion,
  SearchResultType,
  EXAMPLE_SEARCHES,
  SEARCH_PRESETS,
} from './types';

// Mock data for demonstration
const MOCK_DESTINATIONS = [
  { id: 'dest_1', name: 'Maasai Mara', country: 'Kenya', region: 'Rift Valley', price: 2500, duration: 5, rating: 4.9, activities: ['safari', 'photography'], travelStyles: ['luxury', 'adventure', 'family'], description: 'Iconic safari destination' },
  { id: 'dest_2', name: 'Serengeti', country: 'Tanzania', region: 'North', price: 3000, duration: 7, rating: 4.8, activities: ['safari'], travelStyles: ['luxury', 'adventure'], description: 'Great Migration destination' },
  { id: 'dest_3', name: 'Zanzibar', country: 'Tanzania', region: 'Coast', price: 1800, duration: 5, rating: 4.7, activities: ['beach', 'snorkeling'], travelStyles: ['romantic', 'luxury', 'family'], description: 'Tropical beach paradise' },
  { id: 'dest_4', name: 'Bwindi', country: 'Uganda', region: 'Southwest', price: 3500, duration: 6, rating: 4.9, activities: ['gorilla'], travelStyles: ['adventure', 'eco'], description: 'Mountain gorilla habitat' },
  { id: 'dest_5', name: 'Amboseli', country: 'Kenya', region: 'South', price: 2200, duration: 4, rating: 4.6, activities: ['safari', 'photography'], travelStyles: ['adventure', 'family'], description: 'Elephants with Kilimanjaro views' },
];

const MOCK_PACKAGES = [
  { id: 'pkg_1', name: 'Classic Maasai Mara Safari', destination: 'dest_1', price: 2800, duration: 5, rating: 4.8, activities: ['safari'], travelStyles: ['luxury'], accommodation: 'luxury_lodge' },
  { id: 'pkg_2', name: 'Great Migration Special', destination: 'dest_2', price: 3500, duration: 7, rating: 4.9, activities: ['safari', 'photography'], travelStyles: ['adventure'], accommodation: 'luxury_lodge' },
  { id: 'pkg_3', name: 'Zanzibar Beach Escape', destination: 'dest_3', price: 1500, duration: 5, rating: 4.7, activities: ['beach', 'snorkeling'], travelStyles: ['romantic', 'family'], accommodation: 'resort' },
  { id: 'pkg_4', name: 'Gorilla Trekking Adventure', destination: 'dest_4', price: 4000, duration: 6, rating: 4.9, activities: ['gorilla', 'hiking'], travelStyles: ['adventure', 'eco'], accommodation: 'mid_range' },
  { id: 'pkg_5', name: 'Family Safari Package', destination: 'dest_1', price: 2200, duration: 5, rating: 4.7, activities: ['safari'], travelStyles: ['family'], accommodation: 'mid_range' },
];

// Storage for history and saved searches
const searchHistory: Map<string, SearchHistoryEntry[]> = new Map();
const savedSearches: Map<string, SavedSearch[]> = new Map();
const popularSearches: PopularSearch[] = [
  { query: 'maasai mara safari', count: 1500, recentTrend: 'rising' },
  { query: 'gorilla trekking uganda', count: 1200, recentTrend: 'rising' },
  { query: 'zanzibar beach', count: 980, recentTrend: 'stable' },
  { query: 'serengeti migration', count: 850, recentTrend: 'stable' },
  { query: 'luxury safari', count: 720, recentTrend: 'declining' },
  { query: 'family safari africa', count: 650, recentTrend: 'rising' },
  { query: 'honeymoon africa', count: 580, recentTrend: 'rising' },
  { query: 'budget safari kenya', count: 520, recentTrend: 'stable' },
];

/**
 * Search Service
 */
class SearchService {
  /**
   * Perform search with AI parsing
   */
  async search(
    query: string,
    userId?: string,
    options: {
      page?: number;
      pageSize?: number;
      types?: SearchResultType[];
    } = {}
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const { page = 1, pageSize = 20, types = ['destination', 'package'] } = options;

    // Parse query with AI
    const filters = aiSearchParser.parse(query);

    // Search each type
    const allResults: SearchResult[] = [];

    if (types.includes('destination')) {
      const destResults = this.searchDestinations(filters);
      allResults.push(...destResults);
    }

    if (types.includes('package')) {
      const pkgResults = this.searchPackages(filters);
      allResults.push(...pkgResults);
    }

    // Sort by score
    allResults.sort((a, b) => b.score - a.score);

    // Paginate
    const total = allResults.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = allResults.slice(startIndex, startIndex + pageSize);

    // Generate facets
    const facets = this.generateFacets(allResults);

    // Generate suggestions
    const suggestions = aiSearchParser.suggest(query);

    // Generate related searches
    const relatedSearches = this.getRelatedSearches(query);

    // Save to history
    if (userId) {
      this.saveSearchHistory(userId, query, filters, total);
    }

    // Update popular searches
    this.updatePopularSearches(query);

    return {
      results: paginatedResults,
      total,
      page,
      pageSize,
      query,
      filters,
      processingTime: Date.now() - startTime,
      suggestions,
      relatedSearches,
      facets,
    };
  }

  /**
   * Search destinations
   */
  private searchDestinations(filters: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];

    for (const dest of MOCK_DESTINATIONS) {
      const score = this.calculateDestinationScore(dest, filters);
      
      if (score > 0.2) {
        const matchedFilters = this.getMatchedFilters(dest, filters);
        
        results.push({
          id: dest.id,
          type: 'destination',
          item: dest,
          score,
          matchedFilters,
          highlights: this.generateHighlights(dest, filters),
        });
      }
    }

    return results;
  }

  /**
   * Search packages
   */
  private searchPackages(filters: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];

    for (const pkg of MOCK_PACKAGES) {
      const score = this.calculatePackageScore(pkg, filters);
      
      if (score > 0.2) {
        const matchedFilters = this.getPackageMatchedFilters(pkg, filters);
        
        results.push({
          id: pkg.id,
          type: 'package',
          item: pkg,
          score,
          matchedFilters,
          highlights: this.generatePackageHighlights(pkg, filters),
        });
      }
    }

    return results;
  }

  /**
   * Calculate destination score
   */
  private calculateDestinationScore(dest: typeof MOCK_DESTINATIONS[0], filters: SearchFilters): number {
    let score = 0;

    // Country match
    if (filters.location?.country && dest.country.toLowerCase().includes(filters.location.country.toLowerCase())) {
      score += 0.25;
    }

    // Region match
    if (filters.location?.region && dest.region.toLowerCase().includes(filters.location.region.toLowerCase())) {
      score += 0.15;
    }

    // Budget match
    if (filters.budget) {
      if (filters.budget.max && dest.price <= filters.budget.max) {
        score += 0.2;
      } else if (filters.budget.min && dest.price >= filters.budget.min) {
        score += 0.1;
      }
    }

    // Duration match
    if (filters.duration) {
      if (filters.duration.max && dest.duration <= filters.duration.max) {
        score += 0.1;
      }
    }

    // Activity match
    if (filters.activities?.length) {
      const activityMatch = dest.activities.filter(a => 
        filters.activities!.some(fa => a.toLowerCase().includes(fa.toLowerCase()))
      ).length;
      score += (activityMatch / filters.activities.length) * 0.15;
    }

    // Travel style match
    if (filters.travelStyle?.length) {
      const styleMatch = dest.travelStyles.filter(s => 
        filters.travelStyle!.includes(s as any)
      ).length;
      score += (styleMatch / filters.travelStyle.length) * 0.1;
    }

    // Rating bonus
    score += (dest.rating / 5) * 0.05;

    return Math.min(score, 1);
  }

  /**
   * Calculate package score
   */
  private calculatePackageScore(pkg: typeof MOCK_PACKAGES[0], filters: SearchFilters): number {
    let score = 0;

    // Budget match
    if (filters.budget) {
      if (filters.budget.max && pkg.price <= filters.budget.max) {
        score += 0.25;
      } else if (filters.budget.min && pkg.price >= filters.budget.min) {
        score += 0.1;
      }
    }

    // Duration match
    if (filters.duration) {
      if (filters.duration.max && pkg.duration <= filters.duration.max) {
        score += 0.2;
      }
    }

    // Activity match
    if (filters.activities?.length) {
      const activityMatch = pkg.activities.filter(a => 
        filters.activities!.some(fa => a.toLowerCase().includes(fa.toLowerCase()))
      ).length;
      score += (activityMatch / filters.activities.length) * 0.2;
    }

    // Travel style match
    if (filters.travelStyle?.length) {
      if (pkg.travelStyles.some(s => filters.travelStyle!.includes(s as any))) {
        score += 0.15;
      }
    }

    // Group type match
    if (filters.requirements?.family && pkg.travelStyles.includes('family')) {
      score += 0.1;
    }
    if (filters.requirements?.romantic && pkg.travelStyles.includes('romantic')) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  /**
   * Get matched filters for destination
   */
  private getMatchedFilters(dest: typeof MOCK_DESTINATIONS[0], filters: SearchFilters): string[] {
    const matched: string[] = [];

    if (filters.location?.country && dest.country.toLowerCase().includes(filters.location.country.toLowerCase())) {
      matched.push('country');
    }
    if (filters.activities?.some(a => dest.activities.includes(a))) {
      matched.push('activities');
    }
    if (filters.travelStyle?.some(s => dest.travelStyles.includes(s as any))) {
      matched.push('travelStyle');
    }

    return matched;
  }

  /**
   * Get matched filters for package
   */
  private getPackageMatchedFilters(pkg: typeof MOCK_PACKAGES[0], filters: SearchFilters): string[] {
    const matched: string[] = [];

    if (filters.budget?.max && pkg.price <= filters.budget.max) {
      matched.push('budget');
    }
    if (filters.duration?.max && pkg.duration <= filters.duration.max) {
      matched.push('duration');
    }
    if (filters.activities?.some(a => pkg.activities.includes(a))) {
      matched.push('activities');
    }

    return matched;
  }

  /**
   * Generate highlights
   */
  private generateHighlights(dest: typeof MOCK_DESTINATIONS[0], filters: SearchFilters) {
    const highlights: { field: string; snippet: string }[] = [];

    if (filters.location?.country) {
      highlights.push({ field: 'country', snippet: `Located in ${dest.country}` });
    }
    if (filters.budget?.max) {
      highlights.push({ field: 'price', snippet: `From $${dest.price}` });
    }

    return highlights;
  }

  /**
   * Generate package highlights
   */
  private generatePackageHighlights(pkg: typeof MOCK_PACKAGES[0], filters: SearchFilters) {
    const highlights: { field: string; snippet: string }[] = [];

    if (filters.budget?.max && pkg.price <= filters.budget.max) {
      highlights.push({ field: 'price', snippet: `$${pkg.price} fits your budget` });
    }
    if (filters.activities?.length) {
      const matched = pkg.activities.filter(a => 
        filters.activities!.some(fa => a.toLowerCase().includes(fa.toLowerCase()))
      );
      if (matched.length > 0) {
        highlights.push({ field: 'activities', snippet: `Includes ${matched.join(', ')}` });
      }
    }

    return highlights;
  }

  /**
   * Generate facets
   */
  private generateFacets(results: SearchResult[]): SearchFacets {
    const facets: SearchFacets = {
      countries: [],
      priceRanges: [
        { min: 0, max: 1500, count: 0 },
        { min: 1500, max: 3000, count: 0 },
        { min: 3000, max: 5000, count: 0 },
        { min: 5000, max: Infinity, count: 0 },
      ],
      durations: [
        { min: 1, max: 3, count: 0 },
        { min: 4, max: 7, count: 0 },
        { min: 8, max: 14, count: 0 },
        { min: 15, max: Infinity, count: 0 },
      ],
    };

    for (const result of results) {
      const item = result.item as Record<string, unknown>;
      
      if (item.country) {
        const country = item.country as string;
        const existing = facets.countries?.find(c => c.value === country);
        if (existing) {
          existing.count++;
        } else {
          facets.countries?.push({ value: country, count: 1 });
        }
      }

      if (item.price) {
        const price = item.price as number;
        for (const range of facets.priceRanges || []) {
          if (price >= range.min && price < range.max) {
            range.count++;
            break;
          }
        }
      }

      if (item.duration) {
        const duration = item.duration as number;
        for (const range of facets.durations || []) {
          if (duration >= range.min && duration <= range.max) {
            range.count++;
            break;
          }
        }
      }
    }

    return facets;
  }

  /**
   * Get related searches
   */
  private getRelatedSearches(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    
    return popularSearches
      .filter(p => p.query.includes(lowerQuery.split(' ')[0]))
      .slice(0, 3)
      .map(p => p.query);
  }

  /**
   * Save search to history
   */
  private saveSearchHistory(userId: string, query: string, filters: SearchFilters, resultCount: number): void {
    const history = searchHistory.get(userId) || [];
    
    const entry: SearchHistoryEntry = {
      id: `history_${Date.now()}`,
      userId,
      query,
      filters,
      resultCount,
      timestamp: new Date().toISOString(),
    };

    // Keep last 50 searches
    history.unshift(entry);
    if (history.length > 50) {
      history.pop();
    }

    searchHistory.set(userId, history);
  }

  /**
   * Update popular searches
   */
  private updatePopularSearches(query: string): void {
    const existing = popularSearches.find(p => 
      p.query.toLowerCase() === query.toLowerCase()
    );

    if (existing) {
      existing.count++;
    } else {
      popularSearches.push({
        query,
        count: 1,
        recentTrend: 'rising',
      });
    }

    // Sort by count
    popularSearches.sort((a, b) => b.count - a.count);
  }

  /**
   * Get search history
   */
  async getSearchHistory(userId: string, limit = 10): Promise<SearchHistoryEntry[]> {
    const history = searchHistory.get(userId) || [];
    return history.slice(0, limit);
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(userId: string): Promise<void> {
    searchHistory.delete(userId);
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit = 10): Promise<PopularSearch[]> {
    return popularSearches.slice(0, limit);
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return savedSearches.get(userId) || [];
  }

  /**
   * Save search
   */
  async saveSearch(
    userId: string,
    name: string,
    query: string,
    filters: SearchFilters,
    options: { notifyNewResults?: boolean; notifyPriceChange?: boolean } = {}
  ): Promise<SavedSearch> {
    const searches = savedSearches.get(userId) || [];
    
    const saved: SavedSearch = {
      id: `saved_${Date.now()}`,
      userId,
      name,
      query,
      filters,
      notifyNewResults: options.notifyNewResults || false,
      notifyPriceChange: options.notifyPriceChange || false,
      createdAt: new Date().toISOString(),
    };

    searches.push(saved);
    savedSearches.set(userId, searches);

    return saved;
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(userId: string, searchId: string): Promise<void> {
    const searches = savedSearches.get(userId) || [];
    const filtered = searches.filter(s => s.id !== searchId);
    savedSearches.set(userId, filtered);
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, userId?: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    // Popular searches
    const popular = popularSearches
      .filter(p => p.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(p => ({
        text: p.query,
        type: 'popular' as const,
        icon: '🔥',
      }));
    suggestions.push(...popular);

    // Recent searches (if user logged in)
    if (userId) {
      const history = searchHistory.get(userId) || [];
      const recent = history
        .filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .map(h => ({
          text: h.query,
          type: 'recent' as const,
          icon: '🕐',
        }));
      suggestions.push(...recent);
    }

    // Example searches
    const examples = EXAMPLE_SEARCHES
      .filter(e => e.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(e => ({
        text: e.query,
        type: 'trending' as const,
        icon: e.icon || '✨',
      }));
    suggestions.push(...examples);

    return suggestions.slice(0, 8);
  }

  /**
   * Get example searches
   */
  getExampleSearches() {
    return EXAMPLE_SEARCHES;
  }

  /**
   * Get search presets
   */
  getPresets() {
    return SEARCH_PRESETS;
  }
}

export const searchService = new SearchService();
