import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_BOOKING_ADDONS } from '../../data/mockData';
import { X, Calendar, Users, CheckCircle2, ShieldCheck, DollarSign, Sparkles } from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    bookingModalOpen,
    bookingModalTarget,
    closeBookingModal,
    itineraries,
    destinations,
    hotels,
    addBooking,
    formatPrice,
    navigateTo,
    user,
  } = useApp();

  const [startDate, setStartDate] = useState<string>('2026-09-10');
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['addon-balloon']);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string>('');

  if (!bookingModalOpen || !bookingModalTarget) return null;

  const targetItin = itineraries.find(i => i.id === bookingModalTarget.id);
  const targetDest = destinations.find(d => d.id === bookingModalTarget.id);
  const targetHotel = hotels.find(h => h.id === bookingModalTarget.id);

  const title = targetItin?.title || targetDest?.name || targetHotel?.name || 'East Africa Expedition Stay';
  const heroImage = targetItin?.heroImage || targetDest?.image || targetHotel?.image || '';
  const basePricePerPerson = targetItin?.priceUSD || targetDest?.startingPrice || targetHotel?.pricePerNight || 1200;

  // Addons total
  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const addon = MOCK_BOOKING_ADDONS.find(a => a.id === addonId);
    if (!addon) return acc;
    return acc + (addon.perPerson ? addon.priceUSD * (adults + childrenCount) : addon.priceUSD);
  }, 0);

  const totalPriceUSD = (basePricePerPerson * (adults + childrenCount * 0.7)) + addonsTotal;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(a => a !== addonId) : [...prev, addonId]
    );
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();

    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + (targetItin?.durationDays || 5));
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const newBk = addBooking({
      itineraryId: targetItin?.id,
      destinationId: targetDest?.id,
      title,
      heroImage,
      travelerName: user?.name || 'VIP Traveler',
      travelerEmail: user?.email || 'traveler@safariflow.com',
      startDate,
      endDate: endDateStr,
      guests: { adults, children: childrenCount },
      totalPriceUSD,
      currency: 'USD',
      status: 'Confirmed',
      paymentStatus: 'Paid in Full',
      addonsSelected: selectedAddons,
      specialRequests,
      guideRangerName: 'Senior Ranger Joseph Ole Nkai',
      guideContact: '+254 712 998 341',
    });

    setConfirmedBookingRef(newBk.bookingRef);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/40 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsSuccess(false);
            closeBookingModal();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-[#F5EBE0]/70 hover:text-[#D4AF37] hover:bg-[#1E3A2B]"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono font-bold uppercase border border-[#D4AF37]/30">
                Reserve Expedition
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EBE0]">
                {title}
              </h2>
              <p className="text-xs font-mono text-[#F5EBE0]/70">
                Instant confirmation with VIP ranger dispatch & zero carbon offset.
              </p>
            </div>

            <form onSubmit={handleConfirmReservation} className="space-y-6 text-xs font-mono">
              
              {/* Date & Guests Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30">
                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-2 rounded-lg border border-[#D4AF37]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Adults
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-2 rounded-lg border border-[#D4AF37]/30"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Children
                  </label>
                  <select
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-2 rounded-lg border border-[#D4AF37]/30"
                  >
                    {[0, 1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} Children</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add-ons Selection */}
              <div className="space-y-3">
                <label className="text-[#D4AF37] font-bold uppercase block">
                  Select Add-On Experiences
                </label>
                <div className="space-y-2">
                  {MOCK_BOOKING_ADDONS.map((addon) => {
                    const active = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          active
                            ? 'bg-[#1E3A2B] border-[#D4AF37] text-[#F5EBE0]'
                            : 'bg-[#181E1A] border-[#D4AF37]/20 text-[#F5EBE0]/70 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-xs text-[#D4AF37]">{addon.name}</span>
                          <p className="text-[10px] text-[#F5EBE0]/70 line-clamp-1">{addon.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#D4AF37]">{formatPrice(addon.priceUSD)}</span>
                          {addon.perPerson && <span className="block text-[9px] opacity-70">/ guest</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase">Dietary & Honeymoon Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Vegan meal plan, preferred top-deck tent..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0]"
                />
              </div>

              {/* Total Calculation Bar */}
              <div className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#F5EBE0]/60 block">Calculated Total</span>
                  <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                    {formatPrice(totalPriceUSD)}
                  </span>
                </div>
                <button
                  type="submit"
                  className="btn-gold py-3 px-6 rounded-xl font-bold text-xs shadow-xl"
                >
                  Confirm & Lock Reservation
                </button>
              </div>

            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">
                Reservation Confirmed
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#F5EBE0]">
                Asante Sana! Expedition Booked
              </h2>
              <p className="text-xs font-mono text-[#F5EBE0]/80 max-w-md mx-auto">
                Your reservation reference code is <strong className="text-[#D4AF37]">{confirmedBookingRef}</strong>. Senior Ranger Joseph Ole Nkai has been assigned to your party.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 text-xs font-mono space-y-1 text-left max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-[#F5EBE0]/60">Lead Traveler:</span>
                <span className="font-bold">{user?.name || 'VIP Traveler'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F5EBE0]/60">Total Amount Charged:</span>
                <span className="font-bold text-[#D4AF37]">{formatPrice(totalPriceUSD)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccess(false);
                closeBookingModal();
                navigateTo('user-dashboard');
              }}
              className="btn-gold py-3 px-8 rounded-xl font-bold text-xs"
            >
              Go to My Safari Hub & Download Voucher
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
