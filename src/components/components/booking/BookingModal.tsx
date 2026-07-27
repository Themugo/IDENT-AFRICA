import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_BOOKING_ADDONS } from '../../data/mockData';
import { PaymentGateways } from './PaymentGateways';
import { BookingType, PaymentGateway } from '../../types';
import { X, Calendar, Users, CheckCircle2, Zap, Clock, QrCode } from 'lucide-react';

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
    currency,
  } = useApp();

  const [bookingType, setBookingType] = useState<BookingType>('Instant Booking');
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full');
  const [startDate, setStartDate] = useState<string>('2026-09-10');
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['addon-balloon']);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const totalPriceUSD = Math.round((basePricePerPerson * (adults + childrenCount * 0.7)) + addonsTotal);
  const depositAmountUSD = Math.round(totalPriceUSD * 0.3);
  const chargeAmountUSD = paymentOption === 'deposit' ? depositAmountUSD : totalPriceUSD;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(a => a !== addonId) : [...prev, addonId]
    );
  };

  // Process Instant Booking payment success
  const handleInstantPaymentSuccess = (
    gateway: PaymentGateway,
    transactionRef: string,
    mpesaPhone?: string
  ) => {
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + (targetItin?.durationDays || 5));
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const newBk = addBooking({
      bookingType: 'Instant Booking',
      itineraryId: targetItin?.id,
      destinationId: targetDest?.id,
      hotelId: targetHotel?.id,
      title,
      heroImage,
      travelerName: user?.name || 'VIP Traveler',
      travelerEmail: user?.email || 'traveler@safariflow.com',
      travelerPhone: user?.phone || mpesaPhone || '+254 712 345 678',
      startDate,
      endDate: endDateStr,
      guests: { adults, children: childrenCount },
      totalPriceUSD,
      depositAmountUSD: chargeAmountUSD,
      balanceDueUSD: totalPriceUSD - chargeAmountUSD,
      currency: 'USD',
      status: 'Confirmed',
      paymentStatus: paymentOption === 'deposit' ? 'Deposit Paid (30%)' : 'Paid in Full',
      paymentGateway: gateway,
      paymentReference: transactionRef,
      mpesaPhoneNumber: mpesaPhone,
      addonsSelected: selectedAddons,
      specialRequests,
      guideRangerName: 'Chief Ranger Joseph Ole Nkai',
      guideContact: '+254 712 998 341 (WhatsApp Direct)',
    });

    setCreatedBooking(newBk);
    setIsSuccess(true);
  };

  // Submit Booking Request (No immediate payment required)
  const handleBookingRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + (targetItin?.durationDays || 5));
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const newBk = addBooking({
      bookingType: 'Booking Request',
      itineraryId: targetItin?.id,
      destinationId: targetDest?.id,
      hotelId: targetHotel?.id,
      title,
      heroImage,
      travelerName: user?.name || 'VIP Traveler',
      travelerEmail: user?.email || 'traveler@safariflow.com',
      travelerPhone: user?.phone || '+254 712 345 678',
      startDate,
      endDate: endDateStr,
      guests: { adults, children: childrenCount },
      totalPriceUSD,
      depositAmountUSD: 0,
      balanceDueUSD: totalPriceUSD,
      currency: 'USD',
      status: 'Pending Approval',
      paymentStatus: 'Unpaid',
      addonsSelected: selectedAddons,
      specialRequests,
      guideRangerName: 'Concierge Assigned upon Confirmation',
      guideContact: '+254 20 712 8800',
    });

    setCreatedBooking(newBk);
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
            {/* Modal Header */}
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono font-bold uppercase border border-[#D4AF37]/30">
                Reserve Expedition
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EBE0]">
                {title}
              </h2>
              <p className="text-xs font-mono text-[#F5EBE0]/70">
                Choose Instant Booking or submit an inquiry booking request for lodge verification.
              </p>
            </div>

            {/* Booking Mode Selector */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#181E1A] rounded-2xl border border-[#D4AF37]/30">
              <button
                type="button"
                onClick={() => setBookingType('Instant Booking')}
                className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                  bookingType === 'Instant Booking'
                    ? 'bg-[#C89A4B] text-[#2E2015] shadow-lg font-bold'
                    : 'text-[#F5EBE0]/70 hover:text-[#D4AF37]'
                }`}
              >
                <Zap className="w-4 h-4 text-[#2E2015]" />
                <span>⚡ Instant Booking</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingType('Booking Request')}
                className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                  bookingType === 'Booking Request'
                    ? 'bg-[#C89A4B] text-[#2E2015] shadow-lg font-bold'
                    : 'text-[#F5EBE0]/70 hover:text-[#D4AF37]'
                }`}
              >
                <Clock className="w-4 h-4 text-[#2E2015]" />
                <span>📋 Booking Request</span>
              </button>
            </div>

            {/* Dates & Guest Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 text-xs font-mono">
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
              <label className="text-[#D4AF37] font-bold uppercase block text-xs font-mono">
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
            <div className="space-y-1 font-mono text-xs">
              <label className="text-[#D4AF37] font-bold uppercase block">Special Requests & Dietary Notes</label>
              <input
                type="text"
                placeholder="e.g. Honeymoon setup, Vegan menu, top deck tent..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0]"
              />
            </div>

            {/* INSTANT BOOKING PAYMENT SECTION */}
            {bookingType === 'Instant Booking' ? (
              <div className="space-y-4 pt-2">
                {/* Deposit Option Radio */}
                <div className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 font-mono text-xs space-y-2">
                  <label className="text-[#D4AF37] font-bold uppercase block">Payment Amount Choice</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('full')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentOption === 'full'
                          ? 'bg-[#1E3A2B] border-[#D4AF37] text-[#F5EBE0]'
                          : 'bg-[#12241A] border-[#D4AF37]/20 text-[#F5EBE0]/70'
                      }`}
                    >
                      <span className="font-bold block text-[#D4AF37]">Pay 100% Full Amount</span>
                      <span className="text-sm font-serif font-bold text-[#F5EBE0]">
                        {formatPrice(totalPriceUSD)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentOption('deposit')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentOption === 'deposit'
                          ? 'bg-[#1E3A2B] border-[#D4AF37] text-[#F5EBE0]'
                          : 'bg-[#12241A] border-[#D4AF37]/20 text-[#F5EBE0]/70'
                      }`}
                    >
                      <span className="font-bold block text-[#D4AF37]">Pay 30% Deposit Now</span>
                      <span className="text-sm font-serif font-bold text-[#F5EBE0]">
                        {formatPrice(depositAmountUSD)}
                      </span>
                      <span className="block text-[9px] opacity-75">
                        (Balance {formatPrice(totalPriceUSD - depositAmountUSD)} due 30 days prior)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Gateway Payment Integration */}
                <PaymentGateways
                  amountUSD={chargeAmountUSD}
                  currency={currency}
                  formatPrice={formatPrice}
                  travelerEmail={user?.email || 'traveler@safariflow.com'}
                  travelerPhone={user?.phone || '+254 712 345 678'}
                  travelerName={user?.name || 'VIP Traveler'}
                  onPaymentSuccess={handleInstantPaymentSuccess}
                  onPaymentError={(err) => setPaymentError(err)}
                />
              </div>
            ) : (
              /* BOOKING REQUEST SUBMIT SECTION */
              <div className="p-5 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[#D4AF37] font-bold uppercase block">Booking Request Summary</span>
                  <p className="text-[#F5EBE0]/80">
                    Your request will be sent directly to our lodge management and wildlife dispatch team. You will be notified within 2 hours with lodge clearance and a secure payment link.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#12241A] border border-[#D4AF37]/20">
                  <span className="text-[#F5EBE0]/70">Total Estimated Cost:</span>
                  <span className="text-xl font-serif font-bold text-[#D4AF37]">
                    {formatPrice(totalPriceUSD)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBookingRequestSubmit}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#C89A4B] to-[#D6B06A] text-[#2E2015] font-mono font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all"
                >
                  <Clock className="w-4 h-4" />
                  <span>Submit Inquiry Request ($0 Due Now)</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Confirmation Success Screen */
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 font-mono">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                {createdBooking?.bookingType === 'Instant Booking' ? '⚡ Instant Expedition Confirmed' : '📋 Request Submitted'}
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#F5EBE0]">
                {createdBooking?.bookingType === 'Instant Booking' ? 'Asante Sana! Booking Secured' : 'Inquiry Sent to Lodge Concierge'}
              </h2>
              <p className="text-xs text-[#F5EBE0]/80 max-w-md mx-auto">
                Booking Reference: <strong className="text-[#D4AF37] text-sm">{createdBooking?.bookingRef}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 text-xs space-y-2 text-left max-w-md mx-auto">
              <div className="flex justify-between border-b border-[#D4AF37]/20 pb-2">
                <span className="text-[#F5EBE0]/60">Itinerary / Hotel:</span>
                <span className="font-bold text-[#F5EBE0]">{createdBooking?.title}</span>
              </div>

              <div className="flex justify-between border-b border-[#D4AF37]/20 pb-2">
                <span className="text-[#F5EBE0]/60">Payment Gateway & Ref:</span>
                <span className="font-bold text-[#D4AF37]">
                  {createdBooking?.paymentGateway || 'Hold'} ({createdBooking?.paymentReference || 'Pending Review'})
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#F5EBE0]/60">Amount Paid / Total:</span>
                <span className="font-bold text-[#D4AF37]">
                  {formatPrice(createdBooking?.depositAmountUSD || 0)} / {formatPrice(createdBooking?.totalPriceUSD)}
                </span>
              </div>
            </div>

            {/* QR Voucher Badge */}
            <div className="p-4 rounded-2xl bg-[#12241A] border border-[#D4AF37]/30 flex items-center justify-center gap-4 max-w-md mx-auto">
              {createdBooking?.qrCodeUrl && (
                <img src={createdBooking.qrCodeUrl} alt="Voucher QR Code" className="w-20 h-20 rounded-lg border border-[#D4AF37]/40" />
              )}
              <div className="text-left space-y-1">
                <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Official VIP Voucher Code
                </span>
                <p className="text-[10px] text-[#F5EBE0]/70">
                  Scan at airstrip or park entrance gate for instant priority clearing.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccess(false);
                closeBookingModal();
                navigateTo('user-dashboard');
              }}
              className="w-full py-3.5 px-8 rounded-xl bg-[#C89A4B] text-[#2E2015] font-bold text-xs uppercase tracking-widest shadow-xl"
            >
              Go to My Safari Hub & Manage Bookings
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
