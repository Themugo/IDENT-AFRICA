'use client';

/**
 * Search History & Saved Searches Component
 * 
 * Display and manage search history and saved searches.
 */

import React, { useState } from 'react';
import { Clock, Bookmark, Trash2, Search, TrendingUp, X, Bell } from 'lucide-react';
import { useSearchHistory, useSavedSearches } from '../../services/search';
import type { SearchHistoryEntry, SavedSearch } from '../../services/search/types';

interface SearchHistoryProps {
  onSearchClick?: (query: string) => void;
  maxItems?: number;
}

export default function SearchHistory({
  onSearchClick,
  maxItems = 10,
}: SearchHistoryProps) {
  const { history, clearHistory } = useSearchHistory();
  const { savedSearches, deleteSavedSearch, applySavedSearch } = useSavedSearches();
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');

  const displayHistory = history.slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Recent
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'saved'
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved ({savedSearches.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'history' && (
          <HistoryList
            history={displayHistory}
            onClear={clearHistory}
            onSearchClick={onSearchClick}
          />
        )}
        {activeTab === 'saved' && (
          <SavedList
            savedSearches={savedSearches}
            onDelete={deleteSavedSearch}
            onApply={applySavedSearch}
          />
        )}
      </div>
    </div>
  );
}

// History list
function HistoryList({
  history,
  onClear,
  onSearchClick,
}: {
  history: SearchHistoryEntry[];
  onClear: () => void;
  onSearchClick?: (query: string) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm text-stone-500">No recent searches</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-stone-500">{history.length} recent searches</span>
        <button
          onClick={onClear}
          className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Clear all
        </button>
      </div>
      <div className="space-y-2">
        {history.map((entry) => (
          <div key={entry.id}>
            <SearchHistoryItem
              entry={entry}
              onClick={() => onSearchClick?.(entry.query)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// History item
function SearchHistoryItem({
  entry,
  onClick,
}: {
  entry: SearchHistoryEntry;
  onClick: () => void;
}) {
  const date = new Date(entry.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-stone-50 hover:bg-amber-50 rounded-lg transition-colors text-left"
    >
      <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">{entry.query}</p>
        <p className="text-xs text-stone-500">{timeAgo} · {entry.resultCount} results</p>
      </div>
    </button>
  );
}

// Saved list
function SavedList({
  savedSearches,
  onDelete,
  onApply,
}: {
  savedSearches: SavedSearch[];
  onDelete: (id: string) => void;
  onApply: (saved: SavedSearch) => void;
}) {
  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm text-stone-500">No saved searches</p>
        <p className="text-xs text-stone-400 mt-1">Save a search to get notified of new results</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {savedSearches.map((saved) => (
        <div key={saved.id}>
          <SavedSearchItem
            saved={saved}
            onApply={() => onApply(saved)}
            onDelete={() => onDelete(saved.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Saved search item
function SavedSearchItem({
  saved,
  onApply,
  onDelete,
}: {
  saved: SavedSearch;
  onApply: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onApply}
        className="w-full flex items-center gap-3 p-3 bg-stone-50 hover:bg-amber-50 rounded-lg transition-colors text-left"
      >
        <Bookmark className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-stone-900 truncate">{saved.name}</p>
            {(saved.notifyNewResults || saved.notifyPriceChange) && (
              <Bell className="w-3 h-3 text-amber-500" />
            )}
          </div>
          <p className="text-xs text-stone-500 truncate">{saved.query}</p>
        </div>
      </button>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
      >
        <X className="w-4 h-4" />
      </button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-10 py-1 min-w-32">
          <button
            onClick={() => {
              onDelete();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Popular searches
interface PopularSearchesProps {
  onSearchClick?: (query: string) => void;
}

export function PopularSearches({ onSearchClick }: PopularSearchesProps) {
  const popular = [
    { query: 'maasai mara safari', count: 1500, trend: 'rising' },
    { query: 'gorilla trekking uganda', count: 1200, trend: 'rising' },
    { query: 'zanzibar beach', count: 980, trend: 'stable' },
    { query: 'serengeti migration', count: 850, trend: 'stable' },
    { query: 'luxury safari', count: 720, trend: 'declining' },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-stone-900">Popular Searches</h3>
      </div>
      <div className="space-y-2">
        {popular.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSearchClick?.(item.query)}
            className="w-full flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors text-left"
          >
            <span className="w-6 h-6 flex items-center justify-center bg-stone-100 rounded text-xs font-medium text-stone-500">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-stone-900">{item.query}</p>
              <p className="text-xs text-stone-500">{item.count.toLocaleString()} searches</p>
            </div>
            {item.trend === 'rising' && (
              <span className="text-xs text-emerald-500 font-medium">↑ rising</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Time ago helper
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
