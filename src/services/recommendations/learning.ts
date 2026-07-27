/**
 * Learning System
 * 
 * Tracks recommendations and improves future suggestions.
 */

// Event types
export type RecommendationEventType =
  | 'shown'
  | 'clicked'
  | 'viewed'
  | 'booked'
  | 'dismissed';

// Event data
export interface RecommendationEvent {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'destination' | 'package' | 'experience';
  eventType: RecommendationEventType;
  recommendationScore: number;
  sessionId: string;
  timestamp: string;
  metadata?: {
    position?: number;
    section?: string;
    query?: string;
    bookingValue?: number;
    bookingId?: string;
  };
}

// Conversion metrics
export interface ConversionMetrics {
  impressions: number;
  clicks: number;
  views: number;
  bookings: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
}

// A/B test variant
export interface ABVariant {
  id: string;
  name: string;
  weight: number;
  impressions: number;
  conversions: number;
}

/**
 * Learning System
 */
class LearningSystem {
  private events: RecommendationEvent[] = [];
  private abTests: Map<string, ABVariant[]> = new Map();

  /**
   * Track recommendation event
   */
  trackEvent(event: Omit<RecommendationEvent, 'id' | 'timestamp'>): void {
    const fullEvent: RecommendationEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);

    // Update A/B test stats
    this.updateABTest(fullEvent);
  }

  /**
   * Track impression (shown)
   */
  trackImpression(
    userId: string,
    itemId: string,
    itemType: 'destination' | 'package' | 'experience',
    sessionId: string,
    position: number,
    section: string,
    score: number
  ): void {
    this.trackEvent({
      userId,
      itemId,
      itemType,
      eventType: 'shown',
      recommendationScore: score,
      sessionId,
      metadata: { position, section },
    });
  }

  /**
   * Track click
   */
  trackClick(
    userId: string,
    itemId: string,
    itemType: 'destination' | 'package' | 'experience',
    sessionId: string,
    position: number,
    section: string,
    score: number
  ): void {
    this.trackEvent({
      userId,
      itemId,
      itemType,
      eventType: 'clicked',
      recommendationScore: score,
      sessionId,
      metadata: { position, section },
    });
  }

  /**
   * Track booking
   */
  trackBooking(
    userId: string,
    itemId: string,
    itemType: 'destination' | 'package' | 'experience',
    sessionId: string,
    position: number,
    section: string,
    score: number,
    bookingValue: number,
    bookingId: string
  ): void {
    this.trackEvent({
      userId,
      itemId,
      itemType,
      eventType: 'booked',
      recommendationScore: score,
      sessionId,
      metadata: {
        position,
        section,
        bookingValue,
        bookingId,
      },
    });
  }

  /**
   * Get conversion metrics for an item
   */
  getItemMetrics(itemId: string): ConversionMetrics {
    const itemEvents = this.events.filter(e => e.itemId === itemId);
    
    const impressions = itemEvents.filter(e => e.eventType === 'shown').length;
    const clicks = itemEvents.filter(e => e.eventType === 'clicked').length;
    const views = itemEvents.filter(e => e.eventType === 'viewed').length;
    const bookings = itemEvents.filter(e => e.eventType === 'booked').length;
    
    const bookingEvents = itemEvents.filter(e => e.eventType === 'booked');
    const revenue = bookingEvents.reduce(
      (sum, e) => sum + (e.metadata?.bookingValue || 0),
      0
    );

    return {
      impressions,
      clicks,
      views,
      bookings,
      clickThroughRate: impressions > 0 ? clicks / impressions : 0,
      conversionRate: clicks > 0 ? bookings / clicks : 0,
      revenue,
    };
  }

  /**
   * Get metrics for a section
   */
  getSectionMetrics(section: string): ConversionMetrics {
    const sectionEvents = this.events.filter(
      e => e.metadata?.section === section
    );

    const impressions = sectionEvents.filter(e => e.eventType === 'shown').length;
    const clicks = sectionEvents.filter(e => e.eventType === 'clicked').length;
    const views = sectionEvents.filter(e => e.eventType === 'viewed').length;
    const bookings = sectionEvents.filter(e => e.eventType === 'booked').length;

    const bookingEvents = sectionEvents.filter(e => e.eventType === 'booked');
    const revenue = bookingEvents.reduce(
      (sum, e) => sum + (e.metadata?.bookingValue || 0),
      0
    );

    return {
      impressions,
      clicks,
      views,
      bookings,
      clickThroughRate: impressions > 0 ? clicks / impressions : 0,
      conversionRate: clicks > 0 ? bookings / clicks : 0,
      revenue,
    };
  }

  /**
   * Get overall metrics
   */
  getOverallMetrics(): ConversionMetrics {
    const impressions = this.events.filter(e => e.eventType === 'shown').length;
    const clicks = this.events.filter(e => e.eventType === 'clicked').length;
    const views = this.events.filter(e => e.eventType === 'viewed').length;
    const bookings = this.events.filter(e => e.eventType === 'booked').length;

    const bookingEvents = this.events.filter(e => e.eventType === 'booked');
    const revenue = bookingEvents.reduce(
      (sum, e) => sum + (e.metadata?.bookingValue || 0),
      0
    );

    return {
      impressions,
      clicks,
      views,
      bookings,
      clickThroughRate: impressions > 0 ? clicks / impressions : 0,
      conversionRate: clicks > 0 ? bookings / clicks : 0,
      revenue,
    };
  }

  /**
   * Get top performing items
   */
  getTopPerformingItems(limit = 10): Array<{ itemId: string; metrics: ConversionMetrics }> {
    const itemIds = new Set(this.events.map(e => e.itemId));
    
    const itemMetrics: Array<{ itemId: string; metrics: ConversionMetrics }> = [];
    
    itemIds.forEach(itemId => {
      itemMetrics.push({
        itemId,
        metrics: this.getItemMetrics(itemId),
      });
    });

    return itemMetrics
      .filter(item => item.metrics.impressions > 0)
      .sort((a, b) => b.metrics.conversionRate - a.metrics.conversionRate)
      .slice(0, limit);
  }

  /**
   * Get worst performing items (for removal)
   */
  getWorstPerformingItems(limit = 10): Array<{ itemId: string; metrics: ConversionMetrics }> {
    return this.getTopPerformingItems(100)
      .slice(-limit)
      .reverse();
  }

  /**
   * Create A/B test
   */
  createABTest(testId: string, variants: Array<{ name: string; weight: number }>): void {
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    
    const abVariants: ABVariant[] = variants.map(v => ({
      id: `${testId}_${v.name}`,
      name: v.name,
      weight: v.weight / totalWeight,
      impressions: 0,
      conversions: 0,
    }));

    this.abTests.set(testId, abVariants);
  }

  /**
   * Get variant for user
   */
  getVariantForUser(testId: string, userId: string): ABVariant | null {
    const variants = this.abTests.get(testId);
    if (!variants) return null;

    // Deterministic assignment based on user ID
    const hash = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = hash % variants.length;
    
    return variants[index];
  }

  /**
   * Update A/B test stats
   */
  private updateABTest(event: RecommendationEvent): void {
    // This would normally track variant performance
    // Simplified for demo
  }

  /**
   * Get events for export
   */
  exportEvents(startDate?: string, endDate?: string): RecommendationEvent[] {
    let filtered = this.events;

    if (startDate) {
      filtered = filtered.filter(e => e.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(e => e.timestamp <= endDate);
    }

    return filtered;
  }

  /**
   * Get user journey
   */
  getUserJourney(userId: string): RecommendationEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Calculate score accuracy
   */
  calculateScoreAccuracy(): number {
    const clickedEvents = this.events.filter(e => e.eventType === 'clicked');
    
    if (clickedEvents.length === 0) return 0;

    // Higher scores should have higher click rates
    const highScoreClicks = clickedEvents.filter(e => e.recommendationScore >= 0.7).length;
    const lowScoreClicks = clickedEvents.filter(e => e.recommendationScore < 0.5).length;

    const totalHighScore = this.events.filter(e => e.recommendationScore >= 0.7).length;
    const totalLowScore = this.events.filter(e => e.recommendationScore < 0.5).length;

    const highCTR = totalHighScore > 0 ? highScoreClicks / totalHighScore : 0;
    const lowCTR = totalLowScore > 0 ? lowScoreClicks / totalLowScore : 0;

    // Score is good if high score items get more clicks
    return highCTR > lowCTR ? highCTR / (highCTR + lowCTR) : 0;
  }

  /**
   * Get daily metrics
   */
  getDailyMetrics(days = 7): Array<{ date: string; metrics: ConversionMetrics }> {
    const result: Array<{ date: string; metrics: ConversionMetrics }> = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = this.events.filter(e => 
        e.timestamp.split('T')[0] === dateStr
      );

      const impressions = dayEvents.filter(e => e.eventType === 'shown').length;
      const clicks = dayEvents.filter(e => e.eventType === 'clicked').length;
      const bookings = dayEvents.filter(e => e.eventType === 'booked').length;
      
      const bookingEvents = dayEvents.filter(e => e.eventType === 'booked');
      const revenue = bookingEvents.reduce(
        (sum, e) => sum + (e.metadata?.bookingValue || 0),
        0
      );

      result.push({
        date: dateStr,
        metrics: {
          impressions,
          clicks,
          views: 0,
          bookings,
          clickThroughRate: impressions > 0 ? clicks / impressions : 0,
          conversionRate: clicks > 0 ? bookings / clicks : 0,
          revenue,
        },
      });
    }

    return result.reverse();
  }
}

export const learningSystem = new LearningSystem();
