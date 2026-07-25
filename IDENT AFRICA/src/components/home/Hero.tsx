import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Star, Award, Compass, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export const Hero: React.FC = () => {
  const { navigateTo } = useApp();

  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedFocus, setSelectedFocus] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('AUGUST 2026');

  // Hero Background Image Slider
  const heroBackgrounds = [
    {
      url: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=2000&q=80",
      caption: "Serengeti & Masai Mara Savannah",
      location: "Kenya & Tanzania"
    },
    {
      url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80",
      caption: "Majestic Elephants at Mt. Kilimanjaro",
      location: "Amboseli National Park"
    },
    {
      url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2000&q=80",
      caption: "Leopard in the Acacia Canopy",
      location: "Samburu & Tarangire"
    },
    {
      url: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=2000&q=80",
      caption: "The Great Wildebeest River Crossing",
      location: "Mara River Triangle"
    },
    {
      url: "https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=2000&q=80",
      caption: "Misty Rainforest Primate Sanctuaries",
      location: "Bwindi & Volcanoes"
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
      caption: "Turquoise Indian Ocean Escapes",
      location: "Zanzibar Archipelago"
    }
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [isBgAutoplay, setIsBgAutoplay] = useState(true);

  // Hero Highlight Cards Slider
  const cardHighlights = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
      tag: "2026 Peak Season Available Slots",
      title: "July 15 — Oct 28",
      subtitle: "River Crossings & Mara Triangle Private Flying Safaris",
      target: "itineraries" as const
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=1200&q=80",
      tag: "Primate Trekking Permits Available",
      title: "Nov 1 — Mar 30",
      subtitle: "Bwindi Impenetrable Forest Gorilla Habituation Expeditions",
      target: "destinations" as const
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      tag: "Guaranteed Luxury Tented Suites",
      title: "Year-Round Private Charters",
      subtitle: "Singita, Angama Mara & &Beyond Exclusive Lodges",
      target: "hotels" as const
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      tag: "Dual Sanctuary Bush & Beach",
      title: "12-Day Masterpiece Journey",
      subtitle: "Serengeti Big Five Game Drive + Zanzibar Private Dhow Cruise",
      target: "itineraries" as const
    }
  ];

  const [cardIndex, setCardIndex] = useState(0);

  // Auto advance background slider
  useEffect(() => {
    if (!isBgAutoplay) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isBgAutoplay, heroBackgrounds.length]);

  // Auto advance card slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCardIndex((prev) => (prev + 1) % cardHighlights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [cardHighlights.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('destinations');
  };

  const nextBg = () => {
    setBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
  };

  const prevBg = () => {
    setBgIndex((prev) => (prev - 1 + heroBackgrounds.length) % heroBackgrounds.length);
  };

  const nextCard = () => {
    setCardIndex((prev) => (prev + 1) % cardHighlights.length);
  };

  const prevCard = () => {
    setCardIndex((prev) => (prev - 1 + cardHighlights.length) % cardHighlights.length);
  };

  return (
    <section className="relative min-h-[90vh] bg-[#2E2015] text-[#F4E8D5] border-b border-[#C89A4B]/30 overflow-hidden">
      
      {/* Background Majestic Wildlife Image Slider */}
      <div className="absolute inset-0 z-0">
        {heroBackgrounds.map((bg, idx) => (
          <div
            key={bg.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === bgIndex ? 'opacity-40 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={bg.url}
              alt={bg.caption}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        {/* Warm Sunset Dust Atmosphere Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E2015] via-[#2E2015]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2015] via-transparent to-[#2E2015]/70" />

        {/* Slider Controls Overlay Bottom Left */}
        <div className="absolute bottom-6 left-6 sm:left-14 z-20 flex items-center gap-3 bg-[#2E2015]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#C89A4B]/30 text-xs text-[#D3C5AE]">
          <button
            onClick={prevBg}
            className="p-1 hover:text-[#D6B06A] transition-colors"
            title="Previous Background"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-[10px] text-[#D6B06A] font-bold">
            0{bgIndex + 1} / 0{heroBackgrounds.length}
          </span>

          <button
            onClick={nextBg}
            className="p-1 hover:text-[#D6B06A] transition-colors"
            title="Next Background"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-3 bg-[#C89A4B]/40 mx-1" />

          <button
            onClick={() => setIsBgAutoplay(!isBgAutoplay)}
            className="p-1 hover:text-[#D6B06A] transition-colors"
            title={isBgAutoplay ? "Pause Background Slideshow" : "Play Background Slideshow"}
          >
            {isBgAutoplay ? <Pause className="w-3 h-3 text-[#D6B06A]" /> : <Play className="w-3 h-3 text-[#D6B06A]" />}
          </button>

          <span className="hidden sm:inline-block text-[10px] text-[#D3C5AE]/80 tracking-wider">
            {heroBackgrounds[bgIndex].caption} ({heroBackgrounds[bgIndex].location})
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[90vh]">
        
        {/* Left Column: Bold Editorial Hero Title & Banner */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-r border-[#C89A4B]/20 space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4B321F]/80 border border-[#C89A4B]/40 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#D6B06A] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D6B06A]">
                East Africa • Serengeti & Masai Mara
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif leading-[0.88] tracking-tight mb-8">
              The Great <br />
              <span className="italic font-editorial font-light text-[#D6B06A] drop-shadow-md">
                Migration
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[#D3C5AE] font-light">
              Experience the raw elegance of East Africa. A curated ecosystem for the modern adventurer who demands precision and prestige.
            </p>
          </div>

          {/* Interactive Feature Highlight Banner Card Slider */}
          <div className="relative border border-[#C89A4B]/40 rounded-2xl overflow-hidden shadow-2xl bg-[#4B321F]/90 backdrop-blur-md">
            
            {/* Card Content Slider */}
            <div className="flex flex-col sm:flex-row gap-0 items-stretch">
              <div className="flex-1 p-6 sm:p-7 relative overflow-hidden min-h-[140px] flex flex-col justify-center">
                
                {/* Background Image for Card Slide */}
                {cardHighlights.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === cardIndex ? 'opacity-30 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
                
                <div className="absolute inset-0 bg-gradient-to-r from-[#2E2015] via-[#4B321F]/85 to-transparent" />
                
                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D6B06A] block">
                      {cardHighlights[cardIndex].tag}
                    </span>
                    
                    {/* Navigation Arrows for Card */}
                    <div className="flex items-center gap-1 bg-[#2E2015]/80 p-1 rounded-lg border border-[#C89A4B]/30">
                      <button
                        onClick={prevCard}
                        className="p-1 hover:text-[#D6B06A] transition-colors text-[#F4E8D5]"
                        title="Previous Highlight"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[9px] font-mono text-[#D6B06A] px-1 font-bold">
                        {cardIndex + 1}/{cardHighlights.length}
                      </span>
                      <button
                        onClick={nextCard}
                        className="p-1 hover:text-[#D6B06A] transition-colors text-[#F4E8D5]"
                        title="Next Highlight"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-2xl sm:text-3xl font-serif text-[#F4E8D5] font-bold">
                    {cardHighlights[cardIndex].title}
                  </p>
                  <p className="text-[11px] text-[#D3C5AE] pt-0.5 max-w-md">
                    {cardHighlights[cardIndex].subtitle}
                  </p>
                </div>
              </div>
              
              {/* AI Planner Vertical Tab Button */}
              <button
                onClick={() => navigateTo('ai-planner')}
                className="bg-gradient-to-b from-[#C89A4B] to-[#B38338] text-[#2E2015] hover:from-[#D6B06A] hover:to-[#C89A4B] transition-all cursor-pointer flex items-center justify-center p-4 text-center font-bold border-l border-[#C89A4B]/50 group"
              >
                <span className="sm:rotate-90 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.25em] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#2E2015]" />
                  <span>AI Planner →</span>
                </span>
              </button>
            </div>

            {/* Slide Progress Dots */}
            <div className="bg-[#2E2015]/90 px-6 py-2 flex items-center gap-2 border-t border-[#C89A4B]/20">
              {cardHighlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCardIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === cardIndex ? 'w-6 bg-[#D6B06A]' : 'w-2 bg-[#6B4E34]/60 hover:bg-[#C89A4B]'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>

        {/* Right Column: Search Widget (Parchment Texture Explorer Panel) */}
        <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 border-t lg:border-t-0 border-[#C89A4B]/20 relative">
          
          <div className="texture-parchment rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-[#C89A4B]/60 text-[#2E2015] relative overflow-hidden">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[#6B4E34]/20 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4B321F] font-cinzel">
                Expedition Search Engine
              </h2>
              <span className="text-[10px] bg-[#4B321F] text-[#D6B06A] px-2.5 py-1 font-bold uppercase tracking-wider rounded border border-[#C89A4B]">
                Ranger Verified
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-5">
              
              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#4B321F] block">
                  Sanctuary / Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-[#F4E8D5] text-[#2E2015] border border-[#6B4E34]/40 p-3 text-xs font-bold uppercase tracking-wider rounded-xl focus:outline-none focus:border-[#C89A4B]"
                >
                  <option value="All">All East Africa</option>
                  <option value="Kenya">Kenya (Masai Mara & Amboseli)</option>
                  <option value="Tanzania">Tanzania (Serengeti & Ngorongoro)</option>
                  <option value="Uganda">Uganda (Bwindi Gorilla Forest)</option>
                  <option value="Rwanda">Rwanda (Volcanoes National Park)</option>
                </select>
              </div>

              {/* Wildlife Priority */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#4B321F] block">
                  Wildlife Encounter Focus
                </label>
                <select
                  value={selectedFocus}
                  onChange={(e) => setSelectedFocus(e.target.value)}
                  className="w-full bg-[#F4E8D5] text-[#2E2015] border border-[#6B4E34]/40 p-3 text-xs font-bold uppercase tracking-wider rounded-xl focus:outline-none focus:border-[#C89A4B]"
                >
                  <option value="All">All Encounters</option>
                  <option value="The Big Five">The Big Five</option>
                  <option value="Great Wildebeest Migration">Wildebeest River Crossings</option>
                  <option value="Mountain Gorillas & Primates">Gorilla Trekking</option>
                  <option value="Marine & Coral Reefs">Bush & Beach Retreats</option>
                </select>
              </div>

              {/* Month */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#4B321F] block">
                  Travel Month (2026)
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-[#F4E8D5] text-[#2E2015] border border-[#6B4E34]/40 p-3 text-xs font-bold uppercase tracking-wider rounded-xl focus:outline-none focus:border-[#C89A4B]"
                >
                  {['JANUARY 2026', 'FEBRUARY 2026', 'MARCH 2026', 'APRIL 2026', 'MAY 2026', 'JUNE 2026', 'JULY 2026', 'AUGUST 2026', 'SEPTEMBER 2026', 'OCTOBER 2026', 'NOVEMBER 2026', 'DECEMBER 2026'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1008] text-[#F4E8D5] hover:bg-[#C89A4B] hover:text-[#2E2015] py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg border border-[#C89A4B]/40"
              >
                <Search className="w-4 h-4 text-[#C89A4B]" />
                <span>Search Luxury Expeditions</span>
              </button>
            </form>

            {/* Quick Stats Grid inside Parchment Panel */}
            <div className="pt-5 border-t border-[#6B4E34]/30 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] uppercase font-bold text-[#6B4E34] tracking-widest">
                  Eco-Rating Average
                </p>
                <p className="text-2xl font-serif font-bold text-[#2E2015]">
                  9.8 / 10
                </p>
                <div className="flex text-[#C89A4B] text-xs gap-0.5 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold text-[#6B4E34] tracking-widest">
                  Ranger Certified
                </p>
                <p className="text-2xl font-serif font-bold text-[#2E2015]">
                  100%
                </p>
                <p className="text-[10px] text-[#4B321F] font-bold flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-[#C89A4B]" />
                  <span>Verified Partners</span>
                </p>
              </div>
            </div>

          </div>

          {/* Map Overlay Graphic on Far Right Side Margin */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-8 py-6 opacity-40 text-[10px] font-mono text-[#D6B06A] tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C89A4B]" />
              <span>KENYA</span>
            </div>
            <div className="w-px h-12 bg-dashed border-r border-[#C89A4B]/50" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C89A4B]" />
              <span>UGANDA</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};


