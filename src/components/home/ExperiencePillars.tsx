import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, ArrowRight, ShieldCheck, Sparkles, Footprints, HeartHandshake, Utensils, Anchor, Mountain, Building2, Landmark, Waves } from 'lucide-react';

export const ExperiencePillars: React.FC = () => {
  const { navigateTo } = useApp();
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const pillars = [
    {
      id: 'wildlife',
      title: 'Wildlife & Sanctuaries',
      category: 'Ecosystem Pillar I',
      subtitle: 'The Great Migration, Big Five & Primate Habitats',
      icon: <Footprints className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      description: 'Private conservancies, river crossing tracking, and ranger-led walking safaris through East Africa’s protected wilderness.',
      stat: '100% Certified Rangers',
      linkTarget: 'destinations' as const
    },
    {
      id: 'culture',
      title: 'Cultural Heritage',
      category: 'Ecosystem Pillar II',
      subtitle: 'Living Tribal Traditions & Swahili Coastal Lore',
      icon: <Landmark className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80',
      description: 'Immersive dialogues with Maasai village elders, Samburu pastoralists, and ancient Swahili stone towns.',
      stat: 'Direct Local Royalty Share',
      linkTarget: 'destinations' as const
    },
    {
      id: 'marine',
      title: 'Marine Escapes',
      category: 'Ecosystem Pillar III',
      subtitle: 'Zanzibar Dhow Voyages & Watamu Coral Reefs',
      icon: <Anchor className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      description: 'Turquoise waters, private island archipelagos, whale shark diving, and sunset dhow sailing along the Spice Coast.',
      stat: 'Protected Marine Reserves',
      linkTarget: 'hotels' as const
    },
    {
      id: 'cities',
      title: 'Urban Metropolises',
      category: 'Ecosystem Pillar IV',
      subtitle: 'Design Hubs, Fine Art & Modern Hospitality',
      icon: <Building2 className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1200&q=80',
      description: 'Nairobi’s thriving contemporary art galleries, Kigali’s clean innovation, and Cape Town’s iconic coastal skyline.',
      stat: 'Curated Boutique Stays',
      linkTarget: 'hotels' as const
    },
    {
      id: 'adventure',
      title: 'High Adventure',
      category: 'Ecosystem Pillar V',
      subtitle: 'Kilimanjaro Summit & Rift Valley Expeditions',
      icon: <Mountain className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=1200&q=80',
      description: 'Mountain treks, crater climbs, white-water kayaking, and helicopter scenic flights over volcanic caldera lakes.',
      stat: 'Master Guide Escorts',
      linkTarget: 'itineraries' as const
    },
    {
      id: 'heritage',
      title: 'Ancient Roots',
      category: 'Ecosystem Pillar VI',
      subtitle: 'UNESCO Sites, Cradle of Humankind & Kingdoms',
      icon: <Compass className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      description: 'Archaeological discoveries at Olduvai Gorge, rock-cut monoliths, and ancient trade routes spanning millennia.',
      stat: 'Historical Trust Access',
      linkTarget: 'destinations' as const
    },
    {
      id: 'food',
      title: 'Culinary Journeys',
      category: 'Ecosystem Pillar VII',
      subtitle: 'Swahili Spice Fusion & Lodge Fine Dining',
      icon: <Utensils className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      description: 'Farm-to-bush banquets, organic vineyard tastings, spice farm tours, and bush dinners under starry night skies.',
      stat: 'Farm-to-Table Focus',
      linkTarget: 'hotels' as const
    },
    {
      id: 'community',
      title: 'Conservation & Community',
      category: 'Ecosystem Pillar VIII',
      subtitle: 'Wildlife Guardianship & Social Impact Trusts',
      icon: <HeartHandshake className="w-5 h-5 text-[#D6B06A]" />,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      description: 'Every booking directly finances anti-poaching ranger units, local education trusts, and habitat restoration.',
      stat: '100% Verified Impact',
      linkTarget: 'supplier-portal' as const
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#463D34] text-[#F4E8D5] relative overflow-hidden texture-map border-b border-[#C89A4B]/40">
      
      {/* Terrain Divider Top */}
      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#2D2621] to-transparent pointer-events-none opacity-80" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#2D2621] border border-[#C89A4B]/60 rounded-full shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#D6B06A] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#D6B06A]">
              Beyond Safari • Diversity of Africa
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-bold text-[#F4E8D5] tracking-tight">
            Eight Pillars of Exploration
          </h2>

          <p className="text-sm sm:text-base text-[#D3C5AE] max-w-2xl mx-auto leading-relaxed font-normal">
            Africa is a vast, multifaceted continent. Ident Africa presents wildlife, heritage, coastlines, cities, and community initiatives as equal, interconnected pillars.
          </p>
        </div>

        {/* 8 Equal Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              onMouseEnter={() => setActivePillar(idx)}
              onMouseLeave={() => setActivePillar(null)}
              onClick={() => navigateTo(pillar.linkTarget)}
              className="group relative bg-[#FFF8EC] text-[#2A1E17] border-2 border-[#C89A4B]/60 rounded-2xl overflow-hidden shadow-xl hover:border-[#D6B06A] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer card-expedition"
            >
              {/* Image & Stamp Badge */}
              <div className="relative h-48 overflow-hidden bg-[#2D2621]">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2621]/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#2D2621]/90 text-[#D6B06A] text-[9px] font-mono font-bold uppercase tracking-widest border border-[#C89A4B]/80 rounded shadow-md">
                  {pillar.category}
                </div>

                <div className="absolute bottom-3 right-3 p-2 rounded-full bg-[#FFF8EC] text-[#2A1E17] border border-[#C89A4B] shadow-md">
                  {pillar.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#2A1E17] group-hover:text-[#C89A4B] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C89A4B] mt-0.5">
                    {pillar.subtitle}
                  </p>
                  <p className="text-xs text-[#5A4738] mt-2 line-clamp-2 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#C89A4B]/30 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase text-[#4F6848] bg-[#F5E7D0] px-2 py-0.5 rounded border border-[#C89A4B]/30">
                    {pillar.stat}
                  </span>
                  <span className="text-xs font-bold text-[#2A1E17] group-hover:text-[#C89A4B] flex items-center gap-1">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
