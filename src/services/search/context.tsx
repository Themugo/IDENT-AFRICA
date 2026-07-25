'use client';

/**
 * Search Context
 * 
 * React context for search state management.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { searchService } from './service';
import {
  SearchFilters,
  SearchResponse,
  SearchHistoryEntry,
  SavedSearch,
  PopularSearch,
  SearchSuggestion,
} from './types';

interface SearchContextType {
  // State
  query: string;
  filters: SearchFilters | null;
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  history: SearchHistoryEntry[];
  savedSearches: SavedSearch[];
  popularSearches: PopularSearch[];
  
  // Actions
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  
  // History
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  
  // Saved searches
  loadSavedSearches: () => Promise<void>;
  saveCurrentSearch: (name: string) => Promise<SavedSearch>;
  deleteSavedSearch: (id: string) => Promise<void>;
  applySavedSearch: (saved: SavedSearch) => Promise<void>;
  
  // Suggestions
  getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SearchProvider({ children, userId }: SearchProviderProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);

  // Load initial data
  React.useEffect(() => {
    loadPopularSearches();
    if (userId) {
      loadHistory();
      loadSavedSearches();
    }
  }, [userId]);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await searchService.search(searchQuery, userId, {
        page: 1,
        pageSize: 20,
      });
      
      setFilters(response.filters);
      setResults(response);
      
      // Refresh history
      if (userId) {
        loadHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters(null);
    setResults(null);
    setError(null);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    if (!query) return;
    
    const updatedFilters = {
      ...filters,
      ...newFilters,
    } as SearchFilters;
    
    setFilters(updatedFilters);
    
    // Re-run search with new filters
    search(query);
  }, [query, filters, search]);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    
    const historyData = await searchService.getSearchHistory(userId);
    setHistory(historyData);
  }, [userId]);

  const clearHistory = useCallback(async () => {
    if (!userId) return;
    
    await searchService.clearSearchHistory(userId);
    setHistory([]);
  }, [userId]);

  const loadSavedSearches = useCallback(async () => {
    if (!userId) return;
    
    const saved = await searchService.getSavedSearches(userId);
    setSavedSearches(saved);
  }, [userId]);

  const saveCurrentSearch = useCallback(async (name: string): Promise<SavedSearch> => {
    if (!userId || !query || !filters) {
      throw new Error('No active search to save');
    }
    
    const saved = await searchService.saveSearch(userId, name, query, filters);
    setSavedSearches(prev => [...prev, saved]);
    return saved;
  }, [userId, query, filters]);

  const deleteSavedSearch = useCallback(async (id: string) => {
    if (!userId) return;
    
    await searchService.deleteSavedSearch(userId, id);
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  }, [userId]);

  const applySavedSearch = useCallback(async (saved: SavedSearch) => {
    setQuery(saved.query);
    setFilters(saved.filters);
    
    setIsLoading(true);
    try {
      const response = await searchService.search(saved.query, userId);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getSuggestions = useCallback(async (searchQuery: string): Promise<SearchSuggestion[]> => {
    return searchService.getSuggestions(searchQuery, userId);
  }, [userId]);

  const loadPopularSearches = async () => {
    const popular = await searchService.getPopularSearches();
    setPopularSearches(popular);
  };

  const value: SearchContextType = {
    query,
    filters,
    results,
    isLoading,
    error,
    history,
    savedSearches,
    popularSearches,
    search,
    clearSearch,
    updateFilters,
    loadHistory,
    clearHistory,
    loadSavedSearches,
    saveCurrentSearch,
    deleteSavedSearch,
    applySavedSearch,
    getSuggestions,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  
  return context;
}

export function useSearchResults() {
  const { results, isLoading, error, filters } = useSearch();
  return { results, isLoading, error, filters };
}

export function useSearchHistory() {
  const { history, loadHistory, clearHistory } = useSearch();
  return { history, loadHistory, clearHistory };
}

export function useSavedSearches() {
  const { savedSearches, loadSavedSearches, saveCurrentSearch, deleteSavedSearch, applySavedSearch } = useSearch();
  return { savedSearches, loadSavedSearches, saveCurrentSearch, deleteSavedSearch, applySavedSearch };
}
