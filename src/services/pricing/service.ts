/**
 * Pricing Service
 * 
 * Service for managing pricing rules, campaigns, and calculations.
 * Integrates with PostgreSQL database when available.
 */

import {
  PriceCalculationRequest,
  PriceBreakdown,
  CalculatedPrice,
  PriceDisplay,
  PricingRule,
  PricingSeason,
  PromotionalCampaign,
  CreatePricingRuleRequest,
  CreateCampaignRequest,
  PromoCodeValidation,
  DEFAULT_SEASONS,
} from './types';
import { calculatePrice, validatePromoCode } from './calculator';

// Database integration (lazy import to avoid circular dependencies)
let db: typeof import('../../db/index.js') | null = null;
async function getDb() {
  if (!db) {
    db = await import('../../db/index.js');
  }
  return db;
}

// Mock storage
const pricingRules: Map<string, PricingRule[]> = new Map();
const campaigns: Map<string, PromotionalCampaign> = new Map();
const seasons: PricingSeason[] = DEFAULT_SEASONS.map((s, i) => ({
  ...s,
  id: `season_${i}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

/**
 * Pricing Service
 */
class PricingService {
  /**
   * Calculate price for an entity
   */
  async calculatePrice(request: PriceCalculationRequest): Promise<CalculatedPrice> {
    const { basePrice, entityId, travelers, travelDate, promoCode } = request;

    // Get applicable rules
    const rules = this.getApplicableRules(entityId, request.entityType, travelDate, travelers);

    // Calculate using pricing engine
    const breakdown = calculatePrice(request);

    // Apply promo code if provided
    let appliedPromotions: string[] = [];
    let finalPrice = breakdown.finalPrice;
    let discountAmount = 0;

    if (promoCode) {
      const validation = await this.validatePromoCode(promoCode, finalPrice);
      if (validation.valid && validation.calculatedDiscount) {
        discountAmount = validation.calculatedDiscount;
        finalPrice -= discountAmount;
        appliedPromotions.push(validation.campaign?.name || promoCode);
      }
    }

    // Calculate original (before any dynamic pricing)
    const originalPrice = basePrice * travelers;

    return {
      originalPrice,
      currentPrice: breakdown.subtotal,
      finalPrice,
      breakdown,
      appliedPromotions,
      expiresAt: this.getPriceExpiry(travelDate),
      nextPriceChange: this.getNextPriceChange(travelDate, entityId),
    };
  }

  /**
   * Get price display info
   */
  async getPriceDisplay(
    entityId: string,
    basePrice: number,
    travelers = 1
  ): Promise<PriceDisplay> {
    const today = new Date();
    const calculation = await this.calculatePrice({
      entityId,
      entityType: 'package',
      basePrice,
      travelDate: today.toISOString(),
      travelers,
    });

    return {
      original: calculation.originalPrice,
      current: calculation.currentPrice,
      final: calculation.finalPrice,
      currency: 'USD',
      hasDiscount: calculation.finalPrice < calculation.originalPrice,
      discountPercentage: calculation.finalPrice < calculation.originalPrice
        ? Math.round(((calculation.originalPrice - calculation.finalPrice) / calculation.originalPrice) * 100)
        : undefined,
      savings: calculation.originalPrice - calculation.finalPrice,
      perPerson: true,
    };
  }

  /**
   * Get applicable pricing rules
   */
  private getApplicableRules(
    entityId: string,
    entityType: string,
    travelDate: string,
    travelers: number
  ): PricingRule[] {
    const rules = pricingRules.get(entityId) || [];
    const date = new Date(travelDate);

    return rules.filter(rule => {
      if (!rule.isActive || !rule.isApproved) return false;

      const startDate = rule.startDate ? new Date(rule.startDate) : null;
      const endDate = rule.endDate ? new Date(rule.endDate) : null;

      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      if (rule.minTravelers && travelers < rule.minTravelers) return false;
      if (rule.maxTravelers && travelers > rule.maxTravelers) return false;

      return true;
    }).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get price expiry (prices valid for 24 hours)
   */
  private getPriceExpiry(travelDate: string): string {
    const expiry = new Date();
    expiry.setHours(23, 59, 59, 999);
    return expiry.toISOString();
  }

  /**
   * Get next price change info
   */
  private getNextPriceChange(travelDate: string, entityId: string): { date: string; newPrice: number; reason: string } | undefined {
    const date = new Date(travelDate);
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Check if entering a different season
    const currentSeason = this.getSeasonForDate(date, undefined);
    const nextSeason = this.getSeasonForDate(nextMonth, undefined);

    if (currentSeason?.id !== nextSeason?.id && nextSeason) {
      return {
        date: nextMonth.toISOString(),
        newPrice: 0, // Would calculate based on new season
        reason: `Price may change when ${nextSeason.name} begins`,
      };
    }

    return undefined;
  }

  // ==================== RULE MANAGEMENT ====================

  /**
   * Create a pricing rule
   */
  async createRule(request: CreatePricingRuleRequest): Promise<PricingRule> {
    const rule: PricingRule = {
      id: `rule_${Date.now()}`,
      entityId: request.entityId,
      entityType: request.entityType,
      ruleType: request.ruleType,
      action: request.action || 'percentage',
      percentageChange: request.percentageChange || 0,
      fixedAmount: request.fixedAmount || 0,
      startDate: request.startDate,
      endDate: request.endDate,
      minTravelers: request.minTravelers || 1,
      maxTravelers: request.maxTravelers,
      minDaysNotice: request.minDaysNotice,
      isWeekendOnly: request.isWeekendOnly || false,
      name: request.name,
      description: request.description,
      promoCode: request.promoCode,
      priority: request.priority || 0,
      isActive: request.isActive ?? true,
      isApproved: false,
      supplierId: request.supplierId,
      requiresSupplierApproval: !!request.supplierId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const entityRules = pricingRules.get(request.entityId) || [];
    entityRules.push(rule);
    pricingRules.set(request.entityId, entityRules);

    return rule;
  }

  /**
   * Get rules for an entity
   */
  async getRules(entityId: string): Promise<PricingRule[]> {
    return pricingRules.get(entityId) || [];
  }

  /**
   * Update a rule
   */
  async updateRule(ruleId: string, updates: Partial<PricingRule>): Promise<PricingRule | null> {
    for (const [entityId, rules] of pricingRules.entries()) {
      const index = rules.findIndex(r => r.id === ruleId);
      if (index !== -1) {
        rules[index] = { ...rules[index], ...updates, updatedAt: new Date().toISOString() };
        pricingRules.set(entityId, rules);
        return rules[index];
      }
    }
    return null;
  }

  /**
   * Approve a rule
   */
  async approveRule(ruleId: string, approvedBy: string): Promise<PricingRule | null> {
    return this.updateRule(ruleId, {
      isApproved: true,
      approvedBy,
      approvedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    for (const [entityId, rules] of pricingRules.entries()) {
      const filtered = rules.filter(r => r.id !== ruleId);
      if (filtered.length !== rules.length) {
        pricingRules.set(entityId, filtered);
        return true;
      }
    }
    return false;
  }

  // ==================== CAMPAIGN MANAGEMENT ====================

  /**
   * Create a campaign
   */
  async createCampaign(request: CreateCampaignRequest): Promise<PromotionalCampaign> {
    const campaign: PromotionalCampaign = {
      id: `campaign_${Date.now()}`,
      ...request,
      targetAudience: request.targetAudience || 'all',
      applicableEntities: request.applicableEntities || [],
      maxUsesPerUser: request.maxUsesPerUser || 1,
      currentUses: 0,
      isAutoApply: request.isAutoApply || false,
      status: 'draft',
      minPurchase: request.minPurchase || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(filters?: { status?: string; active?: boolean }): Promise<PromotionalCampaign[]> {
    let result = Array.from(campaigns.values());

    if (filters?.status) {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters?.active !== undefined) {
      const now = new Date();
      result = result.filter(c => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        return filters.active ? c.status === 'active' && now >= start && now <= end : true;
      });
    }

    return result.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string): Promise<PromotionalCampaign | null> {
    return campaigns.get(campaignId) || null;
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, updates: Partial<PromotionalCampaign>): Promise<PromotionalCampaign | null> {
    const campaign = campaigns.get(campaignId);
    if (!campaign) return null;

    const updated = { ...campaign, ...updates, updatedAt: new Date().toISOString() };
    campaigns.set(campaignId, updated);
    return updated;
  }

  /**
   * Activate campaign
   */
  async activateCampaign(campaignId: string): Promise<PromotionalCampaign | null> {
    return this.updateCampaign(campaignId, { status: 'active' });
  }

  /**
   * Deactivate campaign
   */
  async deactivateCampaign(campaignId: string): Promise<PromotionalCampaign | null> {
    return this.updateCampaign(campaignId, { status: 'paused' });
  }

  // ==================== PROMO CODE VALIDATION ====================

  /**
   * Validate promo code
   */
  async validatePromoCode(code: string, orderAmount: number): Promise<PromoCodeValidation> {
    const upperCode = code.toUpperCase();

    // Find campaign with this promo code
    const campaign = Array.from(campaigns.values()).find(
      c => c.promoCode?.toUpperCase() === upperCode
    );

    if (!campaign) {
      return {
        valid: false,
        code,
        error: 'Invalid promo code',
        errorCode: 'NOT_APPLICABLE',
      };
    }

    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    // Check if campaign is active
    if (campaign.status !== 'active') {
      return {
        valid: false,
        code,
        campaign,
        error: 'This promotion is not currently active',
        errorCode: 'EXPIRED',
      };
    }

    // Check date range
    if (now < startDate) {
      return {
        valid: false,
        code,
        campaign,
        error: `This promotion starts on ${startDate.toLocaleDateString()}`,
        errorCode: 'NOT_STARTED',
      };
    }

    if (now > endDate) {
      return {
        valid: false,
        code,
        campaign,
        error: 'This promotion has ended',
        errorCode: 'EXPIRED',
      };
    }

    // Check usage limits
    if (campaign.maxUses && campaign.currentUses >= campaign.maxUses) {
      return {
        valid: false,
        code,
        campaign,
        error: 'This promotion has reached its usage limit',
        errorCode: 'USAGE_LIMIT',
      };
    }

    // Check minimum purchase
    if (campaign.minPurchase && orderAmount < campaign.minPurchase) {
      return {
        valid: false,
        code,
        campaign,
        error: `Minimum purchase of $${campaign.minPurchase} required`,
        errorCode: 'MIN_PURCHASE',
        calculatedDiscount: 0,
      };
    }

    // Calculate discount
    let calculatedDiscount = 0;
    if (campaign.discountType === 'percentage') {
      calculatedDiscount = orderAmount * (campaign.discountValue / 100);
    } else if (campaign.discountType === 'fixed') {
      calculatedDiscount = campaign.discountValue;
    }

    // Apply max discount cap
    if (campaign.maxDiscount && calculatedDiscount > campaign.maxDiscount) {
      calculatedDiscount = campaign.maxDiscount;
    }

    return {
      valid: true,
      code,
      campaign,
      calculatedDiscount: Math.round(calculatedDiscount),
    };
  }

  /**
   * Redeem promo code
   */
  async redeemPromoCode(
    code: string,
    userId: string,
    bookingId: string,
    orderAmount: number
  ): Promise<{ success: boolean; discount: number; error?: string }> {
    const validation = await this.validatePromoCode(code, orderAmount);

    if (!validation.valid) {
      return {
        success: false,
        discount: 0,
        error: validation.error,
      };
    }

    // Update campaign usage
    if (validation.campaign) {
      validation.campaign.currentUses++;
      campaigns.set(validation.campaign.id, validation.campaign);
    }

    return {
      success: true,
      discount: validation.calculatedDiscount || 0,
    };
  }

  // ==================== SEASONS ====================

  /**
   * Get all seasons
   */
  async getSeasons(): Promise<PricingSeason[]> {
    return seasons;
  }

  /**
   * Get current season
   */
  async getCurrentSeason(region?: string): Promise<PricingSeason | null> {
    const now = new Date();
    return this.getSeasonForDate(now, region);
  }

  /**
   * Get season for date
   */
  private getSeasonForDate(date: Date, region?: string): PricingSeason | null {
    const month = date.getMonth() + 1;
    
    return seasons.find(s => {
      if (region && s.region !== region) return false;
      if (!s.isActive) return false;
      
      // Handle date ranges across year boundary
      if (s.startMonth <= s.endMonth) {
        return month >= s.startMonth && month <= s.endMonth;
      } else {
        return month >= s.startMonth || month <= s.endMonth;
      }
    }) || null;
  }

  /**
   * Update season
   */
  async updateSeason(seasonId: string, updates: Partial<PricingSeason>): Promise<PricingSeason | null> {
    const index = seasons.findIndex(s => s.id === seasonId);
    if (index === -1) return null;

    seasons[index] = { ...seasons[index], ...updates, updatedAt: new Date().toISOString() };
    return seasons[index];
  }

  // ==================== ANALYTICS ====================

  /**
   * Get pricing analytics
   */
  async getAnalytics(entityId: string): Promise<{
    totalRules: number;
    activeRules: number;
    pendingApprovals: number;
    averageDiscount: number;
    campaigns: number;
  }> {
    const rules = pricingRules.get(entityId) || [];

    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.isActive && r.isApproved).length,
      pendingApprovals: rules.filter(r => r.isActive && !r.isApproved).length,
      averageDiscount: rules.length > 0
        ? rules.reduce((sum, r) => sum + r.percentageChange, 0) / rules.length
        : 0,
      campaigns: Array.from(campaigns.values()).filter(
        c => c.applicableEntities.includes(entityId)
      ).length,
    };
  }
}

export const pricingService = new PricingService();
