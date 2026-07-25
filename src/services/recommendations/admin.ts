/**
 * Recommendation Admin Controls
 * 
 * Admin interface for adjusting recommendation weights and settings.
 */

import { RecommendationWeights, DEFAULT_WEIGHTS } from './engine';

// Admin settings
export interface AdminSettings {
  weights: RecommendationWeights;
  enabled: boolean;
  personalizationEnabled: boolean;
  collaborativeEnabled: boolean;
  seasonalEnabled: boolean;
  minScoreThreshold: number;
  maxRecommendations: number;
  recencyDays: number;
  popularityBoost: boolean;
}

// Default settings
export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  weights: { ...DEFAULT_WEIGHTS },
  enabled: true,
  personalizationEnabled: true,
  collaborativeEnabled: true,
  seasonalEnabled: true,
  minScoreThreshold: 0.3,
  maxRecommendations: 20,
  recencyDays: 30,
  popularityBoost: true,
};

// Preset configurations
export const WEIGHT_PRESETS: Record<string, Partial<RecommendationWeights>> = {
  luxury: {
    customerPreference: 0.35,
    budget: 0.10,
    ratings: 0.25,
    popularity: 0.10,
  },
  budget: {
    customerPreference: 0.20,
    budget: 0.35,
    popularity: 0.20,
    ratings: 0.15,
  },
  adventure: {
    customerPreference: 0.30,
    seasonality: 0.20,
    popularity: 0.15,
    collaborative: 0.15,
  },
  family: {
    customerPreference: 0.25,
    budget: 0.20,
    ratings: 0.20,
    availability: 0.15,
  },
  romantic: {
    customerPreference: 0.35,
    ratings: 0.25,
    budget: 0.15,
    seasonality: 0.10,
  },
};

// Admin actions log
interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  previousValue: unknown;
  newValue: unknown;
  timestamp: string;
}

/**
 * Admin Controller
 */
class RecommendationAdminController {
  private settings: AdminSettings = { ...DEFAULT_ADMIN_SETTINGS };
  private actionLog: AdminAction[] = [];

  /**
   * Get current settings
   */
  getSettings(): AdminSettings {
    return { ...this.settings };
  }

  /**
   * Update weights
   */
  updateWeights(weights: Partial<RecommendationWeights>, adminId: string): void {
    const previousWeights = { ...this.settings.weights };
    
    this.settings.weights = {
      ...this.settings.weights,
      ...weights,
    };

    // Normalize weights to sum to 1
    const total = Object.values(this.settings.weights).reduce((sum, w) => sum + w, 0);
    if (total !== 1) {
      Object.keys(this.settings.weights).forEach(key => {
        this.settings.weights[key as keyof RecommendationWeights] /= total;
      });
    }

    this.logAction(adminId, 'update_weights', previousWeights, this.settings.weights);
  }

  /**
   * Apply preset
   */
  applyPreset(presetName: string, adminId: string): boolean {
    const preset = WEIGHT_PRESETS[presetName];
    if (!preset) return false;

    this.updateWeights(preset, adminId);
    return true;
  }

  /**
   * Update general settings
   */
  updateSettings(updates: Partial<AdminSettings>, adminId: string): void {
    const previousSettings = { ...this.settings };

    this.settings = {
      ...this.settings,
      ...updates,
    };

    this.logAction(adminId, 'update_settings', previousSettings, this.settings);
  }

  /**
   * Toggle feature
   */
  toggleFeature(
    feature: 'enabled' | 'personalizationEnabled' | 'collaborativeEnabled' | 'seasonalEnabled' | 'popularityBoost',
    adminId: string
  ): void {
    const previousValue = this.settings[feature];
    this.settings[feature] = !previousValue;
    this.logAction(adminId, `toggle_${feature}`, previousValue, this.settings[feature]);
  }

  /**
   * Set threshold
   */
  setMinScoreThreshold(threshold: number, adminId: string): void {
    const previousValue = this.settings.minScoreThreshold;
    this.settings.minScoreThreshold = Math.max(0, Math.min(1, threshold));
    this.logAction(adminId, 'set_threshold', previousValue, this.settings.minScoreThreshold);
  }

  /**
   * Set max recommendations
   */
  setMaxRecommendations(max: number, adminId: string): void {
    const previousValue = this.settings.maxRecommendations;
    this.settings.maxRecommendations = Math.max(1, Math.min(50, max));
    this.logAction(adminId, 'set_max_recs', previousValue, this.settings.maxRecommendations);
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(adminId: string): void {
    const previousSettings = { ...this.settings };
    this.settings = { ...DEFAULT_ADMIN_SETTINGS };
    this.logAction(adminId, 'reset_defaults', previousSettings, this.settings);
  }

  /**
   * Get action log
   */
  getActionLog(limit = 50): AdminAction[] {
    return this.actionLog.slice(-limit);
  }

  /**
   * Log admin action
   */
  private logAction(adminId: string, action: string, previousValue: unknown, newValue: unknown): void {
    this.actionLog.push({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adminId,
      action,
      previousValue,
      newValue,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 actions
    if (this.actionLog.length > 1000) {
      this.actionLog.shift();
    }
  }

  /**
   * Export configuration
   */
  exportConfiguration(): object {
    return {
      settings: this.settings,
      presets: WEIGHT_PRESETS,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import configuration
   */
  importConfiguration(config: Partial<AdminSettings>, adminId: string): boolean {
    try {
      if (config.weights) {
        this.updateWeights(config.weights, adminId);
      }
      
      const otherSettings = { ...config };
      delete otherSettings.weights;
      
      if (Object.keys(otherSettings).length > 0) {
        this.updateSettings(otherSettings, adminId);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get weight suggestions based on metrics
   */
  suggestWeightAdjustments(metrics: {
    ctr: number;
    conversionRate: number;
    revenue: number;
  }): Partial<RecommendationWeights> {
    const suggestions: Partial<RecommendationWeights> = {};

    if (metrics.ctr < 0.05) {
      // Low click-through rate - increase popularity/collaborative
      suggestions.popularity = 0.20;
      suggestions.collaborative = 0.10;
    }

    if (metrics.conversionRate < 0.03) {
      // Low conversion - improve relevance scoring
      suggestions.customerPreference = 0.30;
      suggestions.ratings = 0.20;
    }

    if (metrics.revenue < 10000) {
      // Low revenue - adjust for higher-value items
      suggestions.budget = 0.25;
      suggestions.ratings = 0.20;
    }

    return suggestions;
  }

  /**
   * Get preset list
   */
  getPresets(): Array<{ name: string; description: string; weights: Partial<RecommendationWeights> }> {
    return [
      {
        name: 'luxury',
        description: 'Focus on high-end preferences and ratings for luxury travelers',
        weights: WEIGHT_PRESETS.luxury,
      },
      {
        name: 'budget',
        description: 'Prioritize budget matching and popularity for price-conscious travelers',
        weights: WEIGHT_PRESETS.budget,
      },
      {
        name: 'adventure',
        description: 'Emphasize personalization and collaborative filtering for adventure seekers',
        weights: WEIGHT_PRESETS.adventure,
      },
      {
        name: 'family',
        description: 'Balance preferences with ratings and availability for families',
        weights: WEIGHT_PRESETS.family,
      },
      {
        name: 'romantic',
        description: 'Focus on preferences and ratings for couples and honeymooners',
        weights: WEIGHT_PRESETS.romantic,
      },
    ];
  }
}

export const recommendationAdmin = new RecommendationAdminController();
