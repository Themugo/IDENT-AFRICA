'use client';

/**
 * Dynamic Pricing Engine - Admin Component
 * 
 * Complete pricing management interface for administrators.
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Tag,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Info,
  Crown,
} from 'lucide-react';
import type {
  PricingRule,
  PromotionalCampaign,
  PricingSeason,
  SeasonType,
} from '../../services/pricing/types';

interface DynamicPricingEngineProps {
  onRuleChange?: (rules: PricingRule[]) => void;
  onCampaignChange?: (campaigns: PromotionalCampaign[]) => void;
}

export function DynamicPricingEngine({ onRuleChange, onCampaignChange }: DynamicPricingEngineProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'campaigns' | 'seasons'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rules, setRules] = useState<PricingRule[]>([]);
  const [campaigns, setCampaigns] = useState<PromotionalCampaign[]>([]);
  const [seasons, setSeasons] = useState<PricingSeason[]>([]);
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    pendingApprovals: 0,
    activeCampaigns: 0,
    totalRedemptions: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rulesRes, campaignsRes, seasonsRes, statsRes] = await Promise.all([
        fetch('/api/pricing/rules'),
        fetch('/api/pricing/campaigns'),
        fetch('/api/pricing/seasons'),
        fetch('/api/pricing/stats'),
      ]);

      const [rulesData, campaignsData, seasonsData, statsData] = await Promise.all([
        rulesRes.json(),
        campaignsRes.json(),
        seasonsRes.json(),
        statsRes.json(),
      ]);

      if (rulesData.success) setRules(rulesData.data.rules || []);
      if (campaignsData.success) setCampaigns(campaignsData.data.campaigns || []);
      if (seasonsData.success) setSeasons(seasonsData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      setError('Failed to load pricing data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-[#1A1512] rounded-2xl border border-[#C89A4B]/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#C89A4B]/20 bg-gradient-to-r from-[#2E2015] to-[#3D2B1F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#C89A4B]/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-[#C89A4B]" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel font-bold text-[#D6B06A]">
                Dynamic Pricing Engine
              </h2>
              <p className="text-sm text-[#D3C5AE]">
                Intelligent pricing management for all entities
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="p-2 hover:bg-[#4B321F] rounded-lg transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 text-[#C89A4B] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <StatCard icon={<Tag className="w-4 h-4" />} label="Total Rules" value={stats.totalRules} />
          <StatCard icon={<Check className="w-4 h-4" />} label="Active Rules" value={stats.activeRules} color="emerald" />
          <StatCard icon={<Clock className="w-4 h-4" />} label="Pending" value={stats.pendingApprovals} color="amber" />
          <StatCard icon={<Sparkles className="w-4 h-4" />} label="Campaigns" value={stats.activeCampaigns} color="blue" />
          <StatCard icon={<Crown className="w-4 h-4" />} label="Redemptions" value={stats.totalRedemptions} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#C89A4B]/20">
        {[
          { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'rules', label: 'Pricing Rules', icon: <Tag className="w-4 h-4" /> },
          { id: 'campaigns', label: 'Campaigns', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'seasons', label: 'Seasons', icon: <Calendar className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#C89A4B] border-b-2 border-[#C89A4B] bg-[#2E2015]/50'
                : 'text-[#D3C5AE] hover:text-[#D6B06A] hover:bg-[#2E2015]/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-950/50 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {activeTab === 'overview' && (
          <PricingOverview rules={rules} campaigns={campaigns} seasons={seasons} />
        )}
        {activeTab === 'rules' && (
          <PricingRulesPanel
            rules={rules}
            onUpdate={setRules}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'campaigns' && (
          <CampaignsPanel
            campaigns={campaigns}
            onUpdate={setCampaigns}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'seasons' && (
          <SeasonsPanel seasons={seasons} onUpdate={setSeasons} />
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color = 'amber' }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: 'amber' | 'emerald' | 'blue' | 'red';
}) {
  const colorClasses = {
    amber: 'text-[#C89A4B]',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
  };

  return (
    <div className="p-4 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-xl">
      <div className={`flex items-center gap-2 ${colorClasses[color]}`}>
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-cinzel font-bold text-[#D6B06A] mt-2">{value}</p>
    </div>
  );
}

// Overview Panel
function PricingOverview({ rules, campaigns, seasons }: {
  rules: PricingRule[];
  campaigns: PromotionalCampaign[];
  seasons: PricingSeason[];
}) {
  const activeRules = rules.filter(r => r.isActive && r.isApproved);
  const pendingRules = rules.filter(r => !r.isApproved);
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  return (
    <div className="space-y-6">
      {/* Rule Type Distribution */}
      <div className="p-6 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-xl">
        <h3 className="text-lg font-serif font-bold text-[#D6B06A] mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Pricing Rules by Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['base', 'season', 'weekend', 'peak', 'discount', 'promotion', 'early_bird', 'group'].map((type) => {
            const count = rules.filter(r => r.ruleType === type).length;
            return (
              <div key={type} className="p-4 bg-[#3D2B1F]/60 rounded-lg border border-[#C89A4B]/10">
                <p className="text-xs text-[#D3C5AE] capitalize">{type.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-[#D6B06A]">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Season */}
      <div className="p-6 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-xl">
        <h3 className="text-lg font-serif font-bold text-[#D6B06A] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Pricing Seasons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasons.map((season) => (
            <div
              key={season.id}
              className={`p-4 rounded-lg border ${
                season.seasonType === 'peak'
                  ? 'bg-red-950/30 border-red-500/30'
                  : season.seasonType === 'high'
                  ? 'bg-amber-950/30 border-amber-500/30'
                  : season.seasonType === 'shoulder'
                  ? 'bg-blue-950/30 border-blue-500/30'
                  : 'bg-[#3D2B1F]/60 border-[#C89A4B]/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-[#D6B06A]">{season.name}</h4>
                <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                  season.seasonType === 'peak'
                    ? 'bg-red-500/30 text-red-300'
                    : season.seasonType === 'high'
                    ? 'bg-amber-500/30 text-amber-300'
                    : season.seasonType === 'shoulder'
                    ? 'bg-blue-500/30 text-blue-300'
                    : 'bg-[#C89A4B]/30 text-[#C89A4B]'
                }`}>
                  {season.seasonType}
                </span>
              </div>
              <p className="text-sm text-[#D3C5AE]">
                {season.startMonth}/{season.startDay} - {season.endMonth}/{season.endDay}
              </p>
              <p className="text-lg font-bold text-[#D6B06A] mt-2">
                {(season.priceMultiplier * 100).toFixed(0)}% of base
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="p-6 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-xl">
        <h3 className="text-lg font-serif font-bold text-[#D6B06A] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Active Promotional Campaigns
        </h3>
        {activeCampaigns.length === 0 ? (
          <p className="text-[#D3C5AE] text-sm">No active campaigns</p>
        ) : (
          <div className="space-y-3">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-[#3D2B1F]/60 rounded-lg border border-[#C89A4B]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#D6B06A]">{campaign.name}</h4>
                    {campaign.promoCode && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#C89A4B]/20 text-[#C89A4B] text-xs font-mono rounded">
                        {campaign.promoCode}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">
                      {campaign.discountType === 'percentage'
                        ? `${campaign.discountValue}%`
                        : `$${campaign.discountValue}`}
                      {' '}OFF
                    </p>
                    <p className="text-xs text-[#D3C5AE]">
                      {campaign.currentUses} / {campaign.maxUses || '∞'} uses
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Pricing Rules Panel
function PricingRulesPanel({ rules, onUpdate, onRefresh }: {
  rules: PricingRule[];
  onUpdate: (rules: PricingRule[]) => void;
  onRefresh: () => void;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  const filteredRules = rules.filter(rule => {
    if (filter === 'pending') return !rule.isApproved && rule.isActive;
    if (filter === 'active') return rule.isApproved && rule.isActive;
    return true;
  });

  const pendingRules = rules.filter(r => !r.isApproved && r.isActive);

  const handleApprove = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/pricing/rules/${ruleId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'admin' }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Failed to approve rule:', err);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      const res = await fetch(`/api/pricing/rules/${ruleId}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingRules.length > 0 && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
          <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Approvals ({pendingRules.length})
          </h3>
          <div className="space-y-2">
            {pendingRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-[#2E2015]/60 rounded-lg">
                <div>
                  <p className="font-medium text-[#D6B06A]">{rule.name}</p>
                  <p className="text-sm text-[#D3C5AE]">{rule.ruleType} • {rule.entityType}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(rule.id)}
                    className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-serif font-bold text-[#D6B06A]">Pricing Rules</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-1.5 bg-[#2E2015] border border-[#C89A4B]/30 rounded-lg text-sm text-[#D6B06A]"
          >
            <option value="all">All Rules</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateRuleForm
          onSubmit={async (data) => {
            try {
              const res = await fetch('/api/pricing/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                setShowCreateForm(false);
                onRefresh();
              }
            } catch (err) {
              console.error('Failed to create rule:', err);
            }
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => (
          <RuleCard
            key={`${rule.id}-${rule.name}`}
            rule={rule}
            onDelete={() => handleDelete(rule.id)}
          />
        ))}
        {filteredRules.length === 0 && (
          <p className="text-center text-[#D3C5AE] py-8">No rules found</p>
        )}
      </div>
    </div>
  );
}

// Rule Card
function RuleCard({ rule, onDelete, ..._props }: { rule: PricingRule; onDelete: () => void } & Record<string, unknown>) {
  const [expanded, setExpanded] = useState(false);

  const getRuleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      base: 'bg-stone-500/30 text-stone-300',
      season: 'bg-blue-500/30 text-blue-300',
      weekend: 'bg-purple-500/30 text-purple-300',
      peak: 'bg-red-500/30 text-red-300',
      discount: 'bg-emerald-500/30 text-emerald-300',
      promotion: 'bg-amber-500/30 text-amber-300',
      early_bird: 'bg-cyan-500/30 text-cyan-300',
      group: 'bg-pink-500/30 text-pink-300',
    };
    return colors[type] || 'bg-[#C89A4B]/30 text-[#C89A4B]';
  };

  return (
    <div className="bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#3D2B1F]/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp className="w-4 h-4 text-[#C89A4B]" /> : <ChevronDown className="w-4 h-4 text-[#C89A4B]" />}
            <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${getRuleTypeColor(rule.ruleType)}`}>
              {rule.ruleType.replace('_', ' ')}
            </span>
          </div>
          <div>
            <p className="font-medium text-[#D6B06A]">{rule.name}</p>
            <p className="text-xs text-[#D3C5AE]">{rule.entityType} • {rule.entityId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-[#D6B06A]">
              {rule.action === 'percentage'
                ? `${rule.percentageChange > 0 ? '+' : ''}${rule.percentageChange}%`
                : `${rule.fixedAmount > 0 ? '+' : ''}$${rule.fixedAmount}`}
            </p>
            <p className="text-xs text-[#D3C5AE]">{rule.action}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            rule.isApproved
              ? 'bg-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/30 text-amber-300'
          }`}>
            {rule.isApproved ? 'Approved' : 'Pending'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#C89A4B]/10 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {rule.startDate && (
              <div>
                <p className="text-[#D3C5AE]">Start Date</p>
                <p className="text-[#D6B06A]">{new Date(rule.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {rule.endDate && (
              <div>
                <p className="text-[#D3C5AE]">End Date</p>
                <p className="text-[#D6B06A]">{new Date(rule.endDate).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-[#D3C5AE]">Priority</p>
              <p className="text-[#D6B06A]">{rule.priority}</p>
            </div>
            <div>
              <p className="text-[#D3C5AE]">Travelers</p>
              <p className="text-[#D6B06A]">{rule.minTravelers}{rule.maxTravelers ? `-${rule.maxTravelers}` : '+'}</p>
            </div>
          </div>
          {rule.description && (
            <p className="mt-3 text-sm text-[#D3C5AE]">{rule.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Create Rule Form
function CreateRuleForm({ onSubmit, onCancel }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    entityId: '',
    entityType: 'package',
    ruleType: 'season',
    action: 'percentage',
    percentageChange: 0,
    fixedAmount: 0,
    startDate: '',
    endDate: '',
    priority: 0,
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#2E2015]/80 border border-[#C89A4B]/30 rounded-xl space-y-4">
      <h3 className="text-lg font-serif font-bold text-[#D6B06A]">Create Pricing Rule</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Rule Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Entity ID</label>
          <input
            type="text"
            value={form.entityId}
            onChange={(e) => setForm({ ...form, entityId: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Entity Type</label>
          <select
            value={form.entityType}
            onChange={(e) => setForm({ ...form, entityType: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          >
            <option value="destination">Destination</option>
            <option value="package">Package</option>
            <option value="experience">Experience</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Rule Type</label>
          <select
            value={form.ruleType}
            onChange={(e) => setForm({ ...form, ruleType: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          >
            <option value="base">Base Price</option>
            <option value="season">Season</option>
            <option value="weekend">Weekend</option>
            <option value="peak">Peak Season</option>
            <option value="discount">Discount</option>
            <option value="promotion">Promotion</option>
            <option value="early_bird">Early Bird</option>
            <option value="group">Group</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Action</label>
          <select
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
            <option value="multiply">Multiply</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">
            {form.action === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
          </label>
          <input
            type="number"
            value={form.action === 'percentage' ? form.percentageChange : form.fixedAmount}
            onChange={(e) => form.action === 'percentage'
              ? setForm({ ...form, percentageChange: Number(e.target.value) })
              : setForm({ ...form, fixedAmount: Number(e.target.value) })
            }
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[#C89A4B]/30 text-[#D3C5AE] rounded-lg hover:bg-[#3D2B1F] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] rounded-lg font-bold transition-colors"
        >
          Create Rule
        </button>
      </div>
    </form>
  );
}

// Campaigns Panel
function CampaignsPanel({ campaigns, onUpdate, onRefresh }: {
  campaigns: PromotionalCampaign[];
  onUpdate: (campaigns: PromotionalCampaign[]) => void;
  onRefresh: () => void;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleToggleStatus = async (campaignId: string, newStatus: string) => {
    try {
      const endpoint = newStatus === 'active' ? 'activate' : 'deactivate';
      const res = await fetch(`/api/pricing/campaigns/${campaignId}/${endpoint}`, { method: 'POST' });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Failed to toggle campaign:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-bold text-[#D6B06A]">Promotional Campaigns</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {showCreateForm && (
        <CreateCampaignForm
          onSubmit={async (data) => {
            try {
              const res = await fetch('/api/pricing/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                setShowCreateForm(false);
                onRefresh();
              }
            } catch (err) {
              console.error('Failed to create campaign:', err);
            }
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-5 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-[#D6B06A]">{campaign.name}</h4>
                {campaign.promoCode && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-[#C89A4B]/20 text-[#C89A4B] text-xs font-mono rounded">
                    {campaign.promoCode}
                  </span>
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                campaign.status === 'active' ? 'bg-emerald-500/30 text-emerald-300' :
                campaign.status === 'paused' ? 'bg-amber-500/30 text-amber-300' :
                campaign.status === 'draft' ? 'bg-stone-500/30 text-stone-300' :
                'bg-[#C89A4B]/30 text-[#C89A4B]'
              }`}>
                {campaign.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-[#D3C5AE]">Discount</p>
                <p className="font-bold text-emerald-400">
                  {campaign.discountType === 'percentage'
                    ? `${campaign.discountValue}%`
                    : `$${campaign.discountValue}`}
                </p>
              </div>
              <div>
                <p className="text-[#D3C5AE]">Uses</p>
                <p className="font-bold text-[#D6B06A]">
                  {campaign.currentUses}{campaign.maxUses ? ` / ${campaign.maxUses}` : ''}
                </p>
              </div>
            </div>

            <div className="text-xs text-[#D3C5AE] mb-3">
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(campaign.id, campaign.status === 'active' ? 'paused' : 'active')}
                className={`p-2 rounded-lg transition-colors ${
                  campaign.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40'
                    : 'bg-[#C89A4B]/20 text-[#C89A4B] hover:bg-[#C89A4B]/40'
                }`}
              >
                {campaign.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <span className="text-xs text-[#D3C5AE]">{campaign.campaignType.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <p className="text-center text-[#D3C5AE] py-8">No campaigns found</p>
      )}
    </div>
  );
}

// Create Campaign Form
function CreateCampaignForm({ onSubmit, onCancel }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    campaignType: 'seasonal',
    startDate: '',
    endDate: '',
    discountType: 'percentage',
    discountValue: 10,
    promoCode: '',
    maxUses: 100,
    isAutoApply: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#2E2015]/80 border border-[#C89A4B]/30 rounded-xl space-y-4">
      <h3 className="text-lg font-serif font-bold text-[#D6B06A]">Create Campaign</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Campaign Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Promo Code (Optional)</label>
          <input
            type="text"
            value={form.promoCode}
            onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none uppercase"
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Campaign Type</label>
          <select
            value={form.campaignType}
            onChange={(e) => setForm({ ...form, campaignType: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          >
            <option value="seasonal">Seasonal</option>
            <option value="flash_sale">Flash Sale</option>
            <option value="early_bird">Early Bird</option>
            <option value="last_minute">Last Minute</option>
            <option value="loyalty">Loyalty</option>
            <option value="referral">Referral</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Discount Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">
            {form.discountType === 'percentage' ? 'Discount (%)' : 'Discount ($)'}
          </label>
          <input
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Max Uses</label>
          <input
            type="number"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[#C89A4B]/30 text-[#D3C5AE] rounded-lg hover:bg-[#3D2B1F] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] rounded-lg font-bold transition-colors"
        >
          Create Campaign
        </button>
      </div>
    </form>
  );
}

// Seasons Panel
function SeasonsPanel({ seasons, onUpdate }: {
  seasons: PricingSeason[];
  onUpdate: (seasons: PricingSeason[]) => void;
}) {
  const getSeasonColor = (type: SeasonType) => {
    const colors: Record<SeasonType, string> = {
      peak: 'bg-red-500/30 border-red-500/50',
      high: 'bg-amber-500/30 border-amber-500/50',
      shoulder: 'bg-blue-500/30 border-blue-500/50',
      low: 'bg-emerald-500/30 border-emerald-500/50',
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-serif font-bold text-[#D6B06A]">Pricing Seasons</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {seasons.map((season) => (
          <div key={season.id} className={`p-6 rounded-xl border-2 ${getSeasonColor(season.seasonType)}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[#D6B06A] text-lg">{season.name}</h4>
              <span className="px-3 py-1 bg-[#2E2015] text-xs font-bold uppercase rounded-full text-[#C89A4B]">
                {season.seasonType}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#D3C5AE]" />
                <span className="text-sm text-[#D3C5AE]">
                  {season.startMonth}/{season.startDay} — {season.endMonth}/{season.endDay}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-[#D3C5AE]" />
                <span className="text-sm text-[#D3C5AE]">
                  Price Multiplier: <span className="font-bold text-[#D6B06A]">{season.priceMultiplier}x</span>
                </span>
              </div>
              {season.region && (
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-[#D3C5AE]" />
                  <span className="text-sm text-[#D3C5AE]">{season.region}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#C89A4B]/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#D3C5AE]">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  season.isActive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-stone-500/30 text-stone-300'
                }`}>
                  {season.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {seasons.length === 0 && (
        <p className="text-center text-[#D3C5AE] py-8">No seasons configured</p>
      )}
    </div>
  );
}

export default DynamicPricingEngine;
