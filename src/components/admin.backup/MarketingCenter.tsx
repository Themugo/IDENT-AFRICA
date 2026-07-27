/**
 * Marketing Center Component
 * 
 * Manage promotions, campaigns, and marketing content.
 */

import React, { useState } from 'react';
import {
  Tag,
  Percent,
  Gift,
  Megaphone,
  Mail,
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  ExternalLink,
  Image,
  Star,
} from 'lucide-react';

// Mock promotions data
const MOCK_PROMOTIONS = [
  { id: '1', code: 'EARLYBIRD', name: 'Early Bird Discount', type: 'percentage', value: 15, minPurchase: 1000, maxUses: 100, uses: 45, startsAt: '2025-06-01', expiresAt: '2025-08-31', status: 'active' },
  { id: '2', code: 'SAFARI25', name: 'Safari Summer Sale', type: 'percentage', value: 25, minPurchase: 2000, maxUses: 50, uses: 12, startsAt: '2025-07-01', expiresAt: '2025-09-30', status: 'active' },
  { id: '3', code: 'FAMILY500', name: 'Family Package Deal', type: 'fixed', value: 500, minPurchase: 2000, maxUses: 30, uses: 8, startsAt: '2025-06-15', expiresAt: '2025-08-15', status: 'active' },
  { id: '4', code: 'VIP2024', name: 'VIP Member Discount', type: 'percentage', value: 20, minPurchase: 0, maxUses: null, uses: 156, startsAt: '2024-01-01', expiresAt: '2025-12-31', status: 'active' },
  { id: '5', code: 'SUMMER23', name: 'Summer Flash Sale', type: 'percentage', value: 30, minPurchase: 500, maxUses: 25, uses: 25, startsAt: '2023-06-01', expiresAt: '2023-08-31', status: 'expired' },
];

const MOCK_CAMPAIGNS = [
  { id: '1', title: 'Summer Safari 2025', status: 'active', impressions: 45000, clicks: 2300, conversions: 45, budget: 5000, spent: 3200 },
  { id: '2', title: 'Gorilla Trek Promo', status: 'draft', impressions: 0, clicks: 0, conversions: 0, budget: 3000, spent: 0 },
  { id: '3', title: 'Winter Escape Campaign', status: 'scheduled', impressions: 0, clicks: 0, conversions: 0, budget: 4000, spent: 0 },
];

// ============ PROMOTION CARD ============

