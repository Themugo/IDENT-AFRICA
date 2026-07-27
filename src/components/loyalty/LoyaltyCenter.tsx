'use client';

/**
 * Loyalty Center
 * 
 * Customer loyalty and rewards management dashboard.
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Gift,
  Star,
  Users,
  TrendingUp,
  GiftIcon,
  Ticket,
  Crown,
  Zap,
  ChevronRight,
  Loader2,
  Search,
  Copy,
  Check,
  X,
  Sparkles,
  Medal,
  Clock,
} from 'lucide-react';

interface LoyaltyProfile {
  id: string;
  customer_id: string;
  customer_name?: string;
  membership_tier: string;
  current_points: number;
  lifetime_points: number;
  total_spending: number;
  total_bookings: number;
  points_to_next_tier?: number;
  tier_benefits?: Record<string, unknown>;
  status: string;
}

interface Tier {
  tier: string;
  name: string;
  description?: string;
  min_lifetime_points: number;
  color: string;
  points_multiplier: number;
  discount_percentage: number;
  benefits: string[];
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  category: string;
  points_cost: number;
  value_amount?: number;
  value_type?: string;
  is_featured?: boolean;
}

interface Transaction {
  id: string;
  transaction_type: string;
  points: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

interface Stats {
  total_members: number;
  active_members: number;
  total_points_issued: number;
  total_points_redeemed: number;
  by_tier: Record<string, number>;
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

const TIER_ICONS: Record<string, React.ReactNode> = {
  bronze: <Medal className="w-6 h-6" />,
  silver: <Medal className="w-6 h-6" />,
  gold: <Crown className="w-6 h-6" />,
  platinum: <Crown className="w-6 h-6" />,
  diamond: <Sparkles className="w-6 h-6" />,
};

const TRANSACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  booking_earn: { label: 'Booking Earned', icon: '🎯', color: 'text-emerald-400' },
  review_earn: { label: 'Review Bonus', icon: '⭐', color: 'text-amber-400' },
  referral_earn: { label: 'Referral Bonus', icon: '👥', color: 'text-blue-400' },
  signup_bonus: { label: 'Welcome Bonus', icon: '🎉', color: 'text-purple-400' },
  promotion_earn: { label: 'Promotion', icon: '🎁', color: 'text-pink-400' },
  redemption: { label: 'Redeemed', icon: '🎫', color: 'text-red-400' },
};

export function LoyaltyCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history' | 'tiers'>('overview');
  const [profiles, setProfiles] = useState<LoyaltyProfile[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<LoyaltyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profilesRes, tiersRes, rewardsRes, transactionsRes, statsRes] = await Promise.all([
        fetch('/api/loyalty/profiles'),
        fetch('/api/loyalty/tiers'),
        fetch('/api/loyalty/rewards'),
        fetch('/api/loyalty/transactions'),
        fetch('/api/loyalty/stats'),
      ]);

      const [profilesData, tiersData, rewardsData, transactionsData, statsData] = await Promise.all([
        profilesRes.json(),
        tiersRes.json(),
        rewardsRes.json(),
        transactionsRes.json(),
        statsRes.json(),
      ]);

      if (profilesData.success) setProfiles(profilesData.data.profiles || []);
      if (tiersData.success) setTiers(tiersData.data.tiers || []);
      if (rewardsData.success) setRewards(rewardsData.data.rewards || []);
      if (transactionsData.success) setTransactions(transactionsData.data.transactions || []);
      if (statsData.success) setStats(statsData.data);

      if (profilesData.data?.profiles?.length > 0 && !selectedProfile) {
        setSelectedProfile(profilesData.data.profiles[0]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReferral = async () => {
    if (!selectedProfile) return;
    
    try {
      const res = await fetch('/api/loyalty/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          referrerId: selectedProfile.customer_id,
          referrerEmail: selectedProfile.customer_name,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setReferralCode(data.data.referral_code);
        setShowReferralModal(true);
      }
    } catch (err) {
      console.error('Failed to create referral:', err);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (!selectedProfile) return;

    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedProfile.customer_id,
          rewardId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Redeemed successfully! Voucher code: ${data.data.voucher_code}`);
        setShowRedeemModal(false);
        loadData();
      } else {
        alert(data.error || 'Failed to redeem');
      }
    } catch (err) {
      console.error('Failed to redeem:', err);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://ident.africa/join?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredProfiles = profiles.filter(p =>
    !searchTerm ||
    (p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierProgress = (profile: LoyaltyProfile): number => {
    const currentTier = tiers.find(t => t.tier === profile.membership_tier);
    const nextTier = tiers.find(t => t.sort_order === (currentTier?.sort_order || 0) + 1);
    
    if (!nextTier) return 100;
    
    const currentMin = currentTier?.min_lifetime_points || 0;
    const nextMin = nextTier.min_lifetime_points;
    const progress = ((profile.lifetime_points - currentMin) / (nextMin - currentMin)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C89A4B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-[#D6B06A]">
            Loyalty Center
          </h1>
          <p className="text-[#8B7355]">Reward your customers and build loyalty</p>
        </div>
        <button
          onClick={handleCreateReferral}
          disabled={!selectedProfile}
          className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50"
        >
          <GiftIcon className="w-4 h-4" />
          Create Referral Link
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Members" value={stats.total_members} />
          <StatCard icon={<Award className="w-5 h-5" />} label="Active Members" value={stats.active_members} />
          <StatCard icon={<Zap className="w-5 h-5" />} label="Points Issued" value={(stats.total_points_issued / 1000).toFixed(0) + 'K'} />
          <StatCard icon={<Gift className="w-5 h-5" />} label="Points Redeemed" value={(stats.total_points_redeemed / 1000).toFixed(0) + 'K'} />
        </div>
      )}

      {/* Tier Overview */}
      <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#D6B06A] mb-4">Membership Tiers</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              className="flex-shrink-0 p-4 rounded-lg border border-[#C89A4B]/20 bg-[#3D2B1F] min-w-[180px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div style={{ color: tier.color }}>{TIER_ICONS[tier.tier]}</div>
                <span className="font-medium text-[#F4E8D5]">{tier.name}</span>
              </div>
              <p className="text-xs text-[#8B7355]">{tier.min_lifetime_points.toLocaleString()} pts</p>
              <p className="text-xs text-[#C89A4B] mt-1">{tier.discount_percentage}% off</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#C89A4B]/20">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Members" />
        <TabButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} label="Rewards" />
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" />
        <TabButton active={activeTab === 'tiers'} onClick={() => setActiveTab('tiers')} label="Tier Benefits" />
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="grid gap-4">
            {filteredProfiles.map((profile) => {
              const tierColor = TIER_COLORS[profile.membership_tier] || '#C89A4B';
              return (
                <div
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`bg-[#2E2015] border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedProfile?.id === profile.id
                      ? 'border-[#C89A4B] shadow-lg'
                      : 'border-[#C89A4B]/20 hover:border-[#C89A4B]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
                      >
                        {TIER_ICONS[profile.membership_tier]}
                      </div>
                      <div>
                        <p className="font-medium text-[#F4E8D5]">{profile.customer_name || profile.customer_id}</p>
                        <p className="text-sm text-[#8B7355]">{profile.membership_tier.charAt(0).toUpperCase() + profile.membership_tier.slice(1)} Member</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#D6B06A]">{profile.current_points.toLocaleString()}</p>
                      <p className="text-xs text-[#8B7355]">points</p>
                    </div>
                  </div>
                  
                  {/* Progress bar to next tier */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-[#8B7355] mb-1">
                      <span>Progress to next tier</span>
                      <span>{Math.round(getTierProgress(profile))}%</span>
                    </div>
                    <div className="h-2 bg-[#3D2B1F] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${getTierProgress(profile)}%`, backgroundColor: tierColor }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#D6B06A]">Available Rewards</h3>
            {selectedProfile && (
              <p className="text-sm text-[#8B7355]">
                Balance: <span className="text-[#D6B06A] font-bold">{selectedProfile.current_points.toLocaleString()}</span> points
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-[#C89A4B]/20 rounded-lg">
                    {reward.category === 'discount' ? (
                      <Ticket className="w-6 h-6 text-[#C89A4B]" />
                    ) : reward.category === 'experience' ? (
                      <Star className="w-6 h-6 text-purple-400" />
                    ) : reward.category === 'upgrade' ? (
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Gift className="w-6 h-6 text-pink-400" />
                    )}
                  </div>
                  {reward.is_featured && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Featured</span>
                  )}
                </div>
                <h4 className="font-medium text-[#F4E8D5] mb-1">{reward.name}</h4>
                <p className="text-sm text-[#8B7355] mb-3">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#D6B06A]">{reward.points_cost.toLocaleString()} pts</span>
                  <button
                    onClick={() => setShowRedeemModal(true)}
                    disabled={!selectedProfile || selectedProfile.current_points < reward.points_cost}
                    className="px-3 py-1.5 bg-[#C89A4B] text-[#2E2015] text-sm font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#C89A4B]/20">
            <h3 className="font-medium text-[#D6B06A]">Points History</h3>
          </div>
          <div className="divide-y divide-[#C89A4B]/10">
            {transactions.map((tx) => {
              const txInfo = TRANSACTION_LABELS[tx.transaction_type] || { label: tx.transaction_type, icon: '📋', color: 'text-gray-400' };
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{txInfo.icon}</span>
                    <div>
                      <p className="font-medium text-[#F4E8D5]">{txInfo.label}</p>
                      <p className="text-sm text-[#8B7355]">{tx.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#8B7355]">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="p-12 text-center text-[#8B7355]">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tiers' && (
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.tier} className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                >
                  {TIER_ICONS[tier.tier]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#F4E8D5]">{tier.name}</h3>
                  <p className="text-[#8B7355]">{tier.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BenefitItem label="Min Points" value={tier.min_lifetime_points.toLocaleString()} />
                <BenefitItem label="Points Bonus" value={`${((tier.points_multiplier - 1) * 100).toFixed(0)}%`} />
                <BenefitItem label="Discount" value={`${tier.discount_percentage}%`} />
                <BenefitItem label="Multiplier" value={`${tier.points_multiplier}x`} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tier.benefits.map((benefit, i) => (
                  <span key={i} className="px-3 py-1 bg-[#3D2B1F] rounded-full text-sm text-[#F4E8D5]">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
              <h2 className="text-lg font-semibold text-[#D6B06A]">Your Referral Code</h2>
              <button onClick={() => setShowReferralModal(false)} className="text-[#8B7355] hover:text-[#F4E8D5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#C89A4B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiftIcon className="w-8 h-8 text-[#C89A4B]" />
              </div>
              <p className="text-3xl font-bold text-[#D6B06A] tracking-wider mb-2">{referralCode}</p>
              <p className="text-[#8B7355] mb-4">Share this code and earn {REFERRAL_BONUS_REFERER} points!</p>
              <div className="flex gap-2">
                <button
                  onClick={copyReferralLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
              <h2 className="text-lg font-semibold text-[#D6B06A]">Redeem Reward</h2>
              <button onClick={() => setShowRedeemModal(false)} className="text-[#8B7355] hover:text-[#F4E8D5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-center text-[#F4E8D5]">
                Current Balance: <span className="text-[#D6B06A] font-bold">{selectedProfile.current_points.toLocaleString()}</span> points
              </p>
              <div className="space-y-2">
                {rewards.filter(r => r.is_featured).map((reward) => (
                  <button
                    key={reward.id}
                    onClick={() => handleRedeem(reward.id)}
                    disabled={selectedProfile.current_points < reward.points_cost}
                    className="w-full p-4 bg-[#3D2B1F] rounded-lg text-left hover:bg-[#4B321F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#F4E8D5]">{reward.name}</p>
                      <p className="text-sm text-[#8B7355]">{reward.points_cost.toLocaleString()} points</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#8B7355]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="text-[#C89A4B]">{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{label}</p>
          <p className="text-2xl font-bold text-[#D6B06A]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'text-[#C89A4B] border-[#C89A4B]' : 'text-[#8B7355] border-transparent hover:text-[#D6B06A]'
      }`}
    >
      {label}
    </button>
  );
}

function BenefitItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#8B7355]">{label}</p>
      <p className="text-lg font-bold text-[#D6B06A]">{value}</p>
    </div>
  );
}

const REFERRAL_BONUS_REFERER = 500;

export default LoyaltyCenter;
