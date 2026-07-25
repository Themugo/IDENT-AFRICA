'use client';

/**
 * Search Results Component
 * 
 * Display search results with filters and pagination.
 */

import React from 'react';
import { MapPin, Clock, Star, DollarSign, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { useSearchResults } from '../../services/search';
import { SearchResultType, SearchResult } from '../../services/search/types';

interface SearchResultsProps {
  onResultClick?: (resultId: string, type: SearchResultType) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function SearchResults({
  onResultClick,
  viewMode = 'grid',
  onViewModeChange,
}: SearchResultsProps) {
  const { results, isLoading, filters } = useSearchResults();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-stone-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-stone-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">
          Start your search
        </h3>
        <p className="text-stone-500">
          Enter a search query to find destinations, packages, and experiences
        </p>
      </div>
    );
  }

  if (results.results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">
          No results found
        </h3>
        <p className="text-stone-500">
          Try adjusting your search or filters
        </p>
        {results.suggestions && results.suggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-stone-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {results.suggestions.map((suggestion, idx) => (
                <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm">
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {results.total} results for "{results.query}"
          </h2>
          <p className="text-sm text-stone-500">
            Found in {results.processingTime}ms
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          <div className="flex border border-stone-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort dropdown */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 hover:bg-stone-50">
            <span>Sort by</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detected filters */}
      {filters && (
        <div className="flex flex-wrap gap-2">
          {filters.location?.country && (
            <FilterTag label={filters.location.country} />
          )}
          {filters.travelStyle?.map(style => (
            <FilterTag key={style} label={style} />
          ))}
          {filters.activities?.map(activity => (
            <FilterTag key={activity} label={activity} />
          ))}
          {filters.budget?.max && (
            <FilterTag label={`Under $${filters.budget.max}`} />
          )}
          {filters.duration?.max && (
            <FilterTag label={`${filters.duration.max} days`} />
          )}
        </div>
      )}

      {/* Results grid/list */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {results.results.map((result) => (
          <div key={result.id}>
            <ResultCard
              result={result}
              viewMode={viewMode}
              onClick={() => onResultClick?.(result.id, result.type)}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {results.total > results.pageSize && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button className="px-4 py-2 border border-stone-200 rounded-lg text-sm hover:bg-stone-50 disabled:opacity-50" disabled={results.page === 1}>
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-stone-600">
            Page {results.page} of {Math.ceil(results.total / results.pageSize)}
          </span>
          <button className="px-4 py-2 border border-stone-200 rounded-lg text-sm hover:bg-stone-50 disabled:opacity-50"
            disabled={results.page >= Math.ceil(results.total / results.pageSize)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Filter tag component
function FilterTag({ label, key }: { label: string; key?: string }) {
  return (
    <span key={key} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
      {label}
    </span>
  );
}

// Result card component
interface ResultCardProps {
  result: SearchResult;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

function ResultCard({ result, viewMode, onClick }: ResultCardProps) {
  const { item, score, type } = result;
  
  const name = item.name as string || item.title as string || 'Unknown';
  const description = item.description as string || '';
  const country = item.country as string || '';
  const price = item.price as number;
  const rating = item.rating as number;
  const duration = item.duration as number;

  const matchPercentage = Math.round(score * 100);

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="flex gap-4 p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="w-32 h-24 bg-gradient-to-br from-stone-200 to-stone-300 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {matchPercentage}% match
                </span>
                <span className="text-xs text-stone-500 capitalize">{type}</span>
              </div>
              <h3 className="font-semibold text-stone-900">{name}</h3>
              <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {country}
              </p>
            </div>
            {price && (
              <div className="text-right">
                <p className="font-bold text-stone-900">${price.toLocaleString()}</p>
                <p className="text-xs text-stone-500">per person</p>
              </div>
            )}
          </div>
          <p className="text-sm text-stone-600 mt-2 line-clamp-2">{description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
            {rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {rating}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {duration} days
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
      className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative h-40 bg-gradient-to-br from-stone-200 to-stone-300">
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {matchPercentage}% match
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-stone-600 bg-white/90 px-2 py-1 rounded capitalize">
          {type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 mb-1">{name}</h3>
        <p className="text-sm text-stone-500 flex items-center gap-1 mb-2">
          <MapPin className="w-4 h-4" />
          {country}
        </p>
        <p className="text-sm text-stone-600 line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-stone-500">
            {rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {rating}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {duration}d
              </span>
            )}
          </div>
          {price && (
            <span className="font-bold text-amber-600">${price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
