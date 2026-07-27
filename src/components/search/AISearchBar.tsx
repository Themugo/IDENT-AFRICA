'use client';

/**
 * AI Search Bar Component
 * 
 * Natural language search with autocomplete and suggestions.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Mic, X, Clock, TrendingUp } from 'lucide-react';
import { useSearch, useSearchHistory } from '../../services/search';
import { EXAMPLE_SEARCHES, SEARCH_PRESETS } from '../../services/search/types';

interface AISearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

export default function AISearchBar({
  placeholder = 'Search destinations, experiences, packages...',
  onSearch,
  size = 'md',
  autoFocus = false,
}: AISearchBarProps) {
  const { query, search, isLoading, getSuggestions } = useSearch();
  const { history } = useSearchHistory();
  const [inputValue, setInputValue] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; type: string; icon?: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input when query changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Get suggestions on input
  useEffect(() => {
    if (inputValue.length > 2) {
      getSuggestions(inputValue).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, getSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      search(inputValue.trim());
      onSearch?.(inputValue.trim());
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputValue(text);
    search(text);
    onSearch?.(text);
    setIsFocused(false);
  };

  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: 'py-3 text-base',
    lg: 'py-4 text-lg',
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${
            isFocused ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-stone-200'
          }`}
        >
          <Search className="w-5 h-5 text-stone-400 ml-4" />
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`flex-1 px-4 bg-transparent outline-none ${sizeClasses[size]} text-stone-900 placeholder-stone-400`}
          />
          
          {/* AI indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg mr-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">AI</span>
          </div>
          
          {/* Voice search */}
          <button
            type="button"
            className="p-3 text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="Voice search"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          {/* Search button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          {/* Clear */}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-48 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-stone-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Example searches */}
          {!inputValue && (
            <div className="p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                Try asking
              </p>
              <div className="space-y-2">
                {EXAMPLE_SEARCHES.slice(0, 3).map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(example.query)}
                    className="w-full flex items-center gap-3 p-3 bg-stone-50 hover:bg-amber-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-lg">{example.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{example.query}</p>
                      <p className="text-xs text-stone-500">{example.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4 border-t border-stone-100">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                Suggestions
              </p>
              <div className="space-y-1">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    {suggestion.type === 'popular' && <TrendingUp className="w-4 h-4 text-amber-500" />}
                    {suggestion.type === 'recent' && <Clock className="w-4 h-4 text-stone-400" />}
                    {suggestion.type === 'trending' && <Sparkles className="w-4 h-4 text-purple-500" />}
                    <span className="text-sm text-stone-700">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search presets */}
          {!inputValue && (
            <div className="p-4 border-t border-stone-100">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                Quick filters
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(SEARCH_PRESETS).slice(0, 4).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSuggestionClick(preset.replace('-', ' '))}
                    className="px-3 py-1.5 text-sm bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-700 rounded-full transition-colors capitalize"
                  >
                    {preset.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
