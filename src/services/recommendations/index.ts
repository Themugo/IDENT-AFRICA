/**
 * Recommendations Service Index
 */

export { customerProfileService, createDefaultProfile } from './profile';
export type {
  CustomerProfile,
  ProfileUpdateInput,
  TravelStyle,
  Interest,
  AgeGroup,
  AccommodationPreference,
} from './profile';

export { recommendationEngine } from './engine';
export type {
  RecommendableItem,
  Recommendation,
  RecommendationWeights,
} from './engine';

export { aiSearchService } from './aiSearch';
export type { SearchFilters } from './aiSearch';

export { learningSystem } from './learning';
export type {
  RecommendationEvent,
  RecommendationEventType,
  ConversionMetrics,
} from './learning';

export { recommendationAdmin } from './admin';
export type { AdminSettings } from './admin';
