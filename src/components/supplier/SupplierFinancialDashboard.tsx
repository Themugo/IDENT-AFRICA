/**
 * Supplier Financial Dashboard Component
 * 
 * Financial overview for suppliers.
 */

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Eye,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';

// Mock data
const FINANCIAL_DATA = {
  earnings: {
    totalEarnings: 45600,
    thisMonth: 12400,
    lastMonth: 15600,
    pendingPayout: 2400,
    lifetimePaid: 43200,
  },
  bookings: {
    total: 47,
    thisMonth: 12,
    completed: 42,
    pending: 5,
  },
  commissions: {
    rate: 15,
    totalPaid: 6480,
    pending: 360,
  },
  recentBookings: [
    { id: '1', customer: 'Sarah Johnson', package: '3 Day Masai Mara Safari', date: '2025-07-24', amount: 2400, status: 'completed', netAmount: 2040 },
    { id: '2', customer: 'Michael Chen', package: '5 Day Gorilla Trek', date: '2025-07-24', amount: 3200, status: 'pending', netAmount: 2720 },
    { id: '3', customer: 'Emma Wilson', package: '2 Day Amboseli', date: '2025-07-23', amount: 1800, status: 'completed', netAmount: 1530 },
    { id: '4', customer: 'James Brown', package: 'Day Trip', date: '2025-07-22', amount: 450, status: 'completed', netAmount: 383 },
  ],
  payouts: [
    { id: '1', amount: 4320, date: '2025-07-15', status: 'paid', bookings: 6 },
    { id: '2', amount: 2880, date: '2025-07-01', status: 'paid', bookings: 4 },
    { id: '3', amount: 5160, date: '2025-06-15', status: 'paid', bookings: 7 },
    { id: '4', amount: 2400, date: '2025-06-28', status: 'processing', bookings: 3 },
  ],
  monthlyEarnings: [
    { month: 'Jan', amount: 6200 },
    { month: 'Feb', amount: 5800 },
    { month: 'Mar', amount: 7400 },
    { month: 'Apr', amount: 6900 },
    { month: 'May', amount: 8200 },
    { month: 'Jun', amount: 11100 },
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

// ============ EARNINGS CHART ============

const EarningsChart: React.FC<{ data: typeof FINANCIAL_DATA.monthlyEarnings }> = ({ data }) => {
  const maxAmount = Math.max(...data.map(d => d.amount));
  
  return (
    <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-stone-100">Monthly Earnings</h3>
        <select className="px-3 py-1 bg-stone-700 border border-stone-600 rounded-lg text-stone-300 text-sm">
          <option>Last 6 months</option>
          <option>This year</option>
        </select>
      </div>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs text-stone-500">${(item.amount / 1000).toFixed(1)}k</span>
            <div
              className={`w-full rounded-t-lg ${
                index === data.length - 1 ? 'bg-amber-500' : 'bg-amber-500/50'
              }`}
              style={{ height: `${(item.amount / maxAmount) * 100}%`, minHeight: '20px' }}
            />
            <span className="text-xs text-stone-500">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

export const SupplierFinancialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payouts'>('overview');

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
              Export Statement
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'Booking Income' },
            { id: 'payouts', label: 'Payouts' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                title="Total Earnings"
                value={`$${FINANCIAL_DATA.earnings.totalEarnings.toLocaleString()}`}
                change={12}
                icon={<DollarSign size={20} className="text-emerald-400" />}
                color="bg-emerald-500/20"
              />
              <StatCard
                title="This Month"
                value={`$${FINANCIAL_DATA.earnings.thisMonth.toLocaleString()}`}
                change={-20}
                icon={<Calendar size={20} className="text-amber-400" />}
                color="bg-amber-500/20"
                subtitle="After commission"
              />
              <StatCard
                title="Pending Payout"
                value={`$${FINANCIAL_DATA.earnings.pendingPayout.toLocaleString()}`}
                icon={<Clock size={20} className="text-blue-400" />}
                color="bg-blue-500/20"
                subtitle="Processing"
              />
              <StatCard
                title="Lifetime Paid"
                value={`$${FINANCIAL_DATA.earnings.lifetimePaid.toLocaleString()}`}
                icon={<CheckCircle size={20} className="text-emerald-400" />}
                color="bg-emerald-500/20"
              />
            </div>

            {/* Commission Info */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-stone-100">Commission Rate</h3>
                  <p className="text-sm text-stone-500">IDENT Africa platform fee</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">{FINANCIAL_DATA.commissions.rate}%</p>
                  <p className="text-xs text-stone-500">of each booking</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-400">Total Commission Paid</p>
                  <p className="text-lg font-semibold text-stone-100">${FINANCIAL_DATA.commissions.totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Earnings Chart */}
              <div className="lg:col-span-2">
                <EarningsChart data={FINANCIAL_DATA.monthlyEarnings} />
              </div>

              {/* Quick Stats */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                <h3 className="font-semibold text-stone-100 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-blue-400" />
                      <span className="text-stone-300">Total Bookings</span>
                    </div>
                    <span className="font-semibold text-stone-100">{FINANCIAL_DATA.bookings.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-emerald-400" />
                      <span className="text-stone-300">Completed</span>
                    </div>
                    <span className="font-semibold text-emerald-400">{FINANCIAL_DATA.bookings.completed}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-amber-400" />
                      <span className="text-stone-300">Pending</span>
                    </div>
                    <span className="font-semibold text-amber-400">{FINANCIAL_DATA.bookings.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-purple-400" />
                      <span className="text-stone-300">This Month</span>
                    </div>
                    <span className="font-semibold text-purple-400">{FINANCIAL_DATA.bookings.thisMonth}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Booking Income */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
                <h2 className="font-semibold text-stone-100">Recent Booking Income</h2>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
              </div>
              <table className="w-full">
                <thead className="bg-stone-900/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Package</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Gross</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Commission</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Net</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-700/50">
                  {FINANCIAL_DATA.recentBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-stone-100">{booking.customer}</p>
                        <p className="text-xs text-stone-500">{booking.date}</p>
                      </td>
                      <td className="px-5 py-4 text-stone-300">{booking.package}</td>
                      <td className="px-5 py-4 text-right text-stone-300">${booking.amount}</td>
                      <td className="px-5 py-4 text-right text-rose-400">-${(booking.amount * 0.15).toFixed(0)}</td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-400">${booking.netAmount}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
            <div className="text-center py-12 text-stone-500">
              Full booking income history with filtering and export
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <>
            {/* Payout Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                <p className="text-sm text-stone-400 mb-1">Pending Payout</p>
                <p className="text-2xl font-bold text-amber-400">$2,400</p>
              </div>
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                <p className="text-sm text-stone-400 mb-1">Last Payout</p>
                <p className="text-2xl font-bold text-emerald-400">$4,320</p>
                <p className="text-xs text-stone-500">Jul 15, 2025</p>
              </div>
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                <p className="text-sm text-stone-400 mb-1">Next Payout</p>
                <p className="text-2xl font-bold text-stone-100">Aug 1, 2025</p>
                <p className="text-xs text-stone-500">Net 30 terms</p>
              </div>
            </div>

            {/* Payout History */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
                <h2 className="font-semibold text-stone-100">Payout History</h2>
                <button className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg flex items-center gap-2">
                  <FileText size={18} />
                  Download Statement
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-stone-900/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Bookings</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Amount</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-700/50">
                  {FINANCIAL_DATA.payouts.map(payout => (
                    <tr key={payout.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-5 py-4 text-stone-300">{payout.date}</td>
                      <td className="px-5 py-4 text-center text-stone-300">{payout.bookings}</td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-400">${payout.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payout.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
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
          </>
        )}
      </main>
    </div>
  );
};

export default SupplierFinancialDashboard;
