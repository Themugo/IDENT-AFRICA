/**
 * Search API Routes
 * AI-powered search with natural language processing
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';
import { searchService } from '../services/search/index.js';
import { aiSearchParser } from '../services/search/parser.js';
import type { SearchFilters, SearchResultType } from '../services/search/types.js';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

// Mock data for extended search
const MOCK_SUPPLIERS = [
  { id: 'sup_1', name: 'Mara Explorer Safaris', type: 'Tour Operator', country: 'Kenya', rating: 4.8, specialties: ['safari', 'photography'], priceRange: { min: 2000, max: 5000 } },
  { id: 'sup_2', name: 'Serengeti Adventures', type: 'Tour Operator', country: 'Tanzania', rating: 4.9, specialties: ['safari', 'migration'], priceRange: { min: 3000, max: 8000 } },
  { id: 'sup_3', name: 'Zanzibar Luxe Retreats', type: 'Hotel', country: 'Tanzania', rating: 4.7, specialties: ['beach', 'romantic'], priceRange: { min: 1500, max: 4000 } },
  { id: 'sup_4', name: 'Uganda Gorilla Treks', type: 'Tour Operator', country: 'Uganda', rating: 4.9, specialties: ['gorilla', 'adventure'], priceRange: { min: 3500, max: 6000 } },
];

const MOCK_EXPERIENCES = [
  { id: 'exp_1', name: 'Hot Air Balloon Safari', destination: 'Maasai Mara', price: 550, duration: 0.5, activities: ['photography', 'safari'], suitableFor: ['family', 'couple', 'solo'] },
  { id: 'exp_2', name: 'Maasai Village Visit', destination: 'Maasai Mara', price: 80, duration: 0.25, activities: ['culture'], suitableFor: ['family', 'solo', 'group'] },
  { id: 'exp_3', name: 'Gorilla Trekking', destination: 'Bwindi', price: 1500, duration: 1, activities: ['hiking', 'gorilla'], suitableFor: ['adventure', 'solo'] },
  { id: 'exp_4', name: 'Sunset Dhow Cruise', destination: 'Zanzibar', price: 120, duration: 0.5, activities: ['beach', 'snorkeling'], suitableFor: ['romantic', 'family', 'couple'] },
  { id: 'exp_5', name: 'Night Game Drive', destination: 'Serengeti', price: 200, duration: 0.5, activities: ['safari', 'photography'], suitableFor: ['adventure', 'group'] },
];

// ==================== MAIN SEARCH ====================

/**
 * POST /api/search - AI-powered natural language search
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      query: searchQuery,
      userId,
      page = 1,
      pageSize = 20,
      types = ['destination', 'package', 'supplier', 'experience'],
    } = req.body;

    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json(createResponse(
        false,
        undefined,
        'Query is required',
        'Please provide a search query'
      ));
    }

    // Parse the natural language query
    const filters = aiSearchParser.parse(searchQuery);

    // Get results based on types
    const results: any[] = [];

    if (types.includes('destination')) {
      const destResults = await searchDestinations(filters);
      results.push(...destResults);
    }

    if (types.includes('package')) {
      const pkgResults = await searchPackages(filters);
      results.push(...pkgResults);
    }

    if (types.includes('supplier')) {
      const supResults = searchSuppliers(filters);
      results.push(...supResults);
    }

    if (types.includes('experience')) {
      const expResults = searchExperiences(filters);
      results.push(...expResults);
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Paginate
    const total = results.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = results.slice(startIndex, startIndex + pageSize);

    // Generate facets
    const facets = generateFacets(results);

    // Get suggestions
    const suggestions = aiSearchParser.suggest(searchQuery);

    // Save to history
    if (userId) {
      await searchService.saveSearchHistory(userId, searchQuery, filters, total);
    }

    // Update popular searches
    await searchService.updatePopularSearches(searchQuery);

    res.status(200).json(createResponse(true, {
      results: paginatedResults,
      total,
      page,
      pageSize,
      query: searchQuery,
      filters,
      processingTime: 0,
      suggestions,
      facets,
    }));
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json(createResponse(false, undefined, 'Search failed', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/search/parse - Parse query without searching
 */
router.get('/parse', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json(createResponse(false, undefined, 'Query required'));
    }

    const filters = aiSearchParser.parse(q);

    res.status(200).json(createResponse(true, {
      query: q,
      filters,
      suggestions: aiSearchParser.suggest(q),
    }));
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json(createResponse(false, undefined, 'Parse failed'));
  }
});

// ==================== SEARCH HELPERS ====================

