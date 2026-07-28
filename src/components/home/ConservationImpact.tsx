import React, { useState, useEffect, useRef } from 'react';
import { Heart, Leaf, Users, Shield, TrendingUp, Award, ChevronRight } from 'lucide-react';

interface ImpactStory {
  id: string;
  title: string;
  subtitle: string;
  story: string;
  image: string;
  impact: {
    value: string;
    label: string;
  };
  category: 'wildlife' | 'community' | 'habitat' | 'research';
}

export const ConservationImpact: React.FC = () => {
  const [activeStory, setActiveStory] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const impactStories: ImpactStory[] = [
    {
      id: 'rhino-recovery',
      title: 'Return of the Giants',
      subtitle: 'Black Rhino Conservation in Kenya',
      story: 'Twenty years ago, black rhinos were on the brink of extinction in Kenya. Today, through dedicated anti-poaching units and habitat protection, populations have recovered by 300%. Each luxury safari directly funds the rangers who patrol these grounds day and night.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85',
      impact: { value: '300%', label: 'Population Recovery' },
      category: 'wildlife'
    },
    {
      id: 'maasai-partnership',
      title: 'Guardians of the Land',
      subtitle: 'Maasai Community Conservation Trust',
      story: 'The Maasai people have coexisted with wildlife for millennia. Our partnership ensures that 40% of conservation revenues return directly to local communities, funding schools, healthcare, and sustainable grazing practices that protect both livestock and wildlife.',
      image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=85',
      impact: { value: '40%', label: 'Revenue to Communities' },
      category: 'community'
    },
    {
      id: 'gorilla-tourism',
      title: 'Hope in the Mist',
      subtitle: 'Mountain Gorilla Protection in Rwanda',
      story: 'Mountain gorillas were once the most endangered great apes on Earth. Through controlled tourism and vigilant protection, their numbers have doubled. A single gorilla trekking permit generates $15,000 annually — enough to protect an entire family group.',
      image: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=1600&q=85',
      impact: { value: '1,000+', label: 'Gorillas Protected' },
      category: 'wildlife'
    },
    {
      id: 'ocean-conservation',
      title: 'Blue Frontiers',
      subtitle: 'Zanzibar Marine Sanctuary',
      story: 'The coral reefs surrounding Zanzibar are among the most biodiverse in the Indian Ocean. Our marine conservation program has established no-take zones protecting 30% of local reef systems, while sustainable tourism provides alternative livelihoods for fishing communities.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
      impact: { value: '30%', label: 'Protected Marine Area' },
      category: 'habitat'
    }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getCategoryIcon = (category: ImpactStory['category']) => {
    switch (category) {
      case 'wildlife': return <Shield className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      case 'habitat': return <Leaf className="w-4 h-4" />;
      case 'research': return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: ImpactStory['category']) => {
    switch (category) {
      case 'wildlife': return 'bg-emerald-900/80 text-emerald-300 border-emerald-600';
      case 'community': return 'bg-violet-900/80 text-violet-300 border-violet-600';
      case 'habitat': return 'bg-blue-900/80 text-blue-300 border-blue-600';
      case 'research': return 'bg-amber-900/80 text-amber-300 border-amber-600';
    }
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#0f0d0a]">
      
      {/* Cinematic Background with Parallax */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ 
            backgroundImage: `url(${impactStories[activeStory].image})`,
            transform: `scale(${isVisible ? 1.05 : 1})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0d0a]/90 via-[#0f0d0a]/70 to-[#0f0d0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0a]/60 via-transparent to-[#0f0d0a]/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#4F6848]" />
            <span className="text-[10px] font-cinzel text-[#4F6848] tracking-[0.4em] uppercase flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Conservation & Impact
            </span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#4F6848]" />
          </div>
          
          <h2 className="font-cormorant text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-6 text-[#F4E8D5]">
            Luxury with <span className="italic text-[#4F6848]">Purpose</span>
          </h2>
          
          <p className="text-base text-[#D3C5AE] max-w-2xl mx-auto font-light leading-relaxed">
            Every expedition booked through Ident Africa directly contributes to wildlife conservation, 
            community development, and habitat preservation across East Africa.
          </p>
        </div>

        {/* Impact Statistics Bar */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {[
            { value: '$4.2M+', label: 'Conservation Funded', icon: <Shield className="w-5 h-5" /> },
            { value: '18M', label: 'Acres Protected', icon: <Leaf className="w-5 h-5" /> },
            { value: '2,400+', label: 'Rangers Supported', icon: <Users className="w-5 h-5" /> },
            { value: '45', label: 'Communities Empowered', icon: <Heart className="w-5 h-5" /> }
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="bg-[#2D2621]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#4F6848]/30 hover:border-[#4F6848]/60 transition-all group"
            >
              <div className="flex items-center gap-2 text-[#4F6848] mb-3">
                {stat.icon}
                <span className="text-[10px] font-cinzel tracking-[0.2em] uppercase">{stat.label}</span>
              </div>
              <div className="font-cormorant text-3xl sm:text-4xl text-[#F4E8D5] font-light group-hover:text-[#C89A4B] transition-colors">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Impact Stories */}
        <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          
          {/* Story Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {impactStories.map((story, idx) => (
              <button
                key={story.id}
                onClick={() => setActiveStory(idx)}
                className={`
                  px-5 py-3 rounded-full text-[11px] font-cinzel tracking-[0.15em] uppercase transition-all duration-500
                  ${activeStory === idx
                    ? 'bg-[#4F6848] text-[#F4E8D5] shadow-lg shadow-[#4F6848]/30'
                    : 'bg-[#2D2621]/60 text-[#D3C5AE] hover:bg-[#2D2621] border border-[#C89A4B]/20'
                  }
                `}
              >
                {story.title}
              </button>
            ))}
          </div>

          {/* Active Story Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image Column */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#4F6848]/20 to-[#C89A4B]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative overflow-hidden rounded-3xl">
                <img 
                  src={impactStories[activeStory].image}
                  alt={impactStories[activeStory].title}
                  className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-transparent to-transparent" />
                
                {/* Impact Badge */}
                <div className="absolute top-6 left-6 bg-[#0f0d0a]/80 backdrop-blur-md rounded-2xl p-6 border border-[#4F6848]/40">
                  <div className="text-[10px] font-cinzel text-[#4F6848] tracking-[0.3em] uppercase mb-2">
                    {impactStories[activeStory].impact.label}
                  </div>
                  <div className="font-cormorant text-5xl text-[#F4E8D5] font-light">
                    {impactStories[activeStory].impact.value}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`px-4 py-2 text-[9px] font-cinzel tracking-[0.2em] uppercase border rounded-full flex items-center gap-2 ${getCategoryColor(impactStories[activeStory].category)}`}>
                    {getCategoryIcon(impactStories[activeStory].category)}
                    {impactStories[activeStory].category}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.3em] uppercase block mb-4">
                  {impactStories[activeStory].subtitle}
                </span>
                <h3 className="font-cormorant text-4xl sm:text-5xl font-light text-[#F4E8D5] mb-6">
                  {impactStories[activeStory].title}
                </h3>
                <div className="w-16 h-px bg-gradient-to-r from-[#4F6848] to-transparent mb-6" />
                <p className="text-[#D3C5AE] leading-relaxed text-lg font-light">
                  {impactStories[activeStory].story}
                </p>
              </div>

              {/* Supporting Data */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#C89A4B]/20">
                {activeStory === 0 && [
                  { value: '1,000+', label: 'Rhinos Protected' },
                  { value: '95%', label: 'Poaching Reduction' },
                  { value: '24/7', label: 'Ranger Patrols' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="font-cormorant text-2xl text-[#F4E8D5] mb-1">{item.value}</div>
                    <div className="text-[10px] text-[#D3C5AE] font-cinzel tracking-wider uppercase">{item.label}</div>
                  </div>
                ))}
                {activeStory === 1 && [
                  { value: '12', label: 'Villages Supported' },
                  { value: '3,000+', label: 'Children in Schools' },
                  { value: '200+', label: 'Jobs Created' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="font-cormorant text-2xl text-[#F4E8D5] mb-1">{item.value}</div>
                    <div className="text-[10px] text-[#D3C5AE] font-cinzel tracking-wider uppercase">{item.label}</div>
                  </div>
                ))}
                {activeStory === 2 && [
                  { value: '$15K', label: 'Per Permit/Year' },
                  { value: '20', label: 'Family Groups' },
                  { value: '106', label: 'Habituated Gorillas' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="font-cormorant text-2xl text-[#F4E8D5] mb-1">{item.value}</div>
                    <div className="text-[10px] text-[#D3C5AE] font-cinzel tracking-wider uppercase">{item.label}</div>
                  </div>
                ))}
                {activeStory === 3 && [
                  { value: '50+', label: 'Dive Sites Mapped' },
                  { value: '15', label: 'Fish Species Recovered' },
                  { value: '100+', label: 'Fishermen Trained' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="font-cormorant text-2xl text-[#F4E8D5] mb-1">{item.value}</div>
                    <div className="text-[10px] text-[#D3C5AE] font-cinzel tracking-wider uppercase">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="group flex items-center gap-3 text-[#4F6848] hover:text-[#C89A4B] transition-colors">
                <span className="text-[10px] font-cinzel tracking-[0.2em] uppercase">
                  Support This Initiative
                </span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className={`mt-24 pt-16 border-t border-[#C89A4B]/20 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="text-center mb-12">
            <span className="text-[10px] font-cinzel text-[#D3C5AE] tracking-[0.3em] uppercase">
              Recognition & Partnerships
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {['African Wildlife Foundation', 'World Wildlife Fund', 'Conservation International', 'Eco Tourism Kenya', 'Fair Trade Tourism'].map((partner, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[#D3C5AE]">
                <Award className="w-4 h-4 text-[#C89A4B]" />
                <span className="text-sm font-cinzel tracking-wider">{partner}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
