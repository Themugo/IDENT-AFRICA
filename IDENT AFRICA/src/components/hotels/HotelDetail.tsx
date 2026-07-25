import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoomType } from '../../types';
import { AddHotelToItineraryModal } from './AddHotelToItineraryModal';
import {
  MapPin,
  Star,
  Bookmark,
  Scale,
  Calendar,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  Phone,
  Mail,
  Users,
  BedDouble,
  ShieldCheck,
  Compass,
  Image as ImageIcon,
  Plus,
  DollarSign,
  Info,
  ExternalLink,
  Clock,
  Award,
  Sun,
} from 'lucide-react';

export const HotelDetail: React.FC = () => {
  const {
    hotels,
    selectedHotelId,
    savedHotelIds,
    comparedHotelIds,
    toggleSaveHotel,
    toggleCompareHotel,
    formatPrice,
    navigateTo,
    openBookingModal,
    addHotelGalleryPhoto,
  } = useApp();

  const hotel = hotels.find(h => h.id === selectedHotelId) || hotels[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'availability' | 'location'>('overview');
  
  // Lightbox & Photo Modal State
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  
  // Itinerary Modal State
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);

  // Availability & Date Picker Calculator State
  const [selectedRoom, setSelectedRoom] = useState<RoomType>(hotel.roomTypes[0] || {
    id: 'default',
    name: 'Standard Safari Suite',
    description: 'Luxury suite overlooking the wild landscape',
    sizeSqFt: 850,
    bedType: 'King Four-Poster',
    maxOccupancy: 2,
    pricePerNight: hotel.pricePerNight,
    image: hotel.image,
    amenities: ['Panorama Deck', 'En-suite Stone Bath'],
    availableRooms: 5,
  });

  const [checkInDate, setCheckInDate] = useState('2026-08-10');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-14');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  if (!hotel) return null;

  const isSaved = savedHotelIds.includes(hotel.id);
  const isCompared = comparedHotelIds.includes(hotel.id);

  // Calculate nights
  const calculateNights = () => {
    try {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 4;
    }
  };

  const nights = calculateNights();
  const roomPricePerNight = selectedRoom.pricePerNight;
  const roomTotal = roomPricePerNight * nights;
  const conservationParkFee = 100 * nights * (adultsCount + childrenCount);
  const estimatedTaxes = Math.round(roomTotal * 0.08);
  const totalStayCost = roomTotal + conservationParkFee + estimatedTaxes;

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    addHotelGalleryPhoto(hotel.id, newPhotoUrl.trim());
    setNewPhotoUrl('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Sticky Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181E1A] p-4 rounded-2xl border border-[#2A362E]">
          <button
            onClick={() => navigateTo('hotels')}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#D4AF37] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Lodges & Sanctuaries
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsItineraryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E3A2B] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold hover:bg-[#D4AF37] hover:text-[#0F1210] transition-colors"
            >
              + Add to Safari Itinerary
            </button>

            <button
              onClick={() => toggleCompareHotel(hotel.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 ${
                isCompared
                  ? 'bg-[#D4AF37] text-[#0F1210] border-[#D4AF37]'
                  : 'bg-[#12241A] text-white border-[#2A362E] hover:border-[#D4AF37]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> {isCompared ? 'Compared' : 'Compare'}
            </button>

            <button
              onClick={() => toggleSaveHotel(hotel.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-[#12241A] text-white border-[#2A362E] hover:border-rose-500'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> {isSaved ? 'Bookmarked' : 'Save'}
            </button>
          </div>
        </div>

        {/* Header Title Section */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#12241A] text-[#D4AF37] text-[10px] font-mono font-bold border border-[#D4AF37]/30 uppercase">
              {hotel.country} • {hotel.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              Eco Score: {hotel.ecoScore}/10
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300" /> {hotel.rating} ({hotel.reviewsCount} reviews)
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5EBE0] leading-tight">
            {hotel.name}
          </h1>

          <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37]">
            <MapPin className="w-4 h-4" />
            <span>{hotel.location}</span>
          </div>
        </div>

        {/* Multi-Photo Gallery Grid */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-auto md:h-96">
            
            {/* Primary Cover Image */}
            <div
              onClick={() => setSelectedPhoto(hotel.image)}
              className="md:col-span-2 relative rounded-3xl overflow-hidden cursor-pointer group h-72 md:h-full border border-[#2A362E]"
            >
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 rounded-xl text-white text-[10px] font-mono font-bold border border-white/20">
                Primary Cover
              </span>
            </div>

            {/* Sub Gallery Grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3 h-full">
              {hotel.gallery.slice(1, 5).map((photoUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(photoUrl)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group border border-[#2A362E] h-36 md:h-full"
                >
                  <img
                    src={photoUrl}
                    alt={`${hotel.name} ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>

          </div>

          {/* Gallery Bar Controls */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#F5EBE0]/60">
              Showing {hotel.gallery.length} verified photographic assets
            </span>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#12241A] border border-[#2A362E] hover:border-[#D4AF37] text-[#D4AF37] font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Photo to Gallery
            </button>
          </div>
        </div>

        {/* Detail Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#2A362E] pb-2 overflow-x-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            Overview & Amenities
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'rooms'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            Suites & Room Types ({hotel.roomTypes.length})
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'availability'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            Availability & Stay Calculator
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'location'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            Sanctuary Location & Maps
          </button>
        </div>

        {/* TAB 1: OVERVIEW & AMENITIES */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              {/* Description Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#2A362E] space-y-4">
                <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">About {hotel.name}</h3>
                <p className="text-xs sm:text-sm font-mono text-[#F5EBE0]/80 leading-relaxed">
                  {hotel.description}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[#F5EBE0]/70 border-t border-[#2A362E]">
                  <div>Check-In: <strong className="text-[#D4AF37]">{hotel.checkInTime || '12:00 PM'}</strong></div>
                  <div>Check-Out: <strong className="text-[#D4AF37]">{hotel.checkOutTime || '10:00 AM'}</strong></div>
                  <div>Luxury Tier: <strong className="text-[#D4AF37]">{hotel.tier}</strong></div>
                </div>
              </div>

              {/* Luxury Amenities Grid */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#2A362E] space-y-6">
                <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">Bespoke Lodge Privileges & Amenities</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#12241A] border border-[#2A362E]">
                      <div className="w-8 h-8 rounded-xl bg-[#1E3A2B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#F5EBE0]">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Quick Summary Card */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-6 shadow-xl">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#F5EBE0]/60 uppercase">Starting Base Rate</span>
                  <div className="text-3xl font-serif font-bold text-[#D4AF37]">
                    {formatPrice(hotel.pricePerNight)}
                  </div>
                  <span className="text-[10px] text-[#F5EBE0]/60 font-mono block">per night • inclusive of safari meals</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#2A362E] text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#F5EBE0]/70">Eco Score</span>
                    <span className="font-bold text-emerald-400">{hotel.ecoScore} / 10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F5EBE0]/70">Guest Rating</span>
                    <span className="font-bold text-amber-400">★ {hotel.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F5EBE0]/70">Room Types</span>
                    <span className="font-bold text-white">{hotel.roomTypes.length} Available</span>
                  </div>
                </div>

                <button
                  onClick={() => openBookingModal('hotel', hotel.id)}
                  className="w-full btn-gold py-3.5 rounded-xl font-mono text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Book Stay Instant
                </button>
              </div>

              {/* Direct Concierge Contact Box */}
              <div className="p-6 rounded-3xl bg-[#12241A] border border-[#2A362E] space-y-3 font-mono text-xs">
                <h4 className="font-serif font-bold text-[#D4AF37] text-sm">Lodge Concierge Direct</h4>
                <div className="flex items-center gap-2 text-[#F5EBE0]/80">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <span>{hotel.contactEmail || 'concierge@safariflow.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#F5EBE0]/80">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>{hotel.contactPhone || '+254 700 000 000'}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ROOM TYPES & SUITES */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#181E1A] border border-[#2A362E] space-y-2">
              <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">Suites, Pavilions & Villas</h2>
              <p className="text-xs font-mono text-[#F5EBE0]/70">
                Explore individual room configurations, max occupancy, and suite-specific features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotel.roomTypes.map(room => (
                <div
                  key={room.id}
                  className="rounded-3xl bg-[#181E1A] border border-[#2A362E] overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 rounded-full text-[#D4AF37] text-[10px] font-mono font-bold">
                        {room.sizeSqFt} sq ft • {room.bedType}
                      </span>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-serif font-bold text-[#F5EBE0]">{room.name}</h3>
                        <span className="text-lg font-serif font-bold text-[#D4AF37] shrink-0">
                          {formatPrice(room.pricePerNight)}<span className="text-[10px] font-mono text-[#F5EBE0]/60">/night</span>
                        </span>
                      </div>

                      <p className="text-xs font-mono text-[#F5EBE0]/70">{room.description}</p>

                      <div className="flex items-center gap-4 text-xs font-mono text-[#F5EBE0]/80 pt-2 border-t border-[#2A362E]">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-[#D4AF37]" /> Max Occupancy: {room.maxOccupancy} Guests
                        </span>
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-4 h-4 text-[#D4AF37]" /> {room.availableRooms} Rooms Open
                        </span>
                      </div>

                      {/* Suite Amenities */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {room.amenities.map((am, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-[#12241A] text-[10px] font-mono text-[#D4AF37] border border-[#2A362E]">
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#12241A] border-t border-[#2A362E]">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setActiveTab('availability');
                      }}
                      className="w-full btn-gold py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Select Suite for Rate Calculator
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AVAILABILITY & STAY CALCULATOR */}
        {activeTab === 'availability' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Calculator Controls */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#2A362E] space-y-6 shadow-2xl">
              <div className="border-b border-[#2A362E] pb-4">
                <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">Live Availability & Pricing Calculator</h3>
                <p className="text-xs font-mono text-[#F5EBE0]/70 mt-1">
                  Select stay dates, guest headcount, and suite configuration to calculate real-time reservation costs.
                </p>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                
                {/* Select Suite */}
                <div className="sm:col-span-2">
                  <label className="block text-[#D4AF37] uppercase font-bold mb-2">Select Suite Configuration</label>
                  <select
                    value={selectedRoom.id}
                    onChange={e => {
                      const found = hotel.roomTypes.find(r => r.id === e.target.value);
                      if (found) setSelectedRoom(found);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  >
                    {hotel.roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} - {formatPrice(rt.pricePerNight)} / night
                      </option>
                    ))}
                  </select>
                </div>

                {/* Check-In Date */}
                <div>
                  <label className="block text-[#D4AF37] uppercase font-bold mb-2">Check-In Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={e => setCheckInDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

                {/* Check-Out Date */}
                <div>
                  <label className="block text-[#D4AF37] uppercase font-bold mb-2">Check-Out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={e => setCheckOutDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

                {/* Adults */}
                <div>
                  <label className="block text-[#D4AF37] uppercase font-bold mb-2">Adult Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={adultsCount}
                    onChange={e => setAdultsCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

                {/* Children */}
                <div>
                  <label className="block text-[#D4AF37] uppercase font-bold mb-2">Child Guests</label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={childrenCount}
                    onChange={e => setChildrenCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

              </div>

              {/* Seasonal Rates Notice */}
              {hotel.seasonalRates && hotel.seasonalRates.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#12241A] border border-[#2A362E] space-y-2 font-mono text-xs">
                  <span className="text-[#D4AF37] font-bold block">Seasonal Multipliers Calendar</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {hotel.seasonalRates.map((sr, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#181E1A] border border-[#2A362E]">
                        <span className="block text-[#F5EBE0] font-bold">{sr.seasonName}</span>
                        <span className="block text-[10px] text-[#F5EBE0]/60">{sr.monthRange}</span>
                        <span className="block text-[10px] text-[#D4AF37] font-bold mt-1">Multiplier: {sr.multiplier}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Stay Breakdown Summary */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#D4AF37]/40 space-y-6 shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xl font-serif font-bold text-[#D4AF37]">Stay Cost Breakdown</h4>
                
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-[#F5EBE0]">
                    <span>{selectedRoom.name} ({nights} nights)</span>
                    <span className="font-bold">{formatPrice(roomTotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#F5EBE0]">
                    <span>Park Conservation Fees ($100/night/guest)</span>
                    <span className="font-bold">{formatPrice(conservationParkFee)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#F5EBE0]">
                    <span>Regional Hospitality VAT & Levies (8%)</span>
                    <span className="font-bold">{formatPrice(estimatedTaxes)}</span>
                  </div>

                  <div className="pt-4 border-t border-[#2A362E] flex items-center justify-between text-base font-bold text-[#D4AF37]">
                    <span>Total Stay Cost</span>
                    <span className="text-2xl font-serif">{formatPrice(totalStayCost)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openBookingModal('hotel', hotel.id)}
                className="w-full btn-gold py-4 rounded-xl font-mono text-xs font-bold shadow-xl flex items-center justify-center gap-2 mt-6"
              >
                <Sparkles className="w-4 h-4" /> Reserve Sanctuary Stay Now
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: LOCATION & MAPS */}
        {activeTab === 'location' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#2A362E] space-y-6">
            <div className="border-b border-[#2A362E] pb-4">
              <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">Sanctuary Coordinates & Airstrip Access</h3>
              <p className="text-xs font-mono text-[#F5EBE0]/70 mt-1">
                Aviation and ground route coordinates for bush flight charter arrivals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-[#12241A] border border-[#2A362E] space-y-2">
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold">GPS Coordinates</span>
                <p className="text-base font-serif font-bold text-[#F5EBE0]">
                  {hotel.coordinates?.lat || -1.2721}, {hotel.coordinates?.lng || 34.9621}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#12241A] border border-[#2A362E] space-y-2">
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold">Nearest Bush Airstrip</span>
                <p className="text-sm font-bold text-[#F5EBE0]">Private Heliport & Keekorok / Serena Airstrip (15 min 4x4 transfer)</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#12241A] border border-[#2A362E] space-y-2">
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold">Park Entrance Gate</span>
                <p className="text-sm font-bold text-[#F5EBE0]">Musiara Gate / Oloololo Escarpment Entrance</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#12241A] border border-[#2A362E] text-center space-y-4">
              <Compass className="w-10 h-10 text-[#D4AF37] mx-auto animate-spin" style={{ animationDuration: '20s' }} />
              <p className="text-xs font-mono text-[#F5EBE0]/80">
                Lodge is accessible via direct bush flight charters from Nairobi Wilson Airport, Kilimanjaro, or Kigali.
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${hotel.coordinates?.lat || -1.2721},${hotel.coordinates?.lng || 34.9621}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 btn-gold px-6 py-2.5 rounded-xl text-xs font-bold font-mono"
              >
                Open Google Satellite View <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX PHOTO MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-black/60 text-white hover:text-rose-400"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedPhoto} alt="Full view" className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* UPLOAD PHOTO MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#181E1A] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-6 text-[#F5EBE0]">
            <div className="flex items-center justify-between border-b border-[#2A362E] pb-3">
              <h3 className="text-xl font-serif font-bold text-[#D4AF37]">Upload Photo to Sanctuary Gallery</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase text-[#D4AF37] mb-1">Photo Image URL *</label>
                <input
                  type="url"
                  required
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 rounded-xl border border-[#2A362E]">
                  Cancel
                </button>
                <button type="submit" className="btn-gold px-6 py-2 rounded-xl font-bold">
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TO ITINERARY MODAL */}
      <AddHotelToItineraryModal
        hotel={hotel}
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
      />

    </div>
  );
};
