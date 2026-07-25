import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_LODGES } from '../../data/mockData';
import { DetailHeroSkeleton } from '../common/Skeleton';
import {
  MapPin,
  Star,
  Calendar,
  Compass,
  Trees,
  ShieldCheck,
  Heart,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BedDouble,
  DollarSign,
  Sun,
  Flame,
  CloudRain,
  Thermometer,
  Wind,
  Phone,
  Globe,
  Navigation,
  Camera,
  Briefcase,
  AlertCircle,
  Plus,
  Maximize2,
  X,
  Layers,
  Binoculars,
  Info,
} from 'lucide-react';

export const DestinationDetail: React.FC = () => {
  const {
    destinations,
    selectedDestinationId,
    navigateTo,
    formatPrice,
    savedDestinationIds,
    toggleSaveDestination,
    openBookingModal,
    addGalleryPhoto,
    user,
  } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedDestinationId]);

  const dest = destinations.find(d => d.id === selectedDestinationId) || destinations[0];
  const [activeImage, setActiveImage] = useState<string>(dest.heroImage || dest.image);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'weather' | 'parkinfo' | 'wildlife' | 'attractions' | 'tips'>('overview');

  const isSaved = savedDestinationIds.includes(dest.id);

  // Find lodges matching country
  const nearbyLodges = MOCK_LODGES.filter(
    l => l.country === dest.country || dest.country === 'Kenya' || dest.country === 'Tanzania'
  ).slice(0, 3);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhotoUrl.trim()) {
      addGalleryPhoto(dest.id, newPhotoUrl.trim());
      setActiveImage(newPhotoUrl.trim());
      setNewPhotoUrl('');
      setUploadModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] dark:bg-[#0F1210]">
        <div className="max-w-7xl mx-auto space-y-8">
          <DetailHeroSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] dark:bg-[#0F1210] text-[#1A1A1A] dark:text-[#F5EBE0] transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigateTo('destinations')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#D4AF37]/30 text-xs font-mono font-semibold text-[#D4AF37] hover:bg-[#1E3A2B] hover:text-white transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sanctuaries
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A2B] border border-[#D4AF37]/40 text-xs font-mono font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F1210] transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Photo to Gallery
            </button>

            <button
              onClick={() => toggleSaveDestination(dest.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono font-semibold transition-all shadow-sm ${
                isSaved
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-[#181E1A] border-[#E6D5C3] dark:border-[#D4AF37]/30 text-[#D4AF37]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved to Favorites' : 'Save Sanctuary'}
            </button>
          </div>
        </div>

        {/* Hero Gallery Section */}
        <div className="space-y-4">
          <div className="relative h-[420px] sm:h-[520px] rounded-3xl overflow-hidden border border-[#E6D5C3] dark:border-[#D4AF37]/30 shadow-2xl group">
            <img
              src={activeImage}
              alt={dest.name}
              className="w-full h-full object-cover transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-6 right-6 p-3 rounded-full bg-black/60 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-[#0F1210] backdrop-blur-md transition-all shadow-lg"
              title="Expand Photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Top Badges */}
            <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-[#12241A]/90 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold backdrop-blur-md">
                {dest.country} • {dest.category}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#D4AF37] text-[#0F1210] text-xs font-mono font-bold">
                Eco Rating: {dest.ecoScore}/10
              </span>
            </div>

            {/* Title Over Overlay */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
              <div>
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{dest.rating}</span>
                  <span>({dest.reviewsCount} Verified Reviews)</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                  {dest.name}
                </h1>
                <p className="text-sm sm:text-base text-[#D4AF37] font-mono mt-1">
                  {dest.tagline}
                </p>
              </div>

              <div className="bg-[#12241A]/90 p-4 rounded-2xl border border-[#D4AF37]/40 backdrop-blur-md text-right shrink-0">
                <span className="text-[10px] uppercase font-mono text-[#F5EBE0]/70 block">Starting From</span>
                <span className="text-3xl font-serif font-bold text-[#D4AF37]">
                  {formatPrice(dest.startingPrice)}
                </span>
                <span className="block text-[10px] text-emerald-400 font-mono mt-0.5">
                  / guest (Includes Park Entry)
                </span>
              </div>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {dest.gallery.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative w-28 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImage === imgUrl ? 'border-[#D4AF37] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Gallery ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#E6D5C3] dark:border-[#2A362E] pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Sanctuary Overview', icon: Compass },
            { id: 'weather', label: 'Weather & Climate', icon: Sun },
            { id: 'parkinfo', label: 'Park Rules & Permits', icon: ShieldCheck },
            { id: 'wildlife', label: 'Wildlife Tracking', icon: Binoculars },
            { id: 'attractions', label: 'Nearby Attractions', icon: MapPin },
            { id: 'tips', label: 'Travel & Packing Tips', icon: Briefcase },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1E3A2B] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                    : 'text-[#665E55] dark:text-[#A8A096] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Details Grid (8 cols + 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-4">
                  <h2 className="text-2xl font-serif font-bold">Sanctuary Overview</h2>
                  <p className="text-sm text-[#665E55] dark:text-[#A8A096] leading-relaxed">
                    {dest.description}
                  </p>

                  <div className="pt-4 border-t border-[#E6D5C3] dark:border-[#2A362E]">
                    <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
                      Key Experience Highlights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dest.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#1A1A1A] dark:text-[#F5EBE0]">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Big 5 Probability Bar */}
                <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-serif font-bold">Big 5 Wildlife Probability Index</h2>
                      <p className="text-xs text-[#665E55] dark:text-[#A8A096] mt-1">
                        Based on ranger field tracking and migration cycles.
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono">
                      Ranger Logged
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { animal: 'Lion Prides', key: 'lion', prob: dest.bigFiveProbability.lion },
                      { animal: 'Leopards', key: 'leopard', prob: dest.bigFiveProbability.leopard },
                      { animal: 'African Elephants', key: 'elephant', prob: dest.bigFiveProbability.elephant },
                      { animal: 'Black / White Rhinos', key: 'rhino', prob: dest.bigFiveProbability.rhino },
                      { animal: 'Cape Buffaloes', key: 'buffalo', prob: dest.bigFiveProbability.buffalo },
                    ].map((item) => (
                      <div key={item.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-semibold">{item.animal}</span>
                          <span className="text-[#D4AF37] font-bold">{item.prob}% Sighting Rate</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#E6D5C3] dark:bg-[#12241A] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1E3A2B] via-[#D4AF37] to-amber-400 transition-all duration-1000"
                            style={{ width: `${item.prob}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WEATHER WIDGET */}
            {activeTab === 'weather' && (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-amber-500 text-xs font-mono font-bold uppercase">
                    <Sun className="w-4 h-4" /> Live Meteorological Intelligence
                  </div>
                  <h2 className="text-3xl font-serif font-bold mt-1">Weather & Seasonal Climate</h2>
                  <p className="text-xs text-[#665E55] dark:text-[#A8A096]">
                    Plan around dry bush seasons and migration weather patterns.
                  </p>
                </div>

                {/* Weather Highlights Cards */}
                {dest.weather ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] text-center space-y-1">
                        <Thermometer className="w-5 h-5 text-[#D4AF37] mx-auto" />
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">Current Temp</span>
                        <span className="text-2xl font-serif font-bold text-[#D4AF37]">{dest.weather.currentTempC}°C</span>
                        <span className="text-[10px] font-mono text-[#665E55] dark:text-[#A8A096] block">{dest.weather.condition}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] text-center space-y-1">
                        <Sun className="w-5 h-5 text-amber-400 mx-auto" />
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">Day / Night</span>
                        <span className="text-2xl font-serif font-bold">{dest.weather.highTempC}°C / {dest.weather.lowTempC}°C</span>
                        <span className="text-[10px] font-mono text-[#665E55] dark:text-[#A8A096] block">Avg High/Low</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] text-center space-y-1">
                        <Wind className="w-5 h-5 text-emerald-500 mx-auto" />
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">Humidity</span>
                        <span className="text-2xl font-serif font-bold">{dest.weather.humidity}%</span>
                        <span className="text-[10px] font-mono text-[#665E55] dark:text-[#A8A096] block">Savanna Air</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] text-center space-y-1">
                        <CloudRain className="w-5 h-5 text-blue-400 mx-auto" />
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">Rainfall</span>
                        <span className="text-2xl font-serif font-bold">{dest.weather.rainfallMm} mm</span>
                        <span className="text-[10px] font-mono text-[#665E55] dark:text-[#A8A096] block">Weekly Total</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-mono flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block uppercase mb-0.5">Seasonal Weather Advice</span>
                        {dest.weather.bestVisitingCondition}
                      </div>
                    </div>

                    {/* Monthly Chart Matrix */}
                    {dest.weather.monthly && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono font-bold uppercase text-[#D4AF37]">
                          Annual Monthly Climate Outlook
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {dest.weather.monthly.map((m) => (
                            <div key={m.month} className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] text-center space-y-1">
                              <span className="text-xs font-mono font-bold block">{m.month}</span>
                              <span className="text-sm font-serif font-bold text-[#D4AF37] block">{m.tempC}°C</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                m.rainfall === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                                m.rainfall === 'Moderate' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {m.rainfall} Rain
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-[#665E55] dark:text-[#A8A096]">Weather details loading...</p>
                )}
              </div>
            )}

            {/* TAB: PARK INFO & RULES */}
            {activeTab === 'parkinfo' && (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono font-bold uppercase">
                    <ShieldCheck className="w-4 h-4" /> Official Park Management
                  </div>
                  <h2 className="text-3xl font-serif font-bold mt-1">Gate Fees, Hours & Conservation Guidelines</h2>
                </div>

                {dest.parkInfo ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E]">
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">Adult Foreign Entry Fee</span>
                        <span className="text-2xl font-serif font-bold text-[#D4AF37]">${dest.parkInfo.entryFeeUSD}</span>
                        <span className="text-[10px] font-mono text-[#665E55] dark:text-[#A8A096] block">per 24 hours</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E]">
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">4x4 Safari Vehicle Permit</span>
                        <span className="text-2xl font-serif font-bold text-[#D4AF37]">${dest.parkInfo.vehicleFeeUSD}</span>
                        <span className="text-[10px] font-mono text-[#665E55] dark:text-[#A8A096] block">per vehicle / entry</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E]">
                        <span className="text-[10px] uppercase font-mono text-[#665E55] dark:text-[#A8A096] block">Total Protected Reserve Area</span>
                        <span className="text-2xl font-serif font-bold text-emerald-500">{dest.parkInfo.totalAreaSqKm} sq km</span>
                        <span className="text-[10px] font-mono text-[#665E55] dark:text-[#A8A096] block">{dest.parkInfo.conservationStatus}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase text-[#D4AF37]">
                        Operating Hours & Strict Regulations
                      </h3>
                      <p className="text-xs font-mono text-[#665E55] dark:text-[#A8A096]">
                        <strong className="text-[#1A1A1A] dark:text-[#F5EBE0]">Gate Schedule:</strong> {dest.parkInfo.operatingHours}
                      </p>

                      <div className="space-y-2">
                        {dest.parkInfo.rules.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#1A1A1A] dark:text-[#F5EBE0] bg-[#FAF7F2] dark:bg-[#12241A] p-3 rounded-xl border border-[#E6D5C3] dark:border-[#2A362E]">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E6D5C3] dark:border-[#2A362E] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <div>
                          <span className="text-[#665E55] dark:text-[#A8A096] block">Ranger HQ Hotline</span>
                          <span className="font-bold">{dest.parkInfo.rangerContact}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-[#D4AF37]" />
                        <div>
                          <span className="text-[#665E55] dark:text-[#A8A096] block">Official Reserve Portal</span>
                          <a href={dest.parkInfo.officialWebsite} target="_blank" rel="noreferrer" className="text-[#D4AF37] font-bold underline">
                            {dest.parkInfo.officialWebsite}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#665E55] dark:text-[#A8A096]">Park info loading...</p>
                )}
              </div>
            )}

            {/* TAB: WILDLIFE */}
            {activeTab === 'wildlife' && (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-mono font-bold uppercase">
                    <Binoculars className="w-4 h-4" /> Ranger Species Database
                  </div>
                  <h2 className="text-3xl font-serif font-bold mt-1">Wildlife Species & Sighting Intelligence</h2>
                </div>

                <div className="space-y-4">
                  {dest.wildlifeInfo && dest.wildlifeInfo.length > 0 ? (
                    dest.wildlifeInfo.map((item) => (
                      <div key={item.id} className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#F5EBE0]">{item.species}</h3>
                          <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono font-bold">
                            {item.sightingProbability} ({item.probabilityPercentage}%)
                          </span>
                        </div>
                        <p className="text-xs text-[#665E55] dark:text-[#A8A096]">{item.description}</p>
                        <div className="text-[11px] font-mono text-[#D4AF37] flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5" /> Best Spotting Window: {item.bestSpottingTime}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#665E55] dark:text-[#A8A096]">No additional wildlife entries available.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ATTRACTIONS & MAP */}
            {activeTab === 'attractions' && (
              <div className="space-y-8">
                {/* Embedded Map Simulation */}
                <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-serif font-bold">Sanctuary Coordinates & Map</h2>
                      <p className="text-xs font-mono text-[#665E55] dark:text-[#A8A096]">
                        Lat: {dest.coordinates.lat} | Lng: {dest.coordinates.lng} ({dest.region}, {dest.country})
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono">
                      GPS Waypoint
                    </span>
                  </div>

                  <div className="relative h-64 rounded-2xl overflow-hidden border border-[#E6D5C3] dark:border-[#2A362E] bg-[#12241A] flex items-center justify-center text-center p-6 text-white">
                    <img
                      src={dest.image}
                      alt="Map background"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[1px]"
                    />
                    <div className="relative z-10 space-y-3">
                      <MapPin className="w-10 h-10 text-[#D4AF37] mx-auto animate-bounce" />
                      <div>
                        <h3 className="font-serif text-lg font-bold">{dest.name}</h3>
                        <p className="text-xs font-mono text-[#D4AF37]">{dest.region}, {dest.country}</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${dest.coordinates.lat},${dest.coordinates.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0F1210] text-xs font-mono font-bold hover:bg-amber-300 transition-colors shadow-lg"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>

                {/* Nearby Attractions List */}
                <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-6">
                  <h2 className="text-2xl font-serif font-bold">Nearby Landmarks & Attractions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dest.nearbyAttractions && dest.nearbyAttractions.length > 0 ? (
                      dest.nearbyAttractions.map((att) => (
                        <div key={att.id} className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">{att.type}</span>
                            <span className="text-xs font-mono text-emerald-500 font-bold">{att.distanceKm} km away</span>
                          </div>
                          <h3 className="text-base font-serif font-bold">{att.name}</h3>
                          <p className="text-xs text-[#665E55] dark:text-[#A8A096]">{att.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#665E55] dark:text-[#A8A096]">No nearby landmark information provided.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TRAVEL TIPS */}
            {activeTab === 'tips' && (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-mono font-bold uppercase">
                    <Briefcase className="w-4 h-4" /> Expedition Preparation
                  </div>
                  <h2 className="text-3xl font-serif font-bold mt-1">Traveler Tips & Packing Guidelines</h2>
                </div>

                <div className="space-y-4">
                  {dest.travelTips && dest.travelTips.length > 0 ? (
                    dest.travelTips.map((tip) => (
                      <div key={tip.id} className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] space-y-2">
                        <span className="px-2.5 py-1 rounded bg-[#1E3A2B] text-[#D4AF37] text-[10px] font-mono font-bold uppercase">
                          {tip.category}
                        </span>
                        <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#F5EBE0]">{tip.title}</h3>
                        <p className="text-xs text-[#665E55] dark:text-[#A8A096] leading-relaxed">{tip.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#665E55] dark:text-[#A8A096]">No travel tips provided.</p>
                  )}
                </div>
              </div>
            )}

            {/* Nearby Luxury Lodges */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold">Premier Nearby Lodges & Camps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nearbyLodges.map((lodge) => (
                  <div
                    key={lodge.id}
                    className="rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] p-5 shadow-lg space-y-3"
                  >
                    <img src={lodge.image} alt={lodge.name} className="w-full h-36 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">{lodge.tier}</span>
                      <h3 className="text-lg font-serif font-bold">{lodge.name}</h3>
                      <p className="text-xs text-[#665E55] dark:text-[#A8A096] mt-1">{lodge.description}</p>
                    </div>
                    <div className="pt-2 border-t border-[#E6D5C3] dark:border-[#2A362E] flex items-center justify-between text-xs">
                      <span className="font-mono text-[#D4AF37] font-bold">{formatPrice(lodge.pricePerNight)} / night</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">★ {lodge.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar Booking & Seasons Box (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Booking Action Box */}
            <div className="p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/40 shadow-2xl space-y-6 sticky top-28">
              
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                  Reserve Expedition
                </span>
                <h3 className="text-2xl font-serif font-bold">
                  Book {dest.name} Safari
                </h3>
                <p className="text-xs text-[#F5EBE0]/80">
                  Instant reservation inquiry with VIP ranger dispatch and guaranteed lodge availability.
                </p>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 flex items-center justify-between">
                <span className="text-xs font-mono text-[#F5EBE0]/70">Package Rate</span>
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                    {formatPrice(dest.startingPrice)}
                  </span>
                  <span className="block text-[10px] text-[#F5EBE0]/60">per person</span>
                </div>
              </div>

              {/* Best Seasons Pill Box */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Optimal Months
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dest.bestMonths.map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#1E3A2B] text-[#D4AF37] border border-[#D4AF37]/30">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openBookingModal('destination', dest.id)}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold shadow-xl"
              >
                Inquire & Book Reserve
              </button>

              <div className="text-center pt-2">
                <button
                  onClick={() => navigateTo('ai-planner')}
                  className="text-xs text-[#D4AF37] hover:underline font-mono flex items-center justify-center gap-1 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Customize with AI Safari Planner
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt={dest.name}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Upload Photo Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#181E1A] text-[#F5EBE0] p-6 rounded-3xl border border-[#D4AF37]/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2A362E] pb-4">
              <h3 className="text-xl font-serif font-bold text-[#D4AF37]">Add Photo to Gallery</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#D4AF37] mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {newPhotoUrl && (
                <div className="relative h-40 rounded-xl overflow-hidden border border-[#2A362E]">
                  <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#2A362E] text-xs font-mono text-[#F5EBE0]/80 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 rounded-xl text-xs font-bold font-mono"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

