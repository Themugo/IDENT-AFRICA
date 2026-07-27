'use client';

/**
 * Supplier Inventory Calendar
 * 
 * Availability calendar for suppliers to manage their inventory.
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Bed,
  Users,
  Car,
  User,
  Sparkles,
  Check,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  product_id: string;
  product_type: string;
  name?: string;
  total_quantity: number;
  available_quantity: number;
  unit_type: string;
}

interface CalendarDay {
  date: string;
  available_quantity: number;
  reserved_quantity: number;
  blocked_quantity: number;
  status: string;
  price_override?: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function SupplierInventoryCalendar() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<CalendarDay | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      loadCalendar();
    }
  }, [selectedItem, currentDate]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory?limit=100');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        if (data.data.items.length > 0 && !selectedItem) {
          setSelectedItem(data.data.items[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCalendar = async () => {
    if (!selectedItem) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    try {
      const res = await fetch(`/api/inventory/calendar/${selectedItem.id}?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      
      if (data.success) {
        // Fill in the calendar days
        const calendarDays: CalendarDay[] = [];
        for (let day = 1; day <= lastDay; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const existing = data.data.find((d: CalendarDay) => d.date === dateStr);
          
          if (existing) {
            calendarDays.push(existing);
          } else {
            // Create default entry
            calendarDays.push({
              date: dateStr,
              available_quantity: selectedItem.total_quantity,
              reserved_quantity: 0,
              blocked_quantity: 0,
              status: 'available',
            });
          }
        }
        setCalendar(calendarDays);
      }
    } catch (err) {
      console.error('Failed to load calendar:', err);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'room': return <Bed className="w-4 h-4" />;
      case 'seat': return <Users className="w-4 h-4" />;
      case 'vehicle': return <Car className="w-4 h-4" />;
      case 'guide': return <User className="w-4 h-4" />;
      case 'activity': return <Sparkles className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getDayStatus = (day: CalendarDay) => {
    if (day.blocked_quantity > 0) return 'blocked';
    if (day.available_quantity === 0) return 'soldout';
    if (day.available_quantity < (selectedItem?.total_quantity || 1) * 0.2) return 'low';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500';
      case 'low': return 'bg-amber-500';
      case 'soldout': return 'bg-red-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-emerald-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/10 hover:bg-emerald-500/20';
      case 'low': return 'bg-amber-500/10 hover:bg-amber-500/20';
      case 'soldout': return 'bg-red-500/10 hover:bg-red-500/20';
      case 'blocked': return 'bg-gray-500/10 hover:bg-gray-500/20';
      default: return 'bg-emerald-500/10 hover:bg-emerald-500/20';
    }
  };

  const updateDay = async (date: string, updates: Partial<CalendarDay>) => {
    if (!selectedItem) return;

    try {
      await fetch(`/api/inventory/calendar/${selectedItem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...updates }),
      });
      loadCalendar();
    } catch (err) {
      console.error('Failed to update day:', err);
    }
  };

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
            Availability Calendar
          </h1>
          <p className="text-[#8B7355]">Manage your inventory availability</p>
        </div>
        <button
          onClick={() => setShowBlockModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Block Dates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Item Selector */}
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#D6B06A] mb-3">Select Inventory</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedItem?.id === item.id
                    ? 'bg-[#C89A4B]/20 border border-[#C89A4B]/50'
                    : 'bg-[#3D2B1F] hover:bg-[#4B321F]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#C89A4B]">{getTypeIcon(item.product_type)}</span>
                  <span className="font-medium text-[#F4E8D5] truncate">
                    {item.name || item.product_id}
                  </span>
                </div>
                <p className="text-xs text-[#8B7355] mt-1">
                  {item.total_quantity} {item.unit_type}s total
                </p>
              </button>
            ))}
            {items.length === 0 && (
              <p className="text-center text-[#8B7355] py-4">No inventory items</p>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3 bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
          {selectedItem ? (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-[#D6B06A]">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs text-[#8B7355] py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {calendar.map((day) => {
                  const status = getDayStatus(day);
                  const dayNum = parseInt(day.date.split('-')[2]);

                  return (
                    <button
                      key={day.date}
                      onClick={() => setEditingDay(day)}
                      className={`aspect-square rounded-lg p-1 transition-colors ${getStatusBg(status)}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className={`text-sm font-medium ${
                          status === 'soldout' ? 'text-red-400' :
                          status === 'low' ? 'text-amber-400' :
                          'text-[#F4E8D5]'
                        }`}>
                          {dayNum}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#C89A4B]/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-[#8B7355]">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-[#8B7355]">Low Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-[#8B7355]">Sold Out</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-xs text-[#8B7355]">Blocked</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-[#C89A4B]/40 mx-auto mb-4" />
              <p className="text-[#8B7355]">Select an inventory item to view calendar</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Day Modal */}
      {editingDay && selectedItem && (
        <DayEditModal
          day={editingDay}
          item={selectedItem}
          onClose={() => setEditingDay(null)}
          onSave={(updates) => {
            updateDay(editingDay.date, updates);
            setEditingDay(null);
          }}
        />
      )}

      {/* Block Dates Modal */}
      {showBlockModal && selectedItem && (
        <BlockDatesModal
          item={selectedItem}
          onClose={() => setShowBlockModal(false)}
        />
      )}
    </div>
  );
}

// Day Edit Modal
function DayEditModal({
  day,
  item,
  onClose,
  onSave,
}: {
  day: CalendarDay;
  item: InventoryItem;
  onClose: () => void;
  onSave: (updates: Partial<CalendarDay>) => void;
}) {
  const [availableQty, setAvailableQty] = useState(day.available_quantity);

  const handleSave = () => {
    onSave({ available_quantity: availableQty });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
          <h2 className="text-lg font-semibold text-[#D6B06A]">
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#F4E8D5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-[#8B7355] mb-1">
              Available Quantity ({item.total_quantity} total)
            </label>
            <input
              type="number"
              min={0}
              max={item.total_quantity}
              value={availableQty}
              onChange={(e) => setAvailableQty(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-[#8B7355]">Reserved</p>
              <p className="font-medium text-[#F4E8D5]">{day.reserved_quantity}</p>
            </div>
            <div className="bg-[#3D2B1F] rounded-lg p-3">
              <p className="text-[#8B7355]">Blocked</p>
              <p className="font-medium text-[#F4E8D5]">{day.blocked_quantity}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#C89A4B]/30 text-[#8B7355] rounded-lg hover:bg-[#3D2B1F] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Block Dates Modal
function BlockDatesModal({
  item,
  onClose,
}: {
  item: InventoryItem;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: item.id,
          startDate,
          endDate,
          quantity,
          reason,
          blockType: 'maintenance',
        }),
      });

      const data = await res.json();
      if (data.success) {
        onClose();
      } else {
        alert(data.error || 'Failed to create block');
      }
    } catch (err) {
      alert('Failed to create block');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
          <h2 className="text-lg font-semibold text-[#D6B06A]">Block Dates</h2>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#F4E8D5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-[#8B7355]">
            Block availability for {item.name || item.product_id}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#8B7355] mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8B7355] mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-1">Quantity to Block</label>
            <input
              type="number"
              min={1}
              max={item.total_quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-1">Reason (Optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Maintenance, Private event"
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              Block Dates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupplierInventoryCalendar;
