/**
 * Admin Supplier Management Component
 * 
 * Manage suppliers, applications, and marketplace operations.
 */

import React, { useState } from 'react';
import {
  Building2,
  Users,
  Package,
  DollarSign,
  Star,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  ChevronDown,
  X,
  Loader2,
  Check,
  Ban,
  FileText,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Edit2,
  BarChart3,
} from 'lucide-react';

// Mock data
const MOCK_SUPPLIERS = [
  { id: '1', companyName: 'Mara Serena Safari Lodge', type: 'lodge', status: 'approved', country: 'Kenya', city: 'Masai Mara', email: 'contact@maraserena.com', products: 12, bookings: 156, revenue: 234000, rating: 4.8, memberSince: '2024-01-15' },
  { id: '2', companyName: 'WildAfrica Tours', type: 'safari_operator', status: 'approved', country: 'Kenya', city: 'Nairobi', email: 'info@wildafrica.com', products: 8, bookings: 234, revenue: 456000, rating: 4.9, memberSince: '2023-08-22' },
  { id: '3', companyName: 'Gorilla Guardians Uganda', type: 'tour_guide', status: 'approved', country: 'Uganda', city: 'Kampala', email: 'bookings@gorillaguardians.com', products: 6, bookings: 89, revenue: 178000, rating: 4.7, memberSince: '2024-03-10' },
  { id: '4', companyName: 'Zanzibar Pearl Hotel', type: 'hotel', status: 'approved', country: 'Tanzania', city: 'Zanzibar', email: 'stay@zanzibarpearl.com', products: 15, bookings: 201, revenue: 312000, rating: 4.6, memberSince: '2023-11-05' },
  { id: '5', companyName: 'Savanna Transport Co', type: 'transport_company', status: 'approved', country: 'Kenya', city: 'Nairobi', email: 'bookings@savannatransport.com', products: 5, bookings: 312, revenue: 89000, rating: 4.5, memberSince: '2024-02-18' },
  { id: '6', companyName: 'Acacia Adventure Activities', type: 'activity_provider', status: 'pending', country: 'Kenya', city: 'Masai Mara', email: 'info@acaciaadventures.com', products: 0, bookings: 0, revenue: 0, rating: 0, memberSince: '2025-07-20' },
  { id: '7', companyName: 'Serengeti Stars Lodge', type: 'lodge', status: 'pending', country: 'Tanzania', city: 'Serengeti', email: 'hello@serengetistars.com', products: 0, bookings: 0, revenue: 0, rating: 0, memberSince: '2025-07-18' },
];

const MOCK_APPLICATIONS = [
  { id: '6', companyName: 'Acacia Adventure Activities', type: 'activity_provider', submittedAt: '2025-07-20', documents: 3, status: 'documents_submitted' },
  { id: '7', companyName: 'Serengeti Stars Lodge', type: 'lodge', submittedAt: '2025-07-18', documents: 4, status: 'documents_submitted' },
];

const TYPE_LABELS: Record<string, string> = {
  lodge: 'Lodge',
  hotel: 'Hotel',
  safari_operator: 'Safari Operator',
  tour_guide: 'Tour Guide',
  transport_company: 'Transport',
  activity_provider: 'Activity Provider',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  rejected: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  suspended: { bg: 'bg-stone-500/20', text: 'text-stone-400' },
};

// ============ STATUS BADGE ============

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ============ RATING STARS ============

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        size={14}
        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}
      />
    ))}
    <span className="text-sm text-stone-400 ml-1">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
  </div>
);

// ============ SUPPLIER DETAIL MODAL ============

