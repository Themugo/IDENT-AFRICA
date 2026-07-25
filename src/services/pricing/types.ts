/**
 * Pricing Types
 * 
 * Type definitions for dynamic pricing system.
 */

// Rule types
export type PricingRuleType =
  | 'base'
  | 'season'
  | 'weekend'
  | 'peak'
  | 'discount'
  | 'promotion'
  | 'early_bird'
  | 'last_minute'
  | 'group'
  | 'supplier_adjustment';

// Price actions
export type PricingAction = 'add' | 'subtract' | 'multiply' | 'percentage';

// Entity types
export type PricingEntityType = 'destination' | 'package' | 'experience';

// Season types
export type SeasonType = 'peak' | 'high' | 'shoulder' | 'low';

// Campaign types
export type CampaignType = 'flash_sale' | 'seasonal' | 'loyalty' | 'referral' | 'early_bird' | 'last_minute';

// Discount types
export type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'tiered';

// Campaign status
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

// Target audience
export type TargetAudience = 'all' | 'new_users' | 'returning' | 'vip' | 'suppliers';

// Pricing rule
export interface PricingRule {
  id: string;
  entityId: string;
  entityType: PricingEntityType;
  ruleType: PricingRuleType;
  action: PricingAction;
  percentageChange: number;
  fixedAmount: number;
  startDate?: string;
  endDate?: string;
  minTravelers: number;
  maxTravelers?: number;
  minDaysNotice?: number;
  isWeekendOnly: boolean;
  name: string;
  description?: string;
  promoCode?: string;
  priority: number;
  isActive: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  supplierId?: string;
  requiresSupplierApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pricing season
export interface PricingSeason {
  id: string;
  name: string;
  seasonType: SeasonType;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  priceMultiplier: number;
  appliesToAll: boolean;
  entityIds: string[];
  region?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Promotional campaign
export interface PromotionalCampaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  campaignType: CampaignType;
  startDate: string;
  endDate: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minPurchase: number;
  targetAudience: TargetAudience;
  applicableEntities: string[];
  maxUses?: number;
  maxUsesPerUser: number;
  currentUses: number;
  promoCode?: string;
  isAutoApply: boolean;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

// Campaign redemption
export interface CampaignRedemption {
  id: string;
  campaignId: string;
  userId: string;
  bookingId?: string;
  promoCode: string;
  discountApplied: number;
  createdAt: string;
}

// Price calculation request
export interface PriceCalculationRequest {
  entityId: string;
  entityType: PricingEntityType;
  basePrice: number;
  travelDate: string;
  travelers: number;
  promoCode?: string;
  userId?: string;
  isWeekendTravel?: boolean;
}

// Price breakdown
export interface PriceBreakdown {
  basePrice: number;
  subtotal: number;
  adjustments: PriceAdjustment[];
  discounts: PriceAdjustment[];
  taxes: TaxAmount[];
  total: number;
  savings: number;
  finalPrice: number;
  currency: string;
}

// Price adjustment
export interface PriceAdjustment {
  ruleId: string;
  ruleName: string;
  ruleType: PricingRuleType;
  type: 'surcharge' | 'discount';
  calculation: 'percentage' | 'fixed';
  value: number;
  amount: number;
  description: string;
}

// Tax amount
export interface TaxAmount {
  name: string;
  rate: number;
  amount: number;
}

// Calculated price response
export interface CalculatedPrice {
  originalPrice: number;
  currentPrice: number;
  finalPrice: number;
  breakdown: PriceBreakdown;
  appliedPromotions: string[];
  expiresAt?: string;
  nextPriceChange?: {
    date: string;
    newPrice: number;
    reason: string;
  };
}

// Price display
export interface PriceDisplay {
  original: number;
  current: number;
  final: number;
  currency: string;
  hasDiscount: boolean;
  discountPercentage?: number;
  savings?: number;
  perPerson: boolean;
  perUnit?: string;
}

// Rule creation
export interface CreatePricingRuleRequest {
  entityId: string;
  entityType: PricingEntityType;
  ruleType: PricingRuleType;
  action?: PricingAction;
  percentageChange?: number;
  fixedAmount?: number;
  startDate?: string;
  endDate?: string;
  minTravelers?: number;
  maxTravelers?: number;
  minDaysNotice?: number;
  isWeekendOnly?: boolean;
  name: string;
  description?: string;
  promoCode?: string;
  priority?: number;
  isActive?: boolean;
  supplierId?: string;
}

// Campaign creation
export interface CreateCampaignRequest {
  name: string;
  slug: string;
  description?: string;
  campaignType: CampaignType;
  startDate: string;
  endDate: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minPurchase?: number;
  targetAudience?: TargetAudience;
  applicableEntities?: string[];
  maxUses?: number;
  maxUsesPerUser?: number;
  promoCode?: string;
  isAutoApply?: boolean;
}

// Validation result
export interface PromoCodeValidation {
  valid: boolean;
  code: string;
  campaign?: PromotionalCampaign;
  error?: string;
  errorCode?: 'EXPIRED' | 'NOT_STARTED' | 'USAGE_LIMIT' | 'USER_LIMIT' | 'MIN_PURCHASE' | 'NOT_APPLICABLE';
  calculatedDiscount?: number;
}

// Default seasons
export const DEFAULT_SEASONS: Omit<PricingSeason, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Peak Season - Great Migration',
    seasonType: 'peak',
    startMonth: 6,
    startDay: 1,
    endMonth: 10,
    endDay: 31,
    priceMultiplier: 1.5,
    appliesToAll: true,
    entityIds: [],
    region: 'East Africa',
    isActive: true,
  },
  {
    name: 'High Season - End Year',
    seasonType: 'high',
    startMonth: 12,
    startDay: 15,
    endMonth: 1,
    endDay: 15,
    priceMultiplier: 1.35,
    appliesToAll: true,
    entityIds: [],
    region: 'East Africa',
    isActive: true,
  },
  {
    name: 'Shoulder Season - March-May',
    seasonType: 'shoulder',
    startMonth: 3,
    startDay: 1,
    endMonth: 5,
    endDay: 31,
    priceMultiplier: 0.85,
    appliesToAll: true,
    entityIds: [],
    region: 'East Africa',
    isActive: true,
  },
  {
    name: 'Low Season - Long Rains',
    seasonType: 'low',
    startMonth: 4,
    startDay: 1,
    endMonth: 5,
    endDay: 31,
    priceMultiplier: 0.75,
    appliesToAll: true,
    entityIds: [],
    region: 'East Africa',
    isActive: true,
  },
];

