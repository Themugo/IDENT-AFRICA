'use client';

/**
 * Quality Center
 * 
 * Supplier quality scoring and badge management dashboard.
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Shield,
  Star,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Loader2,
  BadgeCheck,
  Crown,
  Leaf,
  Sparkles,
  ThumbsUp,
  Trophy,
  Zap,
  Users,
  Target,
  BarChart3,
} from 'lucide-react';

interface QualityScore {
  supplier_id: string;
  supplier_name?: string;
  overall_score: number;
  score_grade: string;
  rating_score: number;
  response_time_score: number;
  completion_rate_score: number;
  satisfaction_score: number;
  cancellation_rate_score: number;
  average_rating: number;
  total_ratings: number;
  booking_completion_rate: number;
  cancellation_rate: number;
  avg_response_time_minutes: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  badges: string[];
  primary_badge?: string;
  last_calculated_at?: string;
}

interface Badge {
  badge_type: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  min_overall_score: number;
  min_rating: number;
  min_completion_rate: number;
  max_cancellation_rate: number;
  min_bookings: number;
}

interface Alert {
  id: string;
  supplier_id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description?: string;
  current_value?: number;
  threshold_value?: number;
  status: string;
}

interface Stats {
  total_suppliers: number;
  avg_score: number;
  avg_response_time: number;
  avg_completion: number;
  badge_distribution: Record<string, number>;
  recent_alerts: number;
}

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  verified_luxury: { icon: <Crown className="w-4 h-4" />, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  top_safari: { icon: <Star className="w-4 h-4" />, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  eco_champion: { icon: <Leaf className="w-4 h-4" />, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  super_host: { icon: <ThumbsUp className="w-4 h-4" />, color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.1)' },
  trusted_supplier: { icon: <Shield className="w-4 h-4" />, color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)' },
  rising_star: { icon: <Zap className="w-4 h-4" />, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  premium_partner: { icon: <Award className="w-4 h-4" />, color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
  excellence_award: { icon: <Trophy className="w-4 h-4" />, color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
};

export function QualityCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'badges' | 'alerts'>('overview');
  const [scores, setScores] = useState<QualityScore[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<QualityScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [scoresRes, badgesRes, alertsRes, statsRes] = await Promise.all([
        fetch('/api/quality/scores'),
        fetch('/api/quality/badges'),
        fetch('/api/quality/alerts'),
        fetch('/api/quality/stats'),
      ]);

      const [scoresData, badgesData, alertsData, statsData] = await Promise.all([
        scoresRes.json(),
        badgesRes.json(),
        alertsRes.json(),
        statsRes.json(),
      ]);

      if (scoresData.success) setScores(scoresData.data.scores || []);
      if (badgesData.success) setBadges(badgesData.data.badges || []);
      if (alertsData.success) setAlerts(alertsData.data.alerts || []);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async (supplierId: string) => {
    try {
      await fetch(`/api/quality/calculate/${supplierId}`, { method: 'POST' });
      loadData();
    } catch (err) {
      console.error('Failed to recalculate:', err);
    }
  };

  const filteredScores = scores.filter(s => {
    const matchesSearch = !searchTerm || 
      s.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBadge = filterBadge === 'all' || s.badges?.includes(filterBadge);
    return matchesSearch && matchesBadge;
  });

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'text-emerald-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const renderBadge = (badge: string) => {
    const config = BADGE_CONFIG[badge] || BADGE_CONFIG.trusted_supplier;
    const badgeInfo = badges.find(b => b.badge_type === badge);
    return (
      <span
        key={badge}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{ color: config.color, backgroundColor: config.bgColor }}
        title={badgeInfo?.description}
      >
        {config.icon}
        {badgeInfo?.name || badge}
      </span>
    );
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
            Quality Center
          </h1>
          <p className="text-[#8B7355]">Supplier performance and badge management</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D2B1F] text-[#F4E8D5] rounded-lg hover:bg-[#4B321F] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Suppliers" value={stats.total_suppliers} />
          <StatCard icon={<Target className="w-5 h-5" />} label="Avg Score" value={stats.avg_score.toFixed(1)} />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Avg Response" value={`${stats.avg_response_time}m`} />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Open Alerts" value={stats.recent_alerts} highlight={stats.recent_alerts > 0} />
        </div>
      )}

      {/* Badge Overview */}
      {stats && Object.keys(stats.badge_distribution).length > 0 && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#D6B06A] mb-4">Badge Distribution</h3>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(stats.badge_distribution).map(([badge, count]) => {
              const config = BADGE_CONFIG[badge] || BADGE_CONFIG.trusted_supplier;
              return (
                <div
                  key={badge}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <span className="text-sm text-[#F4E8D5]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#C89A4B]/20">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
        <TabButton active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Suppliers" />
        <TabButton active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} label="Badge Definitions" />
        <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} label="Alerts" />
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Top Performers */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#C89A4B]/20">
              <h3 className="font-medium text-[#D6B06A] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Top Performers
              </h3>
            </div>
            <div className="divide-y divide-[#C89A4B]/10">
              {scores.slice(0, 5).map((score, index) => (
                <div key={score.supplier_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-[#8B7355]'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#F4E8D5]">{score.supplier_name || score.supplier_id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {score.badges?.slice(0, 2).map(renderBadge)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getGradeColor(score.score_grade)}`}>
                      {score.overall_score.toFixed(1)}
                    </p>
                    <p className="text-sm text-[#8B7355]">{score.score_grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <h3 className="font-medium text-[#D6B06A] mb-4">Score Distribution</h3>
            <div className="space-y-3">
              {[
                { range: 'A (90-100)', min: 90, color: 'bg-emerald-500' },
                { range: 'B (80-89)', min: 80, color: 'bg-blue-500' },
                { range: 'C (70-79)', min: 70, color: 'bg-amber-500' },
                { range: 'D (60-69)', min: 60, color: 'bg-orange-500' },
                { range: 'F (<60)', min: 0, color: 'bg-red-500' },
              ].map(grade => {
                const count = scores.filter(s => s.overall_score >= grade.min && 
                  (grade.min === 0 || s.overall_score < grade.min + (grade.min === 90 ? 10 : 10))
                ).length;
                const percentage = scores.length > 0 ? (count / scores.length) * 100 : 0;
                return (
                  <div key={grade.range} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-[#8B7355]">{grade.range}</span>
                    <div className="flex-1 h-6 bg-[#3D2B1F] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${grade.color} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-sm text-[#F4E8D5] text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search suppliers..."
                  className="w-full pl-10 pr-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
                />
              </div>
              <select
                value={filterBadge}
                onChange={(e) => setFilterBadge(e.target.value)}
                className="px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              >
                <option value="all">All Badges</option>
                {badges.map(b => (
                  <option key={b.badge_type} value={b.badge_type}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Supplier Cards */}
          <div className="grid gap-4">
            {filteredScores.map((score) => (
              <div
                key={score.supplier_id}
                className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4 hover:border-[#C89A4B]/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-[#F4E8D5]">{score.supplier_name || score.supplier_id}</h3>
                      <span className={`text-xl font-bold ${getGradeColor(score.score_grade)}`}>
                        {score.score_grade}
                      </span>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {score.badges?.map(renderBadge)}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <MetricBox
                        label="Overall"
                        value={score.overall_score.toFixed(1)}
                        subValue={`${score.score_grade} Grade`}
                      />
                      <MetricBox
                        label="Rating"
                        value={score.average_rating.toFixed(1)}
                        subValue={`${score.total_ratings} reviews`}
                        icon={<Star className="w-3 h-3" />}
                      />
                      <MetricBox
                        label="Response"
                        value={`${score.avg_response_time_minutes}m`}
                        subValue="avg time"
                        icon={<Clock className="w-3 h-3" />}
                      />
                      <MetricBox
                        label="Completion"
                        value={`${score.booking_completion_rate.toFixed(0)}%`}
                        subValue={`${score.completed_bookings}/${score.total_bookings}`}
                        icon={<CheckCircle className="w-3 h-3" />}
                      />
                      <MetricBox
                        label="Cancellation"
                        value={`${score.cancellation_rate.toFixed(1)}%`}
                        subValue="rate"
                        icon={<XCircle className="w-3 h-3" />}
                      />
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleRecalculate(score.supplier_id)}
                      className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                      title="Recalculate Score"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-[#8B7355] mb-1">
                    <span>Quality Score</span>
                    <span>{score.overall_score.toFixed(1)}/100</span>
                  </div>
                  <div className="h-2 bg-[#3D2B1F] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBarColor(score.overall_score)} transition-all`}
                      style={{ width: `${score.overall_score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const config = BADGE_CONFIG[badge.badge_type] || BADGE_CONFIG.trusted_supplier;
            return (
              <div key={badge.badge_type} className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#F4E8D5]">{badge.name}</h3>
                    <span className="text-xs text-[#8B7355]">{badge.min_overall_score}+ score</span>
                  </div>
                </div>
                <p className="text-sm text-[#8B7355] mb-3">{badge.description}</p>
                <div className="text-xs text-[#8B7355] space-y-1">
                  <p>Min Rating: {badge.min_rating}+</p>
                  <p>Completion Rate: {badge.min_completion_rate}%+</p>
                  <p>Max Cancellation: {badge.max_cancellation_rate}%</p>
                  <p>Min Bookings: {badge.min_bookings}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
          <div className="divide-y divide-[#C89A4B]/10">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#F4E8D5]">{alert.title}</h4>
                      <p className="text-sm text-[#8B7355] mt-1">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#8B7355]">
                        <span>Supplier: {alert.supplier_id}</span>
                        {alert.current_value !== undefined && (
                          <span>Current: {alert.current_value.toFixed(2)}</span>
                        )}
                        {alert.threshold_value !== undefined && (
                          <span>Threshold: {alert.threshold_value.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.status === 'open' ? 'bg-red-500/20 text-red-400' :
                    alert.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="p-12 text-center text-[#8B7355]">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-40" />
                <p>No alerts at this time</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`bg-[#2E2015] border rounded-xl p-4 ${highlight ? 'border-red-500/50' : 'border-[#C89A4B]/20'}`}>
      <div className="flex items-center gap-3">
        <div className={highlight ? 'text-red-400' : 'text-[#C89A4B]'}>{icon}</div>
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

function MetricBox({ label, value, subValue, icon }: { label: string; value: string; subValue?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#3D2B1F] rounded-lg p-3">
      <div className="flex items-center gap-1 text-xs text-[#8B7355] mb-1">
        {icon}
        {label}
      </div>
      <p className="text-lg font-bold text-[#F4E8D5]">{value}</p>
      {subValue && <p className="text-xs text-[#8B7355]">{subValue}</p>}
    </div>
  );
}

export default QualityCenter;
