import React from 'react';
import { Star, ShieldCheck, Award, Heart, Trees } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const trustMetrics = [
    {
      icon: <Star className="w-6 h-6 text-[#D4A94D]" />,
      title: '5.0 Star Guest Rating',
      subtitle: 'Based on 1,420+ verified safari reviews from discerning international travelers.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#D4A94D]" />,
      title: 'Flying Doctors Coverage',
      subtitle: 'Complimentary AMREF emergency evacuation insurance included on every circuit.',
    },
    {
      icon: <Award className="w-6 h-6 text-[#D4A94D]" />,
      title: '25+ Years Local Expertise',
      subtitle: 'Native Silver & Gold-rated KPSGA safari guides leading every private game drive.',
    },
    {
      icon: <Heart className="w-6 h-6 text-[#D4A94D]" />,
      title: 'Conservation Committed',
      subtitle: '$50 per booking directly funds habitat preservation and anti-poaching ranger units.',
    },
  ];

  const partners = [
    'African Wildlife Foundation',
    'Kenya Wildlife Service',
    'Tanzania National Parks (TANAPA)',
    'Ecotourism Kenya Gold Certified',
    'Mara Predator Conservation Programme',
  ];

  return (
    <section className="w-full bg-[#1B2620] border-y border-[#D4A94D]/30 py-12 px-4 sm:px-6 lg:px-8 text-[#F7F1E7] texture-leather">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustMetrics.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#25362B] border border-[#D4A94D]/30 rounded-2xl p-5 space-y-3 transition-all duration-300 hover:border-[#D4A94D] hover:-translate-y-1 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1B2620] border border-[#D4A94D]/40 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <h4 className="text-base font-serif font-bold text-[#F7F1E7]">
                {item.title}
              </h4>
              <p className="text-xs font-sans text-[#D3C5AE] leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Conservation & Institutional Partners Bar */}
        <div className="pt-6 border-t border-[#D4A94D]/20 text-center space-y-3">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4A94D]">
            Official Conservation & Wildlife Accreditation Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono text-[#D3C5AE]/90">
            {partners.map((partner, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Trees className="w-3.5 h-3.5 text-[#D4A94D]" />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
