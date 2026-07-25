/**
 * Pricing Calculator
 * 
 * Core pricing calculation logic with support for:
 * - Base price
 * - Seasonal pricing
 * - Weekend pricing
 * - Peak season pricing
 * - Discounts and promotions
 * - Group pricing
 */

import {
  PriceCalculationRequest,
  PriceAdjustment,
  TaxAmount,
  DEFAULT_TAX_RATES,
} from './types';

// Mock pricing rules storage
const pricingRules: Map<string, Array<{
  id: string;
  ruleType: string;
  action: string;
  percentageChange: number;
  fixedAmount: number;
  startDate?: string;
  endDate?: string;
  name: string;
  priority: number;
}>> = new Map();

// Mock season data
const seasons = [
  { name: 'Peak Season', seasonType: 'peak', multiplier: 1.5, months: [6, 7, 8, 9, 10] },
  { name: 'High Season', seasonType: 'high', multiplier: 1.35, months: [12, 1] },
  { name: 'Shoulder Season', seasonType: 'shoulder', multiplier: 0.85, months: [3, 11] },
  { name: 'Low Season', seasonType: 'low', multiplier: 0.75, months: [4, 5] },
];

/**
 * Check if date is weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Get season for a date
 */
function getSeason(date: Date): { name: string; multiplier: number; seasonType: string } | null {
  const month = date.getMonth() + 1;
  for (const season of seasons) {
    if (season.months.includes(month)) {
      return { name: season.name, multiplier: season.multiplier, seasonType: season.seasonType };
    }
  }
  return null;
}

/**
 * Check if date is within range
 */
function isWithinRange(date: Date, start?: string, end?: string): boolean {
  if (!start && !end) return true;
  
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  
  return true;
}

/**
 * Calculate price with all adjustments
 */
