import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Calendar,
  Bookmark,
  Scale,
  FileText,
  LogOut,
  ArrowRight,
  Download,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    user,
    logout,
    bookings,
    destinations,
    itineraries,
    savedDestinationIds,
    savedItineraryIds,
    comparedItineraryIds,
    navigateTo,
    formatPrice,
    toggleSaveDestination,
    toggleSaveItinerary,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'compared' | 'profile'>('bookings');

  const savedDests = destinations.filter(d => savedDestinationIds.includes(d.id));
  const savedItins = itineraries.filter(i => savedItineraryIds.includes(i.id));
  const comparedItins = itineraries.filter(i => comparedItineraryIds.includes(i.id));

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] dark:bg-[#0F1210] text-[#1A1A1A] dark:text-[#F5EBE0] transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* User Banner Header */}
        <div className="p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name || 'Traveler'}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C89A4B] text-[#2E2015]">
                  VIP TRAVELER
                </span>
                <span className="text-xs font-mono text-emerald-400">Verified Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold mt-1">
                {user?.name || 'Traveler Account'}
              </h1>
              <p className="text-xs font-mono text-[#F5EBE0]/70">
                {user?.email} • {user?.phone || '+254 712 345 678'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-mono font-semibold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#E6D5C3] dark:border-[#2A362E] pb-4 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'bookings'
                ? 'bg-[#1E3A2B] text-[#D4AF37] border border-[#D4AF37]/40 shadow-md'
                : 'text-[#665E55] dark:text-[#A8A096] hover:bg-[#1E3A2B]/20'
            }`}
          >
            <Calendar className="w-4 h-4" />
            My Expedition Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'saved'
                ? 'bg-[#1E3A2B] text-[#D4AF37] border border-[#D4AF37]/40 shadow-md'
                : 'text-[#665E55] dark:text-[#A8A096] hover:bg-[#1E3A2B]/20'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Sanctuaries & Trips ({savedDests.length + savedItins.length})
          </button>

          <button
            onClick={() => setActiveTab('compared')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'compared'
                ? 'bg-[#1E3A2B] text-[#D4AF37] border border-[#D4AF37]/40 shadow-md'
                : 'text-[#665E55] dark:text-[#A8A096] hover:bg-[#1E3A2B]/20'
            }`}
          >
            <Scale className="w-4 h-4" />
            Compared Safaris ({comparedItins.length})
          </button>

          <button
            onClick={() => navigateTo('itinerary-builder')}
            className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all bg-[#C89A4B] text-[#2E2015] hover:bg-[#D6B06A]"
          >
            <FileText className="w-4 h-4" />
            Custom Drag & Drop Builder
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-[#1E3A2B] text-[#D4AF37] border border-[#D4AF37]/40 shadow-md'
                : 'text-[#665E55] dark:text-[#A8A096] hover:bg-[#1E3A2B]/20'
            }`}
          >
            <User className="w-4 h-4" />
            Traveler Preferences
          </button>
        </div>

        {/* Tab Content */}

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold">Active & Upcoming Reservations</h2>

            {bookings.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] space-y-3">
                <Calendar className="w-12 h-12 text-[#D4AF37] mx-auto opacity-50" />
                <h3 className="text-xl font-serif font-bold">No Active Bookings Yet</h3>
                <p className="text-xs text-[#665E55] dark:text-[#A8A096]">
                  Explore our luxury safari itineraries and book your dream East African adventure.
                </p>
                <button onClick={() => navigateTo('itineraries')} className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold mt-2">
                  Explore Safaris
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#D4AF37]/30 shadow-xl space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6D5C3] dark:border-[#2A362E]">
                      <div>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="font-bold text-[#D4AF37]">{bk.bookingRef}</span>
                          <span>•</span>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            {bk.status}
                          </span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold mt-1">{bk.title}</h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-[#665E55] dark:text-[#A8A096] block">Total Charged</span>
                        <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                          {formatPrice(bk.totalPriceUSD)}
                        </span>
                        <span className="block text-[10px] text-emerald-400 font-mono">{bk.paymentStatus}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E]">
                        <span className="text-[#665E55] dark:text-[#A8A096] block">Dates & Guests</span>
                        <span className="font-bold text-[#D4AF37] text-sm block mt-1">
                          {bk.startDate} to {bk.endDate}
                        </span>
                        <span className="text-[11px] block mt-0.5">{bk.guests.adults} Adults, {bk.guests.children} Children</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E]">
                        <span className="text-[#665E55] dark:text-[#A8A096] block">Lead Ranger Guide</span>
                        <span className="font-bold text-[#D4AF37] text-sm block mt-1">{bk.guideRangerName || 'Assigned Ranger'}</span>
                        <span className="text-[11px] block mt-0.5">{bk.guideContact || 'Direct WhatsApp Dispatch'}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] flex flex-col justify-between">
                        <span className="text-[#665E55] dark:text-[#A8A096]">Official Travel Voucher</span>
                        <button
                          onClick={() => alert(`Downloading PDF Expedition Voucher for ${bk.bookingRef}...`)}
                          className="btn-gold py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 mt-2"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Voucher PDF
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold">Saved Sanctuaries & Expeditions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDests.map((dest) => (
                <div key={dest.id} className="p-5 rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] space-y-3">
                  <img src={dest.image} alt={dest.name} className="w-full h-36 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{dest.country}</span>
                    <h3 className="text-lg font-serif font-bold">{dest.name}</h3>
                  </div>
                  <button onClick={() => navigateTo('destination-detail', dest.id)} className="w-full btn-forest py-2 rounded-lg text-xs font-semibold">
                    View Sanctuary
                  </button>
                </div>
              ))}

              {savedItins.map((itin) => (
                <div key={itin.id} className="p-5 rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] space-y-3">
                  <img src={itin.heroImage} alt={itin.title} className="w-full h-36 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{itin.luxuryTier}</span>
                    <h3 className="text-lg font-serif font-bold">{itin.title}</h3>
                  </div>
                  <button onClick={() => navigateTo('itinerary-detail', itin.id)} className="w-full btn-gold py-2 rounded-lg text-xs font-bold">
                    View Itinerary
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Compared */}
        {activeTab === 'compared' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Trip Comparison List ({comparedItins.length})</h2>
              <button onClick={() => navigateTo('compare')} className="btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                Open Matrix View <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparedItins.map((itin) => (
                <div key={itin.id} className="p-6 rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] flex gap-4 items-center">
                  <img src={itin.heroImage} alt={itin.title} className="w-28 h-28 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{itin.luxuryTier}</span>
                    <h3 className="text-base font-serif font-bold">{itin.title}</h3>
                    <span className="text-sm font-bold text-[#D4AF37] block">{formatPrice(itin.priceUSD)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Profile Preferences */}
        {activeTab === 'profile' && (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-6 max-w-2xl">
            <h2 className="text-2xl font-serif font-bold">Traveler Information & Preferences</h2>
            
            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase">Full Name</label>
                <input type="text" defaultValue={user?.name} className="w-full bg-[#FAF7F2] dark:bg-[#12241A] p-3 rounded-xl border border-[#E6D5C3] dark:border-[#2A362E]" />
              </div>

              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase">Email Address</label>
                <input type="email" defaultValue={user?.email} className="w-full bg-[#FAF7F2] dark:bg-[#12241A] p-3 rounded-xl border border-[#E6D5C3] dark:border-[#2A362E]" />
              </div>

              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase">Dietary Requirements</label>
                <input type="text" defaultValue={user?.dietaryPreferences} className="w-full bg-[#FAF7F2] dark:bg-[#12241A] p-3 rounded-xl border border-[#E6D5C3] dark:border-[#2A362E]" />
              </div>

              <button className="btn-gold py-3 px-6 rounded-xl font-bold text-xs mt-4">
                Save Traveler Preferences
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
