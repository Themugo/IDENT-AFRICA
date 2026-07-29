import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { 
  Compass, MapPin, Phone, ChevronRight, 
  Star, Shield, Award, Users, Sparkles, CheckCircle,
  ArrowRight, MessageCircle, PawPrint
} from 'lucide-react';
import { TrustAndAuthority } from '../trust/TrustAndAuthority';

// ==================== ANIMATED SECTION WRAPPER ====================
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==================== CONVERSION HERO ====================
const ConversionHero: React.FC = () => {
  const { navigateTo } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  
  // Parallax scroll effect
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const contentY = useTransform(scrollY, [0, 500], [0, 80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[85vh] flex items-center overflow-hidden"
    >
      {/* Parallax Background Image */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=3000&q=85')`,
          y: backgroundY
        }}
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0806]/80 via-[#0a0806]/50 to-[#0a0806]/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] via-transparent to-[#0a0806]/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C89A4B]/5 to-transparent" />
      
      {/* Animated grain overlay */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          opacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Content with Parallax */}
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full"
        style={{ y: contentY }}
      >
        <motion.div 
          className="max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Pre-heading - Staggered animation */}
          <motion.div 
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="w-12 h-px bg-[#C89A4B]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
            <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.4em] uppercase">
              East Africa's Premier Safari Curator
            </span>
          </motion.div>
          
          {/* Main Headline - Character by character reveal */}
          <motion.h1 
            className="font-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#F4E8D5] leading-[0.95] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.span 
              className="block"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Your East African
            </motion.span>
            <motion.span 
              className="block italic text-[#C89A4B]"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Safari Journey
            </motion.span>
            <motion.span 
              className="block"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Awaits
            </motion.span>
          </motion.h1>
          
          {/* Sub-headline */}
          <motion.p 
            className="text-lg sm:text-xl text-[#D3C5AE] font-light max-w-xl mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            From the Serengeti plains to Rwanda's misty forests — let our expert rangers design your perfect expedition.
          </motion.p>
          
          {/* PRIMARY CTAs - Staggered animation */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {/* Primary CTA: Plan My Safari */}
            <motion.button
              onClick={() => navigateTo('ai-planner')}
              className="group relative flex items-center gap-4 px-8 py-5 bg-[#C89A4B] text-[#1a1008] rounded-xl overflow-hidden shadow-2xl hover:shadow-[#C89A4B]/30 transition-all duration-500 active:scale-[0.98]"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="absolute inset-0 bg-[#D6B06A] transform -translate-x-full"
                animate={{ x: ['-100%', '0%'] }}
                transition={{ duration: 0.5 }}
              />
              <div className="relative z-10 flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-[#1a1008]/20 flex items-center justify-center"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-70 block">Start Now</span>
                  <span className="font-cinzel font-bold text-lg tracking-wide">Plan My Safari</span>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 ml-4" />
                </motion.div>
              </div>
            </motion.button>
            
            {/* Secondary CTA: Explore Destinations */}
            <motion.button
              onClick={() => navigateTo('destinations')}
              className="group flex items-center gap-4 px-8 py-5 bg-[#2D2621]/80 backdrop-blur-sm border border-[#C89A4B]/50 text-[#F4E8D5] rounded-xl hover:bg-[#463D34] hover:border-[#C89A4B] transition-all duration-500 active:scale-[0.98]"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-full bg-[#C89A4B]/20 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <MapPin className="w-6 h-6 text-[#C89A4B]" />
              </motion.div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D3C5AE] block">Discover</span>
                <span className="font-cinzel font-bold text-base tracking-wide">Explore Destinations</span>
              </div>
            </motion.button>
            
            {/* Tertiary CTA: Speak With Expert */}
            <motion.button
              onClick={() => navigateTo('ai-planner')}
              className="group flex items-center gap-4 px-8 py-5 bg-transparent border border-[#C89A4B]/40 text-[#F4E8D5] rounded-xl hover:border-[#C89A4B] hover:bg-[#C89A4B]/10 transition-all duration-500 active:scale-[0.98]"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-full border border-[#C89A4B]/40 flex items-center justify-center"
                whileHover={{ borderColor: '#C89A4B' }}
              >
                <Phone className="w-5 h-5 text-[#C89A4B]" />
              </motion.div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D3C5AE] block">Get Advice</span>
                <span className="font-cinzel font-bold text-base tracking-wide">Speak With Expert</span>
              </div>
            </motion.button>
          </motion.div>
          
          {/* Trust Indicators - Staggered fade in */}
          <motion.div 
            className="flex flex-wrap items-center gap-8 text-[#D3C5AE]"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05, color: '#4F6848' }}
              transition={{ duration: 0.2 }}
            >
              <Shield className="w-4 h-4 text-[#4F6848]" />
              <span className="text-sm">100% Ranger Verified</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05, color: '#C89A4B' }}
              transition={{ duration: 0.2 }}
            >
              <Award className="w-4 h-4 text-[#C89A4B]" />
              <span className="text-sm">4.9★ Average Rating</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">3,200+ Expeditions</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator with bounce animation */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.span 
          className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.3em] uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll
        </motion.span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronRight className="w-5 h-5 text-[#C89A4B] rotate-90" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// ==================== QUICK DESTINATION SELECTOR ====================
