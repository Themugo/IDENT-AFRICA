'use client';

/**
 * Pricing Admin Component
 * 
 * Admin interface for managing pricing rules and campaigns.
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  Tag, 
  TrendingUp,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import type { 
  PricingRule, 
  PromotionalCampaign, 
  PricingSeason,
  PricingRuleType
} from '../../services/pricing/types';

interface PricingAdminProps {
  onCreateRule?: (rule: Partial<PricingRule>) => void;
  onUpdateRule?: (ruleId: string, updates: Partial<PricingRule>) => void;
  onDeleteRule?: (ruleId: string) => void;
  onApproveRule?: (ruleId: string) => void;
  onCreateCampaign?: (campaign: Partial<PromotionalCampaign>) => void;
  onUpdateCampaign?: (campaignId: string, updates: Partial<PromotionalCampaign>) => void;
  rules?: PricingRule[];
  campaigns?: PromotionalCampaign[];
  seasons?: PricingSeason[];
}

export default function PricingAdmin({
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onApproveRule,
  onCreateCampaign,
  onUpdateCampaign,
  rules = [],
  campaigns = [],
  seasons = [],
}: PricingAdminProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'campaigns' | 'seasons'>('rules');

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'rules'
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          Pricing Rules
          <span className="ml-1 px-2 py-0.5 bg-stone-200 text-stone-600 rounded-full text-xs">
            {rules.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Campaigns
          <span className="ml-1 px-2 py-0.5 bg-stone-200 text-stone-600 rounded-full text-xs">
            {campaigns.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('seasons')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'seasons'
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Seasons
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'rules' && (
          <PricingRulesTab 
            rules={rules}
            onCreate={onCreateRule}
            onUpdate={onUpdateRule}
            onDelete={onDeleteRule}
            onApprove={onApproveRule}
          />
        )}
        {activeTab === 'campaigns' && (
          <CampaignsTab 
            campaigns={campaigns}
            onCreate={onCreateCampaign}
            onUpdate={onUpdateCampaign}
          />
        )}
        {activeTab === 'seasons' && (
          <SeasonsTab seasons={seasons} />
        )}
      </div>
    </div>
  );
}

// Pricing Rules Tab
function PricingRulesTab({
  rules,
  onCreate,
  onUpdate,
  onDelete,
  onApprove,
}: {
  rules: PricingRule[];
  onCreate?: (rule: Partial<PricingRule>) => void;
  onUpdate?: (ruleId: string, updates: Partial<PricingRule>) => void;
  onDelete?: (ruleId: string) => void;
  onApprove?: (ruleId: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  const pendingRules = rules.filter(r => !r.isApproved);
  const approvedRules = rules.filter(r => r.isApproved);

  return (
    <div className="space-y-4">
      {/* Pending approvals */}
      {pendingRules.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Approvals ({pendingRules.length})
          </h4>
          <div className="space-y-2">
            {pendingRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-stone-900">{rule.name}</p>
                  <p className="text-sm text-stone-500">{rule.ruleType} - {rule.entityType}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove?.(rule.id)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="Approve"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete?.(rule.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Reject"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active rules */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-stone-900">Active Rules ({approvedRules.length})</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Rule form */}
      {showForm && (
        <PricingRuleForm
          onSubmit={(rule) => {
            onCreate?.(rule);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Rules list */}
      <div className="space-y-2">
        {approvedRules.map(rule => (
          <div key={rule.id}>
            <RuleCard
              rule={rule}
              onEdit={(updates) => onUpdate?.(rule.id, updates)}
              onDelete={() => onDelete?.(rule.id)}
            />
          </div>
        ))}
        {approvedRules.length === 0 && (
          <p className="text-center text-stone-500 py-8">No active pricing rules</p>
        )}
      </div>
    </div>
  );
}

// Rule card
function RuleCard({
  rule,
  onEdit,
  onDelete,
}: {
  rule: PricingRule;
  onEdit: (updates: Partial<PricingRule>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-4 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-stone-900">{rule.name}</h5>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              rule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
            }`}>
              {rule.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-stone-500">
            {rule.ruleType} • {rule.entityType} • {rule.action}
          </p>
          {rule.startDate && rule.endDate && (
            <p className="text-xs text-stone-400 mt-1">
              {new Date(rule.startDate).toLocaleDateString()} - {new Date(rule.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-amber-600">
            {rule.action === 'percentage' ? `${rule.percentageChange > 0 ? '+' : ''}${rule.percentageChange}%` : 
             `$${rule.fixedAmount}`}
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Rule form
function PricingRuleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (rule: Partial<PricingRule>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    ruleType: 'discount' as PricingRuleType,
    entityType: 'package' as 'destination' | 'package' | 'experience',
    action: 'percentage' as 'percentage' | 'fixed',
    percentageChange: 0,
    fixedAmount: 0,
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-stone-50 rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Rule Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Rule Type</label>
          <select
            value={form.ruleType}
            onChange={(e) => setForm({ ...form, ruleType: e.target.value as PricingRuleType })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="discount">Discount</option>
            <option value="season">Season</option>
            <option value="weekend">Weekend</option>
            <option value="peak">Peak</option>
            <option value="early_bird">Early Bird</option>
            <option value="last_minute">Last Minute</option>
            <option value="group">Group</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Action</label>
          <select
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value as 'percentage' | 'fixed' })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {form.action === 'percentage' ? 'Percentage (%)' : 'Fixed Amount ($)'}
          </label>
          <input
            type="number"
            value={form.action === 'percentage' ? form.percentageChange : form.fixedAmount}
            onChange={(e) => form.action === 'percentage' 
              ? setForm({ ...form, percentageChange: Number(e.target.value) })
              : setForm({ ...form, fixedAmount: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
        >
          Create Rule
        </button>
      </div>
    </form>
  );
}

// Campaigns Tab
function CampaignsTab({
  campaigns,
  onCreate,
  onUpdate,
}: {
  campaigns: PromotionalCampaign[];
  onCreate?: (campaign: Partial<PromotionalCampaign>) => void;
  onUpdate?: (campaignId: string, updates: Partial<PromotionalCampaign>) => void;
}) {
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-stone-900">
          Active Campaigns ({activeCampaigns.length})
        </h4>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map(campaign => (
          <div key={campaign.id}>
            <CampaignCard
              campaign={campaign}
              onToggleStatus={() => onUpdate?.(
                campaign.id,
                { status: campaign.status === 'active' ? 'paused' : 'active' }
              )}
            />
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <p className="text-center text-stone-500 py-8">No promotional campaigns</p>
      )}
    </div>
  );
}

// Campaign card
function CampaignCard({
  campaign,
  onToggleStatus,
}: {
  campaign: PromotionalCampaign;
  onToggleStatus: () => void;
}) {
  const statusColors = {
    draft: 'bg-stone-100 text-stone-600',
    scheduled: 'bg-blue-100 text-blue-600',
    active: 'bg-emerald-100 text-emerald-600',
    paused: 'bg-amber-100 text-amber-600',
    completed: 'bg-stone-100 text-stone-500',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-4 border border-stone-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="font-medium text-stone-900">{campaign.name}</h5>
          {campaign.promoCode && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-mono">
              {campaign.promoCode}
            </span>
          )}
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[campaign.status]}`}>
          {campaign.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-stone-500">Discount</p>
          <p className="font-medium text-stone-900">
            {campaign.discountType === 'percentage' 
              ? `${campaign.discountValue}%` 
              : `$${campaign.discountValue}`}
          </p>
        </div>
        <div>
          <p className="text-stone-500">Uses</p>
          <p className="font-medium text-stone-900">
            {campaign.currentUses}
            {campaign.maxUses && ` / ${campaign.maxUses}`}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-500">
          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
        </span>
        <button
          onClick={onToggleStatus}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
        >
          {campaign.status === 'active' ? (
            <ToggleRight className="w-5 h-5 text-emerald-500" />
          ) : (
            <ToggleLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

// Seasons Tab
function SeasonsTab({ seasons }: { seasons: PricingSeason[] }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-stone-900">Pricing Seasons</h4>
      
      <div className="grid gap-4 md:grid-cols-2">
        {seasons.map(season => (
          <div
            key={season.id}
            className={`p-4 border rounded-lg ${
              season.seasonType === 'peak' ? 'border-red-200 bg-red-50' :
              season.seasonType === 'high' ? 'border-amber-200 bg-amber-50' :
              season.seasonType === 'shoulder' ? 'border-blue-200 bg-blue-50' :
              'border-stone-200 bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-stone-900">{season.name}</h5>
              <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${
                season.seasonType === 'peak' ? 'bg-red-200 text-red-700' :
                season.seasonType === 'high' ? 'bg-amber-200 text-amber-700' :
                season.seasonType === 'shoulder' ? 'bg-blue-200 text-blue-700' :
                'bg-stone-200 text-stone-600'
              }`}>
                {season.seasonType}
              </span>
            </div>
            <p className="text-sm text-stone-600">
              {season.startMonth}/{season.startDay} - {season.endMonth}/{season.endDay}
            </p>
            <p className="text-lg font-bold text-stone-900 mt-2">
              {(season.priceMultiplier * 100).toFixed(0)}% of base price
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
