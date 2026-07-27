import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, ArrowRight, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Destination } from '../../types';

interface DestinationCardProps {
  dest: Destination;
}

const DestinationCardWithSlider: React.FC<DestinationCardProps> = ({ dest }) => {
  const { navigateTo, formatPrice, savedDestinationIds, toggleSaveDestination } = useApp();
  const isSaved = savedDestinationIds.includes(dest.id);

  // Gallery slider images list (combining primary image + gallery)
  const images = Array.from(new Set([dest.image, ...(dest.gallery || [])]));
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
      className="group relative bg-[#FFF8EC] border-2 border-[#C89A4B]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-2xl hover:border-[#D6B06A] hover:-translate-y-1.5 card-journal"
    >
      {/* Image & Slider Controls */}
      <div className="relative h-64 overflow-hidden bg-[#2D2621]">
        <img
          src={images[imgIndex]}
          alt={`${dest.name} slide ${imgIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2621]/80 via-transparent to-transparent pointer-events-none" />

        {/* Country Tag - Collectible Journal Stamp Style */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-[#2D2621]/90 text-[#D6B06A] text-[11px] font-bold uppercase tracking-widest border border-[#C89A4B]/80 rounded-md shadow-md z-10 font-mono">
          {dest.country}
        </div>

        {/* Save Heart Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveDestination(dest.id);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all border z-10 cursor-pointer ${
            isSaved
              ? 'bg-rose-800 text-white border-rose-600'
              : 'bg-[#FFF8EC]/90 text-[#2A1E17] border-[#C89A4B]/60 hover:text-[#C89A4B] hover:bg-[#FFF8EC]'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Destination'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Gallery Prev / Next Controls - Always Prominent & Visible Slider Buttons */}
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

            {/* Slider Dots Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-[#1A1008]/90 px-2.5 py-1 rounded-full border border-[#C89A4B] shadow-md">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === imgIndex ? 'w-5 bg-[#D6B06A]' : 'w-2 bg-[#C89A4B]/40 hover:bg-[#D6B06A]'
                  }`}
                  title={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Rating & Category */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs z-10">
          <span className="px-2.5 py-1 bg-[#FFF8EC]/90 text-[#2A1E17] border border-[#C89A4B]/50 text-[11px] font-bold uppercase tracking-wider rounded-md backdrop-blur-sm shadow">
            {dest.category}
          </span>
          <div className="flex items-center gap-1 font-bold bg-[#C89A4B] text-[#1A1008] px-2.5 py-1 text-[11px] rounded-md shadow-md">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{dest.rating}</span>
            <span className="text-[11px] opacity-90">({dest.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-[#2A1E17] group-hover:text-[#C89A4B] transition-colors">
            {dest.name}
          </h3>
          <p className="text-[11px] text-[#C89A4B] font-bold uppercase tracking-widest mt-1 font-mono">
            {dest.tagline}
          </p>
          <p className="mt-3 text-[13px] text-[#5A4738] line-clamp-2 leading-relaxed font-normal">
            {dest.description}
          </p>
        </div>

        {/* Wildlife highlights tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {dest.wildlifeHighlights.slice(0, 2).map((highlight) => (
            <span
              key={highlight}
              className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest bg-[#F5E7D0] text-[#2A1E17] border border-[#C89A4B]/40 rounded-md font-mono"
            >
              {highlight}
            </span>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-[#C89A4B]/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#5A4738] block font-mono">
              From / Person
            </span>
            <span className="text-lg font-serif font-bold text-[#2A1E17]">
              {formatPrice(dest.startingPrice)}
            </span>
          </div>

          <button
            onClick={() => navigateTo('destination-detail', dest.id)}
            className="btn-gold text-[11px] py-2.5 px-4 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <span>Explore Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export const FeaturedDestinations: React.FC = () => {
  const { destinations, navigateTo } = useApp();

  const featured = destinations.filter(d => d.featured).slice(0, 6);

  return (
    <section className="py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#463D34] text-[#F4E8D5] border-b border-[#C89A4B]/40 relative overflow-hidden texture-savannah">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-6 border-b border-[#C89A4B]/30">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D6B06A] mb-3 block font-mono">
              East African Crown Jewels
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F4E8D5] tracking-tight">
              Iconic Wildlife Sanctuaries
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#D3C5AE] max-w-2xl font-normal">
              Explore protected game reserves, mist-covered gorilla rainforests, and turquoise island escapes.
            </p>
          </div>

          <button
            onClick={() => navigateTo('destinations')}
            className="btn-gold flex items-center gap-2 self-start md:self-auto rounded-lg cursor-pointer"
          >
            <span>All 12 Sanctuaries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid with Card Image Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((dest) => (
            <DestinationCardWithSlider key={dest.id} dest={dest} />
          ))}
        </div>

      </div>
    </section>
  );
};

