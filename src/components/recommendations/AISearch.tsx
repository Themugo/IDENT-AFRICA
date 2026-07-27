'use client';

/**
 * AI Search Component
 * 
 * Natural language search with filter extraction.
 */

import React, { useState } from 'react';
import { Search, Sparkles, Mic, X, Filter } from 'lucide-react';
import { aiSearchService } from '../../services/recommendations';

interface AISearchProps {
  onSearch: (query: string, filters: ReturnType<typeof aiSearchService.parseQuery>) => void;
  placeholder?: string;
}

export default function AISearch({ onSearch, placeholder = 'Search destinations, experiences...' }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<ReturnType<typeof aiSearchService.parseQuery> | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    
    if (value.length > 3) {
      const filters = aiSearchService.parseQuery(value);
      setParsedFilters(filters);
    } else {
      setParsedFilters(null);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    
    const filters = aiSearchService.parseQuery(query);
    onSearch(query, filters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setParsedFilters(null);
  };

  const examples = aiSearchService.getExampleQueries();
  const suggestions = aiSearchService.generateSuggestions(query);

  return (
    <div className="relative">
      {/* Search Input */}
      <div
        className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${
          isFocused ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-stone-200'
        }`}
      >
        <Search className="w-5 h-5 text-stone-400 ml-4" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 bg-transparent outline-none text-stone-900 placeholder-stone-400"
        />
        
        {/* AI indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg mr-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium">AI</span>
        </div>
        
        {/* Voice search */}
        <button className="p-4 text-stone-400 hover:text-stone-600 transition-colors">
          <Mic className="w-5 h-5" />
        </button>
        
        {/* Search button */}
        <button
          onClick={handleSearch}
          className="px-6 py-4 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-r-lg"
        >
          Search
        </button>
        
        {/* Clear */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-36 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter preview */}
      {parsedFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-stone-200 shadow-lg p-4 z-10">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="text-sm font-medium text-stone-600">Detected Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {parsedFilters.budget && (
              <FilterChip
                label={`Budget: $${parsedFilters.budget.min || 0} - $${parsedFilters.budget.max || '∞'}`}
                onRemove={() => {}}
              />
            )}
            {parsedFilters.duration && (
              <FilterChip
                label={`Duration: ${parsedFilters.duration.min}-${parsedFilters.duration.max} days`}
                onRemove={() => {}}
              />
            )}
            {parsedFilters.travelStyle?.map(style => (
              <FilterChip
                key={style}
                label={style}
                onRemove={() => {}}
              />
            ))}
            {parsedFilters.interests?.map(interest => (
              <FilterChip
                key={interest}
                label={interest}
                onRemove={() => {}}
              />
            ))}
            {parsedFilters.rating && (
              <FilterChip
                label={`${parsedFilters.rating}+ stars`}
                onRemove={() => {}}
              />
            )}
            {parsedFilters.attributes?.map(attr => (
              <FilterChip
                key={attr}
                label={attr}
                onRemove={() => {}}
              />
            ))}
          </div>
          
          {suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-xs text-stone-500">Suggestions:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestions.map((suggestion, idx) => (
                  <span key={idx} className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example queries */}
      {!query && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-stone-200 shadow-lg p-4 z-10">
          <p className="text-sm font-medium text-stone-600 mb-3">Try asking like this:</p>
          <div className="space-y-2">
            {examples.slice(0, 3).map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(example.query);
                  handleQueryChange(example.query);
                }}
                className="block w-full text-left p-3 bg-stone-50 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <p className="text-sm font-medium text-stone-900">{example.query}</p>
                <p className="text-xs text-stone-500 mt-0.5">{example.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Chip Component
interface FilterChipProps {
  label: string;
  onRemove: () => void;
  key?: string;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm">
      <span className="capitalize">{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