interface PromotionCardProps {
  promotion: typeof MOCK_PROMOTIONS[0];
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onEdit, onToggle, onDelete }) => {
  const usagePercent = promotion.maxUses ? Math.round((promotion.uses / promotion.maxUses) * 100) : 0;
  
  return (
    <div className={`bg-stone-800/50 border rounded-xl p-5 ${
      promotion.status === 'active' ? 'border-stone-700' : 'border-stone-800 opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-stone-100">{promotion.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <code className="px-2 py-0.5 bg-stone-700 rounded text-amber-400 text-sm">{promotion.code}</code>
            <button className="p-1 text-stone-500 hover:text-stone-300">
              <Copy size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className={`p-1 ${promotion.status === 'active' ? 'text-emerald-400' : 'text-stone-600'}`}>
            {promotion.status === 'active' ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
          <button onClick={onEdit} className="p-1 text-stone-500 hover:text-stone-300">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-1 text-stone-500 hover:text-rose-400">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          promotion.type === 'percentage' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {promotion.type === 'percentage' ? `${promotion.value}% OFF` : `$${promotion.value} OFF`}
        </div>
        {promotion.minPurchase > 0 && (
          <span className="text-xs text-stone-500">Min. ${promotion.minPurchase}</span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Usage</span>
          <span className="text-stone-300">{promotion.uses}{promotion.maxUses ? ` / ${promotion.maxUses}` : ' (unlimited)'}</span>
        </div>
        {promotion.maxUses && (
          <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                usagePercent > 80 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-stone-500">
        <span>Valid: {promotion.startsAt} - {promotion.expiresAt}</span>
        <span className={`${promotion.status === 'active' ? 'text-emerald-400' : 'text-stone-600'}`}>
          {promotion.status}
        </span>
      </div>
    </div>
  );
};

// ============ MAIN MARKETING CENTER ============

export const MarketingCenter: React.FC = () => {
  const [promotions, setPromotions] = useState(MOCK_PROMOTIONS);
  const [activeTab, setActiveTab] = useState<'promotions' | 'campaigns' | 'featured'>('promotions');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleToggle = (id: string) => {
    setPromotions(prev =>
      prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p)
    );
  };

  const stats = {
    activePromotions: promotions.filter(p => p.status === 'active').length,
    totalCodesUsed: promotions.reduce((sum, p) => sum + p.uses, 0),
    potentialDiscount: promotions.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.value * p.uses), 0),
    activeCampaigns: MOCK_CAMPAIGNS.filter(c => c.status === 'active').length,
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-stone-100">Marketing Center</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
              <Mail size={18} />
              Email Campaign
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Create Promotion
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'promotions', label: 'Promotions', icon: Tag },
            { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
            { id: 'featured', label: 'Featured Content', icon: Star },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Active Promotions</span>
              <Tag size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-stone-100">{stats.activePromotions}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Codes Used</span>
              <Gift size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.totalCodesUsed}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Total Discount Given</span>
              <Percent size={18} className="text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">${stats.potentialDiscount}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Active Campaigns</span>
              <Megaphone size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.activeCampaigns}</p>
          </div>
        </div>

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="text"
                  placeholder="Search promotions..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions.map(promotion => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  onEdit={() => {}}
                  onToggle={() => handleToggle(promotion.id)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2">
                <Plus size={18} />
                Create Campaign
              </button>
            </div>

            <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-900/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Campaign</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Impressions</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Clicks</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Conversions</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Budget</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-700/50">
                  {MOCK_CAMPAIGNS.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-stone-100">{campaign.title}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          campaign.status === 'draft' ? 'bg-stone-600/50 text-stone-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-stone-300">{campaign.impressions.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-stone-300">{campaign.clicks.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-emerald-400 font-medium">{campaign.conversions}</td>
                      <td className="px-5 py-4 text-right text-stone-300">${campaign.budget.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Featured Content Tab */}
        {activeTab === 'featured' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stone-100">Featured Destination</h3>
                  <button className="text-amber-400 hover:text-amber-300 text-sm">Change</button>
                </div>
                <div className="aspect-video bg-stone-700 rounded-lg flex items-center justify-center mb-4">
                  <Image size={48} className="text-stone-600" />
                </div>
                <p className="text-stone-400 text-sm">Masai Mara National Reserve</p>
              </div>

              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stone-100">Featured Package</h3>
                  <button className="text-amber-400 hover:text-amber-300 text-sm">Change</button>
                </div>
                <div className="aspect-video bg-stone-700 rounded-lg flex items-center justify-center mb-4">
                  <Image size={48} className="text-stone-600" />
                </div>
                <p className="text-stone-400 text-sm">7 Day Maasai Mara Luxury Safari</p>
              </div>
            </div>

            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
              <h3 className="font-semibold text-stone-100 mb-4">Homepage Hero Banner</h3>
              <div className="aspect-[3/1] bg-stone-700 rounded-lg flex items-center justify-center mb-4">
                <Image size={64} className="text-stone-600" />
              </div>
              <button className="w-full py-3 border-2 border-dashed border-stone-600 rounded-lg text-stone-500 hover:border-stone-500 hover:text-stone-400 transition-colors">
                Upload New Banner
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Create Promotion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowCreateModal(false)} />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl bg-stone-900 border border-stone-700 rounded-2xl">
              <div className="flex items-center justify-between p-4 border-b border-stone-700">
                <h2 className="text-lg font-semibold text-stone-100">Create Promotion</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-1 text-stone-400 hover:text-stone-200">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Promotion Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Sale"
                    className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Discount Code</label>
                  <input
                    type="text"
                    placeholder="e.g., SUMMER20"
                    className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Type</label>
                    <select className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Value</label>
                    <input
                      type="number"
                      placeholder="e.g., 20"
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-stone-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2">
                  <Save size={16} />
                  Create Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingCenter;
