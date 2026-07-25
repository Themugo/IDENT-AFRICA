import React, { useState } from 'react';
import { Booking, RefundWorkflow } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, RefreshCw, AlertCircle, ShieldAlert, CheckCircle2, DollarSign } from 'lucide-react';

interface RefundRequestModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const RefundRequestModal: React.FC<RefundRequestModalProps> = ({ booking, isOpen, onClose }) => {
  const { submitRefundRequest, formatPrice } = useApp();

  const [reason, setReason] = useState<RefundWorkflow['reason']>('Schedule Change');
  const [reasonDetails, setReasonDetails] = useState('');
  const [payoutAccount, setPayoutAccount] = useState(booking.mpesaPhoneNumber || booking.travelerEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate refund percentage policy based on trip date
  const now = new Date();
  const tripDate = new Date(booking.startDate);
  const diffDays = Math.ceil((tripDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

  let refundEligiblePercent = 100;
  if (diffDays < 14) {
    refundEligiblePercent = 50;
  } else if (diffDays < 30) {
    refundEligiblePercent = 75;
  }

  const requestedAmountUSD = Math.round((booking.totalPriceUSD * refundEligiblePercent) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonDetails.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitRefundRequest(booking.id, reason, reasonDetails, requestedAmountUSD, payoutAccount);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 p-6 sm:p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/40 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#F5EBE0]/70 hover:text-[#D4AF37] hover:bg-[#1E3A2B]"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#3B1212] text-[#FF8888] text-xs font-mono font-bold uppercase border border-[#FF8888]/30">
                Cancellation & Refund Portal
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#F5EBE0]">
                Request Refund for {booking.bookingRef}
              </h3>
              <p className="text-xs font-mono text-[#F5EBE0]/70">
                {booking.title} ({booking.startDate} to {booking.endDate})
              </p>
            </div>

            {/* Refund Policy Calculation Box */}
            <div className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[#D4AF37] font-bold uppercase">
                <span>Refund Guarantee Policy</span>
                <span>{diffDays} Days Prior</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-y border-[#D4AF37]/20">
                <span className="text-[#F5EBE0]/80">Original Gross Booking:</span>
                <span className="font-bold text-[#F5EBE0]">{formatPrice(booking.totalPriceUSD)}</span>
              </div>

              <div className="flex items-center justify-between text-[#4ADE80]">
                <span>Eligible Refund Rate ({refundEligiblePercent}%):</span>
                <span className="font-bold text-sm">{formatPrice(requestedAmountUSD)}</span>
              </div>

              <p className="text-[10px] text-[#F5EBE0]/60 pt-1">
                *Cancellations &gt;30 days prior qualify for 100% refund. 14-30 days qualify for 75%. Under 14 days subject to 50% lodge hold fee.
              </p>
            </div>

            {/* Refund Request Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase block">Cancellation Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full bg-[#181E1A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30"
                >
                  <option value="Schedule Change">Flight / Schedule Reschedule</option>
                  <option value="Medical Emergency">Medical / Personal Emergency</option>
                  <option value="Weather & Geopolitical">Weather or Travel Advisory</option>
                  <option value="Service Issue">Lodge / Itinerary Change Request</option>
                  <option value="Other">Other Personal Reason</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase block">Detailed Explanation</label>
                <textarea
                  rows={3}
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  placeholder="Please describe why you need to request this cancellation..."
                  required
                  className="w-full bg-[#181E1A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase block">Disbursement Account (M-Pesa or Email)</label>
                <input
                  type="text"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  placeholder="e.g. +254 712 345 678 or traveler@safariflow.com"
                  required
                  className="w-full bg-[#181E1A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-red-800 hover:bg-red-700 text-[#F5EBE0] font-mono font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#F5EBE0]" />
                      <span>Submitting Refund Ticket...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Submit Cancellation Ticket ({formatPrice(requestedAmountUSD)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1E3A2B] border border-[#4ADE80] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#4ADE80]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#F5EBE0]">
              Refund Claim Submitted
            </h3>
            <p className="text-xs font-mono text-[#F5EBE0]/80 max-w-sm mx-auto">
              Your refund request for <span className="text-[#D4AF37] font-bold">{booking.bookingRef}</span> ({formatPrice(requestedAmountUSD)}) is under priority review by SafariFlow Audit Team.
            </p>
            <div className="p-4 rounded-xl bg-[#181E1A] border border-[#D4AF37]/30 text-left font-mono text-xs space-y-1">
              <p className="text-[#D4AF37] font-bold">Claim Details:</p>
              <p>Reason: {reason}</p>
              <p>Refund Target: {payoutAccount}</p>
              <p>Estimated Disbursement: 24-48 Hours</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#C89A4B] text-[#2E2015] font-mono font-bold text-xs uppercase tracking-widest"
            >
              Back to My Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
