import React from 'react';
import { ShieldCheck, Compass, Award, Trees, DollarSign, Lock, Headset } from 'lucide-react';

export const TrustPillars: React.FC = () => {
  const pillars = [
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#C89A4B]" />,
      title: 'Ranger Verified',
      subtitle: 'Licensed Naturalists',
      description: 'Every guide in our ecosystem is licensed by local wildlife authorities with 10+ years field tracking experience.',
    },
    {
      icon: <DollarSign className="w-7 h-7 text-[#C89A4B]" />,
      title: 'Direct Operator Rates',
      subtitle: 'Zero Markups',
      description: 'Book directly at official conservancy rates with transparent park entry fee disclosures.',
    },
    {
      icon: <Trees className="w-7 h-7 text-[#C89A4B]" />,
      title: '100% Eco Stewardship',
      subtitle: 'Carbon Neutral',
      description: 'A portion of every booking directly funds anti-poaching patrols & community reforestation.',
    },
    {
      icon: <Award className="w-7 h-7 text-[#C89A4B]" />,
      title: 'Guaranteed Suites',
      subtitle: 'Exclusive Camps',
      description: 'Direct live API ties with luxury camps like Singita, Angama Mara, and &Beyond ensure instant suite confirmation.',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#2E2015] border-b border-[#C89A4B]/30 relative overflow-hidden texture-earth">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[10px] font-bold text-[#D6B06A] uppercase tracking-[0.3em]">
            Ecosystem Standards & Prestige
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F4E8D5]">
            The Ident Africa Promise
          </h2>
          <p className="text-xs sm:text-sm text-[#D3C5AE] font-light">
            Uncompromising luxury travel paired with deep ecological stewardship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#4B321F]/80 border border-[#C89A4B]/30 shadow-xl hover:border-[#D6B06A] transition-all space-y-4 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2E2015] border border-[#C89A4B]/40 flex items-center justify-center shadow-inner">
                {p.icon}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#D6B06A] block">
                  {p.subtitle}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#F4E8D5]">
                  {p.title}
                </h3>
              </div>
              <p className="text-xs text-[#D3C5AE] leading-relaxed font-light">
                {p.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