async function searchDestinations(filters: SearchFilters) {
  if (!isDatabaseConnected()) {
    // Use mock data
    return searchMockDestinations(filters);
  }

  try {
    let sql = 'SELECT * FROM destinations WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    // Location filters
    if (filters.location?.country) {
      sql += ` AND country ILIKE $${paramIndex++}`;
      params.push(`%${filters.location.country}%`);
    }
    if (filters.location?.region) {
      sql += ` AND region ILIKE $${paramIndex++}`;
      params.push(`%${filters.location.region}%`);
    }

    // Price filter
    if (filters.budget?.max) {
      sql += ` AND starting_price_usd <= $${paramIndex++}`;
      params.push(filters.budget.max);
    }
    if (filters.budget?.min) {
      sql += ` AND starting_price_usd >= $${paramIndex++}`;
      params.push(filters.budget.min);
    }

    // Duration filter
    if (filters.duration?.max) {
      sql += ` AND duration_days <= $${paramIndex++}`;
      params.push(filters.duration.max);
    }

    sql += ' ORDER BY rating DESC, starting_price_usd ASC';

    const result = await query(sql, params);

    return result.rows.map((dest: any) => ({
      id: dest.id,
      type: 'destination',
      item: dest,
      score: calculateDestinationScore(dest, filters),
      matchedFilters: getMatchedDestinationFilters(dest, filters),
    }));
  } catch (error) {
    console.error('Database search error:', error);
    return searchMockDestinations(filters);
  }
}

function searchMockDestinations(filters: SearchFilters) {
  const mockDestinations = [
    { id: 'dest_1', name: 'Maasai Mara', country: 'Kenya', region: 'Rift Valley', price: 2500, duration: 5, rating: 4.9, activities: ['safari', 'photography'], travelStyles: ['luxury', 'adventure', 'family'], description: 'Iconic safari destination with the Great Migration' },
    { id: 'dest_2', name: 'Serengeti', country: 'Tanzania', region: 'North', price: 3000, duration: 7, rating: 4.8, activities: ['safari', 'migration'], travelStyles: ['luxury', 'adventure'], description: 'World-famous park for wildlife and the Great Migration' },
    { id: 'dest_3', name: 'Zanzibar', country: 'Tanzania', region: 'Coast', price: 1800, duration: 5, rating: 4.7, activities: ['beach', 'snorkeling', 'swimming'], travelStyles: ['romantic', 'luxury', 'family'], description: 'Tropical beach paradise with historic Stone Town' },
    { id: 'dest_4', name: 'Bwindi', country: 'Uganda', region: 'Southwest', price: 3500, duration: 6, rating: 4.9, activities: ['gorilla', 'hiking'], travelStyles: ['adventure', 'eco'], description: 'Impenetrable forest home to mountain gorillas' },
    { id: 'dest_5', name: 'Amboseli', country: 'Kenya', region: 'South', price: 2200, duration: 4, rating: 4.6, activities: ['safari', 'photography', 'swimming'], travelStyles: ['adventure', 'family'], description: 'Stunning views of Mount Kilimanjaro and elephant herds' },
    { id: 'dest_6', name: 'Ngorongoro', country: 'Tanzania', region: 'North', price: 2800, duration: 4, rating: 4.8, activities: ['safari', 'photography'], travelStyles: ['luxury', 'adventure'], description: 'UNESCO crater with incredible wildlife viewing' },
    { id: 'dest_7', name: 'Volcanoes National Park', country: 'Rwanda', region: 'North', price: 3800, duration: 5, rating: 4.9, activities: ['gorilla', 'hiking'], travelStyles: ['adventure', 'eco'], description: 'Home to Dian Fossey and mountain gorillas' },
  ];

  return mockDestinations
    .map((dest) => ({
      id: dest.id,
      type: 'destination',
      item: dest,
      score: calculateDestinationScore(dest, filters),
      matchedFilters: getMatchedDestinationFilters(dest, filters),
    }))
    .filter((r) => r.score > 0.2);
}

