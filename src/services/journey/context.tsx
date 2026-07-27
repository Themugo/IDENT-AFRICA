'use client';

/**
 * Journey Context
 * 
 * React context for traveler journey state management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { journeyService } from './service';
import {
  JourneyEntry,
  JourneyStage,
  EntityType,
  StageMetadata,
  JourneyStatus,
  getStageInfo,
  calculateProgress,
} from './types';

// Context type
interface JourneyContextType {
  // State
  currentJourney: JourneyEntry | null;
  journeyHistory: JourneyEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Computed
  currentStage: JourneyStage | null;
  progress: number;
  stageInfo: ReturnType<typeof getStageInfo>;
  nextAction: string;
  
  // Actions
  startJourney: (
    stage: JourneyStage,
    entityType: EntityType,
    entityId: string,
    metadata?: Partial<StageMetadata>
  ) => Promise<JourneyEntry>;
  progressJourney: (metadata?: Partial<StageMetadata>) => Promise<JourneyEntry | null>;
  updateJourneyStatus: (status: JourneyStatus) => Promise<void>;
  trackDiscovery: (
    entityType: EntityType,
    entityId: string,
    metadata?: { searchQuery?: string; filters?: Record<string, string> }
  ) => Promise<void>;
  trackBooking: (
    bookingId: string,
    packageId: string,
    metadata?: { selectedDates?: { start: string; end: string }; travelers?: number }
  ) => Promise<void>;
  trackPayment: (
    paymentId: string,
    metadata?: { amount?: number; paymentMethod?: string }
  ) => Promise<void>;
  trackReview: (
    rating: number,
    feedback?: string
  ) => Promise<void>;
  refreshJourney: () => Promise<void>;
}

// Context
const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

// Provider props
interface JourneyProviderProps {
  children: ReactNode;
  userId: string;
}

// Provider
export function JourneyProvider({ children, userId }: JourneyProviderProps) {
  const [currentJourney, setCurrentJourney] = useState<JourneyEntry | null>(null);
  const [journeyHistory, setJourneyHistory] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJourney = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [active, history] = await Promise.all([
        journeyService.getActiveJourney(userId),
        journeyService.getUserJourneys(userId),
      ]);
      
      setCurrentJourney(active);
      setJourneyHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journey');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load journey on mount / when userId changes
  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  const startJourney = useCallback(async (
    stage: JourneyStage,
    entityType: EntityType,
    entityId: string,
    metadata?: Partial<StageMetadata>
  ): Promise<JourneyEntry> => {
    const journey = await journeyService.startJourney(userId, stage, entityType, entityId, metadata);
    setCurrentJourney(journey);
    setJourneyHistory(prev => [...prev, journey]);
    return journey;
  }, [userId]);

  const progressJourney = useCallback(async (
    metadata?: Partial<StageMetadata>
  ): Promise<JourneyEntry | null> => {
    if (!currentJourney) return null;
    
    const updated = await journeyService.progressToNextStage(currentJourney.id, metadata);
    if (updated) {
      setCurrentJourney(updated);
      setJourneyHistory(prev => 
        prev.map(j => j.id === updated.id ? updated : j)
      );
    }
    return updated;
  }, [currentJourney]);

  const updateJourneyStatus = useCallback(async (
    status: JourneyStatus
  ): Promise<void> => {
    if (!currentJourney) return;
    
    const updated = await journeyService.updateJourney(currentJourney.id, { status });
    if (updated) {
      setCurrentJourney(status === 'completed' ? null : updated);
      setJourneyHistory(prev => 
        prev.map(j => j.id === updated.id ? updated : j)
      );
    }
  }, [currentJourney]);

  const trackDiscovery = useCallback(async (
    entityType: EntityType,
    entityId: string,
    metadata?: { searchQuery?: string; filters?: Record<string, string> }
  ): Promise<void> => {
    await journeyService.trackDiscovery(userId, entityType, entityId, metadata);
    await loadJourney();
  }, [userId, loadJourney]);

  const trackBooking = useCallback(async (
    bookingId: string,
    packageId: string,
    metadata?: { selectedDates?: { start: string; end: string }; travelers?: number }
  ): Promise<void> => {
    const journey = await journeyService.trackBooking(userId, bookingId, packageId, metadata);
    setCurrentJourney(journey);
    setJourneyHistory(prev => [...prev, journey]);
  }, [userId]);

  const trackPayment = useCallback(async (
    paymentId: string,
    metadata?: { amount?: number; paymentMethod?: string }
  ): Promise<void> => {
    if (!currentJourney) return;
    
    await journeyService.trackPayment(currentJourney.id, paymentId, metadata);
    await loadJourney();
  }, [currentJourney, loadJourney]);

  const trackReview = useCallback(async (
    rating: number,
    feedback?: string
  ): Promise<void> => {
    if (!currentJourney) return;
    
    await journeyService.trackPostTravel(currentJourney.id, {
      rating,
      feedback,
    });
    await loadJourney();
  }, [currentJourney, loadJourney]);

  const refreshJourney = useCallback(async (): Promise<void> => {
    await loadJourney();
  }, [loadJourney]);

  // Computed values
  const currentStage = currentJourney?.stage || null;
  const progress = currentStage ? calculateProgress(currentStage) : 0;
  const stageInfo = currentStage ? getStageInfo(currentStage) : getStageInfo('DISCOVERY');
  const nextAction = stageInfo.nextAction;

  const value: JourneyContextType = {
    currentJourney,
    journeyHistory,
    isLoading,
    error,
    currentStage,
    progress,
    stageInfo,
    nextAction,
    startJourney,
    progressJourney,
    updateJourneyStatus,
    trackDiscovery,
    trackBooking,
    trackPayment,
    trackReview,
    refreshJourney,
  };

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
}

/**
 * Hook to use journey context
 */
export function useJourney(): JourneyContextType {
  const context = useContext(JourneyContext);
  
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  
  return context;
}

/**
 * Hook to get current journey
 */
export function useCurrentJourney() {
  const { currentJourney, currentStage, progress, stageInfo, nextAction } = useJourney();
  return { currentJourney, currentStage, progress, stageInfo, nextAction };
}

/**
 * Hook to track journey events
 */
export function useJourneyTracking() {
  const { trackDiscovery, trackBooking, trackPayment, trackReview } = useJourney();
  return { trackDiscovery, trackBooking, trackPayment, trackReview };
}
