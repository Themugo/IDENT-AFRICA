import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, PaymentGateway } from '../../types';
import { RefundRequestModal } from './RefundRequestModal';
import { PaymentGateways } from './PaymentGateways';
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  Smartphone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  QrCode,
  Download,
  Sparkles,
  RefreshCw,
  X,
  Zap,
  ArrowRight
} from 'lucide-react';

export const BookingHistoryView: React.FC = () => {
  const {
    bookings,
    formatPrice,
    completeBalancePayment,
    user,
    currency,
    navigateTo
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Instant' | 'Requests' | 'Refunds'>('All');
  
  // Modals state
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<Booking | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.travelerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'Instant') return b.bookingType === 'Instant Booking';
    if (filterType === 'Requests') return b.bookingType === 'Booking Request';
    if (filterType === 'Refunds') return b.status === 'Refund Requested' || b.status === 'Refunded';

    return true;
  });

  // Complete remaining balance payment
  const handleBalancePaymentSuccess = (gateway: PaymentGateway, transactionRef: string) => {
    if (selectedBookingForPayment) {
      completeBalancePayment(selectedBookingForPayment.id, gateway, transactionRef);
      setSelectedBookingForPayment(null);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D4AF37]/20 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono font-bold uppercase border border-[#D4AF37]/30">
                Expedition Booking Engine
              </span>
              <span className="text-xs font-mono text-[#F5EBE0]/60">• Live Ledger</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5EBE0]">
              My Safari Bookings & Payments
            </h1>
            <p className="text-sm font-mono text-[#F5EBE0]/70 mt-1">
              Manage instant reservations, inquiry status, gateway payment receipts, and refund claims.
            </p>
          </div>

          <button
            onClick={() => navigateTo('destinations')}
            className="btn-gold py-3 px-6 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-[#2E2015]" />
            <span>Explore New Safari</span>
          </button>
        </div>

        {/* Stats Dashboard Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#12241A] border border-[#D4AF37]/30 space-y-1 font-mono">
            <span className="text-[10px] text-[#F5EBE0]/60 uppercase">Total Expeditions</span>
            <div className="text-2xl font-serif font-bold text-[#D4AF37]">{bookings.length}</div>
            <span className="text-[10px] text-[#4ADE80]">Active Ledger</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#12241A] border border-[#D4AF37]/30 space-y-1 font-mono">
            <span className="text-[10px] text-[#F5EBE0]/60 uppercase">Confirmed Instant</span>
            <div className="text-2xl font-serif font-bold text-[#F5EBE0]">
              {bookings.filter(b => b.status === 'Confirmed').length}
            </div>
            <span className="text-[10px] text-[#D4AF37]">Rangers Assigned</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#12241A] border border-[#D4AF37]/30 space-y-1 font-mono">
            <span className="text-[10px] text-[#F5EBE0]/60 uppercase">Total Portfolio Value</span>
            <div className="text-2xl font-serif font-bold text-[#D4AF37]">
              {formatPrice(bookings.reduce((sum, b) => sum + b.totalPriceUSD, 0))}
            </div>
            <span className="text-[10px] text-[#F5EBE0]/60">USD Equivalent</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#12241A] border border-[#D4AF37]/30 space-y-1 font-mono">
            <span className="text-[10px] text-[#F5EBE0]/60 uppercase">Refund Claims</span>
            <div className="text-2xl font-serif font-bold text-amber-400">
              {bookings.filter(b => b.status === 'Refund Requested' || b.status === 'Refunded').length}
            </div>
            <span className="text-[10px] text-amber-400/80">Audit Tracking</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#12241A] p-4 rounded-2xl border border-[#D4AF37]/20">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reference, title or traveler..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181E1A] text-[#F5EBE0] pl-9 pr-4 py-2 rounded-xl border border-[#D4AF37]/30 font-mono text-xs"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
            {(['All', 'Instant', 'Requests', 'Refunds'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`py-2 px-4 rounded-xl border whitespace-nowrap transition-all ${
                  filterType === tab
                    ? 'bg-[#C89A4B] text-[#2E2015] font-bold border-[#D4AF37]'
                    : 'bg-[#181E1A] text-[#F5EBE0]/70 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                }`}
              >
                {tab === 'All' && 'All Bookings'}
                {tab === 'Instant' && '⚡ Instant Bookings'}
                {tab === 'Requests' && '📋 Inquiry Requests'}
                {tab === 'Refunds' && '🛡️ Refunds & Claims'}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#12241A] border border-[#D4AF37]/20 font-mono space-y-3">
              <FileText className="w-10 h-10 text-[#D4AF37] mx-auto opacity-60" />
              <h3 className="text-xl font-serif text-[#F5EBE0]">No Matching Reservations Found</h3>
              <p className="text-xs text-[#F5EBE0]/60 max-w-sm mx-auto">
                No bookings match your current search criteria or filter.
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const isInstant = booking.bookingType === 'Instant Booking';
              const isBalanceDue = (booking.balanceDueUSD || 0) > 0;
              const isRefundActive = booking.status === 'Refund Requested' || booking.status === 'Refunded';

              return (
                <div
                  key={booking.id}
                  className="p-6 rounded-3xl bg-[#12241A] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all space-y-6"
                >
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/20 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#D4AF37]">
                        {booking.bookingRef}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        isInstant
                          ? 'bg-[#1E3A2B] text-[#4ADE80] border-[#4ADE80]/30'
                          : 'bg-[#2A2418] text-[#D4AF37] border-[#D4AF37]/30'
                      }`}>
                        {booking.bookingType || 'Instant Booking'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        booking.status === 'Confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                          : booking.status === 'Refund Requested'
                          ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                          : booking.status === 'Refunded'
                          ? 'bg-red-950 text-red-400 border-red-500/30'
                          : 'bg-[#181E1A] text-[#F5EBE0]/80 border-[#D4AF37]/20'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-[#F5EBE0]/60">Booked: {booking.createdAt}</span>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    {/* Hero Image & Title */}
                    <div className="md:col-span-2 flex gap-4 items-center">
                      <img
                        src={booking.heroImage}
                        alt={booking.title}
                        className="w-24 h-20 object-cover rounded-2xl border border-[#D4AF37]/30 shrink-0"
                      />
                      <div className="space-y-1">
                        <h3 className="text-lg font-serif font-bold text-[#F5EBE0] line-clamp-1">
                          {booking.title}
                        </h3>
                        <div className="flex items-center gap-3 font-mono text-xs text-[#F5EBE0]/70">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {booking.startDate} → {booking.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {booking.guests.adults} Adults, {booking.guests.children} Children
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="font-mono text-xs space-y-1 p-3 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/20">
                      <div className="flex justify-between">
                        <span className="text-[#F5EBE0]/60">Total Cost:</span>
                        <span className="font-bold text-[#D4AF37]">{formatPrice(booking.totalPriceUSD)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#F5EBE0]/60">Payment Gateway:</span>
                        <span className="font-bold text-[#F5EBE0]">{booking.paymentGateway || 'Stripe'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#F5EBE0]/60">Status:</span>
                        <span className="font-bold text-emerald-400">{booking.paymentStatus}</span>
                      </div>
                      {isBalanceDue && (
                        <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-[#D4AF37]/20">
                          <span>Balance Due:</span>
                          <span>{formatPrice(booking.balanceDueUSD || 0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 font-mono text-xs">
                      {/* View Voucher & QR */}
                      <button
                        onClick={() => setSelectedBookingForVoucher(booking)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#1E3A2B] text-[#D4AF37] hover:bg-[#2A4D3B] border border-[#D4AF37]/30 flex items-center justify-center gap-2 font-bold transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>VIP Voucher & QR</span>
                      </button>

                      {/* Pay Balance if due */}
                      {isBalanceDue && (
                        <button
                          onClick={() => setSelectedBookingForPayment(booking)}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#C89A4B] text-[#2E2015] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Balance ({formatPrice(booking.balanceDueUSD || 0)})</span>
                        </button>
                      )}

                      {/* Request Refund */}
                      {!isRefundActive && booking.status !== 'Cancelled' && (
                        <button
                          onClick={() => setSelectedBookingForRefund(booking)}
                          className="w-full py-2 px-3 rounded-xl bg-red-950/40 text-red-300 hover:bg-red-900/50 border border-red-500/30 text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Request Cancellation</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Refund Status Banner if applicable */}
                  {booking.refundWorkflow && (
                    <div className="p-4 rounded-2xl bg-[#181E1A] border border-amber-500/30 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Refund Ticket #{booking.refundWorkflow.id}
                        </span>
                        <span className="uppercase px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40">
                          {booking.refundWorkflow.status}
                        </span>
                      </div>
                      <p className="text-[#F5EBE0]/80">
                        Reason: {booking.refundWorkflow.reason} - {booking.refundWorkflow.reasonDetails}
                      </p>
                      <div className="flex justify-between text-[11px] text-[#F5EBE0]/60 pt-1 border-t border-[#D4AF37]/10">
                        <span>Claim Amount: {formatPrice(booking.refundWorkflow.requestedAmountUSD)}</span>
                        <span>Payout Target: {booking.refundWorkflow.payoutAccount}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* REFUND MODAL */}
        {selectedBookingForRefund && (
          <RefundRequestModal
            booking={selectedBookingForRefund}
            isOpen={!!selectedBookingForRefund}
            onClose={() => setSelectedBookingForRefund(null)}
          />
        )}

        {/* BALANCE PAYMENT MODAL */}
        {selectedBookingForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="relative w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/40 shadow-2xl space-y-6">
              <button
                onClick={() => setSelectedBookingForPayment(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-[#F5EBE0]/70 hover:text-[#D4AF37]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 font-mono">
                <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-bold uppercase border border-[#D4AF37]/30">
                  Complete Expedition Balance
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EBE0]">
                  {selectedBookingForPayment.bookingRef}: {selectedBookingForPayment.title}
                </h3>
                <p className="text-xs text-[#F5EBE0]/70">
                  Remaining Balance: <span className="text-[#D4AF37] font-bold">{formatPrice(selectedBookingForPayment.balanceDueUSD || 0)}</span>
                </p>
              </div>

              <PaymentGateways
                amountUSD={selectedBookingForPayment.balanceDueUSD || 0}
                currency={currency}
                formatPrice={formatPrice}
                travelerEmail={user?.email || selectedBookingForPayment.travelerEmail}
                travelerPhone={selectedBookingForPayment.travelerPhone || '+254 712 345 678'}
                travelerName={selectedBookingForPayment.travelerName}
                onPaymentSuccess={handleBalancePaymentSuccess}
                onPaymentError={() => {}}
              />
            </div>
          </div>
        )}

        {/* VIP VOUCHER & QR MODAL */}
        {selectedBookingForVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg my-8 p-6 sm:p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/40 shadow-2xl space-y-6 text-center font-mono">
              <button
                onClick={() => setSelectedBookingForVoucher(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-[#F5EBE0]/70 hover:text-[#D4AF37]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-bold uppercase border border-[#D4AF37]/30">
                  Official VIP Safari Clearance
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F5EBE0] pt-2">
                  {selectedBookingForVoucher.bookingRef}
                </h3>
                <p className="text-xs text-[#F5EBE0]/70">{selectedBookingForVoucher.title}</p>
              </div>

              <div className="p-6 rounded-2xl bg-white text-black max-w-xs mx-auto space-y-3 shadow-2xl">
                <img
                  src={selectedBookingForVoucher.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedBookingForVoucher.bookingRef}`}
                  alt="QR Code"
                  className="w-44 h-44 mx-auto rounded-lg"
                />
                <span className="block font-bold text-sm tracking-widest">{selectedBookingForVoucher.bookingRef}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 text-xs text-left space-y-1">
                <p className="text-[#D4AF37] font-bold">Ranger & Flight Dispatch:</p>
                <p>Lead Ranger: {selectedBookingForVoucher.guideRangerName || 'Senior Ranger Joseph Ole Nkai'}</p>
                <p>Ranger Hotline: {selectedBookingForVoucher.guideContact || '+254 712 998 341'}</p>
                <p>Traveler: {selectedBookingForVoucher.travelerName}</p>
                <p>Dates: {selectedBookingForVoucher.startDate} to {selectedBookingForVoucher.endDate}</p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-3 px-6 rounded-xl bg-[#C89A4B] text-[#2E2015] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print VIP Pass Voucher</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
