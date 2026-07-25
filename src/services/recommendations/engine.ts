/**
 * Recommendation Engine
 * 
 * Scoring engine for personalized recommendations.
 */

import { CustomerProfile, Interest } from './profile';

// Recommendation weights (admin configurable)
export interface RecommendationWeights {
  customerPreference: number;    // How well it matches customer preferences
  seasonality: number;           // Current season relevance
  budget: number;               // Budget match
  popularity: number;           // Popularity/booking rate
  ratings: number;               // Customer ratings
  availability: number;          // Availability score
  recency: number;              // Recently viewed/booked
  collaborative: number;         // Similar users liked this
}

// Default weights
export const DEFAULT_WEIGHTS: RecommendationWeights = {
  customerPreference: 0.25,
  seasonality: 0.15,
  budget: 0.20,
  popularity: 0.15,
  ratings: 0.15,
  availability: 0.05,
  recency: 0.03,
  collaborative: 0.02,
};

// Destination/package data
export interface RecommendableItem {
  id: string;
  type: 'destination' | 'package' | 'experience';
  name: string;
  description: string;
  imageUrl: string;
  
  // Attributes for scoring
  price: number;
  rating: number;
  reviewCount: number;
  
  // Tags/interests it fulfills
  interests: Interest[];
  
  // Categories
  travelStyles: string[];
  ageGroups: string[];
  
  // Seasonality
  bestMonths: number[];  // 1-12
  
  // Location
  country: string;
  region: string;
  
  // Metadata
  popularity: number;     // 0-1
  availability: number;   // 0-1 (1 = always available)
  isTrending: boolean;
  
  // For experiences
  duration?: number;      // in days
}

// Recommendation result
export interface Recommendation {
  item: RecommendableItem;
  score: number;
  reasons: string[];
  matchBreakdown: {
    preference: number;
    seasonality: number;
    budget: number;
    popularity: number;
    ratings: number;
    availability: number;
    recency: number;
    collaborative: number;
  };
}

/**
 * Recommendation Engine
 */
class RecommendationEngine {
  private weights: RecommendationWeights = { ...DEFAULT_WEIGHTS };
  private recentViews: Map<string, string[]> = new Map();  // userId -> itemIds
  private clickHistory: Map<string, Map<string, number>> = new Map();  // userId -> itemId -> clicks

