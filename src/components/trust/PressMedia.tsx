import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ExternalLink, Quote, Calendar, ChevronRight, 
  Newspaper, Award, Star, Play, Globe
} from 'lucide-react';

interface PressMention {
  id: string;
  outlet: string;
  headline: string;
  excerpt: string;
  date: string;
  type: 'review' | 'feature' | 'award' | 'interview';
  link: string;
  image: string;
  featured: boolean;
  rating?: number;
}

export const PressMedia: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'review' | 'feature' | 'award' | 'interview'>('all');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const pressMentions: PressMention[] = [
    {
      id: 'press-1',
      outlet: 'Condé Nast Traveller',
      headline: 'The 20 Best Safari Operators for 2026',
      excerpt: 'Ident Africa stands out for its curated network of expert guides and exclusive access to private concessions...',
      date: 'January 2026',
      type: 'review',
      link: '#',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80',
      featured: true,
      rating: 98
    },
    {
      id: 'press-2',
      outlet: 'National Geographic',
      headline: 'Inside the Most Exclusive Safari Camps in East Africa',
      excerpt: 'From Singita\'s private suites to Angama Mara\'s cinema-quality storytelling, these properties redefine luxury...',
      date: 'November 2025',
      type: 'feature',
      link: '#',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      featured: true
    },
    {
      id: 'press-3',
      outlet: 'Travel + Leisure',
      headline: 'World\'s Best Awards: Top Safari Lodge Networks',
      excerpt: 'For the fifth consecutive year, Ident Africa earns recognition for exceptional wildlife encounters...',
      date: 'July 2025',
      type: 'award',
      link: '#',
      image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=600&q=80',
      featured: true
    },
    {
      id: 'press-4',
      outlet: 'AFAR',
      headline: 'How Ident Africa Is Revolutionizing Safari Booking',
      excerpt: 'The AI-powered trip planner that customizes every detail is changing how discerning travelers plan...',
      date: 'September 2025',
      type: 'interview',
      link: '#',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
      featured: false
    },
    {
      id: 'press-5',
      outlet: 'Robb Report',
      headline: 'The Ultra-Luxury Safari Experience: A First-Person Account',
      excerpt: 'When only the rarest wildlife encounters will do, Ident Africa delivers with precision and panache...',
      date: 'March 2025',
      type: 'review',
      link: '#',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      featured: false,
      rating: 97
    },
    {
      id: 'press-6',
      outlet: 'Forbes',
      headline: 'The Luxury Safari Industry\'s Digital Transformation',
      excerpt: 'Ident Africa\'s technology-first approach is setting new standards for personalization...',
      date: 'May 2025',
      type: 'feature',
      link: '#',
      image: 'https://images.unsplash.com/photo-1575496131869-1e3d1f1b9b6f?auto=format&fit=crop&w=600&q=80',
      featured: false
    },
    {
      id: 'press-7',
      outlet: 'The Guardian',
      headline: 'Conserving Wildlife Through Luxury Tourism',
      excerpt: 'How safari operators like Ident Africa are leading conservation efforts in East Africa...',
      date: 'April 2025',
      type: 'feature',
      link: '#',
      image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=600&q=80',
      featured: false
    },
    {
      id: 'press-8',
      outlet: 'Bloomberg Pursuits',
      headline: 'The Ultimate Safari: Planning a Once-in-a-Lifetime Journey',
      excerpt: 'Expert tips for booking the perfect East African safari from industry veterans...',
      date: 'June 2025',
      type: 'interview',
      link: '#',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
      featured: false
    }
  ];

  const featuredPress = pressMentions.filter(p => p.featured);
  
  const filteredPress = activeCategory === 'all' 
    ? pressMentions.filter(p => !p.featured)
    : pressMentions.filter(p => p.type === activeCategory && !p.featured);

  const categories = [
    { id: 'all', label: 'All Mentions' },
    { id: 'review', label: 'Reviews' },
    { id: 'feature', label: 'Features' },
    { id: 'award', label: 'Awards' },
    { id: 'interview', label: 'Interviews' }
  ] as const;

  const getTypeBadge = (type: PressMention['type']) => {
    const styles = {
      review: 'bg-[#C89A4B]/20 text-[#C89A4B]',
      feature: 'bg-[#4F6848]/20 text-[#4F6848]',
      award: 'bg-[#D4AF37]/20 text-[#D4AF37]',
      interview: 'bg-[#2D2621]/20 text-[#F4E8D5]'
    };
    const icons = {
      review: <Star className="w-3 h-3" />,
      feature: <Newspaper className="w-3 h-3" />,
      award: <Award className="w-3 h-3" />,
      interview: <Play className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${styles[type]}`}>
        {icons[type]}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#0a0806]">
      
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806] via-[#1A1008] to-[#0a0806]" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#C89A4B]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C89A4B]" />
            <Globe className="w-6 h-6 text-[#C89A4B]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C89A4B]" />
          </div>
          
          <h2 className="font-cormorant text-4xl lg:text-5xl text-[#F4E8D5] font-light mb-4">
            As Seen In
          </h2>
          <p className="text-[#D3C5AE] max-w-2xl mx-auto">
            Recognized by the world's most respected travel authorities
          </p>
        </motion.div>

        {/* Press Logos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-12 mb-16 pb-8 border-b border-[#2D2621]"
        >
          {['Condé Nast Traveller', 'National Geographic', 'Travel + Leisure', 'AFAR', 'Robb Report', 'Forbes'].map((outlet, idx) => (
            <span 
              key={idx}
              className="font-cormorant text-xl lg:text-2xl text-[#D3C5AE]/40 italic hover:text-[#C89A4B] transition-colors cursor-pointer"
            >
              {outlet}
            </span>
          ))}
        </motion.div>

        {/* Featured Press */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {featuredPress.map((press, idx) => (
            <motion.article
              key={press.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
              className={`group relative rounded-2xl overflow-hidden bg-[#1A1008] border border-[#2D2621] hover:border-[#C89A4B]/50 transition-all ${
                idx === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative overflow-hidden ${idx === 0 ? 'h-64 lg:h-full' : 'h-48'}`}>
                <img 
                  src={press.image}
                  alt={press.outlet}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008] via-[#1A1008]/30 to-transparent" />
                
                {/* Outlet Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#0a0806]/80 backdrop-blur-sm rounded-full text-[#F4E8D5] text-xs font-cinzel tracking-wider">
                    {press.outlet}
                  </span>
                </div>

                {/* Rating */}
                {press.rating && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-[#0a0806]/80 backdrop-blur-sm rounded-full">
                    <Star className="w-4 h-4 text-[#C89A4B] fill-current" />
                    <span className="text-[#F4E8D5] font-medium">{press.rating}/100</span>
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute bottom-4 left-4">
                  {getTypeBadge(press.type)}
                </div>
              </div>

              {/* Content */}
              <div className={`p-6 ${idx === 0 ? 'lg:p-8' : ''}`}>
                <h3 className={`font-serif text-[#F4E8D5] mb-3 group-hover:text-[#C89A4B] transition-colors ${
                  idx === 0 ? 'text-2xl lg:text-3xl' : 'text-lg'
                }`}>
                  {press.headline}
                </h3>
                <p className="text-[#D3C5AE]/70 text-sm leading-relaxed mb-4 line-clamp-2">
                  {press.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#D3C5AE]/50 text-xs">
                    <Calendar className="w-3 h-3" />
                    {press.date}
                  </div>
                  <a 
                    href={press.link}
                    className="flex items-center gap-1 text-[#C89A4B] text-xs font-cinzel tracking-wider hover:gap-2 transition-all"
                  >
                    Read Article <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* More Press - Filterable */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-cinzel tracking-wider transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#C89A4B] text-[#1a1008]'
                    : 'bg-[#2D2621] text-[#D3C5AE] hover:bg-[#3D3631]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Press Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPress.slice(0, 4).map((press, idx) => (
              <article
                key={press.id}
                className="group bg-[#1A1008] rounded-xl overflow-hidden border border-[#2D2621] hover:border-[#C89A4B]/30 transition-all"
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={press.image}
                    alt={press.outlet}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008] to-transparent" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-wider">{press.outlet}</span>
                    {getTypeBadge(press.type)}
                  </div>
                  <h4 className="text-[#F4E8D5] text-sm font-serif mb-2 line-clamp-2 group-hover:text-[#C89A4B] transition-colors">
                    {press.headline}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-[#D3C5AE]/50">
                    <span>{press.date}</span>
                    <a href={press.link} className="flex items-center gap-1 text-[#C89A4B] hover:gap-2 transition-all">
                      Read <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </motion.div>

        {/* Awards Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-[#D4AF37]/20 via-[#C89A4B]/20 to-[#D4AF37]/20 rounded-2xl p-8 border border-[#D4AF37]/30"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            <div className="text-center">
              <Award className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
              <div className="font-cormorant text-2xl text-[#D4AF37]">5x</div>
              <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Travel + Leisure Awards</div>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
              <div className="font-cormorant text-2xl text-[#D4AF37]">#1</div>
              <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Safari Network 2026</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
              <div className="font-cormorant text-2xl text-[#D4AF37]">98</div>
              <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">CN Traveller Score</div>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
              <div className="font-cormorant text-2xl text-[#D4AF37]">4.97</div>
              <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Guest Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PressMedia;
