'use client';

/**
 * Price Display Component
 * 
 * Shows calculated prices with discounts and savings.
 */

import React from 'react';
import { Tag, TrendingDown, Clock, Info } from 'lucide-react';
import type { PriceDisplay as PriceDisplayType } from '../../services/pricing/types';

interface PriceDisplayProps {
  price: PriceDisplayType;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
  showPerPerson?: boolean;
  travelers?: number;
  className?: string;
}

export default function PriceDisplay({
  price,
  size = 'md',
  showSavings = true,
  showPerPerson = true,
  travelers = 1,
  className = '',
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const originalSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Current price */}
      <div className="flex items-baseline gap-2">
        <span className={`font-bold text-stone-900 ${sizeClasses[size]}`}>
          ${price.current.toLocaleString()}
        </span>
        {price.perPerson && <span className="text-stone-500 text-sm">per person</span>}
      </div>

      {/* Original price with strikethrough */}
      {price.hasDiscount && price.original !== price.current && (
        <div className="flex items-center gap-2">
          <span className={`text-stone-400 line-through ${originalSizeClasses[size]}`}>
            ${price.original.toLocaleString()}
          </span>
          {price.discountPercentage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
              <TrendingDown className="w-3 h-3" />
              {price.discountPercentage}% off
            </span>
          )}
        </div>
      )}

      {/* Savings badge */}
      {showSavings && price.savings && price.savings > 0 && (
        <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
          <Tag className="w-4 h-4" />
          <span>You save ${price.savings.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// Price badge component
interface PriceBadgeProps {
  label: string;
  value: string;
  variant?: 'success' | 'warning' | 'info';
}

export function PriceBadge({ label, value, variant = 'info' }: PriceBadgeProps) {
  const variantClasses = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${variantClasses[variant]}`}>
      <span className="text-xs font-medium">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

// Price breakdown tooltip
interface PriceBreakdownTooltipProps {
  basePrice: number;
  adjustments: Array<{ name: string; amount: number; type: 'surcharge' | 'discount' }>;
  discounts: Array<{ name: string; amount: number }>;
  taxes: Array<{ name: string; rate: number; amount: number }>;
  total: number;
  travelers?: number;
}

export function PriceBreakdownTooltip({
  basePrice,
  adjustments,
  discounts,
  taxes,
  total,
  travelers = 1,
}: PriceBreakdownTooltipProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg p-4 min-w-64">
      <h4 className="font-semibold text-stone-900 mb-3">Price Breakdown</h4>
      
      <div className="space-y-2 text-sm">
        {/* Base price */}
        <div className="flex justify-between">
          <span className="text-stone-600">Base price</span>
          <span className="font-medium">${basePrice.toLocaleString()}</span>
        </div>
        
        {travelers > 1 && (
          <div className="flex justify-between">
            <span className="text-stone-600">× {travelers} travelers</span>
            <span className="font-medium">${(basePrice * travelers).toLocaleString()}</span>
          </div>
        )}

        {/* Adjustments */}
        {adjustments.map((adj, idx) => (
          <div key={idx} className="flex justify-between text-amber-600">
            <span>{adj.name}</span>
            <span>+${adj.amount.toLocaleString()}</span>
          </div>
        ))}

        {/* Discounts */}
        {discounts.map((disc, idx) => (
          <div key={idx} className="flex justify-between text-emerald-600">
            <span>{disc.name}</span>
            <span>-${disc.amount.toLocaleString()}</span>
          </div>
        ))}

        {/* Subtotal */}
        <div className="border-t border-stone-200 pt-2 mt-2">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>${(basePrice * travelers + adjustments.reduce((s, a) => s + a.amount, 0)).toLocaleString()}</span>
          </div>
        </div>

        {/* Taxes */}
        {taxes.map((tax, idx) => (
          <div key={idx} className="flex justify-between text-stone-500">
            <span>{tax.name} ({(tax.rate * 100).toFixed(0)}%)</span>
            <span>${tax.amount.toLocaleString()}</span>
          </div>
        ))}

        {/* Total */}
        <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-amber-600">${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Dynamic pricing indicator
interface DynamicPricingIndicatorProps {
  nextChange?: {
    date: string;
    newPrice: number;
    reason: string;
  };
  currentSeason?: string;
  seasonMultiplier?: number;
}

export function DynamicPricingIndicator({
  nextChange,
  currentSeason,
  seasonMultiplier,
}: DynamicPricingIndicatorProps) {
  if (!nextChange && !currentSeason) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1 text-sm">
        {currentSeason && (
          <p className="text-amber-800">
            <span className="font-medium">{currentSeason}</span>
            {seasonMultiplier && seasonMultiplier !== 1 && (
              <span className="text-amber-600 ml-1">
                ({seasonMultiplier > 1 ? '+' : ''}{((seasonMultiplier - 1) * 100).toFixed(0)}%)
              </span>
            )}
          </p>
        )}
        {nextChange && (
          <p className="text-amber-700 flex items-center gap-1 mt-1">
            <Clock className="w-4 h-4" />
            Price changes {new Date(nextChange.date).toLocaleDateString()} - {nextChange.reason}
          </p>
        )}
      </div>
    </div>
  );
}

// Promo code input
interface PromoCodeInputProps {
  onApply: (code: string) => void;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export function PromoCodeInput({ onApply, isLoading, error, success }: PromoCodeInputProps) {
  const [code, setCode] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onApply(code.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={!code.trim() || isLoading}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Checking...' : 'Apply'}
        </button>
      </div>
      
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      
      {success && (
        <p className="text-emerald-600 text-sm">{success}</p>
      )}
    </form>
  );
}
