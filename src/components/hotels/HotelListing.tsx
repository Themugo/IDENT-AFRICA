import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Country, HotelCategory } from '../../types';
import { ListingGridSkeleton } from '../common/Skeleton';
import {
  Search,
  MapPin,
  Star,
  Bookmark,
  Scale,
  Sparkles,
  BedDouble,
  ArrowUpRight,
} from 'lucide-react';

export const HotelListing: React.FC = () => {
  const {
    hotels,
    savedHotelIds,
    comparedHotelIds,
    toggleSaveHotel,
    toggleCompareHotel,
    formatPrice,
    navigateTo,
    openBookingModal,
  } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<Country | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<HotelCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating' | 'ecoScore'>('rating');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [selectedCountry, selectedCategory, searchQuery, sortBy]);

  const CATEGORIES: (HotelCategory | 'All')[] = [
    'All',
    'Safari Lodge',
    'Luxury Tented Camp',
    'Bespoke Private Villa',
    'Heritage Manor',
    'Eco Beach Resort',
    'Mountain Treehouse',
  ];

  const COUNTRIES: (Country | 'All')[] = ['All', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda'];

  // Filtering Logic
  const filteredHotels = hotels.filter(h => {
    const matchesCountry = selectedCountry === 'All' || h.country === selectedCountry;
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCountry && matchesCategory && matchesSearch;
  });

  // Sorting Logic
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'price-asc') return a.pricePerNight - b.pricePerNight;
    if (sortBy === 'price-desc') return b.pricePerNight - a.pricePerNight;
    if (sortBy === 'ecoScore') return b.ecoScore - a.ecoScore;
    return b.rating - a.rating; // default rating
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-[#181E1A] border border-[#D4AF37]/30 p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
            alt="Luxury Lodges"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="relative z-20 max-w-2xl space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#D4AF37] px-3 py-1 bg-[#12241A] rounded-full border border-[#D4AF37]/40 inline-block">
              Luxury Hotel Ecosystem & Sanctuaries
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
              Wilderness Lodges, Tented Camps & Manor Estates
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[#F5EBE0]/80">
              Curated luxury accommodations with verified eco-credentials, room-type pricing, live availability, and direct booking verification.
            </p>
          </div>
        </div>

        {/* Floating Comparison Sticky Alert Bar if hotels are selected */}
        {comparedHotelIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#1E3A2B] border border-[#D4AF37] text-[#F5EBE0] flex items-center justify-between shadow-xl font-mono text-xs">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-[#D4AF37]" />
              <span>
                <strong>{comparedHotelIds.length} Lodges Selected for Comparison</strong>
              </span>
            </div>
            <button
              onClick={() => navigateTo('compare-hotels')}
              className="btn-gold px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
            >
              Compare Side-by-Side <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="p-6 rounded-3xl bg-[#181E1A] border border-[#2A362E] space-y-6 shadow-xl">
          
          {/* Top Row: Search & Sort */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#D4AF37]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search lodges by name, location, or feature..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#12241A] border border-[#2A362E] text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto font-mono text-xs">
              <span className="text-[#F5EBE0]/60 shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full md:w-auto bg-[#12241A] border border-[#2A362E] text-[#D4AF37] px-4 py-3 rounded-2xl focus:outline-none font-bold"
              >
                <option value="rating">Guest Rating (Highest First)</option>
                <option value="ecoScore">Eco Score (Highest First)</option>
                <option value="price-asc">Nightly Rate: Low to High</option>
                <option value="price-desc">Nightly Rate: High to Low</option>
              </select>
            </div>

          </div>

          {/* Country Selection Buttons */}
          <div className="space-y-2 font-mono text-xs">
            <span className="text-[#D4AF37] uppercase text-[10px] tracking-wider font-bold block">
              Filter By Country
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {COUNTRIES.map(country => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCountry === country
                      ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                      : 'bg-[#12241A] text-[#F5EBE0]/70 border border-[#2A362E] hover:border-[#D4AF37]/50'
                  }`}
                >
                  {country === 'All' ? 'All Countries' : country}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-2 font-mono text-xs">
            <span className="text-[#D4AF37] uppercase text-[10px] tracking-wider font-bold block">
              Lodge Category Architecture
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] transition-all ${
                    selectedCategory === category
                      ? 'bg-[#1E3A2B] border border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-[#12241A] text-[#F5EBE0]/60 border border-[#2A362E] hover:text-white'
                  }`}
                >
                  {category === 'All' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between font-mono text-xs text-[#F5EBE0]/70">
          <span>Showing {sortedHotels.length} luxury lodges & tented sanctuaries</span>
        </div>

        {/* Hotel Cards Grid */}
        {isLoading ? (
          <ListingGridSkeleton type="hotel" count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedHotels.map(h => {
            const isSaved = savedHotelIds.includes(h.id);
            const isCompared = comparedHotelIds.includes(h.id);

            return (
              <div
                key={h.id}
                className="rounded-3xl bg-[#181E1A] border border-[#2A362E] hover:border-[#D4AF37]/50 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group"
              >
                <div>
                  {/* Hero Image Container */}
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={h.image}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Country & Category Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                      <span className="px-3 py-1 rounded-full bg-black/70 text-[#D4AF37] text-[10px] font-mono font-bold backdrop-blur-md border border-[#D4AF37]/30">
                        {h.country}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30">
                        {h.category}
                      </span>
                    </div>

                    {/* Action Icon Overlays (Save Favorite & Compare) */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {/* Compare Toggle */}
                      <button
                        onClick={() => toggleCompareHotel(h.id)}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                          isCompared
                            ? 'bg-[#D4AF37] text-[#0F1210] border-[#D4AF37]'
                            : 'bg-black/60 text-white/80 border-white/20 hover:text-white'
                        }`}
                        title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                      >
                        <Scale className="w-4 h-4" />
                      </button>

                      {/* Save Favorite */}
                      <button
                        onClick={() => toggleSaveHotel(h.id)}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                          isSaved
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-black/60 text-white/80 border-white/20 hover:text-white'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Save Lodge'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Ratings Pill */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {h.rating} ({h.reviewsCount})
                      </span>
                      <span className="font-bold text-emerald-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                        Eco Score: {h.ecoScore}/10
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#F5EBE0] group-hover:text-[#D4AF37] transition-colors leading-tight">
                        {h.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#D4AF37] mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{h.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#F5EBE0]/70 line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>

                    {/* Key Amenities Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#12241A] text-[#F5EBE0]/80 text-[10px] font-mono border border-[#2A362E]"
                        >
                          {amenity}
                        </span>
                      ))}
                      {h.amenities.length > 3 && (
                        <span className="px-2 py-1 rounded-lg bg-[#12241A] text-[#D4AF37] text-[10px] font-mono">
                          +{h.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 bg-[#12241A] border-t border-[#2A362E] space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-[#F5EBE0]/60 uppercase block">Starting Base Rate</span>
                      <span className="text-xl font-serif font-bold text-[#D4AF37]">
                        {formatPrice(h.pricePerNight)}
                      </span>
                      <span className="text-[10px] text-[#F5EBE0]/60"> / night</span>
                    </div>

                    <span className="text-[10px] font-mono text-[#F5EBE0]/70 flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {h.roomTypes.length} Suites
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <button
                      onClick={() => navigateTo('hotel-detail', h.id)}
                      className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F5EBE0] font-bold border border-[#2A362E] transition-all text-center"
                    >
                      View Lodge
                    </button>
                    <button
                      onClick={() => openBookingModal('hotel', h.id)}
                      className="py-2.5 rounded-xl btn-gold font-bold shadow-md flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Book Stay
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
        )}

      </div>
    </div>
  );
};
