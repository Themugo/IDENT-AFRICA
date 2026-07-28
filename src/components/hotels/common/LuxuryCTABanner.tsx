import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles, Calendar } from 'lucide-react';

interface LuxuryCTABannerProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export const LuxuryCTABanner: React.FC<LuxuryCTABannerProps> = ({
  title = 'Begin Your Tailor-Made East African Safari',
  subtitle = 'Connect directly with our Senior Safari Concierge team in Nairobi to curate your private expedition, luxury lodges, and charter flights.',
  primaryButtonText = 'Plan Custom Safari',
  secondaryButtonText = 'Explore Safari Circuits',
}) => {
  const { navigateTo, openBookingModal } = useApp();

  return (
    <section className="relative w-full bg-[#101913] text-[#F7F1E7] py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#D4A94D]/40 overflow-hidden texture-leather">
      {/* Decorative Gold Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4A94D]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#25362B] border border-[#D4A94D]/40 text-[#D4A94D] text-xs font-mono font-bold uppercase tracking-widest shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A94D]" />
          <span>Bespoke Private Concierge</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#F7F1E7] tracking-tight leading-tight max-w-3xl mx-auto">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#D3C5AE] max-w-2xl mx-auto font-sans leading-relaxed">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigateTo('ai-planner')}
            className="px-8 py-3.5 rounded-xl bg-[#2F4F3E] text-[#FFFBF4] border-2 border-[#D4A94D] hover:bg-[#D4A94D] hover:text-[#1B2620] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 cursor-pointer group"
          >
            <Calendar className="w-4 h-4 text-[#D4A94D] group-hover:text-[#1B2620]" />
            <span>{primaryButtonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigateTo('itineraries')}
            className="px-8 py-3.5 rounded-xl bg-[#1B2620] border border-[#D4A94D] text-[#D4A94D] hover:bg-[#25362B] hover:text-[#FFFBF4] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>{secondaryButtonText}</span>
          </button>
        </div>

        {/* Guarantee Note */}
        <p className="text-[11px] font-mono text-[#D3C5AE]/70 pt-2">
          ⚡ 100% Flexible Booking Terms • Free Cancellation up to 30 Days Prior • Guaranteed Wildlife Sightings
        </p>

      </div>
    </section>
  );
};
