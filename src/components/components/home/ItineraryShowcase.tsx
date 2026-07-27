import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Scale, Sparkles, CheckCircle2, ArrowRight, Plane, ChevronLeft, ChevronRight, ArrowLeft, MapPin, Utensils, Car, Star } from 'lucide-react';
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

          <p className="mt-2 text-[13px] text-[#5A4738] leading-relaxed font-normal">
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
              <span className="block text-[11px] text-[#4F6848] font-mono font-bold">
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
    <section className="py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#463D34] text-[#F4E8D5] relative overflow-hidden border-b border-[#C89A4B]/40 texture-leather">
      
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

// Itinerary Detail View - displays day-by-day itinerary
export const ItineraryDetail: React.FC = () => {
  const { itineraries, selectedItineraryId, navigateTo, formatPrice, openBookingModal } = useApp();
  
  const itinerary = itineraries.find(i => i.id === selectedItineraryId) || itineraries[0];
  
  if (!itinerary) {
    return (
      <div className="py-20 px-4 text-center text-[#F4E8D5]">
        <p>Itinerary not found.</p>
        <button onClick={() => navigateTo('itineraries')} className="btn-gold mt-4">
          Back to Expeditions
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#463D34] text-[#F4E8D5]">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        <img 
          src={itinerary.heroImage} 
          alt={itinerary.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#463D34] via-[#463D34]/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <button 
            onClick={() => navigateTo('itineraries')}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D6B06A] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Expeditions
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#4F6848] text-white text-xs font-bold">
              {itinerary.luxuryTier}
            </span>
            {itinerary.countries.map(country => (
              <span key={country} className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-mono">
                {country}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#F4E8D5] mb-4">
            {itinerary.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#D3C5AE]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{itinerary.durationDays} Days / {itinerary.durationNights} Nights</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <span>{itinerary.rating} ({itinerary.reviewsCount} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#D4AF37]" />
              <span>{itinerary.transferType}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Quick Info Bar */}
        <div className="bg-[#2D2621] rounded-2xl p-6 mb-8 border border-[#C89A4B]/40">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-1">Price Per Person</p>
              <p className="text-3xl font-serif font-bold text-[#F4E8D5]">{formatPrice(itinerary.priceUSD)}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigateTo('compare')}
                className="px-6 py-3 rounded-xl border border-[#C89A4B] text-[#D4AF37] font-bold text-sm hover:bg-[#C89A4B]/10 transition-colors"
              >
                Compare
              </button>
              <button 
                onClick={() => openBookingModal('itinerary', itinerary.id)}
                className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#2D2621] font-bold text-sm hover:bg-[#D6B06A] transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
        
        {/* What's Included */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#2D2621] rounded-2xl p-6 border border-[#4F6848]/40">
            <h3 className="text-lg font-serif font-bold text-[#4F6848] mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Included
            </h3>
            <ul className="space-y-2">
              {itinerary.includedInPrice.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#D3C5AE]">
                  <span className="text-[#4F6848] mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#2D2621] rounded-2xl p-6 border border-[#D4AF37]/40">
            <h3 className="text-lg font-serif font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
              <span className="text-xl">✕</span> Not Included
            </h3>
            <ul className="space-y-2">
              {itinerary.excludedInPrice.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#D3C5AE]">
                  <span className="text-[#D4AF37] mt-0.5">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Day by Day */}
        <div className="space-y-8">
          <h2 className="text-2xl font-serif font-bold text-[#F4E8D5]">Day-by-Day Journal</h2>
          {itinerary.dayByDay.map((day) => (
            <div key={day.day} className="bg-[#2D2621] rounded-2xl overflow-hidden border border-[#C89A4B]/30">
              <div className="flex items-center gap-4 p-6 border-b border-[#C89A4B]/20">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#2D2621] font-bold text-lg">
                  {day.day}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#F4E8D5]">{day.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-[#D3C5AE]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" /> {day.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-[#D4AF37]" /> {day.meals}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#D3C5AE] leading-relaxed mb-4">{day.description}</p>
                <div className="flex flex-wrap gap-2">
                  {day.activities.map((activity, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-[#4F6848]/30 text-[#D4AF37] text-xs font-mono">
                      {activity}
                    </span>
                  ))}
                </div>
                {day.accommodation && (
                  <div className="mt-4 pt-4 border-t border-[#C89A4B]/20">
                    <p className="text-xs text-[#D4AF37] font-mono uppercase tracking-wider mb-1">Accommodation</p>
                    <p className="text-sm text-[#F4E8D5]">{day.accommodation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => openBookingModal('itinerary', itinerary.id)}
            className="px-8 py-4 rounded-xl bg-[#D4AF37] text-[#2D2621] font-bold text-sm hover:bg-[#D6B06A] transition-colors"
          >
            Book This Expedition
          </button>
        </div>
      </div>
    </div>
  );
};