export function calculatePrice(request: PriceCalculationRequest): {
  basePrice: number;
  subtotal: number;
  adjustments: PriceAdjustment[];
  discounts: PriceAdjustment[];
  taxes: TaxAmount[];
  total: number;
  savings: number;
  finalPrice: number;
  currency: string;
} {
  const {
    basePrice,
    travelDate,
    travelers,
    isWeekendTravel,
  } = request;

  const adjustments: PriceAdjustment[] = [];
  const discounts: PriceAdjustment[] = [];
  const travelDateObj = new Date(travelDate);
  
  let subtotal = basePrice * travelers;
  
  // 1. Apply seasonal pricing
  const season = getSeason(travelDateObj);
  if (season && season.multiplier !== 1) {
    const seasonAmount = subtotal * (season.multiplier - 1);
    adjustments.push({
      ruleId: 'seasonal',
      ruleName: season.name,
      ruleType: 'season',
      type: season.multiplier > 1 ? 'surcharge' : 'discount',
      calculation: 'percentage',
      value: (season.multiplier - 1) * 100,
      amount: Math.round(seasonAmount),
      description: `${season.name} pricing`,
    });
    subtotal += seasonAmount;
  }
  
  // 2. Apply weekend pricing
  if (isWeekendTravel || isWeekend(travelDateObj)) {
    adjustments.push({
      ruleId: 'weekend',
      ruleName: 'Weekend Rate',
      ruleType: 'weekend',
      type: 'surcharge',
      calculation: 'percentage',
      value: 10,
      amount: Math.round(subtotal * 0.1),
      description: 'Weekend travel surcharge',
    });
    subtotal *= 1.1;
  }
  
  // 3. Apply peak season (additional)
  if (season?.seasonType === 'peak') {
    // Peak is already in multiplier, this is extra if needed
    adjustments.push({
      ruleId: 'peak',
      ruleName: 'Peak Season Premium',
      ruleType: 'peak',
      type: 'surcharge',
      calculation: 'percentage',
      value: 15,
      amount: Math.round(subtotal * 0.15),
      description: 'Peak season premium',
    });
    subtotal *= 1.15;
  }
  
  // 4. Apply group discounts
  if (travelers > 4) {
    const groupDiscount = (travelers - 4) * 5; // 5% per extra person
    discounts.push({
      ruleId: 'group',
      ruleName: 'Group Discount',
      ruleType: 'group',
      type: 'discount',
      calculation: 'percentage',
      value: Math.min(groupDiscount, 25), // Cap at 25%
      amount: Math.round(subtotal * Math.min(groupDiscount, 25) / 100),
      description: `${travelers} travelers - group savings`,
    });
    subtotal *= (1 - Math.min(groupDiscount, 25) / 100);
  }
  
  // 5. Apply early bird discount (if travel date is far)
  const daysUntilTravel = Math.ceil((travelDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntilTravel > 60) {
    discounts.push({
      ruleId: 'early_bird',
      ruleName: 'Early Bird Discount',
      ruleType: 'early_bird',
      type: 'discount',
      calculation: 'percentage',
      value: 10,
      amount: Math.round(subtotal * 0.1),
      description: 'Book 60+ days ahead',
    });
    subtotal *= 0.9;
  }
  
  // Calculate taxes
  const taxes: TaxAmount[] = DEFAULT_TAX_RATES
    .filter(t => t.rate > 0)
    .map(tax => ({
      name: tax.name,
      rate: tax.rate,
      amount: Math.round(subtotal * tax.rate),
    }));
  
  const taxTotal = taxes.reduce((sum, t) => sum + t.amount, 0);
  const total = subtotal + taxTotal;
  
  // Calculate savings
  const originalTotal = basePrice * travelers;
  const savings = Math.max(0, originalTotal - subtotal);
  
  return {
    basePrice: basePrice * travelers,
    subtotal: Math.round(subtotal),
    adjustments,
    discounts,
    taxes,
    total: Math.round(total),
    savings: Math.round(savings),
    finalPrice: Math.round(total),
    currency: 'USD',
  };
}

/**
 * Calculate per-person price
 */
export function calculatePerPersonPrice(
  basePrice: number,
  travelers: number,
  travelDate: string
): {
  perPerson: number;
  total: number;
  breakdown: ReturnType<typeof calculatePrice>;
} {
  const breakdown = calculatePrice({
    entityId: '',
    entityType: 'package',
    basePrice,
    travelDate,
    travelers,
  });
  
  return {
    perPerson: Math.round(breakdown.finalPrice / travelers),
    total: breakdown.finalPrice,
    breakdown,
  };
}

/**
 * Get price display info
 */
export function getPriceDisplay(
  originalPrice: number,
  currentPrice: number
): {
  original: number;
  current: number;
  hasDiscount: boolean;
  discountPercentage?: number;
  savings?: number;
} {
  const hasDiscount = currentPrice < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : undefined;
  const savings = hasDiscount ? originalPrice - currentPrice : undefined;
  
  return {
    original: originalPrice,
    current: currentPrice,
    hasDiscount,
    discountPercentage,
    savings,
  };
}

/**
 * Validate promo code
 */
export function validatePromoCode(
  code: string,
  amount: number
): {
  valid: boolean;
  discount: number;
  message: string;
} {
  const upperCode = code.toUpperCase();
  
  // Mock promo codes
  const promoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
    'WELCOME10': { discount: 10, type: 'percentage' },
    'SAVE20': { discount: 20, type: 'percentage' },
    'SUMMER100': { discount: 100, type: 'fixed' },
    'AFRICA50': { discount: 50, type: 'fixed' },
  };
  
  const promo = promoCodes[upperCode];
  
  if (!promo) {
    return {
      valid: false,
      discount: 0,
      message: 'Invalid promo code',
    };
  }
  
  const discount = promo.type === 'percentage'
    ? Math.round(amount * promo.discount / 100)
    : promo.discount;
  
  return {
    valid: true,
    discount,
    message: `Promo code applied: ${promo.type === 'percentage' ? `${promo.discount}% off` : `$${promo.discount} off`}`,
  };
}

/**
 * Get price tiers for display
 */
export function getPriceTiers(
  basePrice: number,
  minTravelers = 1,
  maxTravelers = 10
): Array<{
  travelers: number;
  perPerson: number;
  total: number;
  savingsPerPerson: number;
}> {
  const tiers = [];
  const basePerPerson = basePrice;
  
  for (let t = minTravelers; t <= maxTravelers; t++) {
    const breakdown = calculatePrice({
      entityId: '',
      entityType: 'package',
      basePrice,
      travelDate: new Date().toISOString(), // Use current date for demo
      travelers: t,
    });
    
    const perPerson = breakdown.finalPrice / t;
    const savingsPerPerson = basePerPerson - perPerson;
    
    tiers.push({
      travelers: t,
      perPerson: Math.round(perPerson),
      total: breakdown.finalPrice,
      savingsPerPerson: Math.max(0, Math.round(savingsPerPerson)),
    });
  }
  
  return tiers;
}