async function searchPackages(filters: SearchFilters) {
  const mockPackages = [
    { id: 'pkg_1', name: 'Classic Maasai Mara Safari', destination: 'Maasai Mara', destinationId: 'dest_1', price: 2800, duration: 5, rating: 4.8, activities: ['safari'], travelStyles: ['luxury'], accommodation: 'luxury_lodge', description: '5-day luxury safari experience' },
    { id: 'pkg_2', name: 'Great Migration Special', destination: 'Serengeti', destinationId: 'dest_2', price: 3500, duration: 7, rating: 4.9, activities: ['safari', 'migration', 'photography'], travelStyles: ['adventure'], accommodation: 'luxury_lodge', description: 'Witness the Great Migration' },
    { id: 'pkg_3', name: 'Zanzibar Beach Escape', destination: 'Zanzibar', destinationId: 'dest_3', price: 1500, duration: 5, rating: 4.7, activities: ['beach', 'snorkeling', 'swimming'], travelStyles: ['romantic', 'family'], accommodation: 'resort', description: 'Tropical beach relaxation' },
    { id: 'pkg_4', name: 'Gorilla Trekking Adventure', destination: 'Bwindi', destinationId: 'dest_4', price: 4000, duration: 6, rating: 4.9, activities: ['gorilla', 'hiking'], travelStyles: ['adventure', 'eco'], accommodation: 'mid_range', description: 'Life-changing gorilla encounter' },
    { id: 'pkg_5', name: 'Family Safari Package', destination: 'Amboseli', destinationId: 'dest_5', price: 2200, duration: 5, rating: 4.7, activities: ['safari', 'swimming'], travelStyles: ['family'], accommodation: 'mid_range', description: 'Perfect for families with kids' },
    { id: 'pkg_6', name: 'Kenya Coastal Adventure', destination: 'Mombasa', destinationId: 'dest_1', price: 1900, duration: 6, rating: 4.5, activities: ['beach', 'snorkeling', 'swimming'], travelStyles: ['family', 'budget'], accommodation: 'mid_range', description: 'Beach and culture combination' },
  ];

  return mockPackages
    .map((pkg) => ({
      id: pkg.id,
      type: 'package',
      item: pkg,
      score: calculatePackageScore(pkg, filters),
      matchedFilters: getMatchedPackageFilters(pkg, filters),
    }))
    .filter((r) => r.score > 0.2);
}

function searchSuppliers(filters: SearchFilters) {
  return MOCK_SUPPLIERS
    .map((sup) => ({
      id: sup.id,
      type: 'supplier',
      item: sup,
      score: calculateSupplierScore(sup, filters),
      matchedFilters: getMatchedSupplierFilters(sup, filters),
    }))
    .filter((r) => r.score > 0.2);
}

function searchExperiences(filters: SearchFilters) {
  return MOCK_EXPERIENCES
    .map((exp) => ({
      id: exp.id,
      type: 'experience',
      item: exp,
      score: calculateExperienceScore(exp, filters),
      matchedFilters: getMatchedExperienceFilters(exp, filters),
    }))
    .filter((r) => r.score > 0.2);
}

// ==================== SCORING FUNCTIONS ====================

function calculateDestinationScore(dest: any, filters: SearchFilters): number {
  let score = 0;

  // Country match (high weight)
  if (filters.location?.country && dest.country?.toLowerCase().includes(filters.location.country.toLowerCase())) {
    score += 0.25;
  }

  // Region match
  if (filters.location?.region && dest.region?.toLowerCase().includes(filters.location.region.toLowerCase())) {
    score += 0.15;
  }

  // Budget match
  if (filters.budget?.max && dest.price <= filters.budget.max) {
    score += 0.2;
  } else if (filters.budget?.min && dest.price >= filters.budget.min) {
    score += 0.1;
  }

  // Duration match
  if (filters.duration?.max && dest.duration <= filters.duration.max) {
    score += 0.1;
  }

  // Activity match
  if (filters.activities?.length) {
    const matches = dest.activities?.filter((a: string) =>
      filters.activities!.some((fa) => a.toLowerCase().includes(fa.toLowerCase()))
    ).length || 0;
    score += (matches / filters.activities.length) * 0.15;
  }

  // Travel style match
  if (filters.travelStyle?.length) {
    const matches = dest.travelStyles?.filter((s: string) =>
      filters.travelStyle!.includes(s.toLowerCase() as any)
    ).length || 0;
    score += (matches / filters.travelStyle.length) * 0.1;
  }

  return score;
}

function calculatePackageScore(pkg: any, filters: SearchFilters): number {
  let score = 0;

  // Budget match (highest weight for packages)
  if (filters.budget?.max && pkg.price <= filters.budget.max) {
    score += 0.3;
  } else if (filters.budget?.min && pkg.price >= filters.budget.min) {
    score += 0.15;
  }

  // Duration match
  if (filters.duration?.max && pkg.duration <= filters.duration.max) {
    score += 0.2;
  }

  // Activity match
  if (filters.activities?.length) {
    const matches = pkg.activities?.filter((a: string) =>
      filters.activities!.some((fa) => a.toLowerCase().includes(fa.toLowerCase()))
    ).length || 0;
    score += (matches / filters.activities.length) * 0.2;
  }

  // Travel style match
  if (filters.travelStyle?.length) {
    const matches = pkg.travelStyles?.filter((s: string) =>
      filters.travelStyle!.includes(s.toLowerCase() as any)
    ).length || 0;
    score += (matches / filters.travelStyle.length) * 0.15;
  }

  // Accommodation match
  if (filters.accommodation?.length && pkg.accommodation) {
    if (filters.accommodation.includes(pkg.accommodation)) {
      score += 0.1;
    }
  }

  return score;
}

