import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, ShieldCheck, Mail, MapPin, Phone, Heart, Sparkles, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-[#1A1A1A] text-[#F5E6D3] border-t border-[#1A1A1A] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C89A4B] to-[#4B321F] text-[#2E2015] flex items-center justify-center text-xs font-serif font-black shadow-md border border-[#D6B06A]/50">
                IA
              </div>
              <span className="text-2xl font-cinzel font-black tracking-tight text-[#C89A4B]">
                IDENT AFRICA
              </span>
            </div>

            <p className="text-xs text-[#F4E8D5]/70 leading-relaxed max-w-sm">
              The premier East African luxury safari ecosystem. Compare, plan, and book certified wildlife expeditions, game reserves, and private bush charters with guaranteed conservation impact.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-[10px] text-[#D6B06A] font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 border border-white/10 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C89A4B]" />
                <span>100% Certified Rangers</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#D6B06A] font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 border border-white/10 rounded">
                <Award className="w-3.5 h-3.5 text-[#C89A4B]" />
                <span>Carbon Neutral Expeditions</span>
              </div>
            </div>
          </div>

          {/* Col 2: Destinations */}
          <div>
            <h4 className="text-[11px] font-bold text-[#C5A059] tracking-widest uppercase mb-4">
              Sanctuaries
            </h4>
            <ul className="space-y-2 text-xs text-[#F5E6D3]/80">
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#C5A059] transition-colors">
                  Masai Mara, Kenya
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#C5A059] transition-colors">
                  Serengeti, Tanzania
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#C5A059] transition-colors">
                  Bwindi Gorilla Forest, Uganda
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#C5A059] transition-colors">
                  Ngorongoro Crater, Tanzania
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('destinations')} className="hover:text-[#C5A059] transition-colors">
                  Volcanoes Park, Rwanda
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="text-[11px] font-bold text-[#C5A059] tracking-widest uppercase mb-4">
              Explore & Tools
            </h4>
            <ul className="space-y-2 text-xs text-[#F5E6D3]/80">
              <li>
                <button onClick={() => navigateTo('itinerary-builder')} className="hover:text-[#C5A059] transition-colors flex items-center gap-1.5 font-bold text-[#D6B06A]">
                  <Sparkles className="w-3 h-3 text-[#D6B06A]" />
                  Visual Itinerary Builder
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('ai-planner')} className="hover:text-[#C5A059] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  Gemini AI Naturalist
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('compare')} className="hover:text-[#C5A059] transition-colors">
                  Expedition Comparator
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('itineraries')} className="hover:text-[#C5A059] transition-colors">
                  Bespoke Itineraries
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('user-dashboard')} className="hover:text-[#C5A059] transition-colors">
                  Traveler Portfolio
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Dispatch & Contact */}
          <div>
            <h4 className="text-[11px] font-bold text-[#C5A059] tracking-widest uppercase mb-4">
              Ranger Dispatch HQ
            </h4>
            <div className="space-y-2.5 text-xs text-[#F5E6D3]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Nairobi Hub, Karen Road, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>+254 20 800 SAFARI</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>concierge@safariflow.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#F5E6D3]/50 gap-4">
          <p>© 2026 Ident Africa Ecosystem Ltd. Crafted for African Wildlife Conservation.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#C5A059] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#C5A059] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#C5A059] cursor-pointer">Ranger Ethics</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
