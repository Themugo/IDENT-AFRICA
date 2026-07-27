import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WildlifeFocus } from '../../types';
import { ListingGridSkeleton } from '../common/Skeleton';
import {
  Grid,
  List,
  Search,
  Star,
  Heart,
  ArrowRight,
  Compass,
} from 'lucide-react';

export const DestinationListing: React.FC = () => {
  const { destinations, navigateTo, formatPrice, savedDestinationIds, toggleSaveDestination } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWildlife, setSelectedWildlife] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Simulated luxury data fetching effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [selectedCountry, selectedCategory, selectedWildlife, searchQuery, sortBy]);

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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#E8DCC8] text-[#2A1E17] transition-colors texture-parchment">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="space-y-3 border-b border-[#C89A4B]/40 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EC] text-[#4F6848] text-xs font-mono font-bold uppercase border border-[#C89A4B]/50 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#C89A4B]" /> East African Sanctuaries
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[#2A1E17]">
            Wildlife Reserves & National Parks
          </h1>
          <p className="text-sm sm:text-base text-[#5A4738] max-w-3xl font-normal">
            Compare protected ecosystems across Kenya, Tanzania, Uganda, and Rwanda. Discover seasonal migration times, Big 5 probabilities, and luxury lodges.
          </p>
        </div>

        {/* Filters & Control Bar */}
        <div className="p-6 rounded-2xl bg-[#FFF8EC] border-2 border-[#C89A4B]/60 shadow-xl space-y-6 card-journal">
          
          {/* Top Search & Controls Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#C89A4B] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search reserve name, country, or park region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5E7D0] border border-[#C89A4B]/50 text-sm font-medium text-[#2A1E17] focus:outline-none focus:border-[#4F6848]"
              />
            </div>

            {/* View Modes & Sorting */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              
              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-[#5A4738]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#F5E7D0] text-xs font-mono px-3 py-2 rounded-lg border border-[#C89A4B]/50 text-[#4F6848] font-bold focus:outline-none"
                >
                  <option value="rating">Top Rated & Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Grid / List view toggle */}
              <div className="flex items-center border border-[#C89A4B]/50 rounded-lg p-1 bg-[#F5E7D0]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-[#4F6848] text-[#FFF8EC]' : 'text-[#5A4738]'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded cursor-pointer ${viewMode === 'list' ? 'bg-[#4F6848] text-[#FFF8EC]' : 'text-[#5A4738]'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Facet Filter Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#C89A4B]/30">
            
            {/* Country Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-[#4F6848] uppercase">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#F5E7D0] text-xs font-bold px-3 py-2 rounded-lg border border-[#C89A4B]/50 text-[#2A1E17] focus:outline-none"
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
              <label className="text-[11px] font-mono font-bold text-[#4F6848] uppercase">Habitat Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#F5E7D0] text-xs font-bold px-3 py-2 rounded-lg border border-[#C89A4B]/50 text-[#2A1E17] focus:outline-none"
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
              <label className="text-[11px] font-mono font-bold text-[#4F6848] uppercase">Wildlife Focus</label>
              <select
                value={selectedWildlife}
                onChange={(e) => setSelectedWildlife(e.target.value)}
                className="w-full bg-[#F5E7D0] text-xs font-bold px-3 py-2 rounded-lg border border-[#C89A4B]/50 text-[#2A1E17] focus:outline-none"
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
        <div className="flex items-center justify-between text-xs font-mono font-bold text-[#5A4738]">
          <span>Showing <strong className="text-[#4F6848]">{sorted.length}</strong> East African Destinations</span>
          {(selectedCountry !== 'All' || selectedCategory !== 'All' || selectedWildlife !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCountry('All');
                setSelectedCategory('All');
                setSelectedWildlife('All');
                setSearchQuery('');
              }}
              className="text-[#4F6848] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Grid or List Listing */}
        {isLoading ? (
          <ListingGridSkeleton type="destination" count={6} />
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 bg-[#FFF8EC] rounded-2xl border-2 border-[#C89A4B]/50 space-y-3 card-journal">
            <Compass className="w-12 h-12 text-[#C89A4B] mx-auto opacity-70" />
            <h3 className="text-xl font-serif font-bold text-[#2A1E17]">No Sanctuaries Found</h3>
            <p className="text-xs text-[#5A4738]">
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
                  className="group rounded-2xl bg-[#FFF8EC] border-2 border-[#C89A4B]/50 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between card-expedition hover:border-[#4F6848]"
                >
                  <div className="relative h-60 overflow-hidden bg-[#DCCCB0]">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E17]/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#4F6848] text-[#FFF8EC] text-xs font-mono font-bold border border-[#C89A4B]/60 shadow">
                      {dest.country}
                    </div>

                    <button
                      onClick={() => toggleSaveDestination(dest.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-rose-700 text-white'
                          : 'bg-[#FFF8EC]/90 text-[#2A1E17] hover:text-[#4F6848]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-mono bg-[#FFF8EC]/90 text-[#2A1E17] font-bold px-2 py-0.5 rounded text-[11px] border border-[#C89A4B]/40 shadow">
                        {dest.category}
                      </span>
                      <div className="flex items-center gap-1 bg-[#C89A4B] text-[#FFF8EC] font-bold px-2 py-0.5 rounded shadow">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#2A1E17] group-hover:text-[#4F6848] transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-[#4F6848] font-mono mt-1 font-bold">
                        {dest.tagline}
                      </p>
                      <p className="mt-2 text-xs text-[#5A4738] line-clamp-2 leading-relaxed font-normal">
                        {dest.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#C89A4B]/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-[#5A4738] block">Starting From</span>
                        <span className="text-lg font-serif font-bold text-[#4F6848]">
                          {formatPrice(dest.startingPrice)}
                        </span>
                      </div>

                      <button
                        onClick={() => navigateTo('destination-detail', dest.id)}
                        className="px-4 py-2 rounded-xl btn-forest text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
                className="p-6 rounded-2xl bg-[#FFF8EC] border-2 border-[#C89A4B]/50 flex flex-col md:flex-row items-center gap-6 shadow-md hover:shadow-xl transition-all card-journal"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full md:w-56 h-40 rounded-xl object-cover border border-[#C89A4B]/40"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono font-bold text-[#4F6848]">
                    <span>{dest.country}</span>
                    <span>•</span>
                    <span>{dest.category}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#2A1E17]">{dest.name}</h3>
                  <p className="text-xs text-[#5A4738] leading-relaxed font-normal">
                    {dest.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {dest.wildlifeHighlights.map(w => (
                      <span key={w} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5E7D0] text-[#4F6848] border border-[#C89A4B]/30">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right space-y-3 shrink-0">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#5A4738] block">From</span>
                    <span className="text-2xl font-serif font-bold text-[#4F6848]">
                      {formatPrice(dest.startingPrice)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigateTo('destination-detail', dest.id)}
                    className="w-full px-5 py-2.5 rounded-xl btn-gold text-xs font-bold cursor-pointer"
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
