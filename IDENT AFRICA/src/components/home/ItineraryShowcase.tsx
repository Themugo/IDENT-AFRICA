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
      className="rounded-2xl bg-[#4B321F] border border-[#C89A4B]/40 overflow-hidden flex flex-col justify-between shadow-2xl hover:border-[#D6B06A] transition-all group"
    >
      {/* Top Image Slider */}
      <div className="relative h-64 overflow-hidden bg-[#2E2015]">
        <img
          src={images[imgIndex]}
          alt={`${itin.title} slide ${imgIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2015] via-transparent to-black/40 pointer-events-none" />

        {/* Luxury Tier Pill */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#C89A4B] text-[#2E2015] text-xs font-bold font-mono z-10">
          {itin.luxuryTier}
        </div>

        {/* Gallery Controls if multiple images exist */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#2E2015]/80 text-[#F4E8D5] hover:text-[#D6B06A] border border-[#C89A4B]/30 opacity-80 group-hover:opacity-100 transition-opacity z-10"
              title="Previous Photo"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#2E2015]/80 text-[#F4E8D5] hover:text-[#D6B06A] border border-[#C89A4B]/30 opacity-80 group-hover:opacity-100 transition-opacity z-10"
              title="Next Photo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Slider Dots */}
            <div className="absolute top-4 right-4 flex items-center gap-1 z-10 bg-[#2E2015]/80 px-2 py-1 rounded-full border border-[#C89A4B]/30">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === imgIndex ? 'w-3.5 bg-[#D6B06A]' : 'w-1.5 bg-[#F4E8D5]/40 hover:bg-[#D6B06A]'
                  }`}
                  title={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Duration */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2E2015]/90 text-[#D6B06A] text-xs font-mono border border-[#C89A4B]/30 z-10">
          <Clock className="w-3.5 h-3.5" />
          <span>{itin.durationDays} Days / {itin.durationNights} Nights</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#D6B06A] mb-2">
            <Plane className="w-3.5 h-3.5" />
            <span>{itin.countries.join(' & ')} • {itin.transferType}</span>
          </div>

          <h3 className="text-2xl font-serif font-bold text-[#F4E8D5] group-hover:text-[#D6B06A] transition-colors leading-snug">
            {itin.title}
          </h3>

          <p className="mt-2 text-xs text-[#D3C5AE] leading-relaxed">
            {itin.subtitle}
          </p>

          {/* Highlights bullet list */}
          <div className="mt-4 space-y-2">
            {itin.includedInPrice.slice(0, 3).map((inc, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#F4E8D5]/90">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B06A] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-[#C89A4B]/20 space-y-4">
          
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono text-[#D3C5AE]/70 uppercase">Total / Guest</span>
            <div className="text-right">
              <span className="text-2xl font-serif font-bold text-[#D6B06A]">
                {formatPrice(itin.priceUSD)}
              </span>
              <span className="block text-[10px] text-emerald-400 font-mono">
                All Conservation Fees Included
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => toggleCompareItinerary(itin.id)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isCompared
                  ? 'bg-[#C89A4B] text-[#2E2015] border-[#C89A4B]'
                  : 'border-[#C89A4B]/40 text-[#D6B06A] hover:bg-[#2E2015]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              {isCompared ? 'Comparing' : 'Compare'}
            </button>

            <button
              onClick={() => openBookingModal('itinerary', itin.id)}
              className="py-2.5 px-3 rounded-xl btn-gold text-xs font-bold flex items-center justify-center gap-1"
            >
              Book Expedition
            </button>
          </div>

          <button
            onClick={() => navigateTo('itinerary-detail', itin.id)}
            className="w-full text-center text-xs font-mono text-[#D6B06A] hover:underline flex items-center justify-center gap-1 pt-1"
          >
            View Day-by-Day Itinerary <ArrowRight className="w-3 h-3" />
          </button>

        </div>

      </div>
    </div>
  );
};

export const ItineraryShowcase: React.FC = () => {
  const { itineraries } = useApp();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#2E2015] text-[#F4E8D5] relative overflow-hidden border-b border-[#C89A4B]/30">
      
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C89A4B_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4B321F] text-[#D6B06A] text-xs font-mono font-bold tracking-wider uppercase border border-[#C89A4B]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B06A]" /> Curated Masterpiece Journeys
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F4E8D5] tracking-tight">
            Flagship Luxury Expeditions
          </h2>
          <p className="text-sm sm:text-base text-[#D3C5AE]/80 font-light">
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
