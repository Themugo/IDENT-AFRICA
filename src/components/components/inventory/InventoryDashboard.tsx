'use client';

/**
 * Admin Inventory Dashboard
 * 
 * Comprehensive inventory management interface for administrators.
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Bed,
  Users,
  Car,
  User,
  Sparkles,
  Loader2,
  BarChart3,
  Layers,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  product_id: string;
  product_type: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  blocked_quantity: number;
  name?: string;
  unit_type: string;
  created_at: string;
}

interface InventoryStats {
  totalItems: number;
  totalCapacity: number;
  availableCapacity: number;
  reservedCapacity: number;
  utilizationRate: number;
  byType: Record<string, { count: number; capacity: number }>;
  lowStockItems: number;
}

export function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch('/api/inventory?limit=100'),
        fetch('/api/inventory/stats'),
      ]);

      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();

      if (itemsData.success) setItems(itemsData.data.items);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'room': return <Bed className="w-5 h-5" />;
      case 'seat': return <Users className="w-5 h-5" />;
      case 'vehicle': return <Car className="w-5 h-5" />;
      case 'guide': return <User className="w-5 h-5" />;
      case 'activity': return <Sparkles className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'room': return 'bg-blue-100 text-blue-600';
      case 'seat': return 'bg-emerald-100 text-emerald-600';
      case 'vehicle': return 'bg-amber-100 text-amber-600';
      case 'guide': return 'bg-purple-100 text-purple-600';
      case 'activity': return 'bg-pink-100 text-pink-600';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.product_type === filterType;
    return matchesSearch && matchesType;
  });

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
            Inventory Management
          </h1>
          <p className="text-[#8B7355]">Real-time availability tracking</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Inventory
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="w-6 h-6" />}
            label="Total Items"
            value={stats.totalItems}
            color="bg-[#2E2015]"
            borderColor="border-[#C89A4B]/30"
          />
          <StatCard
            icon={<Layers className="w-6 h-6" />}
            label="Total Capacity"
            value={stats.totalCapacity}
            color="bg-[#2E2015]"
            borderColor="border-emerald-500/30"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Utilization"
            value={`${stats.utilizationRate}%`}
            color="bg-[#2E2015]"
            borderColor="border-amber-500/30"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Low Stock"
            value={stats.lowStockItems}
            color="bg-[#2E2015]"
            borderColor="border-red-500/30"
          />
        </div>
      )}

      {/* Utilization Bar */}
      {stats && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#8B7355]">Capacity Utilization</span>
            <span className="text-sm font-medium text-[#D6B06A]">{stats.utilizationRate}%</span>
          </div>
          <div className="h-3 bg-[#3D2B1F] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C89A4B] to-[#D6B06A] transition-all duration-500"
              style={{ width: `${stats.utilizationRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#8B7355]">
            <span>Available: {stats.availableCapacity}</span>
            <span>Reserved: {stats.reservedCapacity}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
            >
              <option value="all">All Types</option>
              <option value="room">Rooms</option>
              <option value="seat">Seats</option>
              <option value="vehicle">Vehicles</option>
              <option value="guide">Guides</option>
              <option value="activity">Activities</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#3D2B1F]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wide">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wide">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wide">
                  Available
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wide">
                  Reserved
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C89A4B]/10">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#8B7355]">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#3D2B1F]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[#F4E8D5]">{item.name || item.product_id}</p>
                        <p className="text-xs text-[#8B7355]">{item.supplier_name || item.supplier_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.product_type)}`}>
                        {getTypeIcon(item.product_type)}
                        <span className="capitalize">{item.product_type}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#F4E8D5]">
                      {item.total_quantity} {item.unit_type}s
                    </td>
                    <td className="px-4 py-3">
                      <span className={item.available_quantity < item.total_quantity * 0.2 ? 'text-red-400' : 'text-emerald-400'}>
                        {item.available_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#F4E8D5]">{item.reserved_quantity}</td>
                    <td className="px-4 py-3">
                      {item.available_quantity === 0 ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                          Sold Out
                        </span>
                      ) : item.available_quantity < item.total_quantity * 0.2 ? (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-[#8B7355] hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Type Breakdown */}
      {stats && Object.keys(stats.byType).length > 0 && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#D6B06A] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Inventory by Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.byType).map(([type, data]) => (
              <div key={type} className="bg-[#3D2B1F] rounded-lg p-3 text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${getTypeColor(type)}`}>
                  {getTypeIcon(type)}
                </div>
                <p className="text-lg font-bold text-[#F4E8D5]">{(data as {count: number; capacity: number}).count}</p>
                <p className="text-xs text-[#8B7355] capitalize">{type}s</p>
                <p className="text-xs text-[#8B7355]">{(data as {count: number; capacity: number}).capacity} units</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateInventoryModal onClose={() => setShowCreateModal(false)} onCreated={loadData} />
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <InventoryDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  borderColor: string;
}) {
  return (
    <div className={`${color} border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className="text-[#C89A4B]">{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{label}</p>
          <p className="text-2xl font-bold text-[#D6B06A]">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Create Inventory Modal
function CreateInventoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    supplierId: '',
    productId: '',
    productType: 'room',
    totalQuantity: 1,
    name: '',
    unitType: 'room',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onCreated();
        onClose();
      } else {
        alert(data.error || 'Failed to create inventory');
      }
    } catch (err) {
      alert('Failed to create inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
          <h2 className="text-lg font-semibold text-[#D6B06A]">Add Inventory Item</h2>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#F4E8D5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-[#8B7355] mb-1">Supplier ID</label>
            <input
              type="text"
              required
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              placeholder="supplier_xxx"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-1">Product ID</label>
            <input
              type="text"
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              placeholder="room_001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#8B7355] mb-1">Type</label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              >
                <option value="room">Room</option>
                <option value="seat">Seat</option>
                <option value="vehicle">Vehicle</option>
                <option value="guide">Guide</option>
                <option value="activity">Activity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#8B7355] mb-1">Quantity</label>
              <input
                type="number"
                required
                min={1}
                value={formData.totalQuantity}
                onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-1">Name (Optional)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              placeholder="Deluxe Safari Tent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#C89A4B]/30 text-[#8B7355] rounded-lg hover:bg-[#3D2B1F] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inventory Detail Modal
function InventoryDetailModal({
  item,
  onClose,
}: {
  item: InventoryItem;
  onClose: () => void;
}) {
  const utilization = Math.round(((item.total_quantity - item.available_quantity) / item.total_quantity) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
          <h2 className="text-lg font-semibold text-[#D6B06A]">Inventory Details</h2>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#F4E8D5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-xs text-[#8B7355]">Name</p>
              <p className="font-medium text-[#F4E8D5]">{item.name || item.product_id}</p>
            </div>
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-xs text-[#8B7355]">Type</p>
              <p className="font-medium text-[#F4E8D5] capitalize">{item.product_type}</p>
            </div>
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-xs text-[#8B7355]">Total Capacity</p>
              <p className="font-medium text-[#F4E8D5]">{item.total_quantity} {item.unit_type}s</p>
            </div>
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-xs text-[#8B7355]">Available</p>
              <p className={`font-medium ${item.available_quantity < item.total_quantity * 0.2 ? 'text-red-400' : 'text-emerald-400'}`}>
                {item.available_quantity} {item.unit_type}s
              </p>
            </div>
          </div>

          <div className="bg-[#3D2B1F] rounded-lg p-3">
            <p className="text-xs text-[#8B7355] mb-2">Utilization</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-[#1A1512] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C89A4B] transition-all"
                  style={{ width: `${utilization}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[#D6B06A]">{utilization}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-xs text-[#8B7355]">Reserved</p>
              <p className="font-medium text-[#F4E8D5]">{item.reserved_quantity}</p>
            </div>
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-xs text-[#8B7355]">Blocked</p>
              <p className="font-medium text-[#F4E8D5]">{item.blocked_quantity}</p>
            </div>
          </div>

          <div className="bg-[#3D2B1F] rounded-lg p-3">
            <p className="text-xs text-[#8B7355]">Supplier</p>
            <p className="font-medium text-[#F4E8D5]">{item.supplier_name || item.supplier_id}</p>
          </div>
        </div>

        <div className="p-4 border-t border-[#C89A4B]/20">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryDashboard;
