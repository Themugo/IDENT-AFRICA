import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupplierProfile, SupplierPricingRule } from '../../types';
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  ShieldCheck,
  Info,
  Check,
} from 'lucide-react';

interface SupplierPricingProps {
  supplier: SupplierProfile;
}

export const SupplierPricing: React.FC<SupplierPricingProps> = ({ supplier }) => {
  const {
    supplierPricingRules,
    addPricingRule,
    deletePricingRule,
    formatPrice,
    currency,
  } = useApp();

  // Filter rules for this supplier
  const myRules = supplierPricingRules.filter((r) => r.supplierId === supplier.id);

  // Form State for new rule
  const [ruleTitle, setRuleTitle] = useState('');
  const [seasonType, setSeasonType] = useState<'High Season' | 'Peak Migration' | 'Green Season' | 'Standard'>('Peak Migration');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [multiplier, setMultiplier] = useState(1.25);
  const [minStayNights, setMinStayNights] = useState(3);

  // Base Rate Editor state
  const [baseRate, setBaseRate] = useState(
    supplier.type === 'Hotel'
      ? 1800
      : supplier.type === 'Transport Company'
      ? 350
      : supplier.type === 'Guide'
      ? 250
      : 3200
  );

  // Interactive Commission Calculator State
  const [calcSampleAmount, setCalcSampleAmount] = useState<number>(baseRate);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleTitle) return;

    addPricingRule({
      supplierId: supplier.id,
      title: ruleTitle,
      seasonType,
      startDate,
      endDate,
      multiplier,
      minStayNights,
    });

    setRuleTitle('');
  };

  // Commission calculations
  const platformCommissionPercent = supplier.commissionPercentage || 15;
  const calculatedCommission = (calcSampleAmount * platformCommissionPercent) / 100;
  const calculatedNetPayout = calcSampleAmount - calculatedCommission;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 texture-earth">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#C89A4B]" />
            <h2 className="text-xl font-cinzel font-bold text-[#D6B06A]">
              Pricing & Seasonal Rate Management
            </h2>
          </div>
          <p className="text-xs text-[#D3C5AE] mt-1">
            Configure base inventory tariffs, seasonal multipliers for Great Migration peak periods, and platform fee transparency.
          </p>
        </div>

        <div className="px-4 py-2 bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg text-xs font-mono text-[#D6B06A] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Platform Commission: {platformCommissionPercent}%</span>
        </div>
      </div>

      {/* Base Rate Configuration */}
      <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
        <h3 className="text-lg font-serif font-bold text-[#D6B06A] border-b border-[#C89A4B]/20 pb-3">
          Base Standard Rate Tariff
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
              {supplier.type === 'Hotel' && 'Standard Suite Nightly Base Rate ($ USD)'}
              {supplier.type === 'Tour Operator' && 'Base Safari Package Rate per Person ($ USD)'}
              {supplier.type === 'Transport Company' && 'Daily Vehicle / Flight Charter Base Rate ($ USD)'}
              {supplier.type === 'Guide' && 'Private Guiding Daily Base Rate ($ USD)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="50"
                value={baseRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setBaseRate(val);
                  setCalcSampleAmount(val);
                }}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-3 text-lg font-bold font-mono text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none pl-8"
              />
              <span className="absolute left-3 top-3.5 text-lg font-bold text-[#C89A4B]">$</span>
            </div>
          </div>

          <button
            onClick={() => alert('Base standard tariff updated successfully.')}
            className="btn-gold py-3 px-6 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Tariff Rate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seasonal Rule Creator Form */}
        <div className="lg:col-span-1 p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#D6B06A] flex items-center gap-2 border-b border-[#C89A4B]/20 pb-3">
            <Plus className="w-5 h-5 text-[#C89A4B]" />
            Add Seasonal Pricing Rule
          </h3>

          <form onSubmit={handleAddRule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Rule Title
              </label>
              <input
                type="text"
                placeholder="e.g. Mara Crossing Migration Surcharge"
                value={ruleTitle}
                onChange={(e) => setRuleTitle(e.target.value)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Season Category
              </label>
              <select
                value={seasonType}
                onChange={(e) => setSeasonType(e.target.value as any)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
              >
                <option value="Peak Migration">Peak Migration (Jul - Oct)</option>
                <option value="High Season">High Season (Dec - Mar)</option>
                <option value="Green Season">Green Season (Apr - Jun / Nov)</option>
                <option value="Standard">Standard Season</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2 text-xs text-[#F4E8D5]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2 text-xs text-[#F4E8D5]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Rate Multiplier ({multiplier}x = {multiplier > 1 ? `+${Math.round((multiplier - 1) * 100)}%` : `-${Math.round((1 - multiplier) * 100)}%`})
              </label>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#C89A4B]"
              />
              <div className="flex justify-between text-[10px] text-[#D3C5AE] font-mono mt-1">
                <span>0.5x (-50%)</span>
                <span>1.0x (Base)</span>
                <span>2.5x (+150%)</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-gold w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Seasonal Rule
            </button>
          </form>
        </div>

        {/* Existing Seasonal Rules List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A]">
              Active Seasonal Multipliers ({myRules.length})
            </h3>

            {myRules.length === 0 ? (
              <div className="p-8 text-center bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
                <Info className="w-8 h-8 text-[#C89A4B] mx-auto mb-2" />
                <p className="text-xs text-[#D3C5AE]">
                  No seasonal pricing multipliers created yet. Standard base rate applies year-round.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F4E8D5]">{rule.title}</span>
                        <span className="px-2 py-0.5 bg-[#C89A4B] text-[#2E2015] text-[10px] font-bold uppercase rounded">
                          {rule.seasonType}
                        </span>
                      </div>
                      <p className="text-xs text-[#D3C5AE] mt-1">
                        Effective: <span className="font-mono text-[#D6B06A]">{rule.startDate}</span> to <span className="font-mono text-[#D6B06A]">{rule.endDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-cinzel font-bold text-[#D6B06A]">
                          {rule.multiplier}x Multiplier
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          Sample Rate: {formatPrice(baseRate * rule.multiplier)}
                        </div>
                      </div>
                      <button
                        onClick={() => deletePricingRule(rule.id)}
                        className="p-2 text-red-400 hover:bg-red-950/60 rounded transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Commission Calculator */}
          <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C89A4B]" />
              Ident Africa Platform Commission Breakdown Calculator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
                <label className="block text-[10px] font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  Gross Booking Value ($ USD)
                </label>
                <input
                  type="number"
                  value={calcSampleAmount}
                  onChange={(e) => setCalcSampleAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded p-2 text-base font-bold font-mono text-[#D6B06A]"
                />
              </div>

              <div className="p-4 bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
                <span className="block text-[10px] font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  Ident Africa Fee ({platformCommissionPercent}%)
                </span>
                <span className="text-base font-bold font-mono text-amber-400 block mt-2">
                  -{formatPrice(calculatedCommission)}
                </span>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-lg">
                <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  Net Disbursed to Supplier
                </span>
                <span className="text-base font-bold font-mono text-emerald-400 block mt-2">
                  {formatPrice(calculatedNetPayout)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
