import React from 'react';
import { useApp } from '../../context/AppContext';
import { AcaciaTreeIcon } from './AcaciaTreeIcon';
import { Compass, ShieldCheck, Mail, MapPin, Phone, Heart, Sparkles, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-[#2D2621] text-[#F4E8D5] border-t-2 border-[#C89A4B]/50 pt-16 pb-12 texture-leather relative overflow-hidden">
      {/* Sunset Glow Background Accent */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#C89A4B]/15 via-[#463D34]/40 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
            <h4 className="text-[11px] font-bold text-[#D6B06A] tracking-widest uppercase mb-4 font-mono">
              Sanctuaries
            </h4>
            <ul className="space-y-2 text-xs text-[#D3C5AE]">
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Masai Mara, Kenya
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Serengeti, Tanzania
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Bwindi Gorilla Forest, Uganda
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Ngorongoro Crater, Tanzania
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Volcanoes Park, Rwanda
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="text-[11px] font-bold text-[#D6B06A] tracking-widest uppercase mb-4 font-mono">
              Explore & Tools
            </h4>
            <ul className="space-y-2 text-xs text-[#D3C5AE]">
              <li>
                <button onClick={() => navigateTo('itinerary-builder')} className="hover:text-[#D6B06A] transition-colors flex items-center gap-1.5 font-bold text-[#D6B06A] cursor-pointer">
                  <Sparkles className="w-3 h-3 text-[#D6B06A]" />
                  Visual Itinerary Builder
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('ai-planner')} className="hover:text-[#D6B06A] transition-colors flex items-center gap-1.5 text-[#4F6848] bg-[#FFF8EC] px-2 py-0.5 rounded-full font-bold w-fit cursor-pointer">
                  <Sparkles className="w-3 h-3 text-[#4F6848]" />
                  AI Naturalist Concierge
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('compare')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Expedition Comparator
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('itineraries')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Bespoke Itineraries
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('user-dashboard')} className="hover:text-[#D6B06A] transition-colors cursor-pointer">
                  Traveler Portfolio
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Dispatch & Contact */}
          <div>
            <h4 className="text-[11px] font-bold text-[#D6B06A] tracking-widest uppercase mb-4 font-mono">
              Lounge HQ
            </h4>
            <div className="space-y-2.5 text-xs text-[#D3C5AE]">
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
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#D3C5AE]/80 gap-4">
          <p>© 2026 Ident Africa Ecosystem Ltd. Official Digital Gateway to East Africa.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#D6B06A] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#D6B06A] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#D6B06A] cursor-pointer">Ranger Ethics</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
