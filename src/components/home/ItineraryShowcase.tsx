import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Scale, Sparkles, CheckCircle2, ArrowRight, Plane, ChevronLeft, ChevronRight } from 'lucide-react';
import { SafariItinerary } from '../../types';

interface ItineraryCardProps {
  itin: SafariItinerary;
}

const ItineraryCardWithSlider: React.FC<ItineraryCardProps> = ({ itin }) => {
  const { navigateTo, formatPrice, comparedItineraryIds, toggleCompareItinerary, openBookingModal } = useApp();
  const isCompared = comparedItineraryIds.includes(itin.id);

  // Gallery slider list (heroImage + gallery images)
  const images = Array.from(new Set([itin.heroImage, ...(itin.gallery || [])]));
  const [imgIndex, setImgIndex] = useState(0);

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="rounded-2xl bg-[#FFF8EC] border-2 border-[#C89A4B]/60 overflow-hidden flex flex-col justify-between shadow-2xl hover:border-[#D6B06A] transition-all group card-journal"
    >
      {/* Top Image Slider */}
      <div className="relative h-64 overflow-hidden bg-[#1A1008]">
        <img
          src={images[imgIndex]}
          alt={`${itin.title} slide ${imgIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008]/80 via-transparent to-transparent pointer-events-none" />

        {/* Luxury Tier Pill */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1A1008]/90 text-[#D6B06A] text-xs font-bold font-mono z-10 shadow border border-[#C89A4B]/70">
          {itin.luxuryTier}
        </div>

        {/* Gallery Controls if multiple images exist */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#1A1008]/90 text-[#D6B06A] hover:bg-[#C89A4B] hover:text-[#1A1008] border border-[#C89A4B] z-20 shadow-xl cursor-pointer transition-all"
              title="Previous Photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#1A1008]/90 text-[#D6B06A] hover:bg-[#C89A4B] hover:text-[#1A1008] border border-[#C89A4B] z-20 shadow-xl cursor-pointer transition-all"
              title="Next Photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slider Dots */}
            <div className="absolute top-4 right-4 flex items-center gap-1 z-20 bg-[#1A1008]/90 px-2.5 py-1 rounded-full border border-[#C89A4B] shadow-md">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === imgIndex ? 'w-4 bg-[#D6B06A]' : 'w-1.5 bg-[#C89A4B]/40 hover:bg-[#D6B06A]'
                  }`}
                  title={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Duration */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFF8EC]/95 text-[#2A1E17] text-xs font-mono font-bold border border-[#C89A4B]/50 z-10 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-[#C89A4B]" />
          <span>{itin.durationDays} Days / {itin.durationNights} Nights</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C89A4B] font-bold mb-2">
            <Plane className="w-3.5 h-3.5 text-[#C89A4B]" />
            <span>{itin.countries.join(' & ')} • {itin.transferType}</span>
          </div>

          <h3 className="text-2xl font-serif font-bold text-[#2A1E17] group-hover:text-[#C89A4B] transition-colors leading-snug">
            {itin.title}
          </h3>

          <p className="mt-2 text-xs text-[#5A4738] leading-relaxed font-normal">
            {itin.subtitle}
          </p>

          {/* Highlights bullet list */}
          <div className="mt-4 space-y-2">
            {itin.includedInPrice.slice(0, 3).map((inc, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#2A1E17]/90 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6848] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-[#C89A4B]/30 space-y-4">
          
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono text-[#5A4738] uppercase font-bold">Total / Guest</span>
            <div className="text-right">
              <span className="text-2xl font-serif font-bold text-[#2A1E17]">
                {formatPrice(itin.priceUSD)}
              </span>
              <span className="block text-[10px] text-[#4F6848] font-mono font-bold">
                Eco & Conservation Fees Included
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => toggleCompareItinerary(itin.id)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isCompared
                  ? 'bg-[#C89A4B] text-[#1A1008] border-[#C89A4B] font-bold'
                  : 'border-[#C89A4B]/50 text-[#2A1E17] bg-[#F5E7D0] hover:bg-[#E8DCC8]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              {isCompared ? 'Comparing' : 'Compare'}
            </button>

            <button
              onClick={() => openBookingModal('itinerary', itin.id)}
              className="py-2.5 px-3 rounded-xl btn-gold text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              Book Expedition
            </button>
          </div>

          <button
            onClick={() => navigateTo('itinerary-detail', itin.id)}
            className="w-full text-center text-xs font-mono text-[#C89A4B] font-bold hover:underline flex items-center justify-center gap-1 pt-1 cursor-pointer"
          >
            View Day-by-Day Journal <ArrowRight className="w-3 h-3 text-[#C89A4B]" />
          </button>

        </div>

      </div>
    </div>
  );
};

export const ItineraryShowcase: React.FC = () => {
  const { itineraries } = useApp();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#463D34] text-[#F4E8D5] relative overflow-hidden border-b border-[#C89A4B]/40 texture-leather">
      
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C89A4B_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2D2621] text-[#D6B06A] text-xs font-mono font-bold tracking-wider uppercase border border-[#C89A4B]/60 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B06A]" /> Curated Masterpiece Journeys
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F4E8D5] tracking-tight">
            Flagship Luxury Expeditions
          </h2>
          <p className="text-sm sm:text-base text-[#D3C5AE] font-normal">
            Handcrafted luxury safaris combining private bush charters, ultra-luxe tented camps, and intimate wildlife encounters.
          </p>
        </div>

        {/* Itinerary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {itineraries.map((itin) => (
            <ItineraryCardWithSlider key={itin.id} itin={itin} />
          ))}
        </div>

      </div>
    </section>
  );
};
