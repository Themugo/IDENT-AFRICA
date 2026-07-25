/**
 * Admin Dashboard Component
 * 
 * Business Owner Command Center - Premium dashboard with all key metrics.
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  MapPin,
  Star,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Activity,
} from 'lucide-react';

// Mock data
const MOCK_METRICS = {
  todayBookings: 5,
  pendingBookings: 12,
  todayRevenue: 24500,
  monthRevenue: 156800,
  totalCustomers: 234,
  activeSuppliers: 18,
  todayVisitors: 1247,
  conversionRate: 2.3,
};

const MOCK_RECENT_BOOKINGS = [
  { id: '1', reference: 'BK20250725001', customer: 'Sarah Johnson', package: '7 Day Maasai Mara Safari', date: '2025-08-15', amount: 4500, status: 'pending' },
  { id: '2', reference: 'BK20250725002', customer: 'Michael Chen', package: 'Gorilla Trek Uganda', date: '2025-08-20', amount: 3200, status: 'confirmed' },
  { id: '3', reference: 'BK20250725003', customer: 'Emma Wilson', package: 'Zanzibar Beach Escape', date: '2025-09-01', amount: 2800, status: 'paid' },
  { id: '4', reference: 'BK20250724001', customer: 'James Brown', package: 'Serengeti Migration', date: '2025-08-10', amount: 5100, status: 'pending' },
  { id: '5', reference: 'BK20250724002', customer: 'Lisa Anderson', package: 'Rwanda Gorilla Experience', date: '2025-08-25', amount: 4800, status: 'confirmed' },
];

const MOCK_POPULAR_DESTINATIONS = [
  { name: 'Masai Mara', bookings: 45, revenue: 202500 },
  { name: 'Serengeti', bookings: 38, revenue: 190000 },
  { name: 'Bwindi Forest', bookings: 28, revenue: 140000 },
  { name: 'Zanzibar', bookings: 35, revenue: 105000 },
  { name: 'Ngorongoro', bookings: 22, revenue: 88000 },
];

const MOCK_RECENT_ACTIVITY = [
  { type: 'booking', message: 'New booking from Sarah Johnson', time: '5 min ago', icon: 'calendar' },
  { type: 'payment', message: 'Payment received - $2,800', time: '12 min ago', icon: 'dollar' },
  { type: 'enquiry', message: 'New enquiry from Michael Chen', time: '25 min ago', icon: 'mail' },
  { type: 'review', message: 'New review on Masai Mara Safari', time: '1 hour ago', icon: 'star' },
  { type: 'supplier', message: 'New supplier application', time: '2 hours ago', icon: 'building' },
];

// ============ METRIC CARD ============

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  prefix,
}) => {
  const isPositive = change && change > 0;
  
  return (
    <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5 hover:border-stone-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-stone-400">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-stone-100">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(change)}%</span>
              {changeLabel && <span className="text-stone-500">{changeLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ STATUS BADGE ============

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Pending' },
    confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Confirmed' },
    paid: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Paid' },
    completed: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Completed' },
    cancelled: { bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'Cancelled' },
  };
  
  const style = styles[status] || styles.pending;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

// ============ ACTIVITY ICON ============

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons: Record<string, React.ReactNode> = {
    calendar: <Calendar size={16} className="text-blue-400" />,
    dollar: <DollarSign size={16} className="text-emerald-400" />,
    mail: <Mail size={16} className="text-amber-400" />,
    star: <Star size={16} className="text-purple-400" />,
    building: <Building2 size={16} className="text-stone-400" />,
    info: <Activity size={16} className="text-stone-400" />,
  };
  
  return icons[type] || icons.info;
};

// ============ MAIN DASHBOARD ============

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [recentBookings, setRecentBookings] = useState(MOCK_RECENT_BOOKINGS);
  const [popularDestinations, setPopularDestinations] = useState(MOCK_POPULAR_DESTINATIONS);
  const [recentActivity, setRecentActivity] = useState(MOCK_RECENT_ACTIVITY);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, bookingsRes, destinationsRes, activityRes] = await Promise.all([
        fetch('/api/admin-dashboard/metrics'),
        fetch('/api/admin-dashboard/bookings/recent'),
        fetch('/api/admin-dashboard/destinations/popular'),
        fetch('/api/admin-dashboard/activity'),
      ]);

      const metricsData = await metricsRes.json();
      const bookingsData = await bookingsRes.json();
      const destinationsData = await destinationsRes.json();
      const activityData = await activityRes.json();

      if (metricsData.success) setMetrics(metricsData.data);
      if (bookingsData.success) setRecentBookings(bookingsData.data);
      if (destinationsData.success) setPopularDestinations(destinationsData.data);
      if (activityData.success) setRecentActivity(activityData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-stone-100">Command Center</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="text-right">
              <p className="text-sm font-medium text-stone-100">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs text-stone-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Bookings"
            value={metrics.todayBookings}
            change={12}
            changeLabel="vs yesterday"
            icon={<Calendar size={20} className="text-blue-400" />}
            color="bg-blue-500/20"
          />
          <MetricCard
            title="Pending Approvals"
            value={metrics.pendingBookings}
            icon={<Clock size={20} className="text-amber-400" />}
            color="bg-amber-500/20"
          />
          <MetricCard
            title="Today's Revenue"
            value={metrics.todayRevenue}
            prefix="$"
            change={8}
            changeLabel="vs yesterday"
            icon={<DollarSign size={20} className="text-emerald-400" />}
            color="bg-emerald-500/20"
          />
          <MetricCard
            title="Customer Enquiries"
            value={23}
            change={-5}
            changeLabel="vs yesterday"
            icon={<Mail size={20} className="text-purple-400" />}
            color="bg-purple-500/20"
          />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Revenue"
            value={metrics.monthRevenue}
            prefix="$"
            change={15}
            changeLabel="vs last month"
            icon={<TrendingUp size={20} className="text-emerald-400" />}
            color="bg-emerald-500/20"
          />
          <MetricCard
            title="Total Customers"
            value={metrics.totalCustomers}
            change={5}
            changeLabel="this month"
            icon={<Users size={20} className="text-blue-400" />}
            color="bg-blue-500/20"
          />
          <MetricCard
            title="Active Suppliers"
            value={metrics.activeSuppliers}
            icon={<Building2 size={20} className="text-stone-400" />}
            color="bg-stone-500/20"
          />
          <MetricCard
            title="Conversion Rate"
            value={metrics.conversionRate}
            suffix="%"
            change={0.3}
            changeLabel="vs last week"
            icon={<TrendingUp size={20} className="text-amber-400" />}
            color="bg-amber-500/20"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
              <h2 className="font-semibold text-stone-100">Recent Bookings</h2>
              <button className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="divide-y divide-stone-700/50">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between px-5 py-4 hover:bg-stone-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Users size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-100">{booking.customer}</p>
                      <p className="text-sm text-stone-500">{booking.package}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-stone-100">${booking.amount.toLocaleString()}</p>
                    <p className="text-xs text-stone-500">{booking.date}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
              <h2 className="font-semibold text-stone-100">Recent Activity</h2>
              <button className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="divide-y divide-stone-700/50">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 px-5 py-3">
                  <div className="mt-1">
                    <ActivityIcon type={activity.icon} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-stone-300">{activity.message}</p>
                    <p className="text-xs text-stone-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
            <h2 className="font-semibold text-stone-100">Popular Destinations</h2>
            <button className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Manage <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-900/50">
                <tr>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Destination</th>
                  <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Bookings</th>
                  <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Revenue</th>
                  <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700/50">
                {popularDestinations.map((dest, index) => {
                  const maxRevenue = Math.max(...popularDestinations.map(d => d.revenue));
                  const percentage = Math.round((dest.revenue / maxRevenue) * 100);
                  return (
                    <tr key={dest.name} className="hover:bg-stone-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium text-stone-100">{dest.name}</span>
                        </div>
                      </td>
                      <td className="text-right px-5 py-4 text-stone-300">{dest.bookings}</td>
                      <td className="text-right px-5 py-4 text-emerald-400 font-medium">${dest.revenue.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-stone-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-500">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-stone-800/50 border border-stone-700 rounded-xl hover:border-amber-500/50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 group-hover:bg-amber-500/30">
              <MapPin size={20} className="text-amber-400" />
            </div>
            <p className="font-medium text-stone-100">Add Destination</p>
            <p className="text-xs text-stone-500">Create new location</p>
          </button>
          <button className="p-4 bg-stone-800/50 border border-stone-700 rounded-xl hover:border-amber-500/50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500/30">
              <Calendar size={20} className="text-emerald-400" />
            </div>
            <p className="font-medium text-stone-100">Create Package</p>
            <p className="text-xs text-stone-500">New safari itinerary</p>
          </button>
          <button className="p-4 bg-stone-800/50 border border-stone-700 rounded-xl hover:border-amber-500/50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/30">
              <Users size={20} className="text-blue-400" />
            </div>
            <p className="font-medium text-stone-100">View Bookings</p>
            <p className="text-xs text-stone-500">{metrics.pendingBookings} pending</p>
          </button>
          <button className="p-4 bg-stone-800/50 border border-stone-700 rounded-xl hover:border-amber-500/50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/30">
              <DollarSign size={20} className="text-purple-400" />
            </div>
            <p className="font-medium text-stone-100">Generate Report</p>
            <p className="text-xs text-stone-500">Sales analytics</p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
