import React from 'react';
import { useApp } from '../../context/AppContext';
import { SupplierProfile } from '../../types';
import {
  DollarSign,
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  BedDouble,
  Car,
  Compass,
  UserCheck,
  Star,
  Edit,
  TrendingUp,
  FileText,
  AlertCircle,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface SupplierDashboardProps {
  supplier: SupplierProfile;
  onNavigateTab: (tab: 'dashboard' | 'availability' | 'pricing' | 'bookings' | 'profile') => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  supplier,
  onNavigateTab,
}) => {
  const {
    supplierBookings,
    formatPrice,
    updateSupplierBookingStatus,
    navigateTo,
  } = useApp();

  // Filter bookings for this supplier
  const myBookings = supplierBookings.filter((b) => b.supplierId === supplier.id);
  const pendingBookings = myBookings.filter((b) => b.status === 'Pending Acceptance');
  const confirmedBookings = myBookings.filter((b) => b.status === 'Confirmed' || b.status === 'In Progress');

  // Calculated Financial Metrics
  const totalGrossRevenue = myBookings
    .filter((b) => b.status !== 'Declined' && b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.totalGrossUSD, 0);

  const totalCommission = myBookings
    .filter((b) => b.status !== 'Declined' && b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.commissionUSD, 0);

  const totalNetPayout = totalGrossRevenue - totalCommission;

  const isPendingApproval = supplier.approvalStatus === 'pending_approval';
  const isRejected = supplier.approvalStatus === 'rejected';

  const getTypeIcon = () => {
    switch (supplier.type) {
      case 'Hotel':
        return <BedDouble className="w-5 h-5 text-[#C89A4B]" />;
      case 'Tour Operator':
        return <Compass className="w-5 h-5 text-[#C89A4B]" />;
      case 'Transport Company':
        return <Car className="w-5 h-5 text-[#C89A4B]" />;
      case 'Guide':
        return <UserCheck className="w-5 h-5 text-[#C89A4B]" />;
      default:
        return <Compass className="w-5 h-5 text-[#C89A4B]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Approval Status Banner */}
      {isPendingApproval && (
        <div className="p-6 bg-[#4B321F]/80 border-2 border-[#C89A4B] rounded-xl text-[#F4E8D5] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#C89A4B]/20 rounded-lg text-[#C89A4B] shrink-0 mt-1 md:mt-0">
              <Clock className="w-7 h-7 animate-pulse text-[#D6B06A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#C89A4B] text-[#2E2015] rounded-full">
                  Pending Warden Approval
                </span>
                <span className="text-xs text-[#D3C5AE]">Application ID: {supplier.id}</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#D6B06A] mt-1">
                Your Listing is Currently Under Review
              </h3>
              <p className="text-xs text-[#D3C5AE] max-w-2xl mt-0.5">
                Ident Africa Head Office is verifying your operating license ({supplier.licenseNumber}) and tax registration. You can fully configure your inventory, pricing rules, and property profile during review.
              </p>
              {supplier.adminNotes && (
                <div className="mt-2 p-2.5 bg-[#2E2015]/80 border border-[#C89A4B]/30 rounded text-xs text-[#D6B06A] italic">
                  <strong>Warden Note:</strong> "{supplier.adminNotes}"
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="btn-gold px-4 py-2 text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Check Documents
          </button>
        </div>
      )}

      {isRejected && (
        <div className="p-6 bg-red-950/80 border-2 border-red-500 rounded-xl text-[#F4E8D5] shadow-xl flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-red-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-serif font-bold text-red-300">
              Application Requires Revision / Rejected
            </h3>
            <p className="text-xs text-red-200 mt-1">
              {supplier.adminNotes || 'Please update your official licensing documentation in the Profile tab and resubmit.'}
            </p>
            <button
              onClick={() => onNavigateTab('profile')}
              className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider"
            >
              Update Credentials
            </button>
          </div>
        </div>
      )}

      {/* Supplier Overview Header Card */}
      <div className="relative rounded-2xl overflow-hidden border border-[#C89A4B]/30 bg-[#2E2015] shadow-2xl texture-earth">
        <div className="h-44 w-full relative">
          <img
            src={supplier.bannerImage}
            alt={supplier.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2015] via-[#2E2015]/60 to-transparent" />
        </div>

        <div className="px-6 pb-6 relative -mt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            <img
              src={supplier.logoOrAvatar}
              alt={supplier.name}
              className="w-24 h-24 rounded-xl object-cover border-2 border-[#C89A4B] shadow-2xl bg-[#4B321F]"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#4B321F] border border-[#C89A4B]/40 text-[#D6B06A] text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5">
                  {getTypeIcon()}
                  {supplier.type} Partner
                </span>
                {supplier.approvalStatus === 'approved' && (
                  <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified Partner
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-cinzel font-black text-[#D6B06A] mt-1">
                {supplier.name}
              </h1>
              <p className="text-xs text-[#D3C5AE] flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#C89A4B]" />
                {supplier.region}, {supplier.country} • License: <span className="font-mono text-[#D6B06A]">{supplier.licenseNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('availability')}
              className="btn-gold flex-1 md:flex-initial py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              Manage Availability
            </button>
            <button
              onClick={() => onNavigateTab('pricing')}
              className="px-4 py-2.5 border border-[#C89A4B]/50 bg-[#4B321F] text-[#D6B06A] hover:bg-[#C89A4B] hover:text-[#2E2015] transition-all rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              Rates & Seasons
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5AE]">
              Expected Net Payout
            </span>
            <div className="p-2 bg-[#4B321F] text-[#C89A4B] rounded-lg border border-[#C89A4B]/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-cinzel font-black text-[#D6B06A] mt-2">
            {formatPrice(totalNetPayout)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#D3C5AE] mt-2 pt-2 border-t border-[#C89A4B]/20">
            <span>Gross: {formatPrice(totalGrossRevenue)}</span>
            <span className="text-xs text-[#C89A4B]">15% Platform Fee</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5AE]">
              Active Bookings
            </span>
            <div className="p-2 bg-[#4B321F] text-[#C89A4B] rounded-lg border border-[#C89A4B]/30">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-cinzel font-black text-[#D6B06A] mt-2">
            {confirmedBookings.length} <span className="text-sm font-sans font-normal text-[#D3C5AE]">Confirmed</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#D3C5AE] mt-2 pt-2 border-t border-[#C89A4B]/20">
            <span className="text-amber-400 font-bold">{pendingBookings.length} Pending Approval</span>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-[#C89A4B] hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5AE]">
              Inventory / Capacity
            </span>
            <div className="p-2 bg-[#4B321F] text-[#C89A4B] rounded-lg border border-[#C89A4B]/30">
              {getTypeIcon()}
            </div>
          </div>
          <div className="text-2xl font-cinzel font-black text-[#D6B06A] mt-2">
            {supplier.type === 'Hotel' && '15 Luxury Suites'}
            {supplier.type === 'Tour Operator' && `${supplier.offeredTours?.length || 2} Tour Packages`}
            {supplier.type === 'Transport Company' && `${supplier.fleet?.reduce((sum, f) => sum + f.availableCount, 0) || 10} Vehicles`}
            {supplier.type === 'Guide' && `${supplier.guideDetails?.kpsgaLevel || 'Gold'} Badge Guide`}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#D3C5AE] mt-2 pt-2 border-t border-[#C89A4B]/20">
            <span>Commission: {supplier.commissionPercentage}%</span>
            <span className="text-emerald-400 font-bold">100% Operational</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5AE]">
              Partner Rating & Trust
            </span>
            <div className="p-2 bg-[#4B321F] text-amber-400 rounded-lg border border-[#C89A4B]/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-cinzel font-black text-[#D6B06A] mt-2 flex items-center gap-2">
            {supplier.rating > 0 ? supplier.rating : '4.95'}{' '}
            <span className="text-xs font-sans text-[#D3C5AE]">({supplier.reviewsCount || 18} reviews)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#D3C5AE] mt-2 pt-2 border-t border-[#C89A4B]/20">
            <span>Response Rate: <strong className="text-emerald-400">98% (&lt;1 hr)</strong></span>
          </div>
        </div>
      </div>

      {/* Pending Booking Requests Action Card */}
      {pendingBookings.length > 0 && (
        <div className="p-6 bg-[#2E2015] border-2 border-amber-500/50 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#C89A4B]/20 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-[#D6B06A]">
                Pending Booking Requests Requiring Action ({pendingBookings.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold uppercase text-[#C89A4B] hover:underline"
            >
              View All Bookings
            </button>
          </div>

          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C89A4B]">{b.bookingRef}</span>
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 text-[10px] font-bold uppercase rounded">
                      {b.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F4E8D5] mt-1">{b.customerName}</h4>
                  <p className="text-xs text-[#D3C5AE] mt-0.5">
                    Service: <strong className="text-[#D6B06A]">{b.serviceName}</strong> • Dates: {b.startDate} to {b.endDate} • {b.paxCount} Guests
                  </p>
                  {b.specialRequirements && (
                    <p className="text-xs text-[#D3C5AE]/80 italic mt-1">
                      "{b.specialRequirements}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                  <div className="text-right pr-2">
                    <div className="text-sm font-bold text-[#D6B06A]">{formatPrice(b.totalGrossUSD)}</div>
                    <div className="text-[10px] text-[#D3C5AE]">Net: {formatPrice(b.netPayoutUSD)}</div>
                  </div>
                  <button
                    onClick={() => updateSupplierBookingStatus(b.id, 'Confirmed')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded uppercase tracking-wider flex items-center gap-1 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => updateSupplierBookingStatus(b.id, 'Declined')}
                    className="px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-600 text-red-300 font-bold text-xs rounded uppercase tracking-wider flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Payout Breakdown Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#C89A4B]/20 pb-3">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C89A4B]" />
              Ident Africa Financial & Escrow Overview
            </h3>
            <span className="text-xs font-mono text-[#D3C5AE]">Settlement Cycle: Bi-Weekly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5AE] block">
                Total Gross Reservations
              </span>
              <span className="text-xl font-cinzel font-bold text-[#F4E8D5] block mt-1">
                {formatPrice(totalGrossRevenue)}
              </span>
            </div>
            <div className="p-4 bg-[#4B321F]/40 border border-[#C89A4B]/20 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5AE] block">
                Ident Africa Commission (15%)
              </span>
              <span className="text-xl font-cinzel font-bold text-amber-400 block mt-1">
                -{formatPrice(totalCommission)}
              </span>
            </div>
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">
                Net Disbursed to Supplier
              </span>
              <span className="text-xl font-cinzel font-bold text-emerald-400 block mt-1">
                {formatPrice(totalNetPayout)}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#D6B06A]">Registered Payout Destination</div>
              <div className="text-xs text-[#D3C5AE] font-mono">
                {supplier.bankName} • Account {supplier.accountNumber} ({supplier.accountName})
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-xs font-bold text-[#C89A4B] hover:underline flex items-center gap-1"
            >
              Edit Payout <Edit className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Shortcut Navigation */}
        <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#D6B06A]">
            Supplier Control Shortcuts
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('availability')}
              className="w-full text-left p-3 bg-[#4B321F]/60 hover:bg-[#C89A4B] hover:text-[#2E2015] transition-all border border-[#C89A4B]/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
                Update Calendar & Blackouts
              </span>
              <ChevronRight className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
            </button>

            <button
              onClick={() => onNavigateTab('pricing')}
              className="w-full text-left p-3 bg-[#4B321F]/60 hover:bg-[#C89A4B] hover:text-[#2E2015] transition-all border border-[#C89A4B]/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
                Add Seasonal Rate Multiplier
              </span>
              <ChevronRight className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
            </button>

            <button
              onClick={() => onNavigateTab('bookings')}
              className="w-full text-left p-3 bg-[#4B321F]/60 hover:bg-[#C89A4B] hover:text-[#2E2015] transition-all border border-[#C89A4B]/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
                Issue Booking Voucher
              </span>
              <ChevronRight className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
            </button>

            <button
              onClick={() => onNavigateTab('profile')}
              className="w-full text-left p-3 bg-[#4B321F]/60 hover:bg-[#C89A4B] hover:text-[#2E2015] transition-all border border-[#C89A4B]/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
                Update Licenses & Insurance
              </span>
              <ChevronRight className="w-4 h-4 text-[#C89A4B] group-hover:text-[#2E2015]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
