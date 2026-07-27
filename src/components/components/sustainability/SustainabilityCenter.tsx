'use client';

/**
 * Sustainability Center
 * 
 * Eco-travel scoring and sustainability management dashboard.
 */

import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Globe,
  TreePine,
  PawPrint,
  Cloud,
  Users,
  Award,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  MapPin,
  DollarSign,
  Shield,
  Recycle,
  Zap,
  Droplets,
  Trash2,
} from 'lucide-react';

interface SustainabilityScore {
  supplier_id: string;
  overall_score: number;
  sustainability_grade: string;
  conservation_score: number;
  community_score: number;
  wildlife_score: number;
  carbon_score: number;
  eco_badges: string[];
  primary_eco_badge?: string;
  conservation_projects: number;
  acres_protected: number;
  trees_planted: number;
  animals_protected: number;
  community_projects: number;
  local_employees: number;
  local_sourcing_percentage: number;
  community_investment_usd: number;
  total_carbon_offset_kg: number;
  carbon_neutral: boolean;
  is_verified: boolean;
}

interface ConservationProject {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  country: string;
  area_sq_km: number;
  target_species: string[];
  funding_goal_usd: number;
  funding_received_usd: number;
  status: string;
  progress_percentage: number;
}

interface Stats {
  total_suppliers: number;
  eco_certified_count: number;
  carbon_neutral_count: number;
  avg_sustainability_score: number;
  total_carbon_offset_kg: number;
  total_acres_protected: number;
  total_trees_planted: number;
  total_community_investment_usd: number;
  conservation_projects_count: number;
}

