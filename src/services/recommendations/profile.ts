/**
 * Customer Profile Engine
 * 
 * Manages traveler intelligence profiles for personalization.
 */

// Travel styles
export type TravelStyle = 
  | 'luxury'
  | 'budget'
  | 'adventure'
  | 'family'
  | 'romantic'
  | 'cultural'
  | 'eco'
  | 'solo';

// Interests
export type Interest =
  | 'wildlife'
  | 'photography'
  | 'hiking'
  | 'beach'
  | 'culture'
  | 'history'
  | 'food'
  | 'shopping'
  | 'sports'
  | 'nature'
  | 'wellness'
  | 'nightlife';

// Age groups
export type AgeGroup = 
  | '18-25'
  | '26-35'
  | '36-45'
  | '46-55'
  | '56-65'
  | '65+';

// Accommodation preferences
export type AccommodationPreference =
  | 'luxury_lodge'
  | 'boutique_hotel'
  | 'mid_range'
  | 'budget'
  | 'camping'
  | 'homestay'
  | 'any';

// Customer profile
export interface CustomerProfile {
  id: string;
  userId: string;
  
  // Demographics
  ageGroup: AgeGroup;
  
  // Preferences
  travelStyle: TravelStyle[];
  interests: Interest[];
  accommodationPreference: AccommodationPreference;
  
  // Budget (monthly in USD)
  budgetRange: {
    min: number;
    max: number;
  };
  
  // Trip preferences
  preferredTripLength: {
    min: number;
    max: number;
  };
  preferredGroupSize: 'solo' | 'couple' | 'small_group' | 'large_group';
  
  // Location preferences
  preferredDestinations: string[];
  preferredClimate: 'tropical' | 'arid' | 'temperate' | 'any';
  
  // Behavior
  bookingFrequency: 'first_time' | 'occasional' | 'frequent' | 'very_frequent';
  advanceBookingDays: number;
  
  // Special requirements
  accessibilityNeeds: boolean;
  dietaryRestrictions: string[];
  
