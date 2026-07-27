import React from 'react';
import { useApp } from '../../context/AppContext';
import { Scale, CheckCircle2, ArrowRight, Trash2, Plus } from 'lucide-react';

export const TripComparator: React.FC = () => {
  const {
    itineraries,
    comparedItineraryIds,
    toggleCompareItinerary,
    clearComparisons,
    navigateTo,
    formatPrice,
    openBookingModal,
  } = useApp();

  const comparedList = itineraries.filter(i => comparedItineraryIds.includes(i.id));

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] dark:bg-[#0F1210] text-[#1A1A1A] dark:text-[#F5EBE0] transition-colors">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E6D5C3] dark:border-[#2A362E] pb-8 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono font-bold uppercase border border-[#D4AF37]/30">
              <Scale className="w-3.5 h-3.5" /> Side-By-Side Expedition Matrix
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
              Compare Safari Expeditions
            </h1>
            <p className="text-sm text-[#665E55] dark:text-[#A8A096] max-w-2xl">
              Compare up to 3 luxury safari itineraries on key criteria: pricing, park inclusions, game drive frequency, transfer types, and cancellation terms.
            </p>
          </div>

          {comparedList.length > 0 && (
            <button
              onClick={clearComparisons}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-xs font-mono font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Comparisons ({comparedList.length})
            </button>
          )}
        </div>

        {/* Empty state if fewer than 1 item */}
        {comparedList.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#181E1A] rounded-3xl border border-[#E6D5C3] dark:border-[#D4AF37]/30 p-8 space-y-6 shadow-xl max-w-2xl mx-auto">
            <Scale className="w-16 h-16 text-[#D4AF37] mx-auto opacity-60" />
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold">No Expeditions Selected for Comparison</h3>
              <p className="text-xs sm:text-sm text-[#665E55] dark:text-[#A8A096]">
                Browse our flagship luxury safari itineraries and click the "Compare" button on any itinerary card to add it to this matrix.
              </p>
            </div>
            <button
              onClick={() => navigateTo('itineraries')}
              className="px-6 py-3 rounded-xl btn-gold text-xs font-bold inline-flex items-center gap-2"
            >
              Browse Safaris to Compare
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Comparison Table */
          <div className="overflow-x-auto">
            <div className="min-w-[800px] bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#D4AF37]/30 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Header Cards Row */}
              <div className="grid grid-cols-4 gap-6 pb-6 border-b border-[#E6D5C3] dark:border-[#2A362E]">
                
                {/* Col 0: Criteria Label */}
                <div className="flex flex-col justify-end space-y-2">
                  <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Comparison Criteria</span>
                  <span className="text-xl font-serif font-bold">Expedition Overview</span>
                </div>

                {/* Compared Itineraries */}
                {comparedList.map((item) => (
                  <div key={item.id} className="relative bg-[#FAF7F2] dark:bg-[#12241A] p-4 rounded-2xl border border-[#E6D5C3] dark:border-[#D4AF37]/30 space-y-3">
                    <button
                      onClick={() => toggleCompareItinerary(item.id)}
                      className="absolute top-3 right-3 p-1 rounded-full text-rose-500 hover:bg-rose-500/20"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <img src={item.heroImage} alt={item.title} className="w-full h-28 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    
                    <div>
                      <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">{item.luxuryTier}</span>
                      <h4 className="text-base font-serif font-bold line-clamp-1">{item.title}</h4>
                      <p className="text-xs font-serif font-bold text-[#D4AF37] mt-1">{formatPrice(item.priceUSD)}</p>
                    </div>

                    <button
                      onClick={() => openBookingModal('itinerary', item.id)}
                      className="w-full btn-gold py-2 rounded-lg text-xs font-bold"
                    >
                      Book Expedition
                    </button>
                  </div>
                ))}

                {/* Fill empty slots up to 3 */}
                {comparedList.length < 3 && (
                  <div
                    onClick={() => navigateTo('itineraries')}
                    className="border-2 border-dashed border-[#D4AF37]/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#D4AF37] transition-all text-[#665E55] dark:text-[#A8A096] hover:text-[#D4AF37]"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-xs font-mono font-bold uppercase">Add Another Safari</span>
                    <span className="text-[11px] opacity-70">Compare up to 3</span>
                  </div>
                )}

              </div>

              {/* Rows */}

              {/* Row 1: Duration */}
              <div className="grid grid-cols-4 gap-6 py-4 border-b border-[#E6D5C3] dark:border-[#2A362E] text-xs">
                <span className="font-mono font-bold text-[#D4AF37] uppercase">Duration</span>
                {comparedList.map((item) => (
                  <span key={item.id} className="font-semibold">
                    {item.durationDays} Days / {item.durationNights} Nights
                  </span>
                ))}
              </div>

              {/* Row 2: Countries */}
              <div className="grid grid-cols-4 gap-6 py-4 border-b border-[#E6D5C3] dark:border-[#2A362E] text-xs">
                <span className="font-mono font-bold text-[#D4AF37] uppercase">Countries Visited</span>
                {comparedList.map((item) => (
                  <span key={item.id} className="font-semibold">
                    {item.countries.join(', ')}
                  </span>
                ))}
              </div>

              {/* Row 3: Parks Visited */}
              <div className="grid grid-cols-4 gap-6 py-4 border-b border-[#E6D5C3] dark:border-[#2A362E] text-xs">
                <span className="font-mono font-bold text-[#D4AF37] uppercase">Destinations Included</span>
                {comparedList.map((item) => (
                  <div key={item.id} className="space-y-1">
                    {item.destinations.map((d, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Row 4: Transfer Type */}
              <div className="grid grid-cols-4 gap-6 py-4 border-b border-[#E6D5C3] dark:border-[#2A362E] text-xs">
                <span className="font-mono font-bold text-[#D4AF37] uppercase">Travel Transfers</span>
                {comparedList.map((item) => (
                  <span key={item.id} className="font-semibold text-emerald-500 font-mono">
                    {item.transferType}
                  </span>
                ))}
              </div>

              {/* Row 5: Game Drives per Day */}
              <div className="grid grid-cols-4 gap-6 py-4 border-b border-[#E6D5C3] dark:border-[#2A362E] text-xs">
                <span className="font-mono font-bold text-[#D4AF37] uppercase">Game Drives / Day</span>
                {comparedList.map((item) => (
                  <span key={item.id} className="font-semibold">
                    {item.gameDrivesPerDay} Unlimited Private 4x4 Drives
                  </span>
                ))}
              </div>

              {/* Row 6: Migration Matching */}
              <div className="grid grid-cols-4 gap-6 py-4 border-b border-[#E6D5C3] dark:border-[#2A362E] text-xs">
                <span className="font-mono font-bold text-[#D4AF37] uppercase">Migration Peak Access</span>
                {comparedList.map((item) => (
                  <div key={item.id}>
                    {item.migrationSeasonMatch ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                        ★ Prime River Crossing Access
                      </span>
                    ) : (
                      <span className="text-[#665E55] dark:text-[#A8A096] font-mono">
                        Standard Savanna Safari
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Row 7: Cancellation Terms */}
              <div className="grid grid-cols-4 gap-6 py-4 text-xs">
                <span className="font-mono font-bold text-[#D4AF37] uppercase">Cancellation Terms</span>
                {comparedList.map((item) => (
                  <span key={item.id} className="text-[#665E55] dark:text-[#A8A096]">
                    {item.cancellationPolicy}
                  </span>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
