import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Play, Pause, MapPin, Calendar } from 'lucide-react';

const HERO_SLIDES = [
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

const SLIDE_INTERVAL = 8000;

export const LuxuryHero: React.FC = () => {
  const { navigateTo } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  // Parallax scroll with requestAnimationFrame throttle
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          if (heroRef.current) {
            const rect = heroRef.current.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
              setScrollY(window.scrollY - heroRef.current.offsetTop);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Auto-advance slides (respects pause)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goToSlide = useCallback((idx: number) => {
    setCurrentSlide(idx);
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen min-h-[900px] overflow-hidden">
      
      {/* Cinematic Background Layer with Parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover scale-110"
              style={{
                transform: `scale(${idx === currentSlide ? 1 : 1.15})`,
                transition: 'transform 8s ease-out'
              }}
              loading={idx === 0 ? 'eager' : 'lazy'}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
        
        {/* Cinematic Color Grading Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510]/40 via-[#2D2621]/20 to-[#2D2621]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0806]/50 via-transparent to-[#0a0806]/30" />
      </div>

      {/* Cinematic Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0a0806]/80 to-transparent pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          
          {/* Brand Mark */}
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

          {/* Navigation */}
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

      {/* Main Hero Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-4xl">
            
            {/* Location Badge */}
            <div className="flex items-center gap-3 mb-8 opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
              <div className="w-12 h-px bg-[#C89A4B]" />
              <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.4em] uppercase">
                {HERO_SLIDES[currentSlide].location}
              </span>
            </div>

            {/* Main Title */}
            <h2 className="font-cormorant text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#F4E8D5] font-light leading-[0.9] tracking-tight mb-6 opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards]">
              {HERO_SLIDES[currentSlide].title.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>

            {/* Subtitle */}
            <p className="font-cormorant text-xl sm:text-2xl md:text-3xl text-[#D3C5AE] italic font-light tracking-wide mb-12 opacity-0 animate-[fadeInUp_1s_ease-out_1.1s_forwards]">
              {HERO_SLIDES[currentSlide].subtitle}
            </p>

            {/* CTA Buttons */}
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

      {/* Slide Indicators */}
      <div className="absolute bottom-24 right-8 lg:right-16 z-30 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide 
                  ? 'h-8 bg-[#C89A4B]' 
                  : 'bg-[#F4E8D5]/40 hover:bg-[#F4E8D5]/70'
              }`}
            />
          ))}
        </div>
        <span className="font-cinzel text-[10px] text-[#C89A4B] tracking-[0.2em] mt-2">
          {String(currentSlide + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
        </span>
      </div>

      {/* Bottom Information Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#2D2621]/90 to-transparent pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            
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

            <div className="flex items-center gap-3 animate-bounce-slow">
              <span className="text-[10px] font-cinzel text-[#D3C5AE] tracking-[0.2em] uppercase">
                Scroll
              </span>
              <ChevronDown className="w-4 h-4 text-[#C89A4B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Pause/Play Control — actually pauses/resumes the slider */}
      <button
        onClick={() => setIsPaused((p) => !p)}
        className="absolute bottom-24 left-8 z-30 p-3 border border-[#C89A4B]/40 text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all duration-300 backdrop-blur-md"
        aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
      >
        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </button>

      {/* CSS Animation Keyframes — injected once via style tag */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-\\[fadeInUp_1s_ease-out_0.5s_forwards\\] { animation: fadeInUp 1s ease-out 0.5s forwards; }
        .animate-\\[fadeInUp_1s_ease-out_0.8s_forwards\\] { animation: fadeInUp 1s ease-out 0.8s forwards; }
        .animate-\\[fadeInUp_1s_ease-out_1.1s_forwards\\] { animation: fadeInUp 1s ease-out 1.1s forwards; }
        .animate-\\[fadeInUp_1s_ease-out_1.4s_forwards\\] { animation: fadeInUp 1s ease-out 1.4s forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </section>
  );
};
