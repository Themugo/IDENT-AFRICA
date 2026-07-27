/**
 * Advanced Analytics Service
 * 
 * Centralized analytics engine for IDENT AFRICA.
 */

import { v4 as uuidv4 } from 'uuid';

// Event Types
export type EventType = 
  // User Events
  | 'page_view' | 'destination_view' | 'package_view' | 'accommodation_view'
  | 'search' | 'filter' | 'favorite_add' | 'favorite_remove'
  | 'itinerary_create' | 'itinerary_modify' | 'itinerary_save'
  | 'booking_start' | 'booking_abandon' | 'booking_complete' | 'booking_cancel'
  | 'signup' | 'login' | 'logout'
  // AI Events
  | 'ai_question' | 'ai_recommendation' | 'ai_recommendation_click' | 'ai_itinerary_generate'
  // Business Events
  | 'payment_received' | 'payment_failed' | 'refund' | 'commission_earned';

// Entity Types
export type EntityType = 'destination' | 'package' | 'accommodation' | 'experience' | 'supplier' | 'user' | 'booking';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: EventType;
  entityType?: EntityType;
  entityId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  // Context
  page?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  country?: string;
  city?: string;
}

export interface MetricSummary {
  revenue: { total: number; change: number };
  bookings: { total: number; change: number };
  customers: { total: number; new: number; returning: number };
  conversion: { rate: number; change: number };
  avgBookingValue: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  secondaryValue?: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  value: number;
  secondaryValue?: number;
  change?: number;
}

// Analytics Service Class
export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string = '';

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event
   */
  track(event: Omit<AnalyticsEvent, 'id' | 'sessionId' | 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      id: uuidv4(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };
    
    this.events.push(fullEvent);
    
    // In production, send to analytics backend
    this.sendToBackend(fullEvent);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, metadata?: Record<string, unknown>): void {
    this.track({
      eventType: 'page_view',
      page,
      metadata: metadata || {},
    });
  }

  /**
   * Track destination view
   */
  trackDestinationView(destinationId: string, metadata?: Record<string, unknown>): void {
    this.track({
      eventType: 'destination_view',
      entityType: 'destination',
      entityId: destinationId,
      metadata: metadata || {},
    });
  }

  /**
   * Track package view
   */
  trackPackageView(packageId: string, metadata?: Record<string, unknown>): void {
    this.track({
      eventType: 'package_view',
      entityType: 'package',
      entityId: packageId,
      metadata: metadata || {},
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, results: number, metadata?: Record<string, unknown>): void {
    this.track({
      eventType: 'search',
      metadata: { query, results, ...metadata },
    });
  }

  /**
   * Track favorite
   */
  trackFavorite(action: 'add' | 'remove', entityType: EntityType, entityId: string): void {
    const eventType: EventType = action === 'add' ? 'favorite_add' : 'favorite_remove';
    this.track({
      eventType,
      entityType,
      entityId,
      metadata: {},
    });
  }

  /**
   * Track booking funnel
   */
  trackBookingFunnel(stage: 'start' | 'complete' | 'cancel', bookingId: string, value?: number): void {
    const eventMap: Record<string, EventType> = {
      start: 'booking_start',
      complete: 'booking_complete',
      cancel: 'booking_cancel',
    };
    
    this.track({
      eventType: eventMap[stage],
      entityType: 'booking',
      entityId: bookingId,
      metadata: value ? { value } : {},
    });
  }

  /**
   * Track AI interaction
   */
  trackAI(action: 'question' | 'recommendation_click' | 'itinerary', metadata?: Record<string, unknown>): void {
    const eventMap: Record<string, EventType> = {
      question: 'ai_question',
      recommendation_click: 'ai_recommendation_click',
      itinerary: 'ai_itinerary_generate',
    };
    
    this.track({
      eventType: eventMap[action],
      metadata: metadata || {},
    });
  }

  /**
   * Track revenue
   */
  trackRevenue(amount: number, bookingId: string, currency = 'USD'): void {
    this.track({
      eventType: 'payment_received',
      entityType: 'booking',
      entityId: bookingId,
      metadata: { amount, currency },
    });
  }

  /**
   * Get events by type
   */
  getEventsByType(type: EventType): AnalyticsEvent[] {
    return this.events.filter(e => e.eventType === type);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string): AnalyticsEvent[] {
    return this.events.filter(e => e.userId === userId);
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(): number {
    const starts = this.events.filter(e => e.eventType === 'booking_start').length;
    const completes = this.events.filter(e => e.eventType === 'booking_complete').length;
    return starts > 0 ? (completes / starts) * 100 : 0;
  }

  /**
   * Get revenue total
   */
  getRevenueTotal(): number {
    return this.events
      .filter(e => e.eventType === 'payment_received')
      .reduce((sum, e) => sum + ((e.metadata?.amount as number) || 0), 0);
  }

  /**
   * Get top performing destinations
   */
  getTopDestinations(limit = 10): TopPerformer[] {
    const views = this.events.filter(e => e.eventType === 'destination_view');
    const counts = new Map<string, number>();
    
    views.forEach(v => {
      if (v.entityId) {
        counts.set(v.entityId, (counts.get(v.entityId) || 0) + 1);
      }
    });
    
    return Array.from(counts.entries())
      .map(([id, count]) => ({ id, name: id, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics(): { query: string; count: number }[] {
    const searches = this.events.filter(e => e.eventType === 'search');
    const counts = new Map<string, number>();
    
    searches.forEach(s => {
      const query = (s.metadata?.query as string) || '';
      if (query) counts.set(query, (counts.get(query) || 0) + 1);
    });
    
    return Array.from(counts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Generate report data
   */
  generateReport(period: 'day' | 'week' | 'month' | 'year'): MetricSummary {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case 'month': startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break;
      case 'year': startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
    }
    
    const periodEvents = this.events.filter(e => new Date(e.timestamp) >= startDate);
    
    const revenue = periodEvents
      .filter(e => e.eventType === 'payment_received')
      .reduce((sum, e) => sum + ((e.metadata?.amount as number) || 0), 0);
    
    const bookings = periodEvents.filter(e => e.eventType === 'booking_complete').length;
    
    const users = new Set(periodEvents.map(e => e.userId).filter(Boolean)).size;
    
    const conversion = this.calculateConversionRate();
    
    return {
      revenue: { total: revenue, change: 0 },
      bookings: { total: bookings, change: 0 },
      customers: { total: users, new: 0, returning: 0 },
      conversion: { rate: conversion, change: 0 },
      avgBookingValue: bookings > 0 ? revenue / bookings : 0,
    };
  }

  /**
   * Send event to backend
   */
  private sendToBackend(event: AnalyticsEvent): void {
    // In production, this would send to your analytics API
    console.log('[Analytics]', event.eventType, event.metadata);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton instance
export const analytics = new AnalyticsService();
