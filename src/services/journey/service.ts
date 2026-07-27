/**
 * Journey Service
 * 
 * Service for managing traveler journey tracking and progression.
 */

import {
  JourneyEntry,
  JourneyStage,
  JourneyStatus,
  EntityType,
  StageMetadata,
  getNextStage,
  getStageInfo,
  calculateProgress,
} from './types';

// Mock journey storage (in production, this would be API calls)
const journeyStorage: Map<string, JourneyEntry[]> = new Map();

/**
 * Journey Service
 */
class JourneyService {
  /**
   * Get user journeys
   */
  async getUserJourneys(userId: string): Promise<JourneyEntry[]> {
    return journeyStorage.get(userId) || [];
  }

  /**
   * Get active journey
   */
  async getActiveJourney(userId: string): Promise<JourneyEntry | null> {
    const journeys = journeyStorage.get(userId) || [];
    return journeys.find(j => j.status === 'active') || null;
  }

  /**
   * Get journey by ID
   */
  async getJourney(journeyId: string): Promise<JourneyEntry | null> {
    for (const journeys of journeyStorage.values()) {
      const journey = journeys.find(j => j.id === journeyId);
      if (journey) return journey;
    }
    return null;
  }

  /**
   * Start a new journey
   */
  async startJourney(
    userId: string,
    stage: JourneyStage,
    entityType: EntityType,
    entityId: string,
    metadata?: Partial<StageMetadata>
  ): Promise<JourneyEntry> {
    // End any existing active journey
    await this.abandonActiveJourneys(userId);

    const journey: JourneyEntry = {
      id: `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      stage,
      entityType,
      entityId,
      status: 'active',
      metadata: metadata || {},
      stageStartedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const journeys = journeyStorage.get(userId) || [];
    journeys.push(journey);
    journeyStorage.set(userId, journeys);

    return journey;
  }

  /**
   * Progress to next stage
   */
  async progressToNextStage(
    journeyId: string,
    metadata?: Partial<StageMetadata>
  ): Promise<JourneyEntry | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const nextStage = getNextStage(journey.stage);
    if (!nextStage) return null;

    return this.updateJourney(journeyId, {
      stage: nextStage,
      metadata: { ...journey.metadata, ...metadata },
    });
  }

  /**
   * Update journey stage
   */
  async updateJourney(
    journeyId: string,
    updates: Partial<{
      stage: JourneyStage;
      entityType: EntityType;
      entityId: string;
      status: JourneyStatus;
      metadata: Partial<StageMetadata>;
      stageCompletedAt?: string;
    }>
  ): Promise<JourneyEntry | null> {
    for (const [userId, journeys] of journeyStorage.entries()) {
      const index = journeys.findIndex(j => j.id === journeyId);
      if (index !== -1) {
        const journey = journeys[index];
        
        // If changing stage, update timestamps
        if (updates.stage && updates.stage !== journey.stage) {
          journey.stageStartedAt = new Date().toISOString();
          journey.stageCompletedAt = new Date().toISOString();
        }

        Object.assign(journey, updates, { updatedAt: new Date().toISOString() });
        journeyStorage.set(userId, journeys);
        return journey;
      }
    }
    return null;
  }

  /**
   * Complete journey
   */
  async completeJourney(journeyId: string): Promise<JourneyEntry | null> {
    return this.updateJourney(journeyId, {
      status: 'completed',
      stageCompletedAt: new Date().toISOString(),
    });
  }

  /**
   * Abandon active journeys
   */
  async abandonActiveJourneys(userId: string): Promise<void> {
    const journeys = journeyStorage.get(userId);
    if (!journeys) return;

    journeys.forEach(journey => {
      if (journey.status === 'active') {
        journey.status = 'abandoned';
        journey.updatedAt = new Date().toISOString();
      }
    });

    journeyStorage.set(userId, journeys);
  }

  /**
   * Track discovery event
   */
  async trackDiscovery(
    userId: string,
    entityType: EntityType,
    entityId: string,
    metadata?: { searchQuery?: string; filters?: Record<string, string> }
  ): Promise<JourneyEntry> {
    // Check for existing discovery journey
    const journeys = journeyStorage.get(userId) || [];
    const existingDiscovery = journeys.find(
      j => j.stage === 'DISCOVERY' && j.entityId === entityId && j.status === 'active'
    );

    if (existingDiscovery) {
      return existingDiscovery;
    }

    return this.startJourney(userId, 'DISCOVERY', entityType, entityId, {
      searchQuery: metadata?.searchQuery,
      filters: metadata?.filters,
    });
  }

  /**
   * Track AI planning
   */
  async trackPlanning(
    userId: string,
    aiPlanId: string,
    metadata?: {
      plannedDuration?: number;
      plannedBudget?: number;
      companions?: number;
    }
  ): Promise<JourneyEntry> {
    return this.startJourney(userId, 'PLANNING', 'ai_plan', aiPlanId, metadata);
  }

  /**
   * Track booking
   */
  async trackBooking(
    userId: string,
    bookingId: string,
    packageId: string,
    metadata?: {
      selectedDates?: { start: string; end: string };
      travelers?: number;
    }
  ): Promise<JourneyEntry> {
    return this.startJourney(userId, 'BOOKING', 'booking', bookingId, {
      bookingId,
      selectedPackage: packageId,
      selectedDates: metadata?.selectedDates,
      travelers: metadata?.travelers,
    });
  }

  /**
   * Track payment
   */
  async trackPayment(
    journeyId: string,
    paymentId: string,
    metadata?: {
      amount?: number;
      paymentMethod?: string;
    }
  ): Promise<JourneyEntry | null> {
    const journey = await this.updateJourney(journeyId, {
      stage: 'PAYMENT',
      metadata: { paymentId, ...metadata },
    });

    // Auto-progress if payment successful
    if (journey) {
      return this.progressToNextStage(journeyId, metadata);
    }

    return null;
  }

  /**
   * Track preparation
   */
  async trackPreparation(
    journeyId: string,
    metadata?: {
      visaRequired?: boolean;
      vaccinations?: string[];
      packingList?: string[];
    }
  ): Promise<JourneyEntry | null> {
    return this.updateJourney(journeyId, {
      stage: 'PREPARATION',
      metadata,
    });
  }

  /**
   * Track travel start
   */
  async trackTravelStart(
    journeyId: string,
    metadata?: {
      checkIn?: string;
      accommodation?: string;
    }
  ): Promise<JourneyEntry | null> {
    return this.updateJourney(journeyId, {
      stage: 'TRAVEL',
      metadata,
    });
  }

  /**
   * Track travel end and review
   */
  async trackPostTravel(
    journeyId: string,
    metadata?: {
      checkOut?: string;
      reviewId?: string;
      rating?: number;
      feedback?: string;
    }
  ): Promise<JourneyEntry | null> {
    const journey = await this.updateJourney(journeyId, {
      stage: 'POST_TRAVEL',
      metadata,
    });

    if (journey) {
      return this.completeJourney(journeyId);
    }

    return null;
  }

  /**
   * Get journey summary
   */
  async getJourneySummary(userId: string): Promise<{
    currentStage: JourneyStage | null;
    progress: number;
    currentJourney: JourneyEntry | null;
    stageInfo: ReturnType<typeof getStageInfo>;
    nextAction: string;
  }> {
    const currentJourney = await this.getActiveJourney(userId);

    if (!currentJourney) {
      return {
        currentStage: null,
        progress: 0,
        currentJourney: null,
        stageInfo: getStageInfo('DISCOVERY'),
        nextAction: 'Start exploring',
      };
    }

    return {
      currentStage: currentJourney.stage,
      progress: calculateProgress(currentJourney.stage),
      currentJourney,
      stageInfo: getStageInfo(currentJourney.stage),
      nextAction: getStageInfo(currentJourney.stage).nextAction,
    };
  }

  /**
   * Get journey timeline
   */
  async getJourneyTimeline(userId: string): Promise<{
    entries: JourneyEntry[];
    completedStages: JourneyStage[];
    activeStage: JourneyStage | null;
  }> {
    const journeys = await this.getUserJourneys(userId);
    
    const completedStages: JourneyStage[] = [];
    let activeStage: JourneyStage | null = null;

    journeys.forEach(journey => {
      if (journey.status === 'completed') {
        completedStages.push(journey.stage);
      }
      if (journey.status === 'active') {
        activeStage = journey.stage;
      }
    });

    // Sort by stage order
    const stageOrder = ['DISCOVERY', 'PLANNING', 'BOOKING', 'PAYMENT', 'PREPARATION', 'TRAVEL', 'POST_TRAVEL'];
    
    const sortedEntries = journeys.sort((a, b) => {
      return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
    });

    return {
      entries: sortedEntries,
      completedStages: [...new Set(completedStages)],
      activeStage,
    };
  }

  /**
   * Get recommendations based on journey stage
   */
  async getRecommendations(journeyId: string): Promise<string[]> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return [];

    const recommendations: Record<JourneyStage, string[]> = {
      DISCOVERY: [
        'Browse featured destinations',
        'Check out popular packages',
        'Read traveler reviews',
      ],
      PLANNING: [
        'Use AI trip planner',
        'Compare packages',
        'View detailed itineraries',
      ],
      BOOKING: [
        'Select your dates',
        'Add travel insurance',
        'Review booking terms',
      ],
      PAYMENT: [
        'Secure payment methods',
        'Group discounts available',
        'Flexible cancellation policy',
      ],
      PREPARATION: [
        'Packing checklist',
        'Visa requirements',
        'Health precautions',
      ],
      TRAVEL: [
        'Emergency contacts',
        'Local customs',
        'Weather forecast',
      ],
      POST_TRAVEL: [
        'Share your experience',
        'Write a review',
        'Plan your next trip',
      ],
    };

    return recommendations[journey.stage] || [];
  }
}

export const journeyService = new JourneyService();
