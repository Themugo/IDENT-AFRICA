/**
 * Admin Financial Dashboard Component
 * 
 * Complete financial overview and management for admins.
 */

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  BarChart3,
} from 'lucide-react';

// Mock financial data
const FINANCIAL_DATA = {
  overview: {
    totalRevenue: 284650,
    platformEarnings: 42697,
    pendingPayouts: 45780,
    refundRate: 2.3,
    monthlyGrowth: 12.5,
  },
  revenueByMonth: [
    { month: 'Jan', amount: 42100, bookings: 45 },
    { month: 'Feb', amount: 38500, bookings: 42 },
    { month: 'Mar', amount: 52300, bookings: 58 },
    { month: 'Apr', amount: 48700, bookings: 51 },
    { month: 'May', amount: 55200, bookings: 62 },
    { month: 'Jun', amount: 47850, bookings: 54 },
  ],
  recentPayments: [
    { id: '1', customer: 'Sarah Johnson', amount: 2400, provider: 'mpesa', status: 'completed', date: '2025-07-24', booking: 'BK-2025-001' },
    { id: '2', customer: 'Michael Chen', amount: 3200, provider: 'stripe', status: 'completed', date: '2025-07-24', booking: 'BK-2025-002' },
    { id: '3', customer: 'Emma Wilson', amount: 1800, provider: 'flutterwave', status: 'processing', date: '2025-07-24', booking: 'BK-2025-003' },
    { id: '4', customer: 'James Brown', amount: 4500, provider: 'mpesa', status: 'failed', date: '2025-07-23', booking: 'BK-2025-004' },
    { id: '5', customer: 'Lisa Anderson', amount: 2100, provider: 'stripe', status: 'completed', date: '2025-07-23', booking: 'BK-2025-005' },
  ],
  pendingPayouts: [
    { id: '1', supplier: 'WildAfrica Tours', amount: 12400, status: 'pending', bookings: 8, dueDate: '2025-07-28' },
    { id: '2', supplier: 'Mara Serena Lodge', amount: 8900, status: 'pending', bookings: 5, dueDate: '2025-07-28' },
    { id: '3', supplier: 'Gorilla Guardians', amount: 5600, status: 'pending', bookings: 3, dueDate: '2025-08-01' },
  ],
  providerStats: [
    { provider: 'M-Pesa', transactions: 156, volume: 89200, percentage: 31.3 },
    { provider: 'Stripe', transactions: 89, volume: 124500, percentage: 43.7 },
    { provider: 'Flutterwave', transactions: 67, volume: 70950, percentage: 25.0 },
  ],
};

// ============ STAT CARD ============

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, subtitle }) => {
  const isPositive = change && change > 0;
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
          <span>{Math.abs(change)}% from last month</span>
        </div>
      )}
    </div>
  );
};

// ============ REVENUE CHART ============

const RevenueChart: React.FC<{ data: typeof FINANCIAL_DATA.revenueByMonth }> = ({ data }) => {
  const maxAmount = Math.max(...data.map(d => d.amount));
  
  return (
    <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-stone-100">Revenue Trend</h3>
        <select className="px-3 py-1 bg-stone-700 border border-stone-600 rounded-lg text-stone-300 text-sm">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
          <option>This year</option>
        </select>
      </div>
      <div className="flex items-end justify-between h-40 gap-2">
        {data.map((item, index) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center">
              <span className="text-xs text-stone-500 mb-1">${(item.amount / 1000).toFixed(0)}k</span>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  index === data.length - 1 ? 'bg-amber-500' : 'bg-amber-500/50'
                }`}
                style={{ height: `${(item.amount / maxAmount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-stone-500">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ STATUS BADGE ============

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle size={12} /> },
    processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Clock size={12} /> },
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Clock size={12} /> },
    failed: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: <XCircle size={12} /> },
    cancelled: { bg: 'bg-stone-500/20', text: 'text-stone-400', icon: <XCircle size={12} /> },
  };
  const style = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ============ PROVIDER BADGE ============

