import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Star, Award, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

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
    <section className="relative min-h-[68vh] sm:min-h-[72vh] lg:min-h-[74vh] bg-[#463D34] text-[#F4E8D5] border-b border-[#C89A4B]/40 overflow-hidden texture-leather">
      
      {/* Background Majestic Wildlife Image Slider */}
      <div className="absolute inset-0 z-0">
        {heroBackgrounds.map((bg, idx) => (
          <div
            key={bg.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === bgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
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

        {/* Muted Gradient Overlay - Keeps text readable while allowing background photos to shine through brightly */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2621]/65 via-[#2D2621]/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2621]/80 via-transparent to-[#2D2621]/30 pointer-events-none" />

        {/* Direct Side Navigation Arrows for Hero Slideshow - Highly Visible Slider Controls */}
        <button
          onClick={prevBg}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#2D2621]/90 text-[#D6B06A] hover:bg-[#C89A4B] hover:text-[#2D2621] border-2 border-[#C89A4B] shadow-2xl transition-all cursor-pointer group"
          title="Previous Safari Background Photo"
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={nextBg}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#2D2621]/90 text-[#D6B06A] hover:bg-[#C89A4B] hover:text-[#2D2621] border-2 border-[#C89A4B] shadow-2xl transition-all cursor-pointer group"
          title="Next Safari Background Photo"
        >
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Slider Controls Overlay Bottom Left */}
        <div className="absolute bottom-6 left-6 sm:left-16 z-30 flex items-center gap-3 bg-[#2D2621]/95 backdrop-blur-md px-4 py-2.5 rounded-full border-2 border-[#C89A4B] text-xs text-[#F4E8D5] shadow-2xl">
          <button
            onClick={prevBg}
            className="p-1.5 hover:bg-[#C89A4B] hover:text-[#1A1008] rounded-full transition-colors cursor-pointer text-[#D6B06A]"
            title="Previous Background"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-xs text-[#D6B06A] font-bold px-1">
            0{bgIndex + 1} / 0{heroBackgrounds.length}
          </span>

          <button
            onClick={nextBg}
            className="p-1.5 hover:bg-[#C89A4B] hover:text-[#1A1008] rounded-full transition-colors cursor-pointer text-[#D6B06A]"
            title="Next Background"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-[#C89A4B]/60 mx-1" />

          <button
            onClick={() => setIsBgAutoplay(!isBgAutoplay)}
            className="p-1.5 hover:bg-[#C89A4B] hover:text-[#1A1008] rounded-full transition-colors cursor-pointer text-[#D6B06A]"
            title={isBgAutoplay ? "Pause Slideshow" : "Play Slideshow"}
          >
            {isBgAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <span className="hidden sm:inline-block text-[11px] text-[#F4E8D5] tracking-wider font-semibold pl-1">
            {heroBackgrounds[bgIndex].caption} ({heroBackgrounds[bgIndex].location})
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[68vh] sm:min-h-[72vh] lg:min-h-[74vh]">
        
        {/* Left Column: Bold Editorial Hero Title & Banner */}
        <div className="w-full lg:w-7/12 p-5 sm:p-8 lg:p-10 flex flex-col justify-between border-r border-[#C89A4B]/30 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2D2621]/80 border border-[#C89A4B]/60 rounded-full mb-4 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#D6B06A] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D6B06A] font-mono">
                East Africa • Serengeti & Masai Mara
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif leading-[0.95] tracking-tight mb-5 text-[#F4E8D5]">
              The Great <br />
              <span className="italic font-editorial font-light text-[#D6B06A] drop-shadow-sm">
                Migration
              </span>
            </h1>

            <p className="max-w-lg text-[15px] sm:text-base leading-relaxed text-[#D3C5AE] font-medium">
              Experience the raw elegance of East Africa. A curated expedition platform for discerning travelers, connecting wildlife, culture, and conservation.
            </p>
          </div>

          {/* Interactive Feature Highlight Banner Card Slider */}
          <div className="relative border-2 border-[#C89A4B]/80 rounded-2xl overflow-hidden shadow-2xl bg-[#FFF8EC]/75 backdrop-blur-md text-[#2A1E17]">
            
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
                
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8EC]/85 via-[#FFF8EC]/60 to-transparent" />
                
                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4F6848] font-mono block">
                      {cardHighlights[cardIndex].tag}
                    </span>
                    
                    {/* Navigation Arrows for Card */}
                    <div className="flex items-center gap-1 bg-[#E8DCC8]/90 p-1 rounded-lg border border-[#C89A4B]/40">
                      <button
                        onClick={prevCard}
                        className="p-1 hover:text-[#4F6848] transition-colors text-[#2A1E17] cursor-pointer"
                        title="Previous Highlight"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono text-[#2A1E17] px-1 font-bold">
                        {cardIndex + 1}/{cardHighlights.length}
                      </span>
                      <button
                        onClick={nextCard}
                        className="p-1 hover:text-[#4F6848] transition-colors text-[#2A1E17] cursor-pointer"
                        title="Next Highlight"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-2xl sm:text-3xl font-serif text-[#2A1E17] font-bold">
                    {cardHighlights[cardIndex].title}
                  </p>
                  <p className="text-[11px] text-[#5A4738] pt-0.5 max-w-md font-medium">
                    {cardHighlights[cardIndex].subtitle}
                  </p>
                </div>
              </div>
              
              {/* AI Planner Vertical Tab Button - Green used sparingly for AI Concierge */}
              <button
                onClick={() => navigateTo('ai-planner')}
                className="bg-[#4F6848]/90 text-[#FFF8EC] hover:bg-[#2D3E2B] transition-all cursor-pointer flex items-center justify-center p-4 text-center font-bold border-l border-[#C89A4B]/40 group"
              >
                <span className="sm:rotate-90 whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.25em] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6B06A]" />
                  <span>AI Concierge →</span>
                </span>
              </button>
            </div>

            {/* Slide Progress Dots */}
            <div className="bg-[#F5E7D0]/80 px-6 py-2 flex items-center gap-2 border-t border-[#C89A4B]/30">
              {cardHighlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCardIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === cardIndex ? 'w-6 bg-[#C89A4B]' : 'w-2 bg-[#C89A4B]/40 hover:bg-[#C89A4B]'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>

        {/* Right Column: Search Widget (Parchment Texture Explorer Panel) */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 border-[#C89A4B]/30 relative">
          
          <div className="bg-[#FFF8EC]/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl border border-[#C89A4B]/80 text-[#2A1E17] relative overflow-hidden texture-parchment">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[#C89A4B]/30 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4F6848] font-cinzel">
                Expedition Search Engine
              </h2>
              <span className="text-[11px] bg-[#4F6848] text-[#FFF8EC] px-2.5 py-1 font-bold uppercase tracking-wider rounded border border-[#C89A4B]">
                Ranger Verified
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              
              {/* Destination */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#4F6848] block font-mono">
                  Sanctuary / Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-[#F5E7D0] text-[#2A1E17] border border-[#C89A4B]/50 h-9 px-3 text-xs font-bold uppercase tracking-wider rounded-lg focus:outline-none focus:border-[#4F6848]"
                >
                  <option value="All">All East Africa</option>
                  <option value="Kenya">Kenya (Masai Mara & Amboseli)</option>
                  <option value="Tanzania">Tanzania (Serengeti & Ngorongoro)</option>
                  <option value="Uganda">Uganda (Bwindi Gorilla Forest)</option>
                  <option value="Rwanda">Rwanda (Volcanoes National Park)</option>
                </select>
              </div>

              {/* Wildlife Priority */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#4F6848] block font-mono">
                  Wildlife Encounter Focus
                </label>
                <select
                  value={selectedFocus}
                  onChange={(e) => setSelectedFocus(e.target.value)}
                  className="w-full bg-[#F5E7D0] text-[#2A1E17] border border-[#C89A4B]/50 h-9 px-3 text-xs font-bold uppercase tracking-wider rounded-lg focus:outline-none focus:border-[#4F6848]"
                >
                  <option value="All">All Encounters</option>
                  <option value="The Big Five">The Big Five</option>
                  <option value="Great Wildebeest Migration">Wildebeest River Crossings</option>
                  <option value="Mountain Gorillas & Primates">Gorilla Trekking</option>
                  <option value="Marine & Coral Reefs">Bush & Beach Retreats</option>
                </select>
              </div>

              {/* Month */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#4F6848] block font-mono">
                  Travel Month (2026)
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-[#F5E7D0] text-[#2A1E17] border border-[#C89A4B]/50 h-9 px-3 text-xs font-bold uppercase tracking-wider rounded-lg focus:outline-none focus:border-[#4F6848]"
                >
                  {['JANUARY 2026', 'FEBRUARY 2026', 'MARCH 2026', 'APRIL 2026', 'MAY 2026', 'JUNE 2026', 'JULY 2026', 'AUGUST 2026', 'SEPTEMBER 2026', 'OCTOBER 2026', 'NOVEMBER 2026', 'DECEMBER 2026'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn-gold w-full h-10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.15em] shadow-lg cursor-pointer mt-1"
              >
                <Search className="w-3.5 h-3.5 text-[#FFF8EC]" />
                <span>Search Luxury Expeditions</span>
              </button>
            </form>

            {/* Quick Stats Grid inside Parchment Panel */}
            <div className="pt-3 border-t border-[#C89A4B]/30 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase font-bold text-[#5A4738] tracking-widest font-mono">
                  Eco-Rating Average
                </p>
                <p className="text-2xl font-serif font-bold text-[#2A1E17]">
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
                <p className="text-[11px] uppercase font-bold text-[#5A4738] tracking-widest font-mono">
                  Ranger Certified
                </p>
                <p className="text-2xl font-serif font-bold text-[#2A1E17]">
                  100%
                </p>
                <p className="text-[11px] text-[#4F6848] font-bold flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-[#C89A4B]" />
                  <span>Verified Partners</span>
                </p>
              </div>
            </div>

          </div>

          {/* Map Overlay Graphic on Far Right Side Margin */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-8 py-6 opacity-60 text-[11px] font-mono text-[#4F6848] tracking-widest font-bold">
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


