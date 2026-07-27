import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Play, Pause, MapPin, Calendar } from 'lucide-react';

export const LuxuryHero: React.FC = () => {
  const { navigateTo } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Cinematic hero slides with National Geographic quality imagery
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=3000&q=90",
      title: "Where Legends Roam",
      subtitle: "East Africa's Untamed Wilderness",
      location: "SERENGETI, TANZANIA"
    },
    {
      image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=3000&q=90",
      title: "The Great Migration",
      subtitle: "Nature's Most Spectacular Journey",
      location: "MARA RIVER, KENYA"
    },
    {
      image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=3000&q=90",
      title: "Into the Wild",
      subtitle: "A Sanctuary Unlike Any Other",
      location: "BWINDI FOREST, UGANDA"
    },
    {
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=3000&q=90",
      title: "Summit Dreams",
      subtitle: "Africa's Rooftop Awaits",
      location: "MOUNT KILIMANJARO"
    },
    {
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=3000&q=90",
      title: "Ancient Giants",
      subtitle: "Walk Among Mountain Gorillas",
      location: "VOLCANOES NATIONAL PARK, RWANDA"
    }
  ];

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          setScrollY(window.scrollY - heroRef.current.offsetTop);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section ref={heroRef} className="relative h-screen min-h-[900px] overflow-hidden">
      
      {/* Cinematic Background Layer with Parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center scale-110"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: `scale(${idx === currentSlide ? 1 : 1.15})`,
                transition: 'transform 8s ease-out'
              }}
            />
          </div>
        ))}
        
        {/* Cinematic Color Grading Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510]/40 via-[#2D2621]/20 to-[#2D2621]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0806]/50 via-transparent to-[#0a0806]/30" />
        
        {/* Film Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Cinematic Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0a0806]/80 to-transparent pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          
          {/* Brand Mark - Refined */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-[#C89A4B]/60 flex items-center justify-center backdrop-blur-md bg-[#2D2621]/40">
                <span className="font-cinzel text-[#C89A4B] text-xl font-bold tracking-wider">IA</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-[#C89A4B]/30 animate-pulse" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl text-[#F4E8D5] tracking-[0.25em] font-bold">
                IDENT AFRICA
              </h1>
              <p className="text-[10px] text-[#C89A4B] tracking-[0.3em] uppercase mt-0.5">
                East African Luxury Expeditions
              </p>
            </div>
          </div>

          {/* Navigation - Minimal & Elegant */}
          <nav className="hidden lg:flex items-center gap-8">
            {['Destinations', 'Expeditions', 'Conservancies', 'Experience'].map((item) => (
              <button
                key={item}
                className="text-[11px] font-cinzel text-[#F4E8D5]/80 hover:text-[#C89A4B] tracking-[0.2em] uppercase transition-colors duration-300"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Enquire CTA */}
          <button 
            onClick={() => navigateTo('ai-planner')}
            className="px-6 py-3 bg-transparent border border-[#C89A4B]/60 text-[#C89A4B] text-[10px] font-cinzel tracking-[0.2em] uppercase hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all duration-500 backdrop-blur-md"
          >
            Private Enquiry
          </button>
        </div>
      </div>

      {/* Main Hero Content - Editorial Typography */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-4xl">
            
            {/* Location Badge */}
            <div className="flex items-center gap-3 mb-8 opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
              <div className="w-12 h-px bg-[#C89A4B]" />
              <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.4em] uppercase">
                {heroSlides[currentSlide].location}
              </span>
            </div>

            {/* Main Title - Cinematic Scale */}
            <h2 className="font-cormorant text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#F4E8D5] font-light leading-[0.9] tracking-tight mb-6 opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards]">
              {heroSlides[currentSlide].title.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>

            {/* Subtitle */}
            <p className="font-cormorant text-xl sm:text-2xl md:text-3xl text-[#D3C5AE] italic font-light tracking-wide mb-12 opacity-0 animate-[fadeInUp_1s_ease-out_1.1s_forwards]">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* CTA Buttons - Refined */}
            <div className="flex flex-wrap items-center gap-6 opacity-0 animate-[fadeInUp_1s_ease-out_1.4s_forwards]">
              <button 
                onClick={() => navigateTo('ai-planner')}
                className="group relative px-10 py-4 bg-[#C89A4B] text-[#1a1008] overflow-hidden"
              >
                <span className="relative z-10 font-cinzel text-[11px] tracking-[0.25em] uppercase font-bold">
                  Plan Your Journey
                </span>
                <div className="absolute inset-0 bg-[#D6B06A] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </button>
              
              <button 
                onClick={() => navigateTo('destinations')}
                className="group flex items-center gap-3 text-[#F4E8D5] hover:text-[#C89A4B] transition-colors duration-300"
              >
                <span className="font-cinzel text-[11px] tracking-[0.2em] uppercase">
                  Explore Sanctuaries
                </span>
                <div className="w-12 h-px bg-current transform origin-left group-hover:scale-x-150 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators - Minimal */}
      <div className="absolute bottom-24 right-8 lg:right-16 z-30 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide 
                  ? 'h-8 bg-[#C89A4B]' 
                  : 'bg-[#F4E8D5]/40 hover:bg-[#F4E8D5]/70'
              }`}
            />
          ))}
        </div>
        <span className="font-cinzel text-[10px] text-[#C89A4B] tracking-[0.2em] mt-2">
          {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Bottom Information Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#2D2621]/90 to-transparent pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            
            {/* Quick Facts */}
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#C89A4B]" />
                <div>
                  <span className="text-[10px] text-[#D3C5AE] tracking-[0.15em] uppercase block">Countries</span>
                  <span className="text-sm font-cormorant text-[#F4E8D5]">Kenya • Tanzania • Uganda • Rwanda</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#C89A4B]" />
                <div>
                  <span className="text-[10px] text-[#D3C5AE] tracking-[0.15em] uppercase block">Best Season</span>
                  <span className="text-sm font-cormorant text-[#F4E8D5]">July — October</span>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="flex items-center gap-3 animate-bounce-slow">
              <span className="text-[10px] font-cinzel text-[#D3C5AE] tracking-[0.2em] uppercase">
                Scroll
              </span>
              <ChevronDown className="w-4 h-4 text-[#C89A4B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Video Control */}
      <button
        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
        className="absolute bottom-24 left-8 z-30 p-3 border border-[#C89A4B]/40 text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all duration-300 backdrop-blur-md"
      >
        {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-[fadeInUp_1s_ease-out_0.5s_forwards] {
          animation: fadeInUp 1s ease-out 0.5s forwards;
        }
        .animate-[fadeInUp_1s_ease-out_0.8s_forwards] {
          animation: fadeInUp 1s ease-out 0.8s forwards;
        }
        .animate-[fadeInUp_1s_ease-out_1.1s_forwards] {
          animation: fadeInUp 1s ease-out 1.1s forwards;
        }
        .animate-[fadeInUp_1s_ease-out_1.4s_forwards] {
          animation: fadeInUp 1s ease-out 1.4s forwards;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </section>
  );
};