  /**
   * Update weights (admin control)
   */
  setWeights(weights: Partial<RecommendationWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Get current weights
   */
  getWeights(): RecommendationWeights {
    return { ...this.weights };
  }

  /**
   * Reset weights to default
   */
  resetWeights(): void {
    this.weights = { ...DEFAULT_WEIGHTS };
  }

  /**
   * Get recommendations for a customer
   */
  async getRecommendations(
    profile: CustomerProfile,
    items: RecommendableItem[],
    options: {
      limit?: number;
      excludeIds?: string[];
      type?: 'destination' | 'package' | 'experience';
    } = {}
  ): Promise<Recommendation[]> {
    const { limit = 10, excludeIds = [], type } = options;

    // Filter items
    let filteredItems = items;
    
    if (type) {
      filteredItems = filteredItems.filter(item => item.type === type);
    }
    
    if (excludeIds.length > 0) {
      filteredItems = filteredItems.filter(item => !excludeIds.includes(item.id));
    }

    // Score each item
    const scoredItems = filteredItems.map(item => ({
      item,
      score: this.calculateScore(item, profile),
      reasons: this.generateReasons(item, profile),
      breakdown: this.calculateBreakdown(item, profile),
    }));

    // Sort by score
    scoredItems.sort((a, b) => b.score - a.score);

    return scoredItems.slice(0, limit).map(s => ({
      item: s.item,
      score: s.score,
      reasons: s.reasons,
      matchBreakdown: s.breakdown,
    }));
  }

  /**
   * Calculate overall score
   */
  private calculateScore(item: RecommendableItem, profile: CustomerProfile): number {
    const breakdown = this.calculateBreakdown(item, profile);
    
    return (
      breakdown.preference * this.weights.customerPreference +
      breakdown.seasonality * this.weights.seasonality +
      breakdown.budget * this.weights.budget +
      breakdown.popularity * this.weights.popularity +
      breakdown.ratings * this.weights.ratings +
      breakdown.availability * this.weights.availability +
      breakdown.recency * this.weights.recency +
      breakdown.collaborative * this.weights.collaborative
    );
  }

  /**
   * Calculate score breakdown
   */
  private calculateBreakdown(item: RecommendableItem, profile: CustomerProfile): Recommendation['matchBreakdown'] {
    const userId = profile.userId;
    
    return {
      preference: this.scorePreferenceMatch(item, profile),
      seasonality: this.scoreSeasonality(item),
      budget: this.scoreBudgetMatch(item, profile),
      popularity: item.popularity,
      ratings: this.scoreRatings(item),
      availability: item.availability,
      recency: this.scoreRecency(item.id, userId),
      collaborative: this.scoreCollaborative(item.id, userId),
    };
  }

  /**
   * Score preference match
   */
  private scorePreferenceMatch(item: RecommendableItem, profile: CustomerProfile): number {
    let score = 0;
    
    // Interest match
    const interestScore = item.interests.reduce((sum, interest) => {
      return sum + (profile.preferenceScores[interest] || 0.5);
    }, 0) / Math.max(item.interests.length, 1);
    score += interestScore * 0.5;

    // Travel style match
    const styleMatch = item.travelStyles.filter(s => 
      profile.travelStyle.includes(s as any)
    ).length;
    const styleScore = styleMatch > 0 ? styleMatch / profile.travelStyle.length : 0;
    score += styleScore * 0.3;

    // Age group match
    if (item.ageGroups.includes(profile.ageGroup)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Score seasonality
   */
  private scoreSeasonality(item: RecommendableItem): number {
    const currentMonth = new Date().getMonth() + 1;
    
    if (item.bestMonths.includes(currentMonth)) {
      return 1.0;
    }
    
    // Check if within +/- 1 month of best
    const nearBest = item.bestMonths.some(month => {
      return Math.abs(month - currentMonth) <= 1 || 
             Math.abs(month - currentMonth) >= 11;
    });
    
    return nearBest ? 0.7 : 0.3;
  }

  /**
   * Score budget match
   */
  private scoreBudgetMatch(item: RecommendableItem, profile: CustomerProfile): number {
    const { min, max } = profile.budgetRange;
    
    if (item.price >= min && item.price <= max) {
      // Perfect match
      return 1.0;
    }
    
    // Within 20% of budget
    if (item.price >= min * 0.8 && item.price <= max * 1.2) {
      return 0.7;
    }
    
    // Within 50% of budget
    if (item.price >= min * 0.5 && item.price <= max * 1.5) {
      return 0.4;
    }
    
    return 0.1;
  }

  /**
   * Score ratings
   */
  private scoreRatings(item: RecommendableItem): number {
    // Weight by both rating and number of reviews
    const ratingScore = item.rating / 5;
    const reviewBonus = Math.min(item.reviewCount / 100, 1) * 0.2;
    
    return Math.min(ratingScore + reviewBonus, 1.0);
  }

  /**
   * Score recency (recently viewed)
   */
  private scoreRecency(itemId: string, userId: string): number {
    const userViews = this.recentViews.get(userId) || [];
    const index = userViews.indexOf(itemId);
    
    if (index === -1) return 0;
    
    // Higher score for more recent views
    return Math.max(0, 1 - (index * 0.2));
  }

  /**
   * Score collaborative filtering
   */
  private scoreCollaborative(itemId: string, userId: string): number {
    const userClicks = this.clickHistory.get(userId);
    if (!userClicks) return 0.5;

    const clicks = userClicks.get(itemId) || 0;
    return Math.min(clicks / 10, 1.0);
  }

  /**
   * Generate human-readable reasons
   */
  private generateReasons(item: RecommendableItem, profile: CustomerProfile): string[] {
    const reasons: string[] = [];

    // Preference match
    const topInterest = item.interests.reduce((top, interest) => {
      const score = profile.preferenceScores[interest] || 0;
      return score > (profile.preferenceScores[top] || 0) ? interest : top;
    }, item.interests[0]);

    if (topInterest && profile.preferenceScores[topInterest] > 0.6) {
      reasons.push(`Matches your ${topInterest} interest`);
    }

    // Style match
    const matchingStyle = item.travelStyles.find(s => 
      profile.travelStyle.includes(s as any)
    );
    if (matchingStyle) {
      reasons.push(`${matchingStyle.charAt(0).toUpperCase() + matchingStyle.slice(1)} experience`);
    }

    // Budget
    if (item.price >= profile.budgetRange.min && item.price <= profile.budgetRange.max) {
      reasons.push('Within your budget');
    }

    // Rating
    if (item.rating >= 4.5) {
      reasons.push(`Highly rated (${item.rating}/5)`);
    }

    // Trending
    if (item.isTrending) {
      reasons.push('Trending now');
    }

    // Popular
    if (item.popularity > 0.8) {
      reasons.push('Popular choice');
    }

    // Season
    const currentMonth = new Date().getMonth() + 1;
    if (item.bestMonths.includes(currentMonth)) {
      reasons.push('Perfect time to visit');
    }

    return reasons;
  }

  /**
   * Track view
   */
  trackView(userId: string, itemId: string): void {
    const views = this.recentViews.get(userId) || [];
    
    // Remove if already exists
    const index = views.indexOf(itemId);
    if (index > -1) {
      views.splice(index, 1);
    }
    
    // Add to front
    views.unshift(itemId);
    
    // Keep only last 20
    if (views.length > 20) {
      views.pop();
    }
    
    this.recentViews.set(userId, views);
  }

  /**
   * Track click
   */
  trackClick(userId: string, itemId: string): void {
    if (!this.clickHistory.has(userId)) {
      this.clickHistory.set(userId, new Map());
    }
    
    const clicks = this.clickHistory.get(userId)!;
    clicks.set(itemId, (clicks.get(itemId) || 0) + 1);
  }

  /**
   * Track booking
   */
  trackBooking(userId: string, itemId: string): void {
    // Booking is a strong positive signal
    if (!this.clickHistory.has(userId)) {
      this.clickHistory.set(userId, new Map());
    }
    
    const clicks = this.clickHistory.get(userId)!;
    clicks.set(itemId, (clicks.get(itemId) || 0) + 5);
    
    // Also add to recent views
    this.trackView(userId, itemId);
  }

  /**
   * Get "Because you liked" recommendations
   */
  async getBecauseYouLiked(
    profile: CustomerProfile,
    items: RecommendableItem[],
    sourceItemId: string,
    limit = 5
  ): Promise<Recommendation[]> {
    const sourceItem = items.find(i => i.id === sourceItemId);
    if (!sourceItem) return [];

    // Find items with similar attributes
    const similarItems = items.filter(item => {
      if (item.id === sourceItemId) return false;
      
      // Check interest overlap
      const interestOverlap = item.interests.filter(i => 
        sourceItem.interests.includes(i)
      ).length;
      
      return interestOverlap >= 1;
    });

    return this.getRecommendations(profile, similarItems, { limit });
  }

  /**
   * Get trending items
   */
  async getTrending(
    profile: CustomerProfile,
    items: RecommendableItem[],
    limit = 5
  ): Promise<Recommendation[]> {
    const trending = items.filter(item => item.isTrending);
    return this.getRecommendations(profile, trending, { limit });
  }

  /**
   * Get seasonal recommendations
   */
  async getSeasonal(
    profile: CustomerProfile,
    items: RecommendableItem[],
    limit = 5
  ): Promise<Recommendation[]> {
    const currentMonth = new Date().getMonth() + 1;
    const seasonal = items.filter(item => item.bestMonths.includes(currentMonth));
    return this.getRecommendations(profile, seasonal, { limit });
  }

  /**
   * Get personalized homepage sections
   */
  async getHomepageRecommendations(
    profile: CustomerProfile,
    items: RecommendableItem[]
  ): Promise<{
    recommendedForYou: Recommendation[];
    becauseYouLiked: Recommendation[];
    trending: Recommendation[];
    seasonal: Recommendation[];
  }> {
    const recentViews = this.recentViews.get(profile.userId) || [];
    const lastViewedId = recentViews[0];

    const [recommendedForYou, becauseYouLiked, trending, seasonal] = await Promise.all([
      this.getRecommendations(profile, items, { limit: 10 }),
      lastViewedId 
        ? this.getBecauseYouLiked(profile, items, lastViewedId, 5)
        : Promise.resolve([]),
      this.getTrending(profile, items, 5),
      this.getSeasonal(profile, items, 5),
    ]);

    return {
      recommendedForYou,
      becauseYouLiked,
      trending,
      seasonal,
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
