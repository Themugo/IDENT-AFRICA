import React from 'react';
import { ShieldCheck, Compass, Award, Trees, DollarSign, Lock, Users, Sparkles, MapPin, Globe } from 'lucide-react';

export const TrustPillars: React.FC = () => {
  const stats = [
    {
      value: '$4.2M+',
      label: 'Conservation Escrow',
      subtext: 'Directly invested in anti-poaching & habitat restoration',
      icon: <Trees className="w-5 h-5 text-[#D6B06A]" />
    },
    {
      value: '100%',
      label: 'Certified Naturalists',
      subtext: 'Ranger-verified guides with 10+ yrs tracking lore',
      icon: <ShieldCheck className="w-5 h-5 text-[#D6B06A]" />
    },
    {
      value: '84',
      label: 'Private Conservancies',
      subtext: 'Exclusive access to Singita, Angama & &Beyond reserves',
      icon: <MapPin className="w-5 h-5 text-[#D6B06A]" />
    },
    {
      value: '99.4%',
      label: '5-Star Traveler Rating',
      subtext: 'Across 3,200+ bespoke East African expeditions',
      icon: <Award className="w-5 h-5 text-[#D6B06A]" />
    }
  ];

  const pillars = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C89A4B]" />,
      title: 'Ranger Verified',
      subtitle: 'Licensed Naturalists',
      description: 'Every guide in our ecosystem is licensed by local wildlife authorities with 10+ years field tracking experience.',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#C89A4B]" />,
      title: 'Direct Operator Rates',
      subtitle: 'Zero Markups',
      description: 'Book directly at official conservancy rates with transparent park entry fee disclosures and FX conversion.',
    },
    {
      icon: <Trees className="w-6 h-6 text-[#4F6848]" />,
      title: '100% Eco Stewardship',
      subtitle: 'Carbon Neutral',
      description: 'A portion of every booking directly funds anti-poaching patrols & community reforestation trusts.',
    },
    {
      icon: <Award className="w-6 h-6 text-[#C89A4B]" />,
      title: 'Guaranteed Suites',
      subtitle: 'Exclusive Camps',
      description: 'Direct live API ties with luxury camps like Singita, Angama Mara, and &Beyond ensure instant suite confirmation.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E8DCC8] border-b border-[#C89A4B]/40 relative overflow-hidden texture-savannah">
      
      {/* Background Subtle Conservation Pattern Overlay */}
      <div className="absolute inset-0 texture-topo opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Statistics Metric Cards Panel */}
        <div className="bg-[#2D2621] text-[#F4E8D5] rounded-3xl p-8 sm:p-12 border-2 border-[#C89A4B]/60 shadow-2xl texture-leather">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-[#C89A4B]/30 gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#D6B06A]">
                Measurable Impact & Trust
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold text-[#F4E8D5] mt-1">
                Ecosystem Metrics & Prestige
              </h3>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#463D34] border border-[#C89A4B]/50 rounded-full text-xs text-[#D6B06A] font-mono font-bold">
              <Globe className="w-4 h-4 text-[#4F6848]" />
              <span>Verified 2026 Audit Report</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#463D34]/80 border border-[#C89A4B]/40 space-y-2 hover:border-[#D6B06A] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#2D2621] border border-[#C89A4B]/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-[#D6B06A]">
                  {s.value}
                </div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4E8D5]">
                  {s.label}
                </div>
                <p className="text-[11px] text-[#D3C5AE] leading-relaxed font-normal">
                  {s.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#4F6848] uppercase tracking-[0.3em]">
            Ecosystem Standards & Prestige
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2A1E17]">
            The Ident Africa Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4738] font-normal max-w-xl mx-auto">
            Uncompromising luxury travel paired with deep ecological stewardship and direct local empowerment.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#FFF8EC] border-2 border-[#C89A4B]/50 shadow-xl hover:border-[#D6B06A] transition-all space-y-4 hover:-translate-y-1.5 card-expedition"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F5E7D0] border border-[#C89A4B]/50 flex items-center justify-center shadow-sm">
                {p.icon}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#4F6848] block font-mono">
                  {p.subtitle}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#2A1E17]">
                  {p.title}
                </h3>
              </div>
              <p className="text-xs text-[#5A4738] leading-relaxed font-normal">
                {p.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};


