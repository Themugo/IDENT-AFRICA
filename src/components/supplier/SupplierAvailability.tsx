import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupplierProfile } from '../../types';
import {
  Calendar as CalendarIcon,
  Info,
  Sliders,
  Save,
} from 'lucide-react';

interface SupplierAvailabilityProps {
  supplier: SupplierProfile;
}

export const SupplierAvailability: React.FC<SupplierAvailabilityProps> = ({ supplier }) => {
  const {
    supplierAvailabilitySlots,
    updateAvailabilitySlot,
    formatPrice,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>('2026-08-15');
  const [slotStatus, setSlotStatus] = useState<'available' | 'blocked' | 'booked'>('available');
  const [overridePrice, setOverridePrice] = useState<number>(0);
  const [availableCapacity, setAvailableCapacity] = useState<number>(
    supplier.type === 'Hotel' ? 10 : supplier.type === 'Transport Company' ? 5 : 1
  );
  const [slotNotes, setSlotNotes] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Minimum stay & lead time
  const [minStayNights, setMinStayNights] = useState<number>(2);
  const [leadTimeHours, setLeadTimeHours] = useState<number>(24);

  // Filter slots for this supplier
  const mySlots = supplierAvailabilitySlots.filter((s) => s.supplierId === supplier.id);

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    updateAvailabilitySlot({
      supplierId: supplier.id,
      date: selectedDate,
      status: slotStatus,
      overridePriceUSD: overridePrice > 0 ? overridePrice : undefined,
      availableCapacity,
      maxCapacity: supplier.type === 'Hotel' ? 15 : 10,
      notes: slotNotes || undefined,
    });

    setSaveSuccessMsg(`Availability updated for ${selectedDate}`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 texture-earth">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#C89A4B]" />
            <h2 className="text-xl font-cinzel font-bold text-[#D6B06A]">
              Inventory & Calendar Management
            </h2>
          </div>
          <p className="text-xs text-[#D3C5AE] mt-1">
            Manage daily blackout dates, custom rate overrides, and real-time available capacity for {supplier.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#4B321F] border border-[#C89A4B]/30 rounded text-xs text-[#D6B06A] font-mono">
            Default Min Stay: {minStayNights} Nights
          </div>
          <div className="px-3 py-1.5 bg-[#4B321F] border border-[#C89A4B]/30 rounded text-xs text-[#D6B06A] font-mono">
            Cutoff Lead Time: {leadTimeHours} Hrs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Slot Configuration Form */}
        <div className="lg:col-span-1 p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#D6B06A] flex items-center gap-2 border-b border-[#C89A4B]/20 pb-3">
            <Sliders className="w-5 h-5 text-[#C89A4B]" />
            Configure Date Override
          </h3>

          <form onSubmit={handleSaveSlot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Availability Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSlotStatus('available')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    slotStatus === 'available'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-[#4B321F] border-[#C89A4B]/30 text-[#D3C5AE] hover:border-[#C89A4B]'
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setSlotStatus('blocked')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    slotStatus === 'blocked'
                      ? 'bg-red-950 border-red-500 text-red-300'
                      : 'bg-[#4B321F] border-[#C89A4B]/30 text-[#D3C5AE] hover:border-[#C89A4B]'
                  }`}
                >
                  Blackout
                </button>
                <button
                  type="button"
                  onClick={() => setSlotStatus('booked')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    slotStatus === 'booked'
                      ? 'bg-amber-950 border-amber-500 text-amber-300'
                      : 'bg-[#4B321F] border-[#C89A4B]/30 text-[#D3C5AE] hover:border-[#C89A4B]'
                  }`}
                >
                  Fully Booked
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Available Units / Capacity
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={availableCapacity}
                onChange={(e) => setAvailableCapacity(parseInt(e.target.value) || 0)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none font-mono"
              />
              <span className="text-[10px] text-[#D3C5AE] mt-0.5 block">
                {supplier.type === 'Hotel' && 'Rooms available'}
                {supplier.type === 'Transport Company' && 'Vehicles/aircraft available'}
                {supplier.type === 'Guide' && 'Max guiding slots'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Custom Daily Price Override ($ USD)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Leave 0 for default seasonal rate"
                value={overridePrice || ''}
                onChange={(e) => setOverridePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Internal Warden / Operation Note
              </label>
              <input
                type="text"
                placeholder="e.g., Private takeoff blackout, high river crossing demand"
                value={slotNotes}
                onChange={(e) => setSlotNotes(e.target.value)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="btn-gold w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save Date Availability
            </button>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs rounded-lg text-center font-bold">
                {saveSuccessMsg}
              </div>
            )}
          </form>
        </div>

        {/* Existing Slot Overrides List & Calendar Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A]">
              Configured Calendar Overrides ({mySlots.length})
            </h3>

            {mySlots.length === 0 ? (
              <div className="p-8 text-center bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
                <Info className="w-8 h-8 text-[#C89A4B] mx-auto mb-2" />
                <p className="text-xs text-[#D3C5AE]">
                  No custom date overrides configured. All dates operate under standard seasonal availability.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#D6B06A]">
                          {slot.date}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            slot.status === 'available'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                              : slot.status === 'blocked'
                              ? 'bg-red-950 text-red-300 border border-red-500'
                              : 'bg-amber-950 text-amber-300 border border-amber-500'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#D3C5AE] mt-1">
                        Capacity: <strong>{slot.availableCapacity} Units</strong>
                        {slot.overridePriceUSD && (
                          <span className="ml-3 text-[#D6B06A] font-mono">
                            Override Price: {formatPrice(slot.overridePriceUSD)}
                          </span>
                        )}
                      </div>
                      {slot.notes && (
                        <p className="text-xs text-[#D3C5AE]/80 italic mt-0.5">
                          "{slot.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDate(slot.date);
                        setSlotStatus(slot.status);
                        setAvailableCapacity(slot.availableCapacity);
                        if (slot.overridePriceUSD) setOverridePrice(slot.overridePriceUSD);
                        if (slot.notes) setSlotNotes(slot.notes);
                      }}
                      className="px-3 py-1.5 border border-[#C89A4B]/40 hover:bg-[#C89A4B] hover:text-[#2E2015] text-[#D6B06A] transition-all rounded text-xs font-bold uppercase"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operational Policy Settings */}
          <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A]">
              Operational Booking Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  Minimum Stay Length (Nights)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={minStayNights}
                    onChange={(e) => setMinStayNights(parseInt(e.target.value) || 1)}
                    className="w-24 bg-[#4B321F] border border-[#C89A4B]/40 rounded p-2 text-xs text-[#F4E8D5] font-mono"
                  />
                  <span className="text-xs text-[#D3C5AE]">Nights minimum required</span>
                </div>
              </div>

              <div className="p-4 bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  Cut-Off Lead Time (Hours)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={leadTimeHours}
                    onChange={(e) => setLeadTimeHours(parseInt(e.target.value) || 24)}
                    className="w-24 bg-[#4B321F] border border-[#C89A4B]/40 rounded p-2 text-xs text-[#F4E8D5] font-mono"
                  />
                  <span className="text-xs text-[#D3C5AE]">Hours before arrival</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
