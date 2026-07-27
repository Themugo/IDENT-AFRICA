import React from 'react';
import { Compass, Sparkles, ArrowRight, ShieldCheck, Star } from 'lucide-react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  highlightTitle?: string;
  description: string;
  bgImage?: string;
  primaryCtaText?: string;
  primaryCtaAction?: () => void;
  secondaryCtaText?: string;
  secondaryCtaAction?: () => void;
  stats?: { label: string; value: string }[];
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow = 'East Africa Expedition',
  title,
  highlightTitle,
  description,
  bgImage = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=85',
  primaryCtaText,
  primaryCtaAction,
  secondaryCtaText,
  secondaryCtaAction,
  stats = [
    { label: 'Wildlife Encounters', value: '100% Guaranteed' },
    { label: 'Bespoke Private Lodges', value: '45+ Sanctuaries' },
    { label: 'Ranger Guide Score', value: '4.98 ★★★★★' },
  ],
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-[#101913] text-[#F7F1E7] border-b border-[#D4A94D]/30 min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-between">
      {/* Background Image with Dual Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1] scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101913] via-[#101913]/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101913]/90 via-[#101913]/40 to-transparent" />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16 sm:pb-14 w-full my-auto">
        <div className="max-w-3xl space-y-4">
          
          {/* Eyebrow Label */}
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25362B]/90 border border-[#D4A94D]/50 text-[#D4A94D] text-xs font-mono font-bold uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-[#D4A94D] animate-spin-slow" />
              <span>{eyebrow}</span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#F7F1E7] tracking-tight leading-[1.15]">
            {title}{' '}
            {highlightTitle && (
              <span className="text-[#D4A94D] italic font-editorial font-normal block sm:inline">
                {highlightTitle}
              </span>
            )}
          </h1>

          {/* Short Description */}
          <p className="text-sm sm:text-base md:text-lg text-[#D3C5AE] leading-relaxed font-sans max-w-2xl">
            {description}
          </p>

          {/* Dual Action CTAs */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {primaryCtaText && (
                <button
                  onClick={primaryCtaAction}
                  className="px-6 py-3 rounded-xl bg-[#2F4F3E] text-[#FFFBF4] border-2 border-[#D4A94D] hover:bg-[#D4A94D] hover:text-[#1B2620] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer group"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {secondaryCtaText && (
                <button
                  onClick={secondaryCtaAction}
                  className="px-6 py-3 rounded-xl bg-[#1B2620]/80 backdrop-blur-md border border-[#D4A94D]/60 text-[#D4A94D] hover:text-[#FFFBF4] hover:bg-[#25362B] hover:border-[#D4A94D] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
                >
                  {secondaryCtaText}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Bottom Hero Trust Metrics Bar */}
      {stats && stats.length > 0 && (
        <div className="relative z-10 w-full bg-[#1B2620]/90 backdrop-blur-md border-t border-[#D4A94D]/30 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#D3C5AE]">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A94D] shrink-0" />
                <span className="text-[#F7F1E7] font-bold">{stat.value}</span>
                <span className="text-[#D3C5AE]/80">• {stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
