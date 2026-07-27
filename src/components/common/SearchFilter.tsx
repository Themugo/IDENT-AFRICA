/**
 * SearchFilter - Reusable search and filter component
 */

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  placeholder?: string;
  filterGroups?: FilterGroup[];
  onSearch: (query: string) => void;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  initialQuery?: string;
  className?: string;
}

export function SearchFilter({
  placeholder = 'Search...',
  filterGroups = [],
  onSearch,
  onFilterChange,
  initialQuery = '',
  className = '',
}: SearchFilterProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleFilterToggle = (groupId: string, value: string) => {
    const newFilters = { ...filters };
    if (!newFilters[groupId]) {
      newFilters[groupId] = [];
    }

    if (newFilters[groupId].includes(value)) {
      newFilters[groupId] = newFilters[groupId].filter((v) => v !== value);
    } else {
      newFilters[groupId] = [...newFilters[groupId], value];
    }

    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const activeFilterCount = Object.values(filters).flat().length;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-800/50 border border-stone-700 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Filter Toggle */}
        {filterGroups.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-amber-600/20 border-amber-600 text-amber-400'
                : 'bg-stone-800/50 border-stone-700 text-stone-400 hover:border-stone-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filterGroups.length > 0 && (
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 space-y-4">
          {filterGroups.map((group) => (
            <div key={group.id}>
              <h4 className="text-sm font-medium text-stone-400 mb-2">{group.label}</h4>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isActive = filters[group.id]?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFilterToggle(group.id, option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
