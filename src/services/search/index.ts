/**
 * Search Service Index
 */

// Types
export * from './types';

// Parser
export { aiSearchParser, AISearchParser } from './parser';

// Service
export { searchService } from './service';

// Context
export { 
  SearchProvider, 
  useSearch, 
  useSearchResults, 
  useSearchHistory, 
  useSavedSearches 
} from './context';
