import React from 'react';
import { Compass } from 'lucide-react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaAction?: () => void;
  ctaSecondaryText?: string;
  ctaSecondaryAction?: () => void;
  centered?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  ctaText,
  ctaAction,
  ctaSecondaryText,
  ctaSecondaryAction,
  centered = true,
  className = '',
}) => {
  return (
    <div
      className={`space-y-3 mb-10 md:mb-14 ${
        centered ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-3xl'
      } ${className}`}
    >
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#D4A94D] bg-[#25362B] px-3.5 py-1.5 rounded-full border border-[#D4A94D]/30 shadow-sm ${
            centered ? 'mx-auto' : ''
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#D4A94D] shrink-0" />
          <span>{eyebrow}</span>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#F7F1E7] tracking-tight leading-tight">
        {title}
      </h2>

      {description && (
        <p className="text-sm sm:text-base text-[#D3C5AE] leading-relaxed font-sans max-w-2xl mx-auto">
          {description}
        </p>
      )}

      {(ctaText || ctaSecondaryText) && (
        <div
          className={`flex flex-wrap items-center gap-3 pt-2 ${
            centered ? 'justify-center' : 'justify-start'
          }`}
        >
          {ctaText && (
            <button
              onClick={ctaAction}
              className="px-6 py-2.5 rounded-xl bg-[#2F4F3E] text-[#FFFBF4] border border-[#D4A94D]/50 hover:bg-[#25362B] hover:border-[#D4A94D] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              {ctaText}
            </button>
          )}

          {ctaSecondaryText && (
            <button
              onClick={ctaSecondaryAction}
              className="px-6 py-2.5 rounded-xl bg-transparent border border-[#D4A94D] text-[#D4A94D] hover:bg-[#D4A94D] hover:text-[#1B2620] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              {ctaSecondaryText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
