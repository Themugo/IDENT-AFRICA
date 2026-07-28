import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

export interface NavSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface StickySectionNavProps {
  sections: NavSection[];
  title?: string;
}

export const StickySectionNav: React.FC<StickySectionNavProps> = ({ sections, title }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(sections[i].id);
        if (sectionEl) {
          const top = sectionEl.offsetTop;
          if (scrollPosition >= top) {
            setActiveSectionId(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130; // Offset for sticky navbar & section nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!sections || sections.length === 0) return null;

  return (
    <div className="sticky top-[114px] z-30 w-full bg-[#25362B]/95 backdrop-blur-md border-b border-[#D4A94D]/30 text-[#F7F1E7] py-2 px-4 sm:px-6 lg:px-8 shadow-md texture-leather">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Title or Indicator */}
        {title && (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#D4A94D] shrink-0 font-bold uppercase tracking-widest border-r border-[#D4A94D]/20 pr-4">
            <Compass className="w-3.5 h-3.5 text-[#D4A94D]" />
            <span>{title}</span>
          </div>
        )}

        {/* Scrollable Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full text-xs font-mono font-semibold">
          {sections.map((section) => {
            const isActive = activeSectionId === section.id;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#D4A94D] text-[#1B2620] border-[#FFFBF4] font-bold shadow-md scale-105 ring-2 ring-[#D4A94D]/40'
                    : 'bg-[#1B2620] text-[#D3C5AE] border-[#D4A94D]/20 hover:border-[#D4A94D] hover:text-[#F7F1E7] hover:bg-[#2F4F3E]'
                }`}
              >
                {section.icon && (
                  <span className={`w-3.5 h-3.5 ${isActive ? 'text-[#1B2620]' : 'text-[#D4A94D]'}`}>
                    {section.icon}
                  </span>
                )}
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
