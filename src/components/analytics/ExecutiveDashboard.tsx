/**
 * Executive Dashboard Component
 * 
 * Advanced analytics and executive reporting for IDENT AFRICA.
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Download,
  FileText,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Globe,
  Building2,
  Star,
  CreditCard,
  Sparkles,
} from 'lucide-react';

const EXECUTIVE_DATA = {
  revenue: {
    total: 2846500,
    monthly: 456780,
    growth: 15.2,
    avgBooking: 3240,
  },
  bookings: {
    total: 892,
    monthly: 145,
    conversion: 3.8,
    cancellations: 12,
    cancellationRate: 1.3,
  },
  customers: {
    total: 3456,
    newThisMonth: 234,
    returning: 1567,
    countries: 45,
  },
  suppliers: {
    total: 28,
    active: 24,
    topPerformers: [
      { name: 'WildAfrica Tours', revenue: 156000, bookings: 45, rating: 4.9 },
      { name: 'Mara Serena Lodge', revenue: 123000, bookings: 38, rating: 4.8 },
      { name: 'Gorilla Guardians', revenue: 89000, bookings: 28, rating: 4.9 },
    ],
  },
  monthlyTrend: [
    { month: 'Jan', revenue: 234000, bookings: 72 },
    { month: 'Feb', revenue: 198000, bookings: 65 },
    { month: 'Mar', revenue: 267000, bookings: 82 },
    { month: 'Apr', revenue: 289000, bookings: 88 },
    { month: 'May', revenue: 312000, bookings: 95 },
    { month: 'Jun', revenue: 356000, bookings: 102 },
    { month: 'Jul', revenue: 398000, bookings: 118 },
    { month: 'Aug', revenue: 412000, bookings: 124 },
    { month: 'Sep', revenue: 387000, bookings: 115 },
    { month: 'Oct', revenue: 423000, bookings: 128 },
    { month: 'Nov', revenue: 445000, bookings: 132 },
    { month: 'Dec', revenue: 456780, bookings: 145 },
  ],
  topPackages: [
    { name: '7 Day Kenya Safari', revenue: 234000, bookings: 78, growth: 12 },
    { name: '3 Day Masai Mara', revenue: 189000, bookings: 156, growth: 8 },
    { name: 'Gorilla Trek Uganda', revenue: 156000, bookings: 48, growth: 25 },
    { name: '5 Day Serengeti', revenue: 134000, bookings: 56, growth: -3 },
    { name: 'Beach Extension', revenue: 98000, bookings: 82, growth: 15 },
  ],
  customerSegments: [
    { segment: 'Luxury Travelers', count: 234, revenue: 678000, percentage: 24 },
    { segment: 'Adventure Seekers', count: 456, revenue: 567000, percentage: 20 },
    { segment: 'Family Groups', count: 389, revenue: 534000, percentage: 19 },
    { segment: 'Couples', count: 678, revenue: 423000, percentage: 15 },
    { segment: 'Solo Travelers', count: 234, revenue: 234000, percentage: 8 },
  ],
  aiMetrics: {
    conversations: 4567,
    recommendations: 12340,
    clicks: 3421,
    conversions: 234,
    conversionRate: 27.7,
  },
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, change, icon, color }) => {
  const isPositive = change !== undefined && change >= 0;
  return (
    <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-stone-400">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-stone-100">{value}</p>
      {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{Math.abs(change)}% vs last period</span>
        </div>
      )}
    </div>
  );
};

export const ExecutiveDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('year');
  const [loading, setLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
  };

  const handleAIInsight = async () => {
    if (!aiQuery.trim()) return;
    setAiInsight('Analyzing data...');
    await new Promise(r => setTimeout(r, 2000));
    
    const insights: Record<string, string> = {
      'drop': `Based on the data, the booking trend shows steady growth throughout the year. The slight variation in February was due to seasonal demand. Current metrics show:\n\n• Revenue growth: +15.2% MoM\n• Booking conversion: 3.8%\n• Customer acquisition: +12% MoM\n\nRecommendation: Continue current marketing strategy.`,
      'growth': `Your growth analysis shows excellent performance:\n\n• Revenue increased by 15.2% this month\n• Top performer: Gorilla Trek Uganda (+25% growth)\n• Best performing segment: Luxury Travelers\n\nKey drivers: AI recommendations, improved SEO, and referral program.`,
      'seasonal': `Seasonal analysis reveals:\n\n• Peak season: July-December (safari season)\n• Shoulder season: March-May\n• Off-peak: January-February\n\nRecommendation: Consider promotions in shoulder season to balance demand.`,
    };
    
    const query = aiQuery.toLowerCase();
    let response = insights['growth'];
    if (query.includes('drop') || query.includes('decrease')) response = insights['drop'];
    else if (query.includes('seasonal') || query.includes('season')) response = insights['seasonal'];
    else response = `Based on current analytics:\n\n• Total Revenue: $${(EXECUTIVE_DATA.revenue.total / 1000000).toFixed(1)}M\n• Monthly Growth: +${EXECUTIVE_DATA.revenue.growth}%\n• Active Suppliers: ${EXECUTIVE_DATA.suppliers.active}\n\nAll key metrics are trending positive.`;
    
    setAiInsight(response);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1500));
    setExporting(false);
    alert(`Exporting ${format.toUpperCase()} report...`);
  };

  const maxRevenue = Math.max(...EXECUTIVE_DATA.monthlyTrend.map(m => m.revenue));

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={24} className="text-emerald-400" />
              <h1 className="text-xl font-bold text-stone-100">Executive Dashboard</h1>
            </div>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Live</span>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <div className="relative group">
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2">
                <Download size={18} />
                Export
                <ChevronDown size={16} />
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-stone-800 border border-stone-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left text-stone-300 hover:bg-stone-700 flex items-center gap-2">
                  <FileText size={16} /> PDF Report
                </button>
                <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-stone-300 hover:bg-stone-700 flex items-center gap-2">
                  <FileText size={16} /> CSV Data
                </button>
                <button onClick={() => handleExport('excel')} className="w-full px-4 py-2 text-left text-stone-300 hover:bg-stone-700 flex items-center gap-2">
                  <FileText size={16} /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`$${(EXECUTIVE_DATA.revenue.total / 1000000).toFixed(2)}M`}
            subtitle={`$${EXECUTIVE_DATA.revenue.monthly.toLocaleString()} this month`}
            change={EXECUTIVE_DATA.revenue.growth}
            icon={<DollarSign size={20} className="text-emerald-400" />}
            color="bg-emerald-500/20"
          />
          <MetricCard
            title="Total Bookings"
            value={EXECUTIVE_DATA.bookings.total.toLocaleString()}
            subtitle={`${EXECUTIVE_DATA.bookings.monthly} this month`}
            change={8.5}
            icon={<Package size={20} className="text-blue-400" />}
            color="bg-blue-500/20"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${EXECUTIVE_DATA.bookings.conversion}%`}
            subtitle="Visitors to bookings"
            change={0.3}
            icon={<TrendingUp size={20} className="text-purple-400" />}
            color="bg-purple-500/20"
          />
          <MetricCard
            title="Avg Booking Value"
            value={`$${EXECUTIVE_DATA.revenue.avgBooking.toLocaleString()}`}
            subtitle="Per booking"
            change={5.2}
            icon={<CreditCard size={20} className="text-amber-400" />}
            color="bg-amber-500/20"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-stone-100">Revenue Trend</h3>
              <p className="text-sm text-stone-500">Monthly performance over the past 12 months</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded" />
                <span className="text-sm text-stone-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-sm text-stone-400">Bookings</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between h-64 gap-2">
            {EXECUTIVE_DATA.monthlyTrend.map((month, i) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1" style={{ height: '200px' }}>
                  <div className="w-full bg-emerald-500/30 rounded-t" style={{ height: `${(month.revenue / maxRevenue) * 100}%`, minHeight: '8px' }} />
                  <div className="w-1 bg-blue-500 rounded-t" style={{ height: `${(month.bookings / 150) * 100}%`, minHeight: '4px' }} />
                </div>
                <span className="text-xs text-stone-500">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Suppliers */}
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-100">Top Suppliers</h3>
              <Building2 size={18} className="text-stone-500" />
            </div>
            <div className="space-y-4">
              {EXECUTIVE_DATA.suppliers.topPerformers.map((supplier, i) => (
                <div key={supplier.name} className="flex items-center gap-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500 text-stone-900' : i === 1 ? 'bg-stone-400 text-stone-900' : 'bg-amber-700 text-white'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-stone-100">{supplier.name}</p>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span>${(supplier.revenue / 1000).toFixed(0)}k</span>
                      <span>{supplier.bookings} bookings</span>
                      <span className="flex items-center gap-1">
                        <Star size={10} className="text-amber-400" /> {supplier.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-100">Customer Segments</h3>
              <PieChart size={18} className="text-stone-500" />
            </div>
            <div className="space-y-3">
              {EXECUTIVE_DATA.customerSegments.map(segment => (
                <div key={segment.segment}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-stone-300">{segment.segment}</span>
                    <span className="text-sm text-stone-500">{segment.percentage}%</span>
                  </div>
                  <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${segment.percentage * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                AI Insights
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIInsight()}
                  placeholder="Ask about your business..."
                  className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 text-sm"
                />
                <button
                  onClick={handleAIInsight}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              {aiInsight && (
                <div className="p-3 bg-stone-900/50 rounded-lg">
                  <p className="text-sm text-stone-300 whitespace-pre-line">{aiInsight}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Packages */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-700">
            <h3 className="text-lg font-semibold text-stone-100">Top Performing Packages</h3>
          </div>
          <table className="w-full">
            <thead className="bg-stone-900/50">
              <tr>
                <th className="text-left text-xs font-medium text-stone-500 uppercase px-6 py-3">Package</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase px-6 py-3">Revenue</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase px-6 py-3">Bookings</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase px-6 py-3">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-700/50">
              {EXECUTIVE_DATA.topPackages.map((pkg, i) => (
                <tr key={pkg.name} className="hover:bg-stone-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-stone-700 flex items-center justify-center text-xs text-stone-400">{i + 1}</span>
                      <span className="font-medium text-stone-100">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-400">${pkg.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-stone-300">{pkg.bookings}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`flex items-center justify-end gap-1 ${pkg.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pkg.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {Math.abs(pkg.growth)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users size={20} className="text-blue-400" />
              <span className="text-sm text-stone-400">Customers</span>
            </div>
            <p className="text-2xl font-bold text-stone-100">{EXECUTIVE_DATA.customers.total.toLocaleString()}</p>
            <p className="text-xs text-emerald-400 mt-1">+{EXECUTIVE_DATA.customers.newThisMonth} new this month</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Globe size={20} className="text-purple-400" />
              <span className="text-sm text-stone-400">Countries</span>
            </div>
            <p className="text-2xl font-bold text-stone-100">{EXECUTIVE_DATA.customers.countries}</p>
            <p className="text-xs text-stone-500 mt-1">Customer origins</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Building2 size={20} className="text-amber-400" />
              <span className="text-sm text-stone-400">Suppliers</span>
            </div>
            <p className="text-2xl font-bold text-stone-100">{EXECUTIVE_DATA.suppliers.active}</p>
            <p className="text-xs text-stone-500 mt-1">Active partners</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={20} className="text-purple-400" />
              <span className="text-sm text-stone-400">AI Impact</span>
            </div>
            <p className="text-2xl font-bold text-stone-100">{EXECUTIVE_DATA.aiMetrics.conversionRate}%</p>
            <p className="text-xs text-stone-500 mt-1">AI conversion rate</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExecutiveDashboard;