const QuickDestinationSelector: React.FC = () => {
  const { navigateTo } = useApp();
  
  const destinations = [
    { name: 'Masai Mara', country: 'Kenya', icon: '🦁', color: 'from-amber-900/50 to-amber-700/30' },
    { name: 'Serengeti', country: 'Tanzania', icon: '🐘', color: 'from-emerald-900/50 to-emerald-700/30' },
    { name: 'Bwindi Gorillas', country: 'Uganda', icon: '🦍', color: 'from-stone-900/50 to-stone-700/30' },
    { name: 'Ngorongoro', country: 'Tanzania', icon: '🦏', color: 'from-orange-900/50 to-orange-700/30' },
  ];
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#2D2621] border-y border-[#C89A4B]/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-cormorant text-2xl sm:text-3xl text-[#F4E8D5] font-light mb-2">
            Where Would You Like to Go?
          </h2>
          <p className="text-sm text-[#D3C5AE]">Select a destination to explore or start planning</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((dest) => (
            <button
              key={dest.name}
              onClick={() => navigateTo('destinations')}
              className={`
                group relative p-6 rounded-2xl overflow-hidden
                bg-gradient-to-br ${dest.color} border border-[#C89A4B]/20
                hover:border-[#C89A4B] transition-all duration-500
                hover:-translate-y-1 hover:shadow-xl
              `}
            >
              <div className="text-4xl mb-3">{dest.icon}</div>
              <h3 className="font-cinzel text-sm text-[#F4E8D5] tracking-wide mb-1">{dest.name}</h3>
              <p className="text-[11px] text-[#D3C5AE] font-mono">{dest.country}</p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-[#C89A4B]" />
              </div>
            </button>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button
            onClick={() => navigateTo('destinations')}
            className="text-[#C89A4B] hover:text-[#D6B06A] transition-colors text-sm font-cinzel tracking-wider inline-flex items-center gap-2"
          >
            View All 12 Sanctuaries
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

// ==================== EXPERT CONSULTATION CTA ====================
const ExpertConsultationCTA: React.FC = () => {
  const { navigateTo } = useApp();
  
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a1510] via-[#2D2621] to-[#1a1510] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C89A4B]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4F6848]/10 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#C89A4B]/20 border border-[#C89A4B]/40 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-[#C89A4B]" />
        </div>
        
        {/* Heading */}
        <h2 className="font-cormorant text-4xl sm:text-5xl md:text-6xl text-[#F4E8D5] font-light mb-6">
          Not Sure Where to Begin?
        </h2>
        <p className="text-lg text-[#D3C5AE] max-w-2xl mx-auto mb-10 leading-relaxed">
          Our safari experts have crafted thousands of expeditions. Share your dream — we'll make it reality. 
          Free 30-minute consultation with no obligation.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigateTo('ai-planner')}
            className="group flex items-center gap-3 px-8 py-4 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel font-bold text-sm tracking-wider hover:bg-[#D6B06A] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Start AI Planning Session
          </button>
          
          <a
            href="tel:+2542080072734"
            className="flex items-center gap-3 px-8 py-4 border border-[#C89A4B]/50 text-[#F4E8D5] rounded-xl hover:border-[#C89A4B] hover:bg-[#C89A4B]/10 transition-all duration-300"
          >
            <Phone className="w-5 h-5 text-[#C89A4B]" />
            <span className="font-cinzel text-sm tracking-wider">Call +254 20 800 SAFARI</span>
          </a>
        </div>
        
        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-[#D3C5AE]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#4F6848]" />
            <span className="text-xs">No Obligation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#4F6848]" />
            <span className="text-xs">Expert Rangers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#4F6848]" />
            <span className="text-xs">Free Consultation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#4F6848]" />
            <span className="text-xs">24hr Response</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== MIGRATION HIGHLIGHT (Conversion Driver) ====================
const MigrationHighlight: React.FC = () => {
  const { navigateTo } = useApp();
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E8DCC8]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=85"
              alt="Great Wildebeest Migration"
              className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="px-4 py-2 bg-[#C89A4B] text-[#1a1008] text-[10px] font-cinzel font-bold tracking-wider uppercase rounded-full">
                Peak Season: July - October
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-[#C89A4B]" />
              <span className="text-[10px] font-cinzel text-[#4F6848] tracking-[0.3em] uppercase">
                Nature's Greatest Spectacle
              </span>
            </div>
            
            <h2 className="font-cormorant text-4xl sm:text-5xl text-[#2A1E17] font-light leading-tight">
              Witness the <span className="italic text-[#C89A4B]">Great Migration</span>
            </h2>
            
            <p className="text-[#5A4738] leading-relaxed">
              1.5 million wildebeest. 800 kilometers. One unforgettable journey. 
              Watch nature's most dramatic spectacle from world-class luxury camps with guaranteed river crossing sightings.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-[#C89A4B]/30">
              <div className="text-center">
                <div className="font-cormorant text-3xl text-[#2A1E17] font-light">1.5M</div>
                <div className="text-[10px] font-mono text-[#5A4738] uppercase tracking-wider">Wildebeest</div>
              </div>
              <div className="text-center">
                <div className="font-cormorant text-3xl text-[#2A1E17] font-light">800km</div>
                <div className="text-[10px] font-mono text-[#5A4738] uppercase tracking-wider">Journey</div>
              </div>
              <div className="text-center">
                <div className="font-cormorant text-3xl text-[#2A1E17] font-light">12</div>
                <div className="text-[10px] font-mono text-[#5A4738] uppercase tracking-wider">Months</div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigateTo('ai-planner')}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-[#2A1E17] text-[#F4E8D5] rounded-xl font-cinzel text-sm tracking-wider hover:bg-[#463D34] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Plan Migration Safari
              </button>
              <button
                onClick={() => navigateTo('itineraries')}
                className="flex items-center justify-center gap-2 px-6 py-4 border border-[#2A1E17]/30 text-[#2A1E17] rounded-xl font-cinzel text-sm tracking-wider hover:bg-[#2A1E17]/10 transition-all"
              >
                View Itineraries
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== SOCIAL PROOF / TESTIMONIALS ====================
const ConversionTestimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "The AI planner suggested exactly what we wanted before we knew we wanted it. Our private migration safari was flawless.",
      name: "Victoria H.",
      location: "London, UK",
      trip: "Serengeti Migration, July 2026"
    },
    {
      quote: "From first inquiry to returning home, every detail was perfect. The rangers were extraordinary.",
      name: "Michael T.",
      location: "New York, USA",
      trip: "Rwanda Gorillas & Masai Mara"
    },
    {
      quote: "Finally, a platform that understands luxury safari. The lodge recommendations were spot-on.",
      name: "Sarah L.",
      location: "Sydney, Australia",
      trip: "Kenya Bush & Beach Circuit"
    }
  ];
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#463D34]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-[#C89A4B] fill-current" />
            ))}
          </div>
          <h2 className="font-cormorant text-3xl sm:text-4xl text-[#F4E8D5] font-light">
            Trusted by <span className="italic text-[#C89A4B]">Discerning Travelers</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-8 bg-[#2D2621] rounded-2xl border border-[#C89A4B]/20">
              <div className="flex gap-1 text-[#C89A4B] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-[#D3C5AE] italic mb-6 leading-relaxed">"{t.quote}"</p>
              <div className="pt-4 border-t border-[#C89A4B]/20">
                <p className="font-cinzel text-sm text-[#F4E8D5]">{t.name}</p>
                <p className="text-[11px] text-[#D3C5AE] font-mono">{t.location}</p>
                <p className="text-[10px] text-[#C89A4B] mt-1">{t.trip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== FINAL CONVERSION CTA ====================
const FinalConversionCTA: React.FC = () => {
  const { navigateTo } = useApp();
  
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-[#1a1510]/90" />
      
      <div className="relative max-w-4xl mx-auto text-center z-10">
        <h2 className="font-cormorant text-4xl sm:text-5xl md:text-6xl text-[#F4E8D5] font-light mb-6 leading-tight">
          Your Safari Story
          <span className="block italic text-[#C89A4B]">Begins Today</span>
        </h2>
        
        <p className="text-lg text-[#D3C5AE] max-w-2xl mx-auto mb-10">
          Join thousands of travelers who have discovered East Africa's magic through our expertly curated expeditions.
        </p>
        
        {/* Triple CTA */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          <button
            onClick={() => navigateTo('ai-planner')}
            className="w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel font-bold tracking-wider hover:bg-[#D6B06A] transition-all shadow-2xl"
          >
            <Sparkles className="w-5 h-5" />
            Plan My Safari
          </button>
          
          <button
            onClick={() => navigateTo('destinations')}
            className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-5 border-2 border-[#F4E8D5]/30 text-[#F4E8D5] rounded-xl font-cinzel tracking-wider hover:border-[#F4E8D5] hover:bg-[#F4E8D5]/10 transition-all"
          >
            <Compass className="w-5 h-5" />
            Explore Destinations
          </button>
          
          <button
            onClick={() => navigateTo('ai-planner')}
            className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-5 border border-[#C89A4B]/50 text-[#C89A4B] rounded-xl font-cinzel tracking-wider hover:border-[#C89A4B] hover:bg-[#C89A4B]/10 transition-all"
          >
            <Phone className="w-5 h-5" />
            Speak With Expert
          </button>
        </div>
        
        {/* Reassurance */}
        <p className="text-sm text-[#D3C5AE]/70 mt-8">
          Free planning • No obligation • Expert guidance within 24 hours
        </p>
      </div>
    </section>
  );
};

// ==================== MAIN CONVERSION HOME COMPONENT ====================
export const ConversionHome: React.FC = () => {
  const { navigateTo } = useApp();
  
  return (
    <>
      {/* 1. Hero with 3 Primary CTAs */}
      <ConversionHero />
      
      {/* 2. Quick Destination Selector - Goal: Explore */}
      <QuickDestinationSelector />
      
      {/* 3. Expert Consultation - Goal: Expert */}
      <ExpertConsultationCTA />
      
      {/* 4. Migration Highlight - Goal: Plan/Inquire */}
      <MigrationHighlight />
      
      {/* 5. Social Proof - Builds Trust */}
      <ConversionTestimonials />
      
      {/* 6. Final Conversion CTA */}
      <FinalConversionCTA />
      
      {/* 7. Trust & Authority - The Most Trusted Safari Authority */}
      <TrustAndAuthority />
      
      {/* Import other luxury sections for scroll depth */}
      <ConservationImpactSection />
      <AuthoritySectionMini />
    </>
  );
};

// Mini versions to keep page lightweight
const ConservationImpactSection: React.FC = () => {
  const { navigateTo } = useApp();
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0f0d0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-cormorant text-3xl sm:text-4xl text-[#F4E8D5] font-light mb-4">
            Travel with <span className="italic text-[#4F6848]">Purpose</span>
          </h2>
          <p className="text-[#D3C5AE] max-w-xl mx-auto">
            Every booking directly funds conservation and community development across East Africa.
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { value: '$4.2M+', label: 'Conservation Funded' },
            { value: '18M', label: 'Acres Protected' },
            { value: '2,400+', label: 'Rangers Supported' },
            { value: '45', label: 'Communities Empowered' }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 bg-[#2D2621]/50 rounded-2xl border border-[#C89A4B]/20">
              <div className="font-cormorant text-3xl text-[#C89A4B] font-light mb-2">{stat.value}</div>
              <div className="text-[10px] font-cinzel text-[#D3C5AE] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <button
            onClick={() => navigateTo('ai-planner')}
            className="inline-flex items-center gap-2 text-[#C89A4B] hover:text-[#D6B06A] transition-colors font-cinzel text-sm tracking-wider"
          >
            Plan Your Impact Safari
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

const AuthoritySectionMini: React.FC = () => {
  const partners = ['Singita', 'Angama Mara', '&Beyond', 'Four Seasons', 'One&Only'];
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#E8DCC8]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] font-cinzel text-[#5A4738] tracking-[0.3em] uppercase">
            Authorized Booking Partner
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
          {partners.map((partner, idx) => (
            <span key={idx} className="font-cormorant text-xl lg:text-2xl text-[#2A1E17] italic">
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConversionHome;
