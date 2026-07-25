/**
 * Traveler Journey Types
 * 
 * Types for unified customer journey management.
 */

// Journey stages
export type JourneyStage =
  | 'DISCOVERY'
  | 'PLANNING'
  | 'BOOKING'
  | 'PAYMENT'
  | 'PREPARATION'
  | 'TRAVEL'
  | 'POST_TRAVEL';

// Journey status
export type JourneyStatus = 'active' | 'completed' | 'abandoned' | 'cancelled';

// Entity types
export type EntityType =
  | 'destination'
  | 'package'
  | 'experience'
  | 'ai_plan'
  | 'booking'
  | 'payment'
  | 'review';

// Stage metadata
export interface StageMetadata {
  // Discovery
  searchQuery?: string;
  filters?: Record<string, string>;
  
  // Planning
  aiPlanId?: string;
  plannedDuration?: number;
  plannedBudget?: number;
  companions?: number;
  
  // Booking
  bookingId?: string;
  selectedPackage?: string;
  selectedDates?: {
    start: string;
    end: string;
  };
  travelers?: number;
  
  // Payment
  paymentId?: string;
  amount?: number;
  paymentMethod?: string;
  
  // Preparation
  visaRequired?: boolean;
  vaccinations?: string[];
  packingList?: string[];
  
  // Travel
  checkIn?: string;
  checkOut?: string;
  accommodation?: string;
  
  // Post-travel
  reviewId?: string;
  rating?: number;
  feedback?: string;
}

// Journey entry
export interface JourneyEntry {
  id: string;
  userId: string;
  stage: JourneyStage;
  entityType: EntityType;
  entityId: string;
  status: JourneyStatus;
  metadata: StageMetadata;
  stageStartedAt: string;
  stageCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Stage info for display
export interface StageInfo {
  stage: JourneyStage;
  title: string;
  description: string;
  icon: string;
  nextAction: string;
}

// All stages configuration
export const JOURNEY_STAGES: StageInfo[] = [
  {
    stage: 'DISCOVERY',
    title: 'Discovery',
    description: 'Exploring destinations and experiences',
    icon: '🔍',
    nextAction: 'Start planning',
  },
  {
    stage: 'PLANNING',
    title: 'Planning',
    description: 'Creating your perfect itinerary',
    icon: '📋',
    nextAction: 'Select package',
  },
  {
    stage: 'BOOKING',
    title: 'Booking',
    description: 'Confirming your trip details',
    icon: '📝',
    nextAction: 'Complete payment',
  },
  {
    stage: 'PAYMENT',
    title: 'Payment',
    description: 'Processing your booking',
    icon: '💳',
    nextAction: 'Prepare for travel',
  },
  {
    stage: 'PREPARATION',
    title: 'Preparation',
    description: 'Getting ready for your adventure',
    icon: '✈️',
    nextAction: 'Start your journey',
  },
  {
    stage: 'TRAVEL',
    title: 'Travel',
    description: 'Enjoying your African adventure',
    icon: '🌍',
    nextAction: 'Share your experience',
  },
  {
    stage: 'POST_TRAVEL',
    title: 'Post-Travel',
    description: 'Reflecting and sharing',
    icon: '⭐',
    nextAction: 'Plan your next trip',
  },
];

// Get stage info
export function getStageInfo(stage: JourneyStage): StageInfo {
  return JOURNEY_STAGES.find(s => s.stage === stage) || JOURNEY_STAGES[0];
}

// Get next stage
export function getNextStage(currentStage: JourneyStage): JourneyStage | null {
  const currentIndex = JOURNEY_STAGES.findIndex(s => s.stage === currentStage);
  if (currentIndex < JOURNEY_STAGES.length - 1) {
    return JOURNEY_STAGES[currentIndex + 1].stage;
  }
  return null;
}

// Get previous stage
export function getPreviousStage(currentStage: JourneyStage): JourneyStage | null {
  const currentIndex = JOURNEY_STAGES.findIndex(s => s.stage === currentStage);
  if (currentIndex > 0) {
    return JOURNEY_STAGES[currentIndex - 1].stage;
  }
  return null;
}

// Stage progress calculation
export function calculateProgress(currentStage: JourneyStage): number {
  const currentIndex = JOURNEY_STAGES.findIndex(s => s.stage === currentStage);
  return Math.round(((currentIndex + 1) / JOURNEY_STAGES.length) * 100);
}

// Stage colors
export const STAGE_COLORS: Record<JourneyStage, string> = {
  DISCOVERY: '#3B82F6', // Blue
  PLANNING: '#8B5CF6', // Purple
  BOOKING: '#F59E0B', // Amber
  PAYMENT: '#10B981', // Emerald
  PREPARATION: '#06B6D4', // Cyan
  TRAVEL: '#EF4444', // Red
  POST_TRAVEL: '#F97316', // Orange
};

// Format stage for display
export function formatStageLabel(stage: JourneyStage): string {
  return stage.charAt(0) + stage.slice(1).toLowerCase().replace('_', ' ');
}
