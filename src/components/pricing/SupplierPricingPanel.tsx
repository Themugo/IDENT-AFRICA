'use client';

/**
 * Supplier Pricing Panel
 * 
 * Interface for suppliers to manage and approve pricing adjustments.
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Check,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Percent,
  TrendingUp,
  Shield,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { PricingRule } from '../../services/pricing/types';

interface SupplierPricingPanelProps {
  supplierId: string;
  supplierName: string;
  onApprovalChange?: (approvedRules: PricingRule[]) => void;
}

export function SupplierPricingPanel({ 
  supplierId, 
  supplierName,
  onApprovalChange 
}: SupplierPricingPanelProps) {
  const [myRules, setMyRules] = useState<PricingRule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadRules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load my rules
      const rulesRes = await fetch(`/api/pricing/rules?supplierId=${supplierId}`);
      const rulesData = await rulesRes.json();
      
      if (rulesData.success) {
        const allRules = rulesData.data.rules || [];
        setMyRules(allRules);
        
        // Separate pending approvals (rules requiring supplier approval)
        const pending = allRules.filter((r: PricingRule) => 
          r.isActive && !r.isApproved && r.requiresSupplierApproval
        );
        setPendingApprovals(pending);
        
        onApprovalChange?.(allRules.filter((r: PricingRule) => r.isApproved));
      }
    } catch (err) {
      setError('Failed to load pricing rules');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, [supplierId]);

  const handleApprove = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/pricing/rules/${ruleId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: supplierId }),
      });
      if (res.ok) loadRules();
    } catch (err) {
      console.error('Failed to approve rule:', err);
    }
  };

  const handleReject = async (ruleId: string) => {
    if (!confirm('Are you sure you want to reject this pricing rule?')) return;
    try {
      const res = await fetch(`/api/pricing/rules/${ruleId}`, { method: 'DELETE' });
      if (res.ok) loadRules();
    } catch (err) {
      console.error('Failed to reject rule:', err);
    }
  };

  return (
    <div className="bg-[#1A1512] rounded-2xl border border-[#C89A4B]/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#C89A4B]/20 bg-gradient-to-r from-[#2E2015] to-[#3D2B1F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#C89A4B]/20 rounded-xl">
              <Shield className="w-6 h-6 text-[#C89A4B]" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel font-bold text-[#D6B06A]">
                Supplier Pricing Control
              </h2>
              <p className="text-sm text-[#D3C5AE]">
                Manage your approved pricing adjustments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadRules}
              className="p-2 hover:bg-[#4B321F] rounded-lg transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 text-[#C89A4B] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] rounded-lg text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Rule
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-3 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-lg text-center">
            <p className="text-2xl font-cinzel font-bold text-[#D6B06A]">{myRules.length}</p>
            <p className="text-xs text-[#D3C5AE]">Total Rules</p>
          </div>
          <div className="p-3 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-lg text-center">
            <p className="text-2xl font-cinzel font-bold text-emerald-400">
              {myRules.filter(r => r.isApproved).length}
            </p>
            <p className="text-xs text-[#D3C5AE]">Approved</p>
          </div>
          <div className="p-3 bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-lg text-center">
            <p className="text-2xl font-cinzel font-bold text-amber-400">{pendingApprovals.length}</p>
            <p className="text-xs text-[#D3C5AE]">Pending Approval</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Pending Approvals from Admin */}
        {pendingApprovals.length > 0 && (
          <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
            <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Awaiting Your Approval ({pendingApprovals.length})
            </h3>
            <p className="text-sm text-[#D3C5AE] mb-4">
              The following pricing rules have been submitted and require your approval:
            </p>
            <div className="space-y-2">
              {pendingApprovals.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-[#2E2015]/60 rounded-lg">
                  <div>
                    <p className="font-medium text-[#D6B06A]">{rule.name}</p>
                    <p className="text-sm text-[#D3C5AE]">
                      {rule.ruleType} • {rule.action === 'percentage' ? `${rule.percentageChange}%` : `$${rule.fixedAmount}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(rule.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(rule.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Rule */}
        {showCreateForm && (
          <SupplierRuleForm
            supplierId={supplierId}
            onSubmit={async (data) => {
              try {
                const res = await fetch('/api/pricing/rules', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...data, requiresSupplierApproval: true }),
                });
                if (res.ok) {
                  setShowCreateForm(false);
                  loadRules();
                }
              } catch (err) {
                console.error('Failed to create rule:', err);
              }
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* My Approved Rules */}
        <div>
          <h3 className="text-lg font-serif font-bold text-[#D6B06A] mb-4">Your Active Pricing Rules</h3>
          
          {myRules.filter(r => r.isApproved).length === 0 ? (
            <div className="p-8 bg-[#2E2015]/40 border border-[#C89A4B]/10 rounded-xl text-center">
              <DollarSign className="w-12 h-12 text-[#C89A4B]/40 mx-auto mb-3" />
              <p className="text-[#D3C5AE]">No active pricing rules</p>
              <p className="text-sm text-[#D3C5AE]/60 mt-1">
                Create a new rule to adjust your pricing
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRules.filter(r => r.isApproved).map((rule) => (
                <SupplierRuleCard key={rule.id} rule={rule} onDelete={loadRules} />
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium text-blue-300 mb-1">How Pricing Approval Works</p>
              <ul className="space-y-1 text-blue-200/80">
                <li>• Create pricing rules with custom seasonal multipliers</li>
                <li>• Admin-set rules require your approval before activation</li>
                <li>• Your approved rules automatically apply to bookings</li>
                <li>• Prices are calculated considering all active rules</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Supplier Rule Card
function SupplierRuleCard({ rule, onDelete, ..._props }: { rule: PricingRule; onDelete: () => void } & Record<string, unknown>) {
  const [expanded, setExpanded] = useState(false);

  const getRuleIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      season: <Calendar className="w-4 h-4" />,
      weekend: <Calendar className="w-4 h-4" />,
      peak: <TrendingUp className="w-4 h-4" />,
      discount: <Percent className="w-4 h-4" />,
      promotion: <TrendingUp className="w-4 h-4" />,
    };
    return icons[type] || <DollarSign className="w-4 h-4" />;
  };

  return (
    <div className="bg-[#2E2015]/60 border border-[#C89A4B]/10 rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#3D2B1F]/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C89A4B]/20 rounded-lg text-[#C89A4B]">
            {getRuleIcon(rule.ruleType)}
          </div>
          <div>
            <p className="font-medium text-[#D6B06A]">{rule.name}</p>
            <p className="text-xs text-[#D3C5AE]">
              {rule.ruleType.replace('_', ' ')} • {rule.entityType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-emerald-400">
              {rule.action === 'percentage'
                ? `${rule.percentageChange > 0 ? '+' : ''}${rule.percentageChange}%`
                : `${rule.fixedAmount > 0 ? '+' : ''}$${rule.fixedAmount}`}
            </p>
            <p className="text-xs text-[#D3C5AE]">{rule.action}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this rule?')) onDelete();
            }}
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
                <p className="text-[#D3C5AE]">Valid From</p>
                <p className="text-[#D6B06A]">{new Date(rule.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {rule.endDate && (
              <div>
                <p className="text-[#D3C5AE]">Valid Until</p>
                <p className="text-[#D6B06A]">{new Date(rule.endDate).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-[#D3C5AE]">Priority</p>
              <p className="text-[#D6B06A]">{rule.priority}</p>
            </div>
            <div>
              <p className="text-[#D3C5AE]">Travelers</p>
              <p className="text-[#D6B06A]">{rule.minTravelers}+</p>
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

// Supplier Rule Form
function SupplierRuleForm({ supplierId, onSubmit, onCancel }: {
  supplierId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    entityId: '',
    entityType: 'package' as const,
    ruleType: 'season' as const,
    action: 'percentage' as const,
    percentageChange: 0,
    fixedAmount: 0,
    startDate: '',
    endDate: '',
    priority: 5,
    minTravelers: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, supplierId, isActive: true });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#2E2015]/80 border border-[#C89A4B]/30 rounded-xl space-y-4">
      <h3 className="text-lg font-serif font-bold text-[#D6B06A]">Create Pricing Rule</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm text-[#D3C5AE] mb-1">Rule Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            placeholder="e.g., Peak Season Safari Premium"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Rule Type</label>
          <select
            value={form.ruleType}
            onChange={(e) => setForm({ ...form, ruleType: e.target.value as any })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          >
            <option value="season">Seasonal Rate</option>
            <option value="weekend">Weekend Rate</option>
            <option value="peak">Peak Season</option>
            <option value="discount">Discount</option>
            <option value="promotion">Special Promotion</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Action</label>
          <select
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value as any })}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
            <option value="multiply">Multiplier</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">
            {form.action === 'percentage' ? 'Percentage (%)' : 
             form.action === 'multiply' ? 'Multiplier (e.g., 1.25)' : 'Amount ($)'}
          </label>
          <input
            type="number"
            step={form.action === 'multiply' ? '0.05' : '1'}
            value={form.action === 'percentage' ? form.percentageChange : 
                   form.action === 'multiply' ? (1 + form.percentageChange / 100) : form.fixedAmount}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (form.action === 'percentage') setForm({ ...form, percentageChange: val });
              else if (form.action === 'multiply') setForm({ ...form, percentageChange: (val - 1) * 100 });
              else setForm({ ...form, fixedAmount: val });
            }}
            className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/30 rounded-lg text-[#D6B06A] focus:border-[#C89A4B] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#D3C5AE] mb-1">Priority (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
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

export default SupplierPricingPanel;