function calculateSupplierScore(sup: any, filters: SearchFilters): number {
  let score = 0;

  // Country match
  if (filters.location?.country && sup.country?.toLowerCase().includes(filters.location.country.toLowerCase())) {
    score += 0.25;
  }

  // Price range match
  if (filters.budget?.max && sup.priceRange?.max <= filters.budget.max) {
    score += 0.25;
  }

  // Specialties match
  if (filters.activities?.length) {
    const matches = sup.specialties?.filter((s: string) =>
      filters.activities!.some((fa) => s.toLowerCase().includes(fa.toLowerCase()))
    ).length || 0;
    score += (matches / filters.activities.length) * 0.25;
  }

  // Travel style match
  if (filters.travelStyle?.length) {
    const matches = sup.specialties?.filter((s: string) =>
      filters.travelStyle!.some((ts) => s.toLowerCase().includes(ts.toLowerCase()))
    ).length || 0;
    score += (matches / filters.travelStyle.length) * 0.15;
  }

  return score;
}

function calculateExperienceScore(exp: any, filters: SearchFilters): number {
  let score = 0;

  // Activity match
  if (filters.activities?.length) {
    const matches = exp.activities?.filter((a: string) =>
      filters.activities!.some((fa) => a.toLowerCase().includes(fa.toLowerCase()))
    ).length || 0;
    score += (matches / filters.activities.length) * 0.35;
  }

  // Budget match
  if (filters.budget?.max && exp.price <= filters.budget.max) {
    score += 0.25;
  }

  // Suitable for match
  if (filters.travelStyle?.length) {
    const styleMap: Record<string, string[]> = {
      family: ['family'],
      romantic: ['couple', 'romantic'],
      solo: ['solo'],
      adventure: ['adventure'],
    };

    let matches = 0;
    for (const style of filters.travelStyle) {
      if (styleMap[style]?.some((s) => exp.suitableFor?.includes(s))) {
        matches++;
      }
    }
    score += (matches / filters.travelStyle.length) * 0.2;
  }

  // Swimming requirement
  if (filters.activities?.includes('swimming') && exp.activities?.includes('swimming')) {
    score += 0.15;
  }

  return score;
}

// ==================== FILTER MATCHING ====================

function getMatchedDestinationFilters(dest: any, filters: SearchFilters): string[] {
  const matched: string[] = [];

  if (filters.location?.country && dest.country?.toLowerCase().includes(filters.location.country.toLowerCase())) {
    matched.push('location');
  }
  if (filters.budget?.max && dest.price <= filters.budget.max) {
    matched.push('budget');
  }
  if (filters.duration?.max && dest.duration <= filters.duration.max) {
    matched.push('duration');
  }
  if (filters.activities?.some((a) => dest.activities?.includes(a))) {
    matched.push('activities');
  }
  if (filters.travelStyle?.some((s) => dest.travelStyles?.includes(s))) {
    matched.push('travelStyle');
  }

  return matched;
}

function getMatchedPackageFilters(pkg: any, filters: SearchFilters): string[] {
  const matched: string[] = [];

  if (filters.budget?.max && pkg.price <= filters.budget.max) {
    matched.push('budget');
  }
  if (filters.duration?.max && pkg.duration <= filters.duration.max) {
    matched.push('duration');
  }
  if (filters.activities?.some((a) => pkg.activities?.includes(a))) {
    matched.push('activities');
  }
  if (filters.travelStyle?.some((s) => pkg.travelStyles?.includes(s))) {
    matched.push('travelStyle');
  }

  return matched;
}

function getMatchedSupplierFilters(sup: any, filters: SearchFilters): string[] {
  const matched: string[] = [];

  if (filters.location?.country && sup.country?.toLowerCase().includes(filters.location.country.toLowerCase())) {
    matched.push('location');
  }
  if (filters.activities?.some((a) => sup.specialties?.includes(a))) {
    matched.push('activities');
  }

  return matched;
}

function getMatchedExperienceFilters(exp: any, filters: SearchFilters): string[] {
  const matched: string[] = [];

  if (filters.activities?.some((a) => exp.activities?.includes(a))) {
    matched.push('activities');
  }
  if (filters.budget?.max && exp.price <= filters.budget.max) {
    matched.push('budget');
  }

  return matched;
}