interface Filter {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface EcoBadge {
  badge_type: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  eco_certified: { icon: <Leaf className="w-4 h-4" />, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  carbon_neutral: { icon: <Cloud className="w-4 h-4" />, color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)' },
  community_support: { icon: <Users className="w-4 h-4" />, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  wildlife_friendly: { icon: <PawPrint className="w-4 h-4" />, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  green_partner: { icon: <Recycle className="w-4 h-4" />, color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)' },
  sustainable_leader: { icon: <Award className="w-4 h-4" />, color: '#EAB308', bgColor: 'rgba(234, 179, 8, 0.1)' },
  plastic_free: { icon: <Trash2 className="w-4 h-4" />, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  renewable_energy: { icon: <Zap className="w-4 h-4" />, color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.1)' },
  waste_reducer: { icon: <Recycle className="w-4 h-4" />, color: '#84CC16', bgColor: 'rgba(132, 204, 22, 0.1)' },
  water_saver: { icon: <Droplets className="w-4 h-4" />, color: '#0EA5E9', bgColor: 'rgba(14, 165, 233, 0.1)' },
};

export function SustainabilityCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'projects' | 'badges'>('overview');
  const [scores, setScores] = useState<SustainabilityScore[]>([]);
  const [projects, setProjects] = useState<ConservationProject[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [badges, setBadges] = useState<EcoBadge[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [scoresRes, projectsRes, statsRes, filtersRes, badgesRes] = await Promise.all([
        fetch('/api/sustainability/scores'),
        fetch('/api/sustainability/conservation'),
        fetch('/api/sustainability/stats'),
        fetch('/api/sustainability/filters'),
        fetch('/api/sustainability/badges'),
      ]);

      const [scoresData, projectsData, statsData, filtersData, badgesData] = await Promise.all([
        scoresRes.json(),
        projectsRes.json(),
        statsRes.json(),
        filtersRes.json(),
        badgesRes.json(),
      ]);

      if (scoresData.success) setScores(scoresData.data.scores || []);
      if (projectsData.success) setProjects(projectsData.data.projects || []);
      if (statsData.success) setStats(statsData.data);
      if (filtersData.success) setFilters(filtersData.data.filters || []);
      if (badgesData.success) setBadges(badgesData.data.badges || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    );
  };

  const filteredScores = scores.filter(s => {
    const matchesSearch = !searchTerm ||
      s.supplier_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilters = selectedFilters.length === 0 ||
      selectedFilters.every(f => s.eco_badges?.includes(f));
    return matchesSearch && matchesFilters;
  });

  const getGradeColor = (grade: string): string => {
    if (grade === 'A') return 'text-emerald-400';
    if (grade === 'B') return 'text-blue-400';
    if (grade === 'C') return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const renderBadge = (badge: string) => {
    const config = BADGE_CONFIG[badge] || BADGE_CONFIG.eco_certified;
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
        <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-[#10B981]">
            Sustainability Center
          </h1>
          <p className="text-[#8B7355]">Eco-travel scoring and environmental impact</p>
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
          <StatCard icon={<Globe className="w-5 h-5" />} label="Eco Certified" value={stats.eco_certified_count} />
          <StatCard icon={<Cloud className="w-5 h-5" />} label="Carbon Neutral" value={stats.carbon_neutral_count} />
          <StatCard icon={<TreePine className="w-5 h-5" />} label="Trees Planted" value={(stats.total_trees_planted / 1000).toFixed(1) + 'K'} />
          <StatCard icon={<Leaf className="w-5 h-5" />} label="Avg Score" value={stats.avg_sustainability_score.toFixed(1)} />
        </div>
      )}

      {/* Impact Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ImpactCard icon={<MapPin className="w-5 h-5" />} label="Acres Protected" value={stats.total_acres_protected.toLocaleString()} />
          <ImpactCard icon={<Cloud className="w-5 h-5" />} label="CO₂ Offset (kg)" value={(stats.total_carbon_offset_kg / 1000).toFixed(1) + 'K'} />
          <ImpactCard icon={<DollarSign className="w-5 h-5" />} label="Community Investment" value={`$${(stats.total_community_investment_usd / 1000).toFixed(0)}K`} />
          <ImpactCard icon={<Leaf className="w-5 h-5" />} label="Conservation Projects" value={stats.conservation_projects_count} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#10B981]/20">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
        <TabButton active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Eco Suppliers" />
        <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} label="Conservation" />
        <TabButton active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} label="Eco Badges" />
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Eco Performers */}
          <div className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#10B981]/20">
              <h3 className="font-medium text-[#10B981] flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Eco Performers
              </h3>
            </div>
            <div className="divide-y divide-[#10B981]/10">
              {scores.slice(0, 5).map((score, index) => (
                <div key={score.supplier_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold w-8 ${
                      index === 0 ? 'text-emerald-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-[#8B7355]'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#F4E8D5]">{score.supplier_id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {score.eco_badges?.slice(0, 3).map(renderBadge)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getGradeColor(score.sustainability_grade)}`}>
                      {score.overall_score.toFixed(1)}
                    </p>
                    <p className="text-sm text-[#8B7355]">Grade {score.sustainability_grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CategoryCard icon={<Leaf className="w-6 h-6" />} label="Conservation" avg={scores.length > 0 ? scores.reduce((a, s) => a + s.conservation_score, 0) / scores.length : 0} />
            <CategoryCard icon={<Users className="w-6 h-6" />} label="Community" avg={scores.length > 0 ? scores.reduce((a, s) => a + s.community_score, 0) / scores.length : 0} />
            <CategoryCard icon={<PawPrint className="w-6 h-6" />} label="Wildlife" avg={scores.length > 0 ? scores.reduce((a, s) => a + s.wildlife_score, 0) / scores.length : 0} />
            <CategoryCard icon={<Cloud className="w-6 h-6" />} label="Carbon" avg={scores.length > 0 ? scores.reduce((a, s) => a + s.carbon_score, 0) / scores.length : 0} />
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedFilters.includes(filter.id)
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#3D2B1F] text-[#F4E8D5] hover:bg-[#4B321F]'
                  }`}
                >
                  <span>{filter.icon}</span>
                  {filter.name}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full pl-10 pr-4 py-2 bg-[#3D2B1F] border border-[#10B981]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          {/* Supplier Cards */}
          <div className="grid gap-4">
            {filteredScores.map((score) => (
              <div key={score.supplier_id} className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl p-4 hover:border-[#10B981]/40 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-[#F4E8D5]">{score.supplier_id}</h3>
                      {score.is_verified && <Shield className="w-4 h-4 text-emerald-400" />}
                      {score.carbon_neutral && <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Carbon Neutral</span>}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {score.eco_badges?.map(renderBadge)}
                    </div>

                    {/* Impact Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <MetricBox icon={<Leaf className="w-4 h-4" />} label="Conservation" value={`${score.conservation_score.toFixed(0)}%`} />
                      <MetricBox icon={<Users className="w-4 h-4" />} label="Community" value={`$${(score.community_investment_usd / 1000).toFixed(0)}K`} />
                      <MetricBox icon={<PawPrint className="w-4 h-4" />} label="Wildlife" value={score.animals_protected > 0 ? score.animals_protected.toString() : 'N/A'} />
                      <MetricBox icon={<TreePine className="w-4 h-4" />} label="Trees" value={score.trees_planted > 0 ? score.trees_planted.toLocaleString() : '0'} />
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <p className={`text-2xl font-bold ${getGradeColor(score.sustainability_grade)}`}>
                      {score.overall_score.toFixed(1)}
                    </p>
                    <p className="text-sm text-[#8B7355]">Sustainability Score</p>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-[#3D2B1F] rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${score.conservation_score}%` }} title="Conservation" />
                    <div className="h-full bg-purple-500" style={{ width: `${score.community_score}%` }} title="Community" />
                    <div className="h-full bg-amber-500" style={{ width: `${score.wildlife_score}%` }} title="Wildlife" />
                    <div className="h-full bg-cyan-500" style={{ width: `${score.carbon_score}%` }} title="Carbon" />
                  </div>
                </div>
              </div>
            ))}
            {filteredScores.length === 0 && (
              <div className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl p-12 text-center">
                <Leaf className="w-12 h-12 mx-auto mb-3 text-[#10B981] opacity-40" />
                <p className="text-[#8B7355]">No suppliers match your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-[#F4E8D5]">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[#8B7355]">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                    <span className="px-2 py-0.5 bg-[#3D2B1F] rounded text-xs">{project.category}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-[#8B7355] mb-4">{project.description}</p>
              
              {/* Species */}
              {project.target_species?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.target_species.map((species) => (
                    <span key={species} className="px-2 py-0.5 bg-[#3D2B1F] rounded text-xs text-[#F4E8D5]">
                      {species}
                    </span>
                  ))}
                </div>
              )}

              {/* Funding Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B7355]">Funding Progress</span>
                  <span className="text-[#F4E8D5]">${(project.funding_received_usd / 1000).toFixed(0)}K / ${(project.funding_goal_usd / 1000).toFixed(0)}K</span>
                </div>
                <div className="h-2 bg-[#3D2B1F] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="bg-[#2E2015] border border-[#10B971]/20 rounded-xl p-12 text-center">
              <Leaf className="w-12 h-12 mx-auto mb-3 text-[#10B981] opacity-40" />
              <p className="text-[#8B7355]">No conservation projects found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const config = BADGE_CONFIG[badge.badge_type] || BADGE_CONFIG.eco_certified;
            return (
              <div key={badge.badge_type} className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#F4E8D5]">{badge.name}</h3>
                    <p className="text-xs text-[#8B7355]">{badge.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="text-[#10B981]">{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{label}</p>
          <p className="text-2xl font-bold text-[#F4E8D5]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#3D2B1F] rounded-xl p-3 text-center">
      <div className="text-[#10B981] flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold text-[#F4E8D5]">{value}</p>
      <p className="text-xs text-[#8B7355]">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'text-[#10B981] border-[#10B981]' : 'text-[#8B7355] border-transparent hover:text-[#10B981]'
      }`}
    >
      {label}
    </button>
  );
}

function CategoryCard({ icon, label, avg }: { icon: React.ReactNode; label: string; avg: number }) {
  return (
    <div className="bg-[#2E2015] border border-[#10B981]/20 rounded-xl p-4 text-center">
      <div className="text-[#10B981] flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-[#F4E8D5]">{avg.toFixed(0)}%</p>
      <p className="text-sm text-[#8B7355]">{label}</p>
    </div>
  );
}

function MetricBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#3D2B1F] rounded-lg p-2 flex items-center gap-2">
      <div className="text-[#10B981]">{icon}</div>
      <div>
        <p className="text-xs text-[#8B7355]">{label}</p>
        <p className="text-sm font-medium text-[#F4E8D5]">{value}</p>
      </div>
    </div>
  );
}

export default SustainabilityCenter;
