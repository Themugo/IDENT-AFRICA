import React from 'react';
import { useApp } from '../../context/AppContext';
import { AcaciaTreeIcon } from './AcaciaTreeIcon';
import { ShieldCheck, Mail, MapPin, Phone, Sparkles, Award, ChevronRight, Globe, Compass, Calendar, Building2, Home, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, currentPage } = useApp();

  // Context-aware related pages based on current page
  const getRelatedPages = () => {
    switch (currentPage) {
      case 'destination-detail':
        return [
          { label: 'View All Sanctuaries', page: 'destinations' as const },
          { label: 'Luxury Lodges Nearby', page: 'hotels' as const },
          { label: 'Plan Expedition', page: 'ai-planner' as const }
        ];
      case 'hotel-detail':
        return [
          { label: 'View All Lodges', page: 'hotels' as const },
          { label: 'Compare Accommodations', page: 'compare-hotels' as const },
          { label: 'Plan Your Stay', page: 'ai-planner' as const }
        ];
      case 'itineraries':
      case 'itinerary-detail':
        return [
          { label: 'Explore Sanctuaries', page: 'destinations' as const },
          { label: 'Luxury Lodges', page: 'hotels' as const },
          { label: 'Build Custom Trip', page: 'itinerary-builder' as const }
        ];
      case 'ai-planner':
      case 'itinerary-builder':
        return [
          { label: 'Featured Expeditions', page: 'itineraries' as const },
          { label: 'Lodge Collection', page: 'hotels' as const },
          { label: 'My Portfolio', page: 'user-dashboard' as const }
        ];
      default:
        return [
          { label: 'Plan Your Safari', page: 'ai-planner' as const },
          { label: 'Build Itinerary', page: 'itinerary-builder' as const },
          { label: 'My Bookings', page: 'my-bookings' as const }
        ];
    }
  };

  const relatedPages = getRelatedPages();

  return (
    <footer className="bg-[#2D2621] text-[#F4E8D5] border-t-2 border-[#C89A4B]/50 pt-16 pb-12 texture-leather relative overflow-hidden">
      {/* Sunset Glow Background Accent */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#C89A4B]/15 via-[#463D34]/40 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Context-Aware Quick Navigation */}
        <div className="mb-12 p-6 bg-[#463D34]/50 rounded-2xl border border-[#C89A4B]/30">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-[#C89A4B]" />
            <span className="text-[11px] font-cinzel text-[#D6B06A] tracking-[0.2em] uppercase">
              Continue Exploring
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPages.map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigateTo(item.page)}
                className="group flex items-center justify-between p-4 bg-[#2D2621] rounded-xl border border-[#C89A4B]/20 hover:border-[#C89A4B] transition-all"
              >
                <span className="text-sm text-[#F4E8D5] group-hover:text-[#C89A4B] transition-colors">
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4 text-[#C89A4B] transform group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#C89A4B]/30">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF8EC] text-[#2D2621] flex items-center justify-center p-1 rounded-xl shadow-md border-2 border-[#4F6848]">
                <AcaciaTreeIcon className="w-8 h-8" leafColor="#4F6848" trunkColor="#2D3E2B" />
              </div>
              <span className="text-2xl font-cinzel font-black tracking-tight text-[#F4E8D5]">
                IDENT AFRICA
              </span>
            </div>

            <p className="text-xs text-[#D3C5AE] leading-relaxed max-w-sm font-normal">
              The official digital gateway to East Africa. Compare, plan, and book certified wildlife expeditions, game reserves, and private bush charters with guaranteed conservation impact.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-[10px] text-[#4F6848] font-bold uppercase tracking-wider bg-[#FFF8EC] px-3 py-1.5 border border-[#4F6848]/60 rounded-lg shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4F6848]" />
                <span>100% Certified Rangers</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#D6B06A] font-bold uppercase tracking-wider bg-[#463D34] px-3 py-1.5 border border-[#C89A4B]/50 rounded-lg shadow-sm">
                <Award className="w-3.5 h-3.5 text-[#C89A4B]" />
                <span>Carbon Neutral Expeditions</span>
              </div>
            </div>
          </div>

          {/* Col 2: Destinations */}
          <div>
            <h4 className="text-[11px] font-bold text-[#D6B06A] tracking-widest uppercase mb-4 font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Sanctuaries
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D3C5AE]">
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#C89A4B]/50" />
                  Masai Mara, Kenya
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#C89A4B]/50" />
                  Serengeti, Tanzania
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#C89A4B]/50" />
                  Bwindi Gorilla Forest, Uganda
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#C89A4B]/50" />
                  Ngorongoro Crater, Tanzania
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#C89A4B]/50" />
                  Volcanoes Park, Rwanda
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="text-[11px] font-bold text-[#D6B06A] tracking-widest uppercase mb-4 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Planning Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D3C5AE]">
              <li>
                <button onClick={() => navigateTo('itinerary-builder')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D6B06A]" />
                  Visual Itinerary Builder
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('ai-planner')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#4F6848]" />
                  AI Naturalist Concierge
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('compare')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C89A4B]/70" />
                  Expedition Comparator
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('itineraries')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#C89A4B]/70" />
                  Bespoke Itineraries
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('user-dashboard')} className="hover:text-[#D6B06A] transition-colors cursor-pointer flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#C89A4B]/70" />
                  Traveler Portfolio
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Dispatch & Contact */}
          <div>
            <h4 className="text-[11px] font-bold text-[#D6B06A] tracking-widest uppercase mb-4 font-mono flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Safari Concierge
            </h4>
            <div className="space-y-3 text-xs text-[#D3C5AE]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C89A4B] shrink-0 mt-0.5" />
                <span>Nairobi Lodge Hub, Karen Road, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C89A4B] shrink-0" />
                <span>+254 20 800 SAFARI</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C89A4B] shrink-0" />
                <span>lounge@identafrica.com</span>
              </div>
              <button
                onClick={() => navigateTo('ai-planner')}
                className="mt-4 w-full py-3 px-4 bg-[#C89A4B] text-[#1a1008] font-cinzel text-[10px] uppercase tracking-wider font-bold rounded-lg hover:bg-[#D6B06A] transition-colors"
              >
                Plan Your Safari
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Home className="w-5 h-5 text-[#C89A4B]" />
              <span className="text-[10px] uppercase tracking-wider text-[#D3C5AE]/80">Return to Home</span>
            </button>
            <span className="text-[#C89A4B]/30 hidden lg:block">|</span>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#D3C5AE]/60">
              © 2026 Ident Africa Ecosystem Ltd.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase font-bold tracking-wider text-[#D3C5AE]/60">
            <button onClick={() => navigateTo('home')} className="hover:text-[#D6B06A] transition-colors">Privacy Policy</button>
            <span className="text-[#C89A4B]/30">|</span>
            <button onClick={() => navigateTo('home')} className="hover:text-[#D6B06A] transition-colors">Terms of Service</button>
            <span className="text-[#C89A4B]/30">|</span>
            <button onClick={() => navigateTo('home')} className="hover:text-[#D6B06A] transition-colors">Ranger Ethics</button>
            <span className="text-[#C89A4B]/30">|</span>
            <button onClick={() => navigateTo('supplier-portal')} className="hover:text-[#D6B06A] transition-colors">Partner Portal</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
