'use client';

/**
 * Live Price Display Component
 * 
 * Shows real-time calculated prices based on dynamic pricing rules.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Tag,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
} from 'lucide-react';
import type { PriceBreakdown } from '../../services/pricing/types';

interface LivePriceDisplayProps {
  entityId: string;
  entityType?: 'destination' | 'package' | 'experience';
  basePrice: number;
  travelers?: number;
  travelDate?: string;
  showBreakdown?: boolean;
  showPromoInput?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  onPriceChange?: (price: number) => void;
}

interface CalculatedPrice {
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

export function LivePriceDisplay({
  entityId,
  entityType = 'package',
  basePrice,
  travelers = 1,
  travelDate,
  showBreakdown = true,
  showPromoInput = true,
  size = 'md',
  compact = false,
  onPriceChange,
}: LivePriceDisplayProps) {
  const [price, setPrice] = useState<CalculatedPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{
    success?: boolean;
    message?: string;
    discount?: number;
  }>({});
  const [showDetails, setShowDetails] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<{ name: string; multiplier: number } | null>(null);

  const fetchPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const effectiveDate = travelDate || new Date().toISOString();
      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          entityType,
          basePrice,
          travelDate: effectiveDate,
          travelers,
          promoCode: promoStatus.success ? promoCode : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrice(data.data);
        onPriceChange?.(data.data.finalPrice);
        
        // Fetch current season
        const seasonRes = await fetch('/api/pricing/seasons/current');
        const seasonData = await seasonRes.json();
        if (seasonData.success && seasonData.data) {
          setCurrentSeason({
            name: seasonData.data.name,
            multiplier: seasonData.data.priceMultiplier,
          });
        }
      } else {
        setError('Failed to calculate price');
      }
    } catch (err) {
      setError('Price unavailable');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, entityType, basePrice, travelers, travelDate, promoCode, promoStatus.success, onPriceChange]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const res = await fetch('/api/pricing/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: price?.currentPrice || basePrice * travelers }),
      });
      
      const data = await res.json();
      if (data.success?.data?.valid) {
        setPromoStatus({
          success: true,
          message: `Promo applied! You save $${data.success.data.calculatedDiscount}`,
          discount: data.success.data.calculatedDiscount,
        });
        // Recalculate with promo
        fetchPrice();
      } else {
        setPromoStatus({
          success: false,
          message: data.success?.data?.error || 'Invalid promo code',
        });
      }
    } catch (err) {
      setPromoStatus({ success: false, message: 'Failed to validate promo' });
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setPromoStatus({});
    fetchPrice();
  };

  if (isLoading) {
    return (
      <div className="bg-[#2E2015]/60 border border-[#C89A4B]/20 rounded-xl p-4 animate-pulse">
        <div className="h-8 bg-[#3D2B1F] rounded w-32"></div>
        <div className="h-4 bg-[#3D2B1F] rounded w-24 mt-2"></div>
      </div>
    );
  }

  if (error || !price) {
    return (
      <div className="bg-[#2E2015]/60 border border-red-500/30 rounded-xl p-4">
        <p className="text-red-400 text-sm">Price unavailable</p>
      </div>
    );
  }

  const hasDiscount = price.finalPrice < price.originalPrice;
  const savings = price.originalPrice - price.finalPrice;
  const discountPercent = hasDiscount ? Math.round((savings / price.originalPrice) * 100) : 0;

  const sizeClasses = {
    sm: compact ? 'text-lg' : 'text-xl',
    md: compact ? 'text-2xl' : 'text-3xl',
    lg: compact ? 'text-3xl' : 'text-4xl',
  };

  return (
    <div className={`bg-[#2E2015]/60 border border-[#C89A4B]/20 rounded-xl overflow-hidden ${
      compact ? 'p-3' : 'p-4'
    }`}>
      {/* Season Indicator */}
      {currentSeason && currentSeason.multiplier !== 1 && !compact && (
        <div className={`mb-3 flex items-center gap-2 text-xs ${
          currentSeason.multiplier > 1 ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {currentSeason.multiplier > 1 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{currentSeason.name} ({(currentSeason.multiplier > 1 ? '+' : '') + Math.round((currentSeason.multiplier - 1) * 100)}%)</span>
        </div>
      )}

      {/* Main Price */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className={`font-cinzel font-bold text-[#D6B06A] ${sizeClasses[size]}`}>
            ${price.finalPrice.toLocaleString()}
          </span>
          {travelers > 1 && (
            <span className="text-sm text-[#D3C5AE] ml-2">× {travelers} travelers</span>
          )}
        </div>
        
        {hasDiscount && (
          <div className="flex items-center gap-2">
            <span className="text-[#D3C5AE] line-through text-sm">
              ${price.originalPrice.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Per Person Breakdown */}
      {travelers > 1 && !compact && (
        <p className="text-xs text-[#D3C5AE] mt-1">
          ${Math.round(price.finalPrice / travelers).toLocaleString()} per person
        </p>
      )}

      {/* Applied Promotions */}
      {price.appliedPromotions.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
          <Sparkles className="w-3 h-3" />
          <span>{price.appliedPromotions.join(', ')} applied</span>
        </div>
      )}

      {/* Price Expiry */}
      {price.expiresAt && !compact && (
        <div className="mt-2 flex items-center gap-1 text-xs text-[#D3C5AE]">
          <Clock className="w-3 h-3" />
          <span>Price valid for 24 hours</span>
        </div>
      )}

      {/* Promo Code Input */}
      {showPromoInput && !compact && (
        <div className="mt-4 pt-4 border-t border-[#C89A4B]/10">
          {promoStatus.success ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">{promoCode}</span>
                <span className="text-xs">applied</span>
              </div>
              <button
                onClick={removePromo}
                className="text-xs text-[#D3C5AE] hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 px-3 py-1.5 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-sm text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none uppercase"
              />
              <button
                onClick={applyPromoCode}
                disabled={!promoCode.trim()}
                className="px-3 py-1.5 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
          {promoStatus.message && (
            <p className={`text-xs mt-2 ${promoStatus.success ? 'text-emerald-400' : 'text-red-400'}`}>
              {promoStatus.message}
            </p>
          )}
        </div>
      )}

      {/* Expandable Details */}
      {showBreakdown && !compact && (
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-sm text-[#D3C5AE] hover:text-[#D6B06A] transition-colors py-2"
          >
            <span>Price breakdown</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showDetails && (
            <div className="mt-3 space-y-2 text-sm">
              {/* Base Price */}
              <div className="flex justify-between">
                <span className="text-[#D3C5AE]">Base price ({travelers}×)</span>
                <span className="text-[#D6B06A]">${(basePrice * travelers).toLocaleString()}</span>
              </div>

              {/* Adjustments */}
              {price.breakdown.adjustments.map((adj, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-amber-400">{adj.description}</span>
                  <span className="text-amber-400">+${adj.amount.toLocaleString()}</span>
                </div>
              ))}

              {/* Discounts */}
              {price.breakdown.discounts.map((disc, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-emerald-400">{disc.description}</span>
                  <span className="text-emerald-400">-${disc.amount.toLocaleString()}</span>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-between border-t border-[#C89A4B]/20 pt-2 mt-2">
                <span className="text-[#D6B06A] font-medium">Subtotal</span>
                <span className="text-[#D6B06A] font-medium">${price.breakdown.subtotal.toLocaleString()}</span>
              </div>

              {/* Taxes */}
              {price.breakdown.taxes.map((tax, idx) => (
                <div key={idx} className="flex justify-between text-[#D3C5AE]">
                  <span>{tax.name} ({(tax.rate * 100).toFixed(0)}%)</span>
                  <span>${tax.amount.toLocaleString()}</span>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between border-t border-[#C89A4B]/20 pt-2 font-bold">
                <span className="text-[#D6B06A]">Total</span>
                <span className="text-[#D6B06A]">${price.breakdown.total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Price Change */}
      {price.nextPriceChange && !compact && (
        <div className="mt-4 p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="text-amber-300 font-medium">
                Price may change on {new Date(price.nextPriceChange.date).toLocaleDateString()}
              </p>
              <p className="text-amber-200/70 mt-1">
                {price.nextPriceChange.reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact price badge for cards
export function PriceBadge({ price, originalPrice, travelers = 1 }: {
  price: number;
  originalPrice: number;
  travelers?: number;
}) {
  const hasDiscount = price < originalPrice;
  const savings = originalPrice - price;
  const discountPercent = hasDiscount ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-cinzel font-bold text-[#D6B06A]">
          ${price.toLocaleString()}
        </span>
        {travelers > 1 && (
          <span className="text-xs text-[#D3C5AE]">× {travelers}</span>
        )}
      </div>
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D3C5AE] line-through">
            ${originalPrice.toLocaleString()}
          </span>
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
            -{discountPercent}%
          </span>
        </div>
      )}
    </div>
  );
}

// Price tiers display
export function PriceTiers({ basePrice, minTravelers = 1, maxTravelers = 8 }: {
  basePrice: number;
  minTravelers?: number;
  maxTravelers?: number;
}) {
  const [travelers, setTravelers] = useState(minTravelers);
  
  const calculateTierPrice = (n: number) => {
    let total = basePrice * n;
    // Apply group discount
    if (n > 4) {
      const discount = Math.min((n - 4) * 5, 25);
      total = total * (1 - discount / 100);
    }
    return Math.round(total);
  };

  return (
    <div className="bg-[#2E2015]/60 border border-[#C89A4B]/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#C89A4B]" />
          <span className="font-bold text-[#D6B06A]">Group Pricing</span>
        </div>
        <span className="text-sm text-[#D3C5AE]">Per {travelers} travelers</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setTravelers(Math.max(minTravelers, travelers - 1))}
          className="w-8 h-8 bg-[#3D2B1F] hover:bg-[#4B321F] text-[#D6B06A] rounded-lg transition-colors"
        >
          -
        </button>
        <span className="text-2xl font-cinzel font-bold text-[#D6B06A] w-12 text-center">
          {travelers}
        </span>
        <button
          onClick={() => setTravelers(Math.min(maxTravelers, travelers + 1))}
          className="w-8 h-8 bg-[#3D2B1F] hover:bg-[#4B321F] text-[#D6B06A] rounded-lg transition-colors"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        {Array.from({ length: maxTravelers - minTravelers + 1 }, (_, i) => minTravelers + i).map(n => {
          const totalPrice = calculateTierPrice(n);
          const perPerson = Math.round(totalPrice / n);
          const hasDiscount = n > 4;
          
          return (
            <div
              key={n}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                n === travelers
                  ? 'bg-[#C89A4B]/20 border border-[#C89A4B]/50'
                  : 'hover:bg-[#3D2B1F]/60'
              }`}
            >
              <span className="text-[#D3C5AE]">{n} traveler{n > 1 ? 's' : ''}</span>
              <div className="flex items-center gap-3">
                {hasDiscount && (
                  <span className="text-xs text-emerald-400">
                    {Math.min((n - 4) * 5, 25)}% off
                  </span>
                )}
                <span className="font-bold text-[#D6B06A]">
                  ${perPerson.toLocaleString()}/person
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[#C89A4B]/20">
        <div className="flex justify-between items-center">
          <span className="text-[#D3C5AE]">Total for {travelers}:</span>
          <span className="text-2xl font-cinzel font-bold text-[#D6B06A]">
            ${calculateTierPrice(travelers).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LivePriceDisplay;
