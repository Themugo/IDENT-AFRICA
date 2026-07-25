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
      className="group relative bg-[#4B321F] border border-[#C89A4B]/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-2xl hover:border-[#D6B06A] hover:-translate-y-1"
    >
      {/* Image & Slider Controls */}
      <div className="relative h-64 overflow-hidden bg-[#2E2015]">
        <img
          src={images[imgIndex]}
          alt={`${dest.name} slide ${imgIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2015] via-[#2E2015]/20 to-transparent pointer-events-none" />

        {/* Country Tag */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-[#2E2015]/90 text-[#D6B06A] text-[10px] font-bold uppercase tracking-widest border border-[#C89A4B]/50 rounded-md backdrop-blur-sm z-10">
          {dest.country}
        </div>

        {/* Save Heart Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveDestination(dest.id);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all border z-10 ${
            isSaved
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-[#2E2015]/80 text-[#F4E8D5] border-[#C89A4B]/40 hover:text-[#D6B06A] hover:bg-[#2E2015]'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Destination'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Gallery Prev / Next Controls if multiple photos exist */}
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
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-[#2E2015]/70 px-2 py-1 rounded-full border border-[#C89A4B]/20">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === imgIndex ? 'w-4 bg-[#D6B06A]' : 'w-1.5 bg-[#F4E8D5]/40 hover:bg-[#D6B06A]'
                  }`}
                  title={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Rating & Category */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs z-10">
          <span className="px-2.5 py-1 bg-[#2E2015]/90 border border-[#C89A4B]/30 text-[10px] font-bold uppercase tracking-wider text-[#F4E8D5] rounded-md backdrop-blur-sm">
            {dest.category}
          </span>
          <div className="flex items-center gap-1 font-bold bg-[#C89A4B] text-[#2E2015] px-2.5 py-1 text-[11px] rounded-md shadow-md">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{dest.rating}</span>
            <span className="text-[9px] opacity-80">({dest.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-[#F4E8D5] group-hover:text-[#D6B06A] transition-colors">
            {dest.name}
          </h3>
          <p className="text-[11px] text-[#D6B06A] font-bold uppercase tracking-widest mt-1">
            {dest.tagline}
          </p>
          <p className="mt-3 text-xs text-[#D3C5AE] line-clamp-2 leading-relaxed font-light">
            {dest.description}
          </p>
        </div>

        {/* Wildlife highlights tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {dest.wildlifeHighlights.slice(0, 2).map((highlight) => (
            <span
              key={highlight}
              className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-[#2E2015] text-[#D6B06A] border border-[#C89A4B]/30 rounded-md"
            >
              {highlight}
            </span>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-[#C89A4B]/20 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#D3C5AE]/70 block">
              From / Person
            </span>
            <span className="text-lg font-serif font-bold text-[#D6B06A]">
              {formatPrice(dest.startingPrice)}
            </span>
          </div>

          <button
            onClick={() => navigateTo('destination-detail', dest.id)}
            className="bg-[#2E2015] text-[#F4E8D5] hover:bg-[#C89A4B] hover:text-[#2E2015] border border-[#C89A4B]/40 text-[10px] py-2.5 px-4 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all"
          >
            <span>Explore Reserve</span>
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#2E2015] border-b border-[#C89A4B]/30 relative overflow-hidden texture-leather">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-6 border-b border-[#C89A4B]/30">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D6B06A] mb-3 block">
              East African Crown Jewels
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F4E8D5] tracking-tight">
              Iconic Wildlife Sanctuaries
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#D3C5AE] max-w-2xl font-light">
              Explore protected game reserves, mist-covered gorilla rainforests, and turquoise island escapes.
            </p>
          </div>

          <button
            onClick={() => navigateTo('destinations')}
            className="btn-gold flex items-center gap-2 self-start md:self-auto rounded-lg"
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

