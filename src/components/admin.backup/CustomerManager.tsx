/**
 * Customer Manager Component
 * 
 * Manage customers, profiles, and communications.
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  MessageSquare,
  X,
  User,
  Star,
  History,
  MailOpen,
} from 'lucide-react';

// Mock customer data
const MOCK_CUSTOMERS = [
  { id: '1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '+1 555-0123', country: 'United States', bookings: 3, totalSpent: 12500, lastBooking: '2025-07-20', status: 'active', avatar: null },
  { id: '2', firstName: 'Michael', lastName: 'Chen', email: 'michael.c@email.com', phone: '+1 555-0124', country: 'Canada', bookings: 1, totalSpent: 3200, lastBooking: '2025-07-25', status: 'active', avatar: null },
  { id: '3', firstName: 'Emma', lastName: 'Wilson', email: 'emma.w@email.com', phone: '+44 20 7123 4567', country: 'United Kingdom', bookings: 2, totalSpent: 6800, lastBooking: '2025-07-15', status: 'active', avatar: null },
  { id: '4', firstName: 'James', lastName: 'Brown', email: 'james.b@email.com', phone: '+61 2 9876 5432', country: 'Australia', bookings: 1, totalSpent: 5100, lastBooking: '2025-07-24', status: 'active', avatar: null },
  { id: '5', firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@email.com', phone: '+1 555-0127', country: 'United States', bookings: 2, totalSpent: 8200, lastBooking: '2025-07-22', status: 'active', avatar: null },
  { id: '6', firstName: 'David', lastName: 'Kim', email: 'david.k@email.com', phone: '+82 2 1234 5678', country: 'South Korea', bookings: 1, totalSpent: 3900, lastBooking: '2025-07-23', status: 'inactive', avatar: null },
];

const MOCK_BOOKING_HISTORY = [
  { id: '1', reference: 'BK20250720001', package: '7 Day Maasai Mara Safari', date: '2025-08-15', amount: 4500, status: 'confirmed' },
  { id: '2', reference: 'BK20250615002', package: '3 Day Amboseli Adventure', date: '2025-07-01', amount: 1800, status: 'completed' },
];

const MOCK_COMMUNICATIONS = [
  { id: '1', type: 'email', subject: 'Booking Confirmation', date: '2025-07-20', status: 'sent' },
  { id: '2', type: 'email', subject: 'Safari Reminder', date: '2025-07-15', status: 'sent' },
];

// ============ CUSTOMER DETAIL MODAL ============

interface CustomerDetailModalProps {
  customer: typeof MOCK_CUSTOMERS[0];
  onClose: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'communications'>('profile');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-stone-700">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <User size={32} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-100">{customer.firstName} {customer.lastName}</h2>
              <p className="text-stone-500">{customer.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg">
                <Mail size={20} />
              </button>
              <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg">
                <Phone size={20} />
              </button>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-200">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-stone-800/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-100">{customer.bookings}</p>
              <p className="text-xs text-stone-500">Total Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">${customer.totalSpent.toLocaleString()}</p>
              <p className="text-xs text-stone-500">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-100">{customer.lastBooking}</p>
              <p className="text-xs text-stone-500">Last Booking</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{customer.country}</p>
              <p className="text-xs text-stone-500">Country</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-700">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'communications', label: 'Communications', icon: Mail },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-amber-400 border-b-2 border-amber-500'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-stone-100">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-stone-500" />
                        <span className="text-stone-300">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-stone-500" />
                        <span className="text-stone-300">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-stone-500" />
                        <span className="text-stone-300">{customer.country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-stone-100">Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg">
                        <span className="text-stone-400">Newsletter</span>
                        <span className="text-emerald-400">Subscribed</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg">
                        <span className="text-stone-400">Marketing</span>
                        <span className="text-amber-400">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {MOCK_BOOKING_HISTORY.map(booking => (
                  <div key={booking.id} className="p-4 bg-stone-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-amber-400">{booking.reference}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="font-medium text-stone-100">{booking.package}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-stone-500">
                      <span>{booking.date}</span>
                      <span className="text-emerald-400">${booking.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'communications' && (
              <div className="space-y-4">
                {MOCK_COMMUNICATIONS.map(comm => (
                  <div key={comm.id} className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <MailOpen size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-100">{comm.subject}</p>
                      <p className="text-sm text-stone-500">{comm.date}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                      {comm.status}
                    </span>
                  </div>
                ))}
                <button className="w-full p-4 border-2 border-dashed border-stone-700 rounded-xl text-stone-500 hover:border-stone-600 hover:text-stone-400 transition-colors flex items-center justify-center gap-2">
                  <Mail size={18} />
                  Send New Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN CUSTOMER MANAGER ============

export const CustomerManager: React.FC = () => {
  const [customers] = useState(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'bookings' | 'spent'>('spent');

  const filteredCustomers = customers
    .filter(c => !searchQuery || 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortBy === 'bookings') return b.bookings - a.bookings;
      return b.totalSpent - a.totalSpent;
    });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent: Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length),
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-stone-100">Customer Management</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
              <Mail size={18} />
              Send Campaign
            </button>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2">
              <Users size={18} />
              Export All
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Total Customers</span>
              <Users size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-stone-100">{stats.total}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Active</span>
              <Star size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Total Revenue</span>
              <DollarSign size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">${stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Avg. Spending</span>
              <History size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">${stats.avgSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          >
            <option value="spent">Sort by Spending</option>
            <option value="bookings">Sort by Bookings</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Customers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <div
              key={customer.id}
              className="bg-stone-800/50 border border-stone-700 rounded-xl p-5 hover:border-stone-600 transition-colors cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <User size={24} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-100">{customer.firstName} {customer.lastName}</h3>
                  <p className="text-sm text-stone-500">{customer.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-700 text-stone-500'
                }`}>
                  {customer.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-stone-800 rounded-lg">
                  <p className="text-lg font-bold text-stone-100">{customer.bookings}</p>
                  <p className="text-xs text-stone-500">Bookings</p>
                </div>
                <div className="text-center p-2 bg-stone-800 rounded-lg">
                  <p className="text-lg font-bold text-emerald-400">${(customer.totalSpent / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-stone-500">Spent</p>
                </div>
                <div className="text-center p-2 bg-stone-800 rounded-lg">
                  <p className="text-lg font-bold text-stone-100">{customer.country.split(' ')[0]}</p>
                  <p className="text-xs text-stone-500">Origin</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg transition-colors">
                  <Mail size={16} className="mx-auto" />
                </button>
                <button className="flex-1 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg transition-colors">
                  <Phone size={16} className="mx-auto" />
                </button>
                <button className="flex-1 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg transition-colors">
                  <MessageSquare size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

export default CustomerManager;