interface SupplierDetailModalProps {
  supplier: typeof MOCK_SUPPLIERS[0];
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  onClose,
  onApprove,
  onReject,
  onSuspend,
}) => {
  const [action, setAction] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState(15);

  const handleAction = () => {
    setAction(null);
    if (supplier.status === 'pending') {
      onApprove();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-stone-700">
            <div className="w-16 h-16 rounded-xl bg-stone-800 flex items-center justify-center">
              <Building2 size={32} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-100">{supplier.companyName}</h2>
              <p className="text-stone-500">{TYPE_LABELS[supplier.type]}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={supplier.status} />
              <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-200">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">${supplier.revenue.toLocaleString()}</p>
                <p className="text-xs text-stone-500">Total Revenue</p>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{supplier.bookings}</p>
                <p className="text-xs text-stone-500">Bookings</p>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">{supplier.products}</p>
                <p className="text-xs text-stone-500">Products</p>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <RatingStars rating={supplier.rating} />
                <p className="text-xs text-stone-500 mt-1">Rating</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-stone-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-stone-400 mb-3">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-stone-500" />
                  <span className="text-stone-300">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-stone-500" />
                  <span className="text-stone-300">{supplier.city}, {supplier.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-stone-500" />
                  <span className="text-stone-300">Member since {supplier.memberSince}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-stone-500" />
                  <span className="text-stone-300">Reg: {supplier.id.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Commission Setting (for pending) */}
            {supplier.status === 'pending' && (
              <div className="bg-stone-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-stone-400 mb-3">Set Commission Rate</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-24 px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    min={0}
                    max={50}
                  />
                  <span className="text-stone-400">% platform fee</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              {supplier.status === 'pending' && (
                <>
                  <button
                    onClick={onApprove}
                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve Supplier
                  </button>
                  <button
                    onClick={onReject}
                    className="px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </>
              )}
              {supplier.status === 'approved' && (
                <>
                  <button className="flex-1 px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium rounded-xl flex items-center justify-center gap-2">
                    <Eye size={18} />
                    View Dashboard
                  </button>
                  <button
                    onClick={onSuspend}
                    className="px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    <Ban size={18} />
                    Suspend
                  </button>
                </>
              )}
              {supplier.status === 'suspended' && (
                <button
                  onClick={onApprove}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Reinstate Supplier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN SUPPLIER MANAGER ============

export const SupplierManager: React.FC = () => {
  const [suppliers] = useState(MOCK_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<typeof MOCK_SUPPLIERS[0] | null>(null);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !searchQuery || 
      supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const matchesType = typeFilter === 'all' || supplier.type === typeFilter;
    const matchesTab = 
      (activeTab === 'all' && ['approved', 'suspended'].includes(supplier.status)) ||
      (activeTab === 'pending' && supplier.status === 'pending') ||
      (activeTab === 'approved' && supplier.status === 'approved');
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const stats = {
    total: suppliers.filter(s => s.status === 'approved').length,
    pending: suppliers.filter(s => s.status === 'pending').length,
    revenue: suppliers.reduce((sum, s) => sum + s.revenue, 0),
    bookings: suppliers.reduce((sum, s) => sum + s.bookings, 0),
  };

  const handleApprove = (id: string) => {
    console.log('Approve supplier:', id);
    setSelectedSupplier(null);
  };

  const handleReject = (id: string) => {
    console.log('Reject supplier:', id);
    setSelectedSupplier(null);
  };

  const handleSuspend = (id: string) => {
    console.log('Suspend supplier:', id);
    setSelectedSupplier(null);
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-stone-100">Supplier Management</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
              <FileText size={18} />
              Export Report
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'all', label: 'All Suppliers', count: stats.total },
            { id: 'pending', label: 'Applications', count: stats.pending },
            { id: 'approved', label: 'Active', count: stats.total },
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
              <span className="text-sm text-stone-400">Active Suppliers</span>
              <Building2 size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-stone-100">{stats.total}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Pending Applications</span>
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Total Revenue</span>
              <DollarSign size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">${(stats.revenue / 1000).toFixed(0)}k</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Total Bookings</span>
              <Package size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.bookings}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          >
            <option value="all">All Types</option>
            <option value="lodge">Lodge</option>
            <option value="hotel">Hotel</option>
            <option value="safari_operator">Safari Operator</option>
            <option value="tour_guide">Tour Guide</option>
            <option value="transport_company">Transport</option>
            <option value="activity_provider">Activity Provider</option>
          </select>
          {activeTab !== 'pending' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
            </select>
          )}
        </div>

        {/* Suppliers Table */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-900/50">
              <tr>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Supplier</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Location</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Products</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Bookings</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Revenue</th>
                <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Rating</th>
                <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-700/50">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center">
                        <Building2 size={20} className="text-stone-400" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-100">{supplier.companyName}</p>
                        <p className="text-xs text-stone-500">{supplier.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-stone-300">{TYPE_LABELS[supplier.type]}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-stone-300">{supplier.city}, {supplier.country}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-stone-300">{supplier.products}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-stone-300">{supplier.bookings}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-medium text-emerald-400">${supplier.revenue.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <RatingStars rating={supplier.rating} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status={supplier.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedSupplier(supplier)}
                        className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {supplier.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(supplier.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(supplier.id)}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto mb-4 text-stone-600" />
              <h3 className="text-lg font-medium text-stone-300 mb-2">No suppliers found</h3>
              <p className="text-stone-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <SupplierDetailModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onApprove={() => handleApprove(selectedSupplier.id)}
          onReject={() => handleReject(selectedSupplier.id)}
          onSuspend={() => handleSuspend(selectedSupplier.id)}
        />
      )}
    </div>
  );
};

export default SupplierManager;