function generateFacets(results: any[]) {
  const facets = {
    countries: [] as { value: string; count: number }[],
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
    activities: [] as { value: string; count: number }[],
    types: [] as { value: string; count: number }[],
  };

  for (const result of results) {
    const item = result.item;

    // Count by type
    const typeEntry = facets.types.find((t) => t.value === result.type);
    if (typeEntry) {
      typeEntry.count++;
    } else {
      facets.types.push({ value: result.type, count: 1 });
    }

    // Count by country
    if (item.country) {
      const country = facets.countries.find((c) => c.value === item.country);
      if (country) {
        country.count++;
      } else {
        facets.countries.push({ value: item.country, count: 1 });
      }
    }

    // Count by price range
    const price = item.price || item.priceRange?.min || 0;
    for (const range of facets.priceRanges) {
      if (price >= range.min && price < range.max) {
        range.count++;
        break;
      }
    }

    // Count by duration
    const duration = item.duration;
    if (duration) {
      for (const range of facets.durations) {
        if (duration >= range.min && duration <= range.max) {
          range.count++;
          break;
        }
      }
    }

    // Count by activities
    if (item.activities) {
      for (const activity of item.activities) {
        const existing = facets.activities.find((a) => a.value === activity);
        if (existing) {
          existing.count++;
        } else {
          facets.activities.push({ value: activity, count: 1 });
        }
      }
    }
  }

  // Sort facets by count
  facets.countries.sort((a, b) => b.count - a.count);
  facets.activities.sort((a, b) => b.count - a.count);
  facets.types.sort((a, b) => b.count - a.count);

  return facets;
}

// ==================== SUGGESTIONS ====================

/**
 * GET /api/search/suggestions - Get search suggestions
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { q, userId } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json(createResponse(false, undefined, 'Query required'));
    }

    const suggestions = await searchService.getSuggestions(q, userId as string | undefined);

    res.status(200).json(createResponse(true, suggestions));
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to get suggestions'));
  }
});

// ==================== HISTORY ====================

/**
 * GET /api/search/history - Get search history
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { userId, limit = '10' } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json(createResponse(false, undefined, 'User ID required'));
    }

    const history = await searchService.getSearchHistory(userId, parseInt(limit as string));

    res.status(200).json(createResponse(true, history));
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to get history'));
  }
});

/**
 * DELETE /api/search/history - Clear search history
 */
router.delete('/history', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(createResponse(false, undefined, 'User ID required'));
    }

    await searchService.clearSearchHistory(userId);

    res.status(200).json(createResponse(true, undefined, 'History cleared'));
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to clear history'));
  }
});

// ==================== SAVED SEARCHES ====================

/**
 * GET /api/search/saved - Get saved searches
 */
router.get('/saved', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json(createResponse(false, undefined, 'User ID required'));
    }

    const saved = await searchService.getSavedSearches(userId);

    res.status(200).json(createResponse(true, saved));
  } catch (error) {
    console.error('Saved searches error:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to get saved searches'));
  }
});

/**
 * POST /api/search/saved - Save a search
 */
router.post('/saved', async (req: Request, res: Response) => {
  try {
    const { userId, name, query, filters, notifyNewResults, notifyPriceChange } = req.body;

    if (!userId || !name || !query) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    const saved = await searchService.saveSearch(userId, name, query, filters || {}, {
      notifyNewResults,
      notifyPriceChange,
    });

    res.status(201).json(createResponse(true, saved, 'Search saved'));
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to save search'));
  }
});

/**
 * DELETE /api/search/saved/:id - Delete saved search
 */
router.delete('/saved/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(createResponse(false, undefined, 'User ID required'));
    }

    await searchService.deleteSavedSearch(userId, id);

    res.status(200).json(createResponse(true, undefined, 'Saved search deleted'));
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete saved search'));
  }
});

// ==================== POPULAR ====================

/**
 * GET /api/search/popular - Get popular searches
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const popular = await searchService.getPopularSearches(parseInt(limit as string));

    res.status(200).json(createResponse(true, popular));
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to get popular searches'));
  }
});

// ==================== EXAMPLES & PRESETS ====================

/**
 * GET /api/search/examples - Get example searches
 */
router.get('/examples', async (_req: Request, res: Response) => {
  res.status(200).json(createResponse(true, searchService.getExampleSearches()));
});

/**
 * GET /api/search/presets - Get search presets
 */
router.get('/presets', async (_req: Request, res: Response) => {
  res.status(200).json(createResponse(true, searchService.getPresets()));
});

export default router;
