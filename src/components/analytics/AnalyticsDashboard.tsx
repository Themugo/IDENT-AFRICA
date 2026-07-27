/**
 * Analytics Dashboard Component
 * 
 * Business intelligence and analytics for IDENT AFRICA.
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Download,
  Globe,
  Monitor,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Search,
} from 'lucide-react';

const ANALYTICS_DATA = {
  overview: {
    visitors: 45678,
    visitorsChange: 12.5,
    pageViews: 234567,
    pageViewsChange: 8.3,
    bounceRate: 32.4,
    bounceRateChange: -2.1,
    avgSession: 4.2,
    avgSessionChange: 15,
  },
  conversions: {
    bookingsStarted: 1234,
    bookingsCompleted: 456,
    conversionRate: 3.7,
    revenue: 284650,
    avgBookingValue: 624,
  },
  topDestinations: [
    { name: 'Masai Mara', views: 15420, bookings: 156, conversion: 1.0 },
    { name: 'Serengeti', views: 12350, bookings: 98, conversion: 0.8 },
    { name: 'Bwindi', views: 8760, bookings: 67, conversion: 0.8 },
    { name: 'Ngorongoro', views: 7890, bookings: 54, conversion: 0.7 },
    { name: 'Amboseli', views: 6540, bookings: 45, conversion: 0.7 },
  ],
  topPackages: [
    { name: '3 Day Masai Mara Classic', views: 8760, bookings: 89 },
    { name: '5 Day Kenya Safari', views: 6540, bookings: 67 },
    { name: '7 Day Ultimate Safari', views: 5430, bookings: 45 },
  ],
  trafficSources: [
    { source: 'Google', visits: 18560, percentage: 40.6, change: 15 },
    { source: 'Direct', visits: 9876, percentage: 21.6, change: 5 },
    { source: 'Facebook', visits: 6543, percentage: 14.3, change: 22 },
    { source: 'Instagram', visits: 4321, percentage: 9.5, change: 35 },
    { source: 'Email', visits: 3210, percentage: 7.0, change: 8 },
  ],
  devices: [
    { type: 'Mobile', percentage: 58 },
    { type: 'Desktop', percentage: 35 },
    { type: 'Tablet', percentage: 7 },
  ],
  countries: [
    { name: 'United States', visitors: 12340 },
    { name: 'United Kingdom', visitors: 8765 },
    { name: 'Germany', visitors: 5432 },
    { name: 'Australia', visitors: 4321 },
    { name: 'France', visitors: 3210 },
  ],
  weeklyData: [
    { day: 'Mon', visitors: 5200, bookings: 65 },
    { day: 'Tue', visitors: 5800, bookings: 72 },
    { day: 'Wed', visitors: 6100, bookings: 78 },
    { day: 'Thu', visitors: 6400, bookings: 85 },
    { day: 'Fri', visitors: 7200, bookings: 92 },
    { day: 'Sat', visitors: 6800, bookings: 88 },
    { day: 'Sun', visitors: 6200, bookings: 76 },
  ],
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  format?: 'number' | 'percent' | 'currency' | 'time';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color, format = 'number' }) => {
  const isPositive = change !== undefined && change > 0;
  
  const formatValue = (val: string | number) => {
    if (format === 'percent') return `${val}%`;
    if (format === 'currency') return `$${Number(val).toLocaleString()}`;
    if (format === 'time') return `${val} min`;
    if (typeof val === 'number') return val.toLocaleString();
    return val;
  };
  
  return (
    <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-stone-400">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-stone-100">{formatValue(value)}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{Math.abs(change)}% from last week</span>
        </div>
      )}
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'conversions' | 'content'>('overview');

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-400" />
              <h1 className="text-xl font-bold text-stone-100">Analytics</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="ytd">Year to date</option>
            </select>
            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'traffic', label: 'Traffic' },
            { id: 'conversions', label: 'Conversions' },
            { id: 'content', label: 'Content' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Main Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="Unique Visitors"
                value={ANALYTICS_DATA.overview.visitors}
                change={ANALYTICS_DATA.overview.visitorsChange}
                icon={<Users size={20} className="text-blue-400" />}
                color="bg-blue-500/20"
              />
              <MetricCard
                title="Page Views"
                value={ANALYTICS_DATA.overview.pageViews}
                change={ANALYTICS_DATA.overview.pageViewsChange}
                icon={<Eye size={20} className="text-purple-400" />}
                color="bg-purple-500/20"
              />
              <MetricCard
                title="Bounce Rate"
                value={ANALYTICS_DATA.overview.bounceRate}
                format="percent"
                change={ANALYTICS_DATA.overview.bounceRateChange}
                icon={<MousePointer size={20} className="text-amber-400" />}
                color="bg-amber-500/20"
              />
              <MetricCard
                title="Avg. Session"
                value={ANALYTICS_DATA.overview.avgSession}
                format="time"
                change={ANALYTICS_DATA.overview.avgSessionChange}
                icon={<Calendar size={20} className="text-emerald-400" />}
                color="bg-emerald-500/20"
              />
            </div>

            {/* Conversions */}
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="Bookings Started"
                value={ANALYTICS_DATA.conversions.bookingsStarted}
                icon={<TrendingUp size={20} className="text-amber-400" />}
                color="bg-amber-500/20"
              />
              <MetricCard
                title="Bookings Completed"
                value={ANALYTICS_DATA.conversions.bookingsCompleted}
                icon={<Package size={20} className="text-emerald-400" />}
                color="bg-emerald-500/20"
              />
              <MetricCard
                title="Conversion Rate"
                value={ANALYTICS_DATA.conversions.conversionRate}
                format="percent"
                icon={<TrendingUp size={20} className="text-blue-400" />}
                color="bg-blue-500/20"
              />
              <MetricCard
                title="Revenue"
                value={ANALYTICS_DATA.conversions.revenue}
                format="currency"
                icon={<DollarSign size={20} className="text-emerald-400" />}
                color="bg-emerald-500/20"
              />
            </div>

            {/* Weekly Chart */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
              <h3 className="font-semibold text-stone-100 mb-4">Weekly Visitors & Bookings</h3>
              <div className="flex items-end justify-between h-48 gap-4">
                {ANALYTICS_DATA.weeklyData.map((data, index) => (
                  <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1" style={{ height: '160px' }}>
                      <div
                        className="w-full bg-blue-500/50 rounded-t-lg"
                        style={{ height: `${(data.visitors / 8000) * 100}%`, minHeight: '20px' }}
                      />
                      <div
                        className="w-full bg-emerald-500/70 rounded-t-lg"
                        style={{ height: `${(data.bookings / 100) * 100}%`, minHeight: '5px' }}
                      />
                    </div>
                    <span className="text-xs text-stone-500">{data.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/50 rounded" />
                  <span className="text-xs text-stone-500">Visitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500/70 rounded" />
                  <span className="text-xs text-stone-500">Bookings</span>
                </div>
              </div>
            </div>

            {/* Top Content */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Destinations */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                <h3 className="font-semibold text-stone-100 mb-4">Top Destinations</h3>
                <div className="space-y-3">
                  {ANALYTICS_DATA.topDestinations.map((dest, index) => (
                    <div key={dest.name} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-stone-700 text-xs flex items-center justify-center text-stone-400">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-stone-100">{dest.name}</p>
                        <p className="text-xs text-stone-500">{dest.views.toLocaleString()} views</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-emerald-400">{dest.bookings}</p>
                        <p className="text-xs text-stone-500">{dest.conversion}% CVR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Packages */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                <h3 className="font-semibold text-stone-100 mb-4">Top Packages</h3>
                <div className="space-y-3">
                  {ANALYTICS_DATA.topPackages.map((pkg, index) => (
                    <div key={pkg.name} className="flex items-center gap-4">
                      <Package size={18} className="text-stone-500" />
                      <div className="flex-1">
                        <p className="font-medium text-stone-100">{pkg.name}</p>
                        <p className="text-xs text-stone-500">{pkg.views.toLocaleString()} views</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-emerald-400">{pkg.bookings} bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Traffic Tab */}
        {activeTab === 'traffic' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Traffic Sources */}
            <div className="lg:col-span-2 bg-stone-800/50 border border-stone-700 rounded-xl p-5">
              <h3 className="font-semibold text-stone-100 mb-4">Traffic Sources</h3>
              <div className="space-y-4">
                {ANALYTICS_DATA.trafficSources.map(source => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-stone-500" />
                        <span className="font-medium text-stone-100">{source.source}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-stone-400">{source.visits.toLocaleString()}</span>
                        <span className={`text-xs ${source.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {source.change > 0 ? '+' : ''}{source.change}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
              <h3 className="font-semibold text-stone-100 mb-4">Devices</h3>
              <div className="space-y-4">
                {ANALYTICS_DATA.devices.map(device => (
                  <div key={device.type}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {device.type === 'Mobile' && <Smartphone size={16} className="text-stone-500" />}
                        {device.type === 'Desktop' && <Monitor size={16} className="text-stone-500" />}
                        <span className="text-stone-300">{device.type}</span>
                      </div>
                      <span className="font-medium text-stone-100">{device.percentage}%</span>
                    </div>
                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          device.type === 'Mobile' ? 'bg-blue-500' :
                          device.type === 'Desktop' ? 'bg-purple-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="lg:col-span-3 bg-stone-800/50 border border-stone-700 rounded-xl p-5">
              <h3 className="font-semibold text-stone-100 mb-4">Top Countries</h3>
              <div className="grid grid-cols-5 gap-4">
                {ANALYTICS_DATA.countries.map((country, index) => (
                  <div key={country.name} className="text-center p-4 bg-stone-900/50 rounded-xl">
                    <Globe size={24} className="mx-auto mb-2 text-blue-400" />
                    <p className="font-medium text-stone-100">{country.name}</p>
                    <p className="text-sm text-stone-500">{country.visitors.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversions Tab */}
        {activeTab === 'conversions' && (
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
            <h3 className="font-semibold text-stone-100 mb-4">Conversion Funnel</h3>
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[
                { label: 'Visitors', value: ANALYTICS_DATA.overview.visitors, percentage: 100 },
                { label: 'Package Views', value: Math.round(ANALYTICS_DATA.overview.visitors * 0.4), percentage: 40 },
                { label: 'Booking Started', value: ANALYTICS_DATA.conversions.bookingsStarted, percentage: 2.7 },
                { label: 'Booking Completed', value: ANALYTICS_DATA.conversions.bookingsCompleted, percentage: 1.0 },
              ].map((step, index) => (
                <React.Fragment key={step.label}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                      <Users size={24} className="text-blue-400" />
                    </div>
                    <p className="font-semibold text-stone-100">{step.value.toLocaleString()}</p>
                    <p className="text-sm text-stone-500">{step.label}</p>
                  </div>
                  {index < 3 && (
                    <div className="flex-1 h-0.5 bg-stone-700 mx-4 mt-8">
                      <div className="h-full bg-blue-500" style={{ width: `${(step.percentage / 100) * 100}%` }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
            <h3 className="font-semibold text-stone-100 mb-4">Top Search Queries</h3>
            <div className="space-y-2">
              {[
                { query: 'masai mara safari packages', count: 3240 },
                { query: 'best time to visit kenya', count: 2890 },
                { query: 'gorilla trekking uganda', count: 2450 },
                { query: 'family safari africa', count: 2120 },
                { query: 'luxury safari lodges', count: 1980 },
              ].map((item, index) => (
                <div key={item.query} className="flex items-center gap-4 p-3 bg-stone-900/50 rounded-lg">
                  <Search size={16} className="text-stone-500" />
                  <div className="flex-1">
                    <p className="font-medium text-stone-100">{item.query}</p>
                  </div>
                  <span className="text-stone-400">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
