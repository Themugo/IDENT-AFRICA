/**
 * Booking Manager Component
 * 
 * Operations center for managing all bookings.
 */

import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ChevronDown,
  X,
  Loader2,
  MessageSquare,
  Download,
  MoreVertical,
  User,
  MapPin,
  Package,
} from 'lucide-react';

// Mock booking data
const MOCK_BOOKINGS = [
  { id: '1', reference: 'BK20250725001', customer: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 555-0123', package: '7 Day Maasai Mara Safari', destination: 'Masai Mara', travelDate: '2025-08-15', guests: 2, amount: 4500, status: 'pending', created: '2 hours ago' },
  { id: '2', reference: 'BK20250725002', customer: 'Michael Chen', email: 'michael.c@email.com', phone: '+1 555-0124', package: 'Gorilla Trek Uganda', destination: 'Bwindi', travelDate: '2025-08-20', guests: 1, amount: 3200, status: 'confirmed', created: '4 hours ago' },
  { id: '3', reference: 'BK20250725003', customer: 'Emma Wilson', email: 'emma.w@email.com', phone: '+1 555-0125', package: 'Zanzibar Beach Escape', destination: 'Zanzibar', travelDate: '2025-09-01', guests: 2, amount: 2800, status: 'paid', created: '5 hours ago' },
  { id: '4', reference: 'BK20250724001', customer: 'James Brown', email: 'james.b@email.com', phone: '+1 555-0126', package: 'Serengeti Migration Special', destination: 'Serengeti', travelDate: '2025-08-10', guests: 4, amount: 5100, status: 'pending', created: '1 day ago' },
  { id: '5', reference: 'BK20250724002', customer: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+1 555-0127', package: 'Rwanda Gorilla Experience', destination: 'Volcanoes', travelDate: '2025-08-25', guests: 2, amount: 4800, status: 'confirmed', created: '1 day ago' },
  { id: '6', reference: 'BK20250723001', customer: 'David Kim', email: 'david.k@email.com', phone: '+1 555-0128', package: '5 Day Kenya Safari', destination: 'Amboseli', travelDate: '2025-07-28', guests: 3, amount: 3900, status: 'completed', created: '2 days ago' },
  { id: '7', reference: 'BK20250723002', customer: 'Anna Martinez', email: 'anna.m@email.com', phone: '+1 555-0129', package: 'Mount Kenya Trek', destination: 'Mount Kenya', travelDate: '2025-08-05', guests: 2, amount: 2400, status: 'cancelled', created: '3 days ago' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { value: 'paid', label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { value: 'completed', label: 'Completed', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-rose-400', bg: 'bg-rose-500/20' },
];

// ============ STATUS BADGE ============

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const option = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.bg} ${option.color}`}>
      {option.label}
    </span>
  );
};

// ============ BOOKING DETAIL MODAL ============

interface BookingDetailModalProps {
  booking: typeof MOCK_BOOKINGS[0];
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.status);

  const handleStatusChange = async () => {
    setUpdating(true);
    setTimeout(() => {
      onStatusChange(newStatus);
      setUpdating(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Calendar size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-stone-100">{booking.reference}</p>
                <p className="text-sm text-stone-500">Booked {booking.created}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={booking.status} />
              <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-200">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="bg-stone-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-stone-400 mb-3">Customer Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-100">{booking.customer}</p>
                    <p className="text-sm text-stone-500">Guest</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-100">{booking.email}</p>
                    <p className="text-sm text-stone-500">Email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-100">{booking.phone}</p>
                    <p className="text-sm text-stone-500">Phone</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-stone-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-stone-400 mb-3">Booking Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-100">{booking.package}</p>
                    <p className="text-sm text-stone-500">Package</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-100">{booking.destination}</p>
                    <p className="text-sm text-stone-500">Destination</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-100">{booking.travelDate}</p>
                    <p className="text-sm text-stone-500">Travel Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-100">{booking.guests} guests</p>
                    <p className="text-sm text-stone-500">Group Size</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-stone-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-stone-400 mb-3">Payment Summary</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">${booking.amount.toLocaleString()}</p>
                  <p className="text-sm text-stone-500">Total Amount</p>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Paid</span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-stone-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-stone-400 mb-3">Update Status</h3>
              <div className="flex items-center gap-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusChange}
                  disabled={updating || newStatus === booking.status}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {updating && <Loader2 size={16} className="animate-spin" />}
                  Update Status
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-stone-700">
              <button className="flex-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center justify-center gap-2">
                <Mail size={18} />
                Send Email
              </button>
              <button className="flex-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                Add Note
              </button>
              <button className="flex-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center justify-center gap-2">
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN BOOKING MANAGER ============

export const BookingManager: React.FC = () => {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<typeof MOCK_BOOKINGS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      booking.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.package.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesTab = activeTab === 'all' || booking.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
    setSelectedBooking(null);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-stone-100">Booking Operations</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'all', label: 'All Bookings', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'confirmed', label: 'Confirmed', count: stats.confirmed },
            { id: 'completed', label: 'Completed', count: stats.completed },
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
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Total Bookings</span>
              <Calendar size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-stone-100">{stats.total}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Pending</span>
              <Clock size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Confirmed</span>
              <CheckCircle size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.confirmed}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Completed</span>
              <DollarSign size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input
              type="text"
              placeholder="Search by reference, customer, or package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Bookings Table */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-900/50">
              <tr>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Reference</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Package</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Guests</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-700/50">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm text-amber-400">{booking.reference}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-100">{booking.customer}</p>
                    <p className="text-xs text-stone-500">{booking.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-stone-300">{booking.package}</p>
                    <p className="text-xs text-stone-500">{booking.destination}</p>
                  </td>
                  <td className="px-5 py-4 text-stone-300">{booking.travelDate}</td>
                  <td className="px-5 py-4 text-stone-300">{booking.guests}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-medium text-emerald-400">${booking.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg"
                        title="Send Email"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg"
                        title="More Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-stone-600" />
              <h3 className="text-lg font-medium text-stone-300 mb-2">No bookings found</h3>
              <p className="text-stone-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={(status) => handleStatusChange(selectedBooking.id, status)}
        />
      )}
    </div>
  );
};

export default BookingManager;