// Tax rates
export const DEFAULT_TAX_RATES = [
  { name: 'VAT', rate: 0.16 },
  { name: 'Park Fees', rate: 0.0 },
  { name: 'Service Charge', rate: 0.0 },
];

// Database row types (for API responses)
export interface PricingRuleRow {
  id: string;
  entity_id: string;
  entity_type: string;
  rule_type: string;
  action: string;
  percentage_change: number;
  fixed_amount: number;
  start_date: string | null;
  end_date: string | null;
  min_travelers: number;
  max_travelers: number | null;
  min_days_notice: number | null;
  is_weekend_only: boolean;
  name: string;
  description: string | null;
  promo_code: string | null;
  priority: number;
  is_active: boolean;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  supplier_id: string | null;
  requires_supplier_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingSeasonRow {
  id: string;
  name: string;
  season_type: string;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  price_multiplier: number;
  applies_to_all: boolean;
  entity_ids: string[];
  region: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionalCampaignRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  campaign_type: string;
  start_date: string;
  end_date: string;
  discount_type: string;
  discount_value: number;
  max_discount: number | null;
  min_purchase: number;
  target_audience: string;
  applicable_entities: string[];
  max_uses: number | null;
  max_uses_per_user: number;
  current_uses: number;
  promo_code: string | null;
  is_auto_apply: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}