  // Computed scores
  preferenceScores: Record<Interest, number>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Default profile
export function createDefaultProfile(userId: string): CustomerProfile {
  return {
    id: `profile_${Date.now()}`,
    userId,
    ageGroup: '26-35',
    travelStyle: ['adventure'],
    interests: ['wildlife', 'nature'],
    accommodationPreference: 'mid_range',
    budgetRange: { min: 1000, max: 5000 },
    preferredTripLength: { min: 3, max: 10 },
    preferredGroupSize: 'small_group',
    preferredDestinations: [],
    preferredClimate: 'tropical',
    bookingFrequency: 'first_time',
    advanceBookingDays: 30,
    accessibilityNeeds: false,
    dietaryRestrictions: [],
    preferenceScores: {
      wildlife: 0.8,
      photography: 0.5,
      hiking: 0.6,
      beach: 0.4,
      culture: 0.5,
      history: 0.4,
      food: 0.5,
      shopping: 0.3,
      sports: 0.3,
      nature: 0.9,
      wellness: 0.3,
      nightlife: 0.2,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Profile update input
export interface ProfileUpdateInput {
  ageGroup?: AgeGroup;
  travelStyle?: TravelStyle[];
  interests?: Interest[];
  accommodationPreference?: AccommodationPreference;
  budgetRange?: { min: number; max: number };
  preferredTripLength?: { min: number; max: number };
  preferredGroupSize?: 'solo' | 'couple' | 'small_group' | 'large_group';
  preferredDestinations?: string[];
  preferredClimate?: 'tropical' | 'arid' | 'temperate' | 'any';
  bookingFrequency?: 'first_time' | 'occasional' | 'frequent' | 'very_frequent';
  advanceBookingDays?: number;
  accessibilityNeeds?: boolean;
  dietaryRestrictions?: string[];
}

/**
 * Customer Profile Service
 */
class CustomerProfileService {
  private profiles: Map<string, CustomerProfile> = new Map();

  /**
   * Create new profile
   */
  async createProfile(userId: string): Promise<CustomerProfile> {
    const profile = createDefaultProfile(userId);
    this.profiles.set(userId, profile);
    return profile;
  }

  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<CustomerProfile | null> {
    return this.profiles.get(userId) || null;
  }

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: ProfileUpdateInput): Promise<CustomerProfile | null> {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const updatedProfile: CustomerProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate preference scores
    updatedProfile.preferenceScores = this.calculatePreferenceScores(updatedProfile);

    this.profiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  /**
   * Calculate preference scores based on profile
   */
  private calculatePreferenceScores(profile: CustomerProfile): Record<Interest, number> {
    const scores: Record<Interest, number> = {
      wildlife: 0.5,
      photography: 0.5,
      hiking: 0.5,
      beach: 0.5,
      culture: 0.5,
      history: 0.5,
      food: 0.5,
      shopping: 0.5,
      sports: 0.5,
      nature: 0.5,
      wellness: 0.5,
      nightlife: 0.5,
    };

    // Boost scores based on interests
    profile.interests.forEach(interest => {
      scores[interest] = Math.min(scores[interest] + 0.3, 1.0);
    });

    // Boost based on travel style
    if (profile.travelStyle.includes('adventure')) {
      scores.hiking += 0.2;
      scores.nature += 0.2;
      scores.wildlife += 0.1;
    }
    if (profile.travelStyle.includes('luxury')) {
      scores.wellness += 0.2;
      scores.food += 0.2;
    }
    if (profile.travelStyle.includes('cultural')) {
      scores.culture += 0.3;
      scores.history += 0.3;
      scores.food += 0.2;
    }
    if (profile.travelStyle.includes('eco')) {
      scores.nature += 0.3;
      scores.wildlife += 0.2;
    }

    return scores;
  }

  /**
   * Add trip to history
   */
  async addTripToHistory(userId: string, trip: {
    destinationId: string;
    packageId?: string;
    interests: Interest[];
    rating?: number;
  }): Promise<void> {
    const profile = this.profiles.get(userId);
    if (!profile) return;

    // Increase preference scores for trip interests
    trip.interests.forEach(interest => {
      profile.preferenceScores[interest] = Math.min(
        profile.preferenceScores[interest] + 0.1 + (trip.rating || 0) * 0.05,
        1.0
      );
    });

    // Add destination to preferred
    if (!profile.preferredDestinations.includes(trip.destinationId)) {
      profile.preferredDestinations.push(trip.destinationId);
    }

    profile.updatedAt = new Date().toISOString();
    this.profiles.set(userId, profile);
  }

  /**
   * Get similar profiles (for collaborative filtering)
   */
  async getSimilarProfiles(userId: string, limit = 10): Promise<CustomerProfile[]> {
    const targetProfile = this.profiles.get(userId);
    if (!targetProfile) return [];

    const profiles: CustomerProfile[] = [];
    
    this.profiles.forEach(profile => {
      if (profile.userId === userId) return;
      
      const similarity = this.calculateProfileSimilarity(targetProfile, profile);
      profiles.push({ ...profile, preferenceScores: { ...profile.preferenceScores } });
    });

    return profiles
      .sort((a, b) => 
        this.calculateProfileSimilarity(targetProfile, a) - 
        this.calculateProfileSimilarity(targetProfile, b)
      )
      .slice(0, limit);
  }

  /**
   * Calculate similarity between two profiles
   */
  private calculateProfileSimilarity(a: CustomerProfile, b: CustomerProfile): number {
    let similarity = 0;

    // Travel style overlap
    const styleOverlap = a.travelStyle.filter(s => b.travelStyle.includes(s)).length;
    similarity += styleOverlap * 0.2;

    // Interest overlap
    const interestOverlap = a.interests.filter(i => b.interests.includes(i)).length;
    similarity += interestOverlap * 0.3;

    // Budget overlap
    const budgetOverlap = Math.min(a.budgetRange.max, b.budgetRange.max) -
                          Math.max(a.budgetRange.min, b.budgetRange.min);
    if (budgetOverlap > 0) {
      similarity += 0.2;
    }

    // Accommodation preference
    if (a.accommodationPreference === b.accommodationPreference) {
      similarity += 0.15;
    }

    // Destination overlap
    const destOverlap = a.preferredDestinations.filter(d => b.preferredDestinations.includes(d)).length;
    similarity += Math.min(destOverlap * 0.15, 0.15);

    return similarity;
  }

  /**
   * Export profile data
   */
  exportProfile(userId: string): object {
    const profile = this.profiles.get(userId);
    if (!profile) return {};

    return {
      demographics: {
        ageGroup: profile.ageGroup,
      },
      preferences: {
        travelStyles: profile.travelStyle,
        interests: profile.interests,
        accommodation: profile.accommodationPreference,
        budget: profile.budgetRange,
        tripLength: profile.preferredTripLength,
        groupSize: profile.preferredGroupSize,
      },
      behavior: {
        bookingFrequency: profile.bookingFrequency,
        advanceBooking: profile.advanceBookingDays,
      },
      preferencesHistory: profile.preferredDestinations,
    };
  }
}

export const customerProfileService = new CustomerProfileService();