const ProviderBadge: React.FC<{ provider: string }> = ({ provider }) => {
  const colors: Record<string, string> = {
    mpesa: 'bg-green-500/20 text-green-400',
    stripe: 'bg-purple-500/20 text-purple-400',
    flutterwave: 'bg-orange-500/20 text-orange-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[provider] || 'bg-stone-500/20 text-stone-400'}`}>
      {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </span>
  );
};

// ============ MAIN COMPONENT ============

export const FinancialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'payouts' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign size={24} className="text-emerald-400" />
              <h1 className="text-xl font-bold text-stone-100">Financial Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2">
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'payouts', label: 'Payouts', icon: DollarSign },
            { id: 'reports', label: 'Reports', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                title="Total Revenue"
                value={`$${FINANCIAL_DATA.overview.totalRevenue.toLocaleString()}`}
                change={FINANCIAL_DATA.overview.monthlyGrowth}
                icon={<DollarSign size={20} className="text-emerald-400" />}
                color="bg-emerald-500/20"
              />
              <StatCard
                title="Platform Earnings"
                value={`$${FINANCIAL_DATA.overview.platformEarnings.toLocaleString()}`}
                subtitle="15% average commission"
                icon={<TrendingUp size={20} className="text-amber-400" />}
                color="bg-amber-500/20"
              />
              <StatCard
                title="Pending Payouts"
                value={`$${FINANCIAL_DATA.overview.pendingPayouts.toLocaleString()}`}
                subtitle="12 suppliers"
                icon={<Clock size={20} className="text-blue-400" />}
                color="bg-blue-500/20"
              />
              <StatCard
                title="Refund Rate"
                value={`${FINANCIAL_DATA.overview.refundRate}%`}
                change={-0.5}
                icon={<TrendingDown size={20} className="text-rose-400" />}
                color="bg-rose-500/20"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2">
                <RevenueChart data={FINANCIAL_DATA.revenueByMonth} />
              </div>

              {/* Provider Stats */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                <h3 className="font-semibold text-stone-100 mb-4">Payment Providers</h3>
                <div className="space-y-4">
                  {FINANCIAL_DATA.providerStats.map(provider => (
                    <div key={provider.provider}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-stone-300">{provider.provider}</span>
                        <span className="text-sm text-stone-500">{provider.percentage}%</span>
                      </div>
                      <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            provider.provider === 'M-Pesa' ? 'bg-green-500' :
                            provider.provider === 'Stripe' ? 'bg-purple-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${provider.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-stone-500">
                        <span>{provider.transactions} transactions</span>
                        <span>${provider.volume.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
                <h2 className="font-semibold text-stone-100">Recent Payments</h2>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
              </div>
              <table className="w-full">
                <thead className="bg-stone-900/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Booking</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Provider</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Amount</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-700/50">
                  {FINANCIAL_DATA.recentPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-stone-100">{payment.customer}</p>
                      </td>
                      <td className="px-5 py-4 text-stone-300">{payment.booking}</td>
                      <td className="px-5 py-4"><ProviderBadge provider={payment.provider} /></td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-400">${payment.amount}</td>
                      <td className="px-5 py-4 text-center"><StatusBadge status={payment.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pending Payouts */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
                <h2 className="font-semibold text-stone-100">Pending Supplier Payouts</h2>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">Process All</button>
              </div>
              <table className="w-full">
                <thead className="bg-stone-900/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Supplier</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Amount</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Bookings</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Due Date</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-700/50">
                  {FINANCIAL_DATA.pendingPayouts.map(payout => (
                    <tr key={payout.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-stone-100">{payout.supplier}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-amber-400">${payout.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-center text-stone-300">{payout.bookings}</td>
                      <td className="px-5 py-4 text-center text-stone-300">{payout.dueDate}</td>
                      <td className="px-5 py-4 text-center"><StatusBadge status={payout.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <button className="px-3 py-1 text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg">
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 w-64"
                />
              </div>
              <div className="flex items-center gap-3">
                <select className="px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Processing</option>
                  <option>Failed</option>
                </select>
                <select className="px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100">
                  <option>All Providers</option>
                  <option>M-Pesa</option>
                  <option>Stripe</option>
                  <option>Flutterwave</option>
                </select>
                <button className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg flex items-center gap-2">
                  <Filter size={18} />
                  Filter
                </button>
              </div>
            </div>
            <div className="text-center py-12 text-stone-500">
              Full payment history with filtering and export functionality
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
              <h2 className="font-semibold text-stone-100">Supplier Payouts</h2>
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg">
                Create Payout Run
              </button>
            </div>
            <div className="text-center py-12 text-stone-500">
              Payout management with batch processing
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Daily Revenue', icon: Calendar, report: 'daily_revenue' },
              { title: 'Monthly Summary', icon: BarChart3, report: 'monthly_summary' },
              { title: 'Commission Report', icon: DollarSign, report: 'commission' },
              { title: 'Supplier Statement', icon: FileText, report: 'supplier_statement' },
            ].map(item => (
              <button
                key={item.report}
                className="bg-stone-800/50 border border-stone-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <item.icon size={24} className="text-emerald-400" />
                </div>
                <h3 className="font-medium text-stone-100">{item.title}</h3>
                <p className="text-sm text-stone-500 mt-1">Generate report</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FinancialDashboard;
