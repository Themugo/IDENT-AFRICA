import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Destination, Country, WildlifeFocus } from '../../types';
import {
  MapPin,
  Filter,
  Grid,
  List,
  Map as MapIcon,
  Search,
  Star,
  Heart,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Trees,
} from 'lucide-react';

export const DestinationListing: React.FC = () => {
  const { destinations, navigateTo, formatPrice, savedDestinationIds, toggleSaveDestination } = useApp();

  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWildlife, setSelectedWildlife] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter logic
  const filtered = destinations.filter((dest) => {
    if (selectedCountry !== 'All' && dest.country !== selectedCountry) return false;
    if (selectedCategory !== 'All' && dest.category !== selectedCategory) return false;
    if (selectedWildlife !== 'All' && !dest.wildlifeHighlights.includes(selectedWildlife as WildlifeFocus)) return false;
    if (
      searchQuery &&
      !dest.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !dest.region.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !dest.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.startingPrice - b.startingPrice;
    if (sortBy === 'price-desc') return b.startingPrice - a.startingPrice;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] dark:bg-[#0F1210] text-[#1A1A1A] dark:text-[#F5EBE0] transition-colors">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="space-y-3 border-b border-[#E6D5C3] dark:border-[#2A362E] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono font-bold uppercase border border-[#D4AF37]/30">
            <Compass className="w-3.5 h-3.5" /> East African Sanctuaries
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
            Wildlife Reserves & National Parks
          </h1>
          <p className="text-sm sm:text-base text-[#665E55] dark:text-[#A8A096] max-w-3xl">
            Compare protected ecosystems across Kenya, Tanzania, Uganda, and Rwanda. Discover seasonal migration times, Big 5 probabilities, and luxury lodges.
          </p>
        </div>

        {/* Filters & Control Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#D4AF37]/30 shadow-xl space-y-6">
          
          {/* Top Search & Controls Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search reserve name, country, or park region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#D4AF37]/30 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* View Modes & Sorting */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              
              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#665E55] dark:text-[#A8A096]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#FAF7F2] dark:bg-[#12241A] text-xs font-mono px-3 py-2 rounded-lg border border-[#E6D5C3] dark:border-[#D4AF37]/30 text-[#D4AF37] font-semibold focus:outline-none"
                >
                  <option value="rating">Top Rated & Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Grid / List view toggle */}
              <div className="flex items-center border border-[#E6D5C3] dark:border-[#D4AF37]/30 rounded-lg p-1 bg-[#FAF7F2] dark:bg-[#12241A]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#D4AF37] text-[#0F1210]' : 'text-[#665E55] dark:text-[#F5EBE0]'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#D4AF37] text-[#0F1210]' : 'text-[#665E55] dark:text-[#F5EBE0]'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Facet Filter Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E6D5C3] dark:border-[#2A362E]">
            
            {/* Country Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#12241A] text-xs px-3 py-2 rounded-lg border border-[#E6D5C3] dark:border-[#D4AF37]/30 focus:outline-none"
              >
                <option value="All">All Countries (4)</option>
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase">Habitat Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#12241A] text-xs px-3 py-2 rounded-lg border border-[#E6D5C3] dark:border-[#D4AF37]/30 focus:outline-none"
              >
                <option value="All">All Ecosystems</option>
                <option value="Savanna & Plains">Savanna & Plains</option>
                <option value="Crater & Highlands">Crater & Highlands</option>
                <option value="Impenetrable Forest">Impenetrable Forest</option>
                <option value="Tropical Coast & Beach">Tropical Coast & Beach</option>
                <option value="Alpine Mountain">Alpine Mountain</option>
              </select>
            </div>

            {/* Wildlife Focus Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase">Wildlife Focus</label>
              <select
                value={selectedWildlife}
                onChange={(e) => setSelectedWildlife(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#12241A] text-xs px-3 py-2 rounded-lg border border-[#E6D5C3] dark:border-[#D4AF37]/30 focus:outline-none"
              >
                <option value="All">All Wildlife Priorities</option>
                <option value="The Big Five">The Big Five</option>
                <option value="Great Wildebeest Migration">Wildebeest Migration</option>
                <option value="Mountain Gorillas & Primates">Gorillas & Primates</option>
                <option value="Marine & Coral Reefs">Marine & Coral Reefs</option>
              </select>
            </div>

          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-[#665E55] dark:text-[#A8A096]">
          <span>Showing <strong className="text-[#D4AF37]">{sorted.length}</strong> East African Destinations</span>
          {(selectedCountry !== 'All' || selectedCategory !== 'All' || selectedWildlife !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCountry('All');
                setSelectedCategory('All');
                setSelectedWildlife('All');
                setSearchQuery('');
              }}
              className="text-[#D4AF37] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Grid or List Listing */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#181E1A] rounded-2xl border border-[#E6D5C3] dark:border-[#2A362E] space-y-3">
            <Compass className="w-12 h-12 text-[#D4AF37] mx-auto opacity-50" />
            <h3 className="text-xl font-serif font-bold">No Sanctuaries Found</h3>
            <p className="text-xs text-[#665E55] dark:text-[#A8A096]">
              Try adjusting your filter criteria or search query.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((dest) => {
              const isSaved = savedDestinationIds.includes(dest.id);
              return (
                <div
                  key={dest.id}
                  className="group rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#12241A]/90 text-[#D4AF37] text-xs font-mono font-semibold border border-[#D4AF37]/30">
                      {dest.country}
                    </div>

                    <button
                      onClick={() => toggleSaveDestination(dest.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                        isSaved
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#12241A]/80 text-white/80 hover:text-[#D4AF37]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-mono bg-black/60 px-2 py-0.5 rounded text-[11px]">
                        {dest.category}
                      </span>
                      <div className="flex items-center gap-1 bg-[#D4AF37] text-[#0F1210] font-bold px-2 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#1A1A1A] dark:text-[#F5EBE0] group-hover:text-[#D4AF37] transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-[#D4AF37] font-mono mt-1 font-semibold">
                        {dest.tagline}
                      </p>
                      <p className="mt-2 text-xs text-[#665E55] dark:text-[#A8A096] line-clamp-2 leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E6D5C3] dark:border-[#2A362E] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">Starting From</span>
                        <span className="text-lg font-serif font-bold text-[#D4AF37]">
                          {formatPrice(dest.startingPrice)}
                        </span>
                      </div>

                      <button
                        onClick={() => navigateTo('destination-detail', dest.id)}
                        className="px-4 py-2 rounded-xl btn-forest text-xs font-semibold flex items-center gap-1.5"
                      >
                        Explore Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((dest) => (
              <div
                key={dest.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] flex flex-col md:flex-row items-center gap-6 shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full md:w-56 h-40 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#D4AF37]">
                    <span>{dest.country}</span>
                    <span>•</span>
                    <span>{dest.category}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold">{dest.name}</h3>
                  <p className="text-xs text-[#665E55] dark:text-[#A8A096] leading-relaxed">
                    {dest.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {dest.wildlifeHighlights.map(w => (
                      <span key={w} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E3A2B]/10 dark:bg-[#1E3A2B] text-[#D4AF37]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right space-y-3 shrink-0">
                  <div>
                    <span className="text-xs font-mono text-[#665E55] dark:text-[#A8A096] block">From</span>
                    <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                      {formatPrice(dest.startingPrice)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigateTo('destination-detail', dest.id)}
                    className="w-full px-5 py-2.5 rounded-xl btn-gold text-xs font-bold"
                  >
                    View Reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
