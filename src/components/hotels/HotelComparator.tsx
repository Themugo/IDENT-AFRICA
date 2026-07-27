import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  X,
  Check,
  Star,
  MapPin,
  Sparkles,
  ArrowLeft,
  BedDouble,
} from 'lucide-react';

export const HotelComparator: React.FC = () => {
  const {
    hotels,
    comparedHotelIds,
    toggleCompareHotel,
    clearHotelComparisons,
    formatPrice,
    navigateTo,
    openBookingModal,
  } = useApp();

  const comparedHotels = hotels.filter(h => comparedHotelIds.includes(h.id));

  const AMENITIES_TO_COMPARE = [
    'Private Heliport',
    'Infinity Bush Pool',
    '24/7 Dedicated Butler Service',
    'Bush Spa & Hydrotherapy',
    'Fine Wine Cellar',
    '100% Solar Off-Grid Power',
    'Equestrian Center & Horseback Safaris',
    'Gorilla Trekking Concierge Desk',
  ];

  if (comparedHotels.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 bg-[#181E1A] p-8 sm:p-10 rounded-3xl border border-[#D4AF37]/30 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#12241A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">Lodge Comparison Matrix</h2>
            <p className="text-xs font-mono text-[#F5EBE0]/70">
              You haven't selected any sanctuary lodges or tented camps for comparison yet.
            </p>
          </div>
          <button
            onClick={() => navigateTo('hotels')}
            className="btn-gold px-6 py-3 rounded-xl font-bold font-mono text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Sanctuary Lodges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A362E] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigateTo('hotels')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D4AF37] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sanctuary Lodges
              </button>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5EBE0]">
              Sanctuary Lodges Comparison Matrix
            </h1>
            <p className="text-xs font-mono text-[#F5EBE0]/70 mt-1">
              Comparing {comparedHotels.length} luxury lodges & tented camps side-by-side.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearHotelComparisons}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs hover:bg-rose-500/20 transition-colors"
            >
              Clear Comparison List
            </button>
            <button
              onClick={() => navigateTo('hotels')}
              className="btn-gold px-4 py-2 rounded-xl font-mono text-xs font-bold"
            >
              + Add More Lodges
            </button>
          </div>
        </div>

        {/* Comparison Table Grid */}
        <div className="overflow-x-auto rounded-3xl border border-[#D4AF37]/30 bg-[#181E1A] shadow-2xl">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[700px]">
            
            {/* Header Row: Images & Titles */}
            <thead>
              <tr className="bg-[#12241A] border-b border-[#2A362E]">
                <th className="p-6 w-56 text-[#D4AF37] uppercase text-[10px] tracking-widest align-top">
                  Sanctuary Lodge Specs
                </th>
                {comparedHotels.map(h => (
                  <th key={h.id} className="p-6 min-w-[260px] align-top border-l border-[#2A362E] space-y-3">
                    <div className="relative h-40 rounded-2xl overflow-hidden group">
                      <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        onClick={() => toggleCompareHotel(h.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-gray-300 hover:text-white"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">{h.country}</span>
                      <h3 className="text-base font-serif font-bold text-[#F5EBE0] leading-snug">{h.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-[#F5EBE0]/70">
                        <MapPin className="w-3 h-3 text-[#D4AF37]" />
                        <span className="truncate">{h.location}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigateTo('hotel-detail', h.id)}
                      className="w-full py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#D4AF37] hover:text-[#0F1210] text-[#D4AF37] font-bold text-xs transition-colors"
                    >
                      View Lodge Details
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2A362E]">
              
              {/* Category & Tier */}
              <tr>
                <td className="p-4 font-bold text-[#D4AF37] uppercase text-[10px]">Lodge Category</td>
                {comparedHotels.map(h => (
                  <td key={h.id} className="p-4 border-l border-[#2A362E] font-bold text-[#F5EBE0]">
                    {h.category}
                  </td>
                ))}
              </tr>

              {/* Luxury Tier */}
              <tr>
                <td className="p-4 font-bold text-[#D4AF37] uppercase text-[10px]">Luxury Tier</td>
                {comparedHotels.map(h => (
                  <td key={h.id} className="p-4 border-l border-[#2A362E] text-[#F5EBE0]">
                    <span className="px-2.5 py-1 rounded-full bg-[#12241A] border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold">
                      {h.tier}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Base Nightly Rate */}
              <tr>
                <td className="p-4 font-bold text-[#D4AF37] uppercase text-[10px]">Starting Base Rate</td>
                {comparedHotels.map(h => (
                  <td key={h.id} className="p-4 border-l border-[#2A362E]">
                    <span className="text-lg font-serif font-bold text-[#D4AF37]">{formatPrice(h.pricePerNight)}</span>
                    <span className="text-[10px] text-[#F5EBE0]/60 block">/ night</span>
                  </td>
                ))}
              </tr>

              {/* Eco Score & Ratings */}
              <tr>
                <td className="p-4 font-bold text-[#D4AF37] uppercase text-[10px]">Eco Score & Ratings</td>
                {comparedHotels.map(h => (
                  <td key={h.id} className="p-4 border-l border-[#2A362E] space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{h.rating}</span>
                      <span className="text-[#F5EBE0]/60 text-[10px]">({h.reviewsCount} reviews)</span>
                    </div>
                    <div className="text-emerald-400 font-bold text-[10px]">
                      Eco Score: {h.ecoScore}/10
                    </div>
                  </td>
                ))}
              </tr>

              {/* Room Types Count */}
              <tr>
                <td className="p-4 font-bold text-[#D4AF37] uppercase text-[10px]">Suites & Room Types</td>
                {comparedHotels.map(h => (
                  <td key={h.id} className="p-4 border-l border-[#2A362E]">
                    <div className="flex items-center gap-1.5 text-[#F5EBE0]">
                      <BedDouble className="w-4 h-4 text-[#D4AF37]" />
                      <span>{h.roomTypes.length} Available Room Types</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-[10px] text-[#F5EBE0]/70">
                      {h.roomTypes.map(rt => (
                        <li key={rt.id}>• {rt.name} ({formatPrice(rt.pricePerNight)})</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Check-In / Check-Out */}
              <tr>
                <td className="p-4 font-bold text-[#D4AF37] uppercase text-[10px]">Check-In / Out</td>
                {comparedHotels.map(h => (
                  <td key={h.id} className="p-4 border-l border-[#2A362E] text-[#F5EBE0]/80">
                    In: {h.checkInTime || '12:00 PM'} • Out: {h.checkOutTime || '10:00 AM'}
                  </td>
                ))}
              </tr>

              {/* Amenities Section Divider Header */}
              <tr className="bg-[#12241A]">
                <td colSpan={comparedHotels.length + 1} className="p-3 text-center uppercase font-bold text-[#D4AF37] text-[10px] tracking-widest">
                  Featured Luxury Amenities Comparison
                </td>
              </tr>

              {/* Specific Amenities Checklist */}
              {AMENITIES_TO_COMPARE.map(amenity => (
                <tr key={amenity}>
                  <td className="p-4 font-bold text-[#F5EBE0]/80 text-[10px]">{amenity}</td>
                  {comparedHotels.map(h => {
                    const hasAmenity = h.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()));
                    return (
                      <td key={h.id} className="p-4 border-l border-[#2A362E] text-center">
                        {hasAmenity ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 mx-auto">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Direct Booking Actions Row */}
              <tr className="bg-[#12241A]/50">
                <td className="p-6 font-bold text-[#D4AF37] uppercase text-[10px]">Action</td>
                {comparedHotels.map(h => (
                  <td key={h.id} className="p-6 border-l border-[#2A362E]">
                    <button
                      onClick={() => openBookingModal('hotel', h.id)}
                      className="w-full btn-gold py-3 rounded-xl font-bold font-mono text-xs shadow-lg flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Book Stay
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
