import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupplierProfile, SupplierBooking } from '../../types';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  Mail,
  Printer,
  QrCode,
  Eye,
  X,
} from 'lucide-react';

interface SupplierBookingsProps {
  supplier: SupplierProfile;
}

export const SupplierBookings: React.FC<SupplierBookingsProps> = ({ supplier }) => {
  const {
    supplierBookings,
    updateSupplierBookingStatus,
    formatPrice,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<SupplierBooking | null>(null);
  const [voucherModalBooking, setVoucherModalBooking] = useState<SupplierBooking | null>(null);

  // Filter for this supplier
  const myBookings = supplierBookings.filter((b) => b.supplierId === supplier.id);

  const filteredBookings = myBookings.filter((b) => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 texture-earth">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C89A4B]" />
            <h2 className="text-xl font-cinzel font-bold text-[#D6B06A]">
              Reservations & Booking Vouchers
            </h2>
          </div>
          <p className="text-xs text-[#D3C5AE] mt-1">
            Accept or decline incoming guest reservations, inspect guest dossiers, and issue official Ident Africa confirmation vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[#4B321F] border border-[#C89A4B]/30 rounded text-xs text-[#D6B06A] font-mono font-bold">
            Total Reservations: {myBookings.length}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#2E2015] p-4 rounded-xl border border-[#C89A4B]/30">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Pending Acceptance', 'Confirmed', 'In Progress', 'Completed', 'Declined'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-[#C89A4B] text-[#2E2015]'
                    : 'bg-[#4B321F] text-[#D3C5AE] hover:text-[#D6B06A] hover:bg-[#C89A4B]/20'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#C89A4B] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ref, guest, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2 pl-9 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl space-y-2">
            <FileText className="w-10 h-10 text-[#C89A4B] mx-auto opacity-50" />
            <h4 className="text-base font-serif font-bold text-[#D6B06A]">
              No Reservations Found
            </h4>
            <p className="text-xs text-[#D3C5AE]">
              There are no bookings matching the selected status or search filter.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-5 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C89A4B] bg-[#4B321F] px-2.5 py-1 rounded border border-[#C89A4B]/30">
                    {b.bookingRef}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                      b.status === 'Confirmed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : b.status === 'Pending Acceptance'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500'
                        : b.status === 'Completed'
                        ? 'bg-blue-950 text-blue-300 border border-blue-500'
                        : 'bg-red-950 text-red-300 border border-red-500'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {b.paymentStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#F4E8D5] mt-1">{b.customerName}</h3>
                <p className="text-xs text-[#D3C5AE]">
                  Service: <strong className="text-[#D6B06A]">{b.serviceName}</strong> • Dates:{' '}
                  <span className="font-mono">{b.startDate}</span> to{' '}
                  <span className="font-mono">{b.endDate}</span> ({b.paxCount} Guests)
                </p>
                {b.specialRequirements && (
                  <p className="text-xs text-[#D3C5AE]/80 italic mt-1">
                    Special Request: "{b.specialRequirements}"
                  </p>
                )}
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#C89A4B]/20">
                <div className="text-left md:text-right">
                  <div className="text-lg font-cinzel font-bold text-[#D6B06A]">
                    {formatPrice(b.totalGrossUSD)}
                  </div>
                  <div className="text-[10px] text-[#D3C5AE]">
                    Net Payout: <strong className="text-emerald-400">{formatPrice(b.netPayoutUSD)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {b.status === 'Pending Acceptance' && (
                    <>
                      <button
                        onClick={() => updateSupplierBookingStatus(b.id, 'Confirmed')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded uppercase tracking-wider flex items-center gap-1 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateSupplierBookingStatus(b.id, 'Declined')}
                        className="px-3 py-2 bg-red-950 border border-red-600 text-red-300 hover:bg-red-900 font-bold text-xs rounded uppercase tracking-wider flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-3 py-2 border border-[#C89A4B]/40 bg-[#4B321F] hover:bg-[#C89A4B] hover:text-[#2E2015] text-[#D6B06A] transition-all rounded text-xs font-bold uppercase flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Guest Dossier
                  </button>

                  <button
                    onClick={() => setVoucherModalBooking(b)}
                    className="btn-gold px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Voucher
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Guest Dossier Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2E2015] border-2 border-[#C89A4B] rounded-2xl max-w-lg w-full p-6 text-[#F4E8D5] space-y-6 shadow-2xl relative texture-earth">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 text-[#C89A4B] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#C89A4B]/30 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C89A4B] block">
                Official Guest Dossier & Itinerary
              </span>
              <h3 className="text-xl font-serif font-bold text-[#D6B06A] mt-0.5">
                {selectedBooking.customerName}
              </h3>
              <p className="text-xs text-[#D3C5AE] font-mono">
                Booking Ref: {selectedBooking.bookingRef}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C89A4B]" />
                  <span>{selectedBooking.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C89A4B]" />
                  <span>{selectedBooking.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C89A4B]" />
                  <span>{selectedBooking.paxCount} Confirmed Guests / Party Members</span>
                </div>
              </div>

              <div className="p-3 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg space-y-2">
                <div className="font-bold text-[#D6B06A]">Requested Service:</div>
                <p className="text-sm font-semibold">{selectedBooking.serviceName}</p>
                <div className="text-[#D3C5AE]">
                  Check-In: <span className="font-mono text-[#D6B06A]">{selectedBooking.startDate}</span> | Check-Out: <span className="font-mono text-[#D6B06A]">{selectedBooking.endDate}</span>
                </div>
              </div>

              {selectedBooking.specialRequirements && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg">
                  <div className="font-bold text-amber-300">Dietary & Ranger Notes:</div>
                  <p className="mt-1 text-[#F4E8D5] italic">"{selectedBooking.specialRequirements}"</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C89A4B]/30">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 border border-[#C89A4B]/40 text-[#D3C5AE] rounded text-xs font-bold uppercase"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setVoucherModalBooking(selectedBooking);
                  setSelectedBooking(null);
                }}
                className="btn-gold px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                View Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Voucher Printable Modal */}
      {voucherModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF6EE] text-[#2E2015] rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative my-8 border-4 border-[#C89A4B]">
            <button
              onClick={() => setVoucherModalBooking(null)}
              className="absolute top-4 right-4 p-2 text-[#2E2015] hover:opacity-75"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Voucher Header */}
            <div className="flex items-center justify-between border-b-2 border-[#2E2015] pb-6 mb-6">
              <div>
                <div className="text-2xl font-cinzel font-black tracking-tight text-[#2E2015]">
                  IDENT AFRICA
                </div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C6239]">
                  Official Supplier Service Confirmation Voucher
                </div>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 bg-[#2E2015] text-[#C89A4B] font-mono text-xs font-bold rounded">
                  {voucherModalBooking.voucherCode}
                </div>
                <div className="text-[10px] text-[#5C4033] mt-1">
                  Issued: {voucherModalBooking.createdAt.split('T')[0]}
                </div>
              </div>
            </div>

            {/* Body Info */}
            <div className="grid grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <span className="font-bold text-[#8C6239] uppercase block mb-1">
                  Supplier / Service Provider
                </span>
                <p className="font-serif font-bold text-sm text-[#2E2015]">{supplier.name}</p>
                <p>{supplier.type} Partner • License: {supplier.licenseNumber}</p>
                <p className="text-[#5C4033]">{supplier.region}, {supplier.country}</p>
              </div>

              <div>
                <span className="font-bold text-[#8C6239] uppercase block mb-1">
                  Guest / Party Information
                </span>
                <p className="font-serif font-bold text-sm text-[#2E2015]">
                  {voucherModalBooking.customerName}
                </p>
                <p>Party Size: {voucherModalBooking.paxCount} Guests</p>
                <p className="text-[#5C4033]">Contact: {voucherModalBooking.customerEmail}</p>
              </div>
            </div>

            <div className="p-4 bg-[#F2E8D5] rounded-xl border border-[#C89A4B]/40 space-y-2 mb-6">
              <span className="font-bold text-[#8C6239] uppercase text-[10px] tracking-wider block">
                Confirmed Expedition Service Details
              </span>
              <div className="text-base font-bold text-[#2E2015]">{voucherModalBooking.serviceName}</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>Start / Arrival:</strong> {voucherModalBooking.startDate}
                </div>
                <div>
                  <strong>End / Departure:</strong> {voucherModalBooking.endDate}
                </div>
              </div>
            </div>

            {/* QR Code Simulation & Security Stamp */}
            <div className="flex items-center justify-between p-4 border-2 border-dashed border-[#C89A4B] rounded-xl bg-white mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#2E2015] p-2 flex items-center justify-center rounded">
                  <QrCode className="w-12 h-12 text-[#C89A4B]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2E2015]">
                    Digital Ranger Access Pass
                  </div>
                  <div className="text-[10px] text-[#5C4033] max-w-xs mt-0.5">
                    Scan upon lodge check-in or airstrip greeting for instant verification.
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-emerald-800 text-white text-[10px] font-bold uppercase rounded tracking-widest">
                  ESCRW-SECURED
                </div>
                <div className="text-[10px] font-mono text-[#5C4033] mt-1">
                  Pmt Ref: {voucherModalBooking.bookingRef}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-[#2E2015]/20 pt-4">
              <button
                onClick={() => setVoucherModalBooking(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2E2015] border border-[#2E2015]/30 rounded hover:bg-[#2E2015]/10"
              >
                Close
              </button>
              <button
                onClick={handlePrintVoucher}
                className="px-5 py-2.5 bg-[#2E2015] text-[#C89A4B] font-bold text-xs rounded uppercase tracking-wider flex items-center gap-2 hover:bg-[#4B321F]"
              >
                <Printer className="w-4 h-4" />
                Print / Save Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
