'use client';

/**
 * AI Travel Search Page
 * 
 * Full-featured search page with natural language processing,
 * search history, saved searches, and popular searches.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Sparkles,
  Clock,
  Bookmark,
  TrendingUp,
  Filter,
  MapPin,
  Star,
  Calendar,
  Users,
  Grid,
  List,
  Mic,
  Loader2,
  Map,
  Package,
  Building2,
  Sparkle,
} from 'lucide-react';
import type { SearchFilters, SearchResult, SearchSuggestion, PopularSearch, SearchHistoryEntry, SavedSearch } from '../../services/search/types';

// Example searches for inspiration
const EXAMPLE_SEARCHES = [
  { query: 'family safari near Nairobi with swimming pool', icon: '👨‍👩‍👧‍👦', description: 'Family-friendly safari with amenities' },
  { query: 'luxury honeymoon in Zanzibar under $5000', icon: '💑', description: 'Romantic beach getaway' },
  { query: 'adventure gorilla trekking Uganda 7 days', icon: '🦍', description: 'Active mountain gorilla expedition' },
  { query: 'budget safari Kenya under $2000', icon: '💰', description: 'Affordable wildlife experience' },
];

interface SearchPageProps {
  onResultClick?: (result: SearchResult) => void;
  userId?: string;
}

export function SearchPage({ onResultClick, userId }: SearchPageProps) {
  // State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'results' | 'history' | 'saved'>('results');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<SearchFilters | null>(null);

  // Load initial data
  useEffect(() => {
    loadPopularSearches();
    if (userId) {
      loadSearchHistory();
      loadSavedSearches();
    }
  }, [userId]);

  // Get suggestions as user types
  useEffect(() => {
    if (query.length > 2) {
      getSuggestions(query);
      // Parse query in real-time
      parseQuery(query);
    } else {
      setSuggestions([]);
      setParsedFilters(null);
    }
  }, [query]);

  const loadPopularSearches = async () => {
    try {
      const res = await fetch('/api/search/popular?limit=8');
      const data = await res.json();
      if (data.success) {
        setPopularSearches(data.data);
      }
    } catch (err) {
      console.error('Failed to load popular searches');
    }
  };

  const loadSearchHistory = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/search/history?userId=${userId}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setSearchHistory(data.data);
      }
    } catch (err) {
      console.error('Failed to load history');
    }
  };

  const loadSavedSearches = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/search/saved?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setSavedSearches(data.data);
      }
    } catch (err) {
      console.error('Failed to load saved searches');
    }
  };

  const parseQuery = async (q: string) => {
    try {
      const res = await fetch(`/api/search/parse?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setParsedFilters(data.data.filters);
      }
    } catch (err) {
      console.error('Failed to parse query');
    }
  };

  const getSuggestions = async (q: string) => {
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}${userId ? `&userId=${userId}` : ''}`);
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (err) {
      console.error('Failed to get suggestions');
    }
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          userId,
          page: 1,
          types: ['destination', 'package', 'supplier', 'experience'],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.data.results);
        setFilters(data.data.filters);
        setTotal(data.data.total);
        setPage(1);
        setQuery(searchQuery);
        
        // Refresh history
        if (userId) {
          loadSearchHistory();
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoading(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          userId,
          page: nextPage,
          types: ['destination', 'package', 'supplier', 'experience'],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults([...results, ...data.data.results]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!userId || !filters) return;

    const name = prompt('Name for this search:');
    if (!name) return;

    try {
      await fetch('/api/search/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          query,
          filters,
          notifyNewResults: false,
          notifyPriceChange: false,
        }),
      });
      loadSavedSearches();
    } catch (err) {
      console.error('Failed to save search');
    }
  };

  const handleDeleteSaved = async (searchId: string) => {
    if (!userId) return;

    try {
      await fetch(`/api/search/saved/${searchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      loadSavedSearches();
    } catch (err) {
      console.error('Failed to delete saved search');
    }
  };

  const handleClearHistory = async () => {
    if (!userId) return;

    try {
      await fetch('/api/search/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setSearchHistory([]);
    } catch (err) {
      console.error('Failed to clear history');
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'destination': return <MapPin className="w-5 h-5" />;
      case 'package': return <Package className="w-5 h-5" />;
      case 'supplier': return <Building2 className="w-5 h-5" />;
      case 'experience': return <Sparkle className="w-5 h-5" />;
      default: return <Map className="w-5 h-5" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'destination': return 'bg-emerald-100 text-emerald-600';
      case 'package': return 'bg-amber-100 text-amber-600';
      case 'supplier': return 'bg-blue-100 text-blue-600';
      case 'experience': return 'bg-purple-100 text-purple-600';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1512]">
      {/* Hero Search Section */}
      <div className="relative bg-gradient-to-b from-[#2E2015] to-[#1A1512] pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C89A4B]/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#C89A4B]" />
              <span className="text-sm text-[#C89A4B] font-medium">AI-Powered Search</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-[#D6B06A] mb-3">
              Find Your Perfect Safari
            </h1>
            <p className="text-[#D3C5AE]">
              Search naturally: "family safari near Nairobi with swimming pool"
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative">
              <div className={`flex items-center bg-[#2E2015] border-2 rounded-xl overflow-hidden transition-all ${
                showSuggestions ? 'border-[#C89A4B] rounded-b-none' : 'border-[#C89A4B]/30'
              }`}>
                <Search className="w-6 h-6 text-[#C89A4B] ml-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search destinations, packages, experiences..."
                  className="flex-1 px-4 py-4 bg-transparent text-[#F4E8D5] placeholder-[#8B7355] outline-none text-lg"
                />
                <button
                  type="button"
                  className="p-3 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                  title="Voice search"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="px-6 py-4 bg-[#C89A4B] text-[#2E2015] font-bold hover:bg-[#D6B06A] transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-[#2E2015] border-2 border-t-0 border-[#C89A4B] rounded-b-xl z-50 max-h-96 overflow-y-auto">
                  {/* Parsed Filters Preview */}
                  {parsedFilters && Object.keys(parsedFilters).length > 2 && (
                    <div className="p-3 border-b border-[#C89A4B]/20">
                      <p className="text-xs text-[#8B7355] mb-2">Detected filters:</p>
                      <div className="flex flex-wrap gap-2">
                        {parsedFilters.location?.country && (
                          <span className="px-2 py-1 bg-[#3D2B1F] text-[#D6B06A] text-xs rounded-full">
                            📍 {parsedFilters.location.country}
                          </span>
                        )}
                        {parsedFilters.budget?.max && (
                          <span className="px-2 py-1 bg-[#3D2B1F] text-[#D6B06A] text-xs rounded-full">
                            💰 Under ${parsedFilters.budget.max}
                          </span>
                        )}
                        {parsedFilters.duration?.max && (
                          <span className="px-2 py-1 bg-[#3D2B1F] text-[#D6B06A] text-xs rounded-full">
                            📅 {parsedFilters.duration.max} days
                          </span>
                        )}
                        {parsedFilters.travelStyle?.map(s => (
                          <span key={s} className="px-2 py-1 bg-[#3D2B1F] text-[#D6B06A] text-xs rounded-full capitalize">
                            {s}
                          </span>
                        ))}
                        {parsedFilters.activities?.map(a => (
                          <span key={a} className="px-2 py-1 bg-[#3D2B1F] text-[#D6B06A] text-xs rounded-full capitalize">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="p-3">
                      <p className="text-xs text-[#8B7355] mb-2">Suggestions</p>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(s.text)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-[#3D2B1F] rounded-lg text-left"
                        >
                          {s.type === 'popular' && <TrendingUp className="w-4 h-4 text-[#C89A4B]" />}
                          {s.type === 'recent' && <Clock className="w-4 h-4 text-[#8B7355]" />}
                          {s.type === 'trending' && <Sparkles className="w-4 h-4 text-purple-400" />}
                          <span className="text-[#F4E8D5] text-sm">{s.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Example Searches */}
                  <div className="p-3 border-t border-[#C89A4B]/20">
                    <p className="text-xs text-[#8B7355] mb-2">Try asking</p>
                    <div className="space-y-2">
                      {EXAMPLE_SEARCHES.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(ex.query)}
                          className="w-full flex items-center gap-3 p-3 bg-[#3D2B1F]/50 hover:bg-[#3D2B1F] rounded-lg text-left transition-colors"
                        >
                          <span className="text-xl">{ex.icon}</span>
                          <div>
                            <p className="text-[#F4E8D5] text-sm">{ex.query}</p>
                            <p className="text-[#8B7355] text-xs">{ex.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Tabs */}
            <div className="bg-[#2E2015] rounded-xl border border-[#C89A4B]/20 overflow-hidden">
              <div className="flex border-b border-[#C89A4B]/20">
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'results' ? 'bg-[#C89A4B]/20 text-[#C89A4B]' : 'text-[#8B7355] hover:text-[#D6B06A]'
                  }`}
                >
                  Results
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'history' ? 'bg-[#C89A4B]/20 text-[#C89A4B]' : 'text-[#8B7355] hover:text-[#D6B06A]'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  History
                </button>
              </div>
              <div className="p-4">
                {activeTab === 'history' ? (
                  <HistoryPanel
                    history={searchHistory}
                    onSearch={handleSearch}
                    onClear={handleClearHistory}
                  />
                ) : (
                  <FiltersPanel filters={filters} onFiltersChange={setFilters} />
                )}
              </div>
            </div>

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div className="bg-[#2E2015] rounded-xl border border-[#C89A4B]/20 p-4">
                <h3 className="text-sm font-bold text-[#D6B06A] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Popular Searches
                </h3>
                <div className="space-y-2">
                  {popularSearches.slice(0, 6).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(p.query)}
                      className="w-full flex items-center justify-between p-2 hover:bg-[#3D2B1F] rounded-lg text-left"
                    >
                      <span className="text-[#F4E8D5] text-sm truncate">{p.query}</span>
                      {p.recentTrend === 'rising' && (
                        <span className="text-emerald-400 text-xs">↑</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            {results.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#D6B06A]">
                    {total} results for "{query}"
                  </h2>
                  {filters && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {parsedFilters?.location?.country && (
                        <span className="px-2 py-1 bg-[#C89A4B]/20 text-[#D6B06A] text-xs rounded-full">
                          {parsedFilters.location.country}
                        </span>
                      )}
                      {parsedFilters?.travelStyle?.map(s => (
                        <span key={s} className="px-2 py-1 bg-[#C89A4B]/20 text-[#D6B06A] text-xs rounded-full capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveSearch}
                    className="flex items-center gap-2 px-3 py-2 bg-[#2E2015] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] text-sm hover:bg-[#3D2B1F] transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#2E2015] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] text-sm hover:bg-[#3D2B1F] transition-colors lg:hidden"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <div className="flex border border-[#C89A4B]/30 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-[#C89A4B] text-[#2E2015]' : 'bg-[#2E2015] text-[#8B7355] hover:text-[#D6B06A]'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-[#C89A4B] text-[#2E2015]' : 'bg-[#2E2015] text-[#8B7355] hover:text-[#D6B06A]'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {isLoading && results.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-[#2E2015] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-[#C89A4B]/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#D6B06A] mb-2">
                  Start your search
                </h3>
                <p className="text-[#8B7355]">
                  Enter a natural language query like<br />
                  <span className="text-[#C89A4B]">"family safari near Nairobi with swimming pool"</span>
                </p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-4'
                }>
                  {results.map((result) => (
                    <ResultCard
                      key={`${result.id}-${result.type}`}
                      result={result}
                      viewMode={viewMode}
                      getResultIcon={getResultIcon}
                      getResultColor={getResultColor}
                      onClick={() => onResultClick?.(result)}
                    />
                  ))}
                </div>

                {/* Load More */}
                {results.length < total && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="px-8 py-3 bg-[#C89A4B] text-[#2E2015] font-bold rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        `Load More (${total - results.length} remaining)`
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Result Card Component
function ResultCard({
  result,
  viewMode,
  getResultIcon,
  getResultColor,
  onClick,
  ..._props
}: {
  result: SearchResult;
  viewMode: 'grid' | 'list';
  getResultIcon: (type: string) => React.ReactNode;
  getResultColor: (type: string) => string;
  onClick: () => void;
} & Record<string, unknown>) {
  const item = result.item as any;
  const name = item.name || item.title || 'Unknown';
  const description = item.description || '';
  const country = item.country || item.destination || '';
  const price = item.price || item.priceRange?.min;
  const rating = item.rating;
  const duration = item.duration;

  const matchPercent = Math.round(result.score * 100);

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="flex gap-4 p-4 bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl hover:border-[#C89A4B]/50 hover:shadow-lg transition-all cursor-pointer"
      >
        <div className="w-32 h-24 bg-gradient-to-br from-[#3D2B1F] to-[#4B321F] rounded-lg flex-shrink-0 flex items-center justify-center">
          {getResultIcon(result.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getResultColor(result.type)}`}>
                  {getResultIcon(result.type)}
                  <span className="capitalize">{result.type}</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                  {matchPercent}% match
                </span>
              </div>
              <h3 className="font-bold text-[#D6B06A]">{name}</h3>
              <p className="text-sm text-[#8B7355] flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {country}
              </p>
            </div>
            {price && (
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-[#D6B06A]">${price.toLocaleString()}</p>
                <p className="text-xs text-[#8B7355]">per person</p>
              </div>
            )}
          </div>
          <p className="text-sm text-[#D3C5AE] mt-2 line-clamp-2">{description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-[#8B7355]">
            {rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {rating}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {duration} days
              </span>
            )}
            {item.travelStyles && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {item.travelStyles.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden hover:border-[#C89A4B]/50 hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="relative h-40 bg-gradient-to-br from-[#3D2B1F] to-[#4B321F]">
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getResultColor(result.type)}`}>
            {getResultIcon(result.type)}
            <span className="capitalize">{result.type}</span>
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-[#C89A4B] text-[#2E2015] text-xs font-bold px-2 py-1 rounded-full">
          {matchPercent}% match
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-[#D6B06A]">
          <MapPin className="w-4 h-4" />
          {country}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[#D6B06A] mb-1 group-hover:text-[#C89A4B] transition-colors">{name}</h3>
        <p className="text-sm text-[#8B7355] line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-[#8B7355]">
            {rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {rating}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {duration}d
              </span>
            )}
          </div>
          {price && (
            <span className="text-lg font-bold text-[#C89A4B]">${price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// History Panel Component
function HistoryPanel({
  history,
  onSearch,
  onClear,
}: {
  history: SearchHistoryEntry[];
  onSearch: (query: string) => void;
  onClear: () => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-[#C89A4B]/40 mx-auto mb-2" />
        <p className="text-[#8B7355] text-sm">No recent searches</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#8B7355]">{history.length} searches</span>
        <button onClick={onClear} className="text-xs text-[#8B7355] hover:text-red-400">
          Clear all
        </button>
      </div>
      <div className="space-y-2">
        {history.map((h) => (
          <button
            key={h.id}
            onClick={() => onSearch(h.query)}
            className="w-full flex items-center gap-3 p-2 hover:bg-[#3D2B1F] rounded-lg text-left"
          >
            <Clock className="w-4 h-4 text-[#8B7355]" />
            <div className="flex-1 min-w-0">
              <p className="text-[#F4E8D5] text-sm truncate">{h.query}</p>
              <p className="text-[#8B7355] text-xs">{h.resultCount} results</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Filters Panel Component
function FiltersPanel({
  filters,
  onFiltersChange,
}: {
  filters: SearchFilters | null;
  onFiltersChange: (filters: SearchFilters | null) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[#D6B06A] flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Active Filters
      </h3>
      
      {filters && Object.keys(filters).length > 2 ? (
        <div className="space-y-3">
          {filters.location?.country && (
            <FilterChip label={`📍 ${filters.location.country}`} />
          )}
          {filters.budget?.max && (
            <FilterChip label={`💰 Under $${filters.budget.max}`} />
          )}
          {filters.duration?.max && (
            <FilterChip label={`📅 ${filters.duration.max} days`} />
          )}
          {filters.travelStyle?.map(s => (
            <FilterChip key={s} label={s} />
          ))}
          {filters.activities?.map(a => (
            <FilterChip key={a} label={a} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#8B7355]">
          Search to see detected filters
        </p>
      )}

      {/* Filter Options */}
      <div className="border-t border-[#C89A4B]/20 pt-4 mt-4">
        <p className="text-xs text-[#8B7355] mb-2">Quick filters</p>
        <div className="space-y-2">
          {['Luxury', 'Budget', 'Family', 'Adventure'].map(filter => (
            <button
              key={filter}
              onClick={() => onFiltersChange({
                query: '',
                raw: '',
                travelStyle: [filter.toLowerCase() as any],
              })}
              className="w-full px-3 py-2 bg-[#3D2B1F] text-[#D6B06A] text-sm rounded-lg hover:bg-[#4B321F] transition-colors text-left"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, ..._props }: { label: string } & Record<string, unknown>) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#3D2B1F] text-[#D6B06A] text-xs rounded-full">
      {label}
    </span>
  );
}

export default SearchPage;
