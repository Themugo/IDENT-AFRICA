import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupplierDashboard } from './SupplierDashboard';
import { SupplierAvailability } from './SupplierAvailability';
import { SupplierPricing } from './SupplierPricing';
import { SupplierBookings } from './SupplierBookings';
import { SupplierProfileComponent } from './SupplierProfile';
import { SupplierRegisterModal } from './SupplierRegisterModal';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  FileText,
  Building,
  PlusCircle,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';

export const SupplierPortal: React.FC = () => {
  const {
    suppliers,
    activeSupplierId,
    activeSupplier,
    setActiveSupplierId,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'availability' | 'pricing' | 'bookings' | 'profile'>('dashboard');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);

  if (!activeSupplier) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-[#F4E8D5]">
        <h2 className="text-2xl font-cinzel font-bold text-[#D6B06A]">Supplier Not Found</h2>
        <button
          onClick={() => setRegisterModalOpen(true)}
          className="btn-gold px-6 py-2 mt-4 font-bold text-xs uppercase"
        >
          Register New Supplier
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E140C] text-[#F4E8D5] py-8 texture-earth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Partner Switching & Admin Navigation Bar */}
        <div className="p-4 bg-[#2E2015] border border-[#C89A4B]/40 rounded-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-[#C89A4B] text-[#2E2015] flex items-center justify-center font-bold rounded-lg shrink-0">
              <Building className="w-5 h-5" />
            </div>

            {/* Active Supplier Switcher Dropdown */}
            <div className="relative flex-grow md:flex-grow-0">
              <button
                onClick={() => setSupplierDropdownOpen(!supplierDropdownOpen)}
                className="w-full md:w-80 px-3.5 py-2 bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg text-xs font-bold text-[#D6B06A] flex items-center justify-between hover:bg-[#C89A4B]/20 transition-all"
              >
                <div className="text-left truncate">
                  <div className="text-[10px] text-[#D3C5AE] uppercase">Active Supplier Portal</div>
                  <div className="truncate font-serif">{activeSupplier.name} ({activeSupplier.type})</div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#C89A4B] shrink-0 ml-2" />
              </button>

              {supplierDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#2E2015] border-2 border-[#C89A4B] shadow-2xl rounded-xl z-50 py-2 divide-y divide-[#C89A4B]/20">
                  <div className="px-3 py-1.5 text-[10px] text-[#D3C5AE] font-bold uppercase tracking-wider">
                    Switch Partner Perspective
                  </div>
                  {suppliers.map((supp) => (
                    <button
                      key={supp.id}
                      onClick={() => {
                        setActiveSupplierId(supp.id);
                        setSupplierDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#C89A4B] hover:text-[#2E2015] transition-colors flex items-center justify-between text-xs ${
                        supp.id === activeSupplierId ? 'bg-[#4B321F] font-bold text-[#D6B06A]' : 'text-[#F4E8D5]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{supp.name}</div>
                        <div className="text-[10px] text-[#D3C5AE] font-mono">{supp.type} • {supp.region}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded shrink-0 ${
                          supp.approvalStatus === 'approved'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {supp.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="px-3.5 py-2 bg-[#4B321F] hover:bg-[#C89A4B] hover:text-[#2E2015] text-[#D6B06A] border border-[#C89A4B]/40 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Register New Partner
            </button>

            <button
              onClick={() => navigateTo('admin-dashboard')}
              className="px-3.5 py-2 bg-[#4B321F] hover:bg-[#C89A4B] hover:text-[#2E2015] text-[#D6B06A] border border-[#C89A4B]/40 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Review Portal
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-2 border-b-2 border-[#C89A4B]/30 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-[#C89A4B] text-[#D6B06A] bg-[#2E2015]'
                : 'border-transparent text-[#D3C5AE] hover:text-[#D6B06A]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#C89A4B]" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'availability'
                ? 'border-[#C89A4B] text-[#D6B06A] bg-[#2E2015]'
                : 'border-transparent text-[#D3C5AE] hover:text-[#D6B06A]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C89A4B]" />
            Availability & Calendar
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-[#C89A4B] text-[#D6B06A] bg-[#2E2015]'
                : 'border-transparent text-[#D3C5AE] hover:text-[#D6B06A]'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#C89A4B]" />
            Pricing & Seasons
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-[#C89A4B] text-[#D6B06A] bg-[#2E2015]'
                : 'border-transparent text-[#D3C5AE] hover:text-[#D6B06A]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#C89A4B]" />
            Bookings & Vouchers
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#C89A4B] text-[#D6B06A] bg-[#2E2015]'
                : 'border-transparent text-[#D3C5AE] hover:text-[#D6B06A]'
            }`}
          >
            <Building className="w-4 h-4 text-[#C89A4B]" />
            Profile & Credentials
          </button>
        </div>

        {/* Tab View Component Mounting */}
        {activeTab === 'dashboard' && (
          <SupplierDashboard
            supplier={activeSupplier}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'availability' && (
          <SupplierAvailability supplier={activeSupplier} />
        )}

        {activeTab === 'pricing' && (
          <SupplierPricing supplier={activeSupplier} />
        )}

        {activeTab === 'bookings' && (
          <SupplierBookings supplier={activeSupplier} />
        )}

        {activeTab === 'profile' && (
          <SupplierProfileComponent supplier={activeSupplier} />
        )}
      </div>

      {/* Supplier Register Modal */}
      <SupplierRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
};
