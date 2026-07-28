import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Star, Play, Quote, MapPin, Calendar, 
  ChevronLeft, ChevronRight, CheckCircle, MessageSquare
} from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company: string;
  location: string;
  rating: number;
  expedition: string;
  duration: string;
  date: string;
  avatar: string;
  photos: string[];
  videoThumbnail: string;
  type: 'video' | 'written';
  verified: boolean;
  highlights: string[];
}

export const RichTestimonials: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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

  const testimonials: Testimonial[] = [
    {
      id: 'test-1',
      quote: 'The great migration from our private terrace at Singita was beyond anything we imagined. James, our guide, seemed to know exactly where the herds would cross. We witnessed three river crossings in a single morning.',
      author: 'Victoria & James Worthington',
      title: 'Founders',
      company: 'Meridian Capital Partners',
      location: 'London, United Kingdom',
      rating: 5,
      expedition: 'Serengeti & Masai Mara: The Great Migration',
      duration: '10 Days',
      date: 'July 2025',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=400&q=80'
      ],
      videoThumbnail: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      type: 'video',
      verified: true,
      highlights: ['Private river crossing viewpoint', 'Cheetah hunt witnessed', 'Hot air balloon sunrise']
    },
    {
      id: 'test-2',
      quote: 'To be in the presence of Dian Fossey\'s mountain gorillas, guided by Moses who has spent a decade studying their families, was a profoundly spiritual experience. This wasn\'t tourism — it was communion.',
      author: 'Dr. Michael Tanaka',
      title: 'Professor of Primatology',
      company: 'Stanford University',
      location: 'San Francisco, USA',
      rating: 5,
      expedition: 'Rwanda Gorilla Discovery: Intimate Encounters',
      duration: '7 Days',
      date: 'September 2025',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1502216172072-05dx5ejVPzA?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=400&q=80'
      ],
      videoThumbnail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      type: 'video',
      verified: true,
      highlights: ['Silverback interaction', 'Golden monkey trek', 'Kigali Genocide Memorial visit']
    },
    {
      id: 'test-3',
      quote: 'From our seaplane landing on Lake Victoria to our final sunset dhow cruise in Zanzibar, every element exceeded our expectations. The attention to detail — from champagne temperature to pillow menu — was extraordinary.',
      author: 'Charlotte & Edouard Beaumont',
      title: 'Art Patrons',
      company: 'Beaumont Foundation',
      location: 'Paris, France',
      rating: 5,
      expedition: 'Kenya & Zanzibar: Bush & Beach Odyssey',
      duration: '14 Days',
      date: 'November 2025',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80'
      ],
      videoThumbnail: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80',
      type: 'written',
      verified: true,
      highlights: ['Private island dinner', 'Spice plantation tour', 'Stone Town history walk']
    },
    {
      id: 'test-4',
      quote: 'As a wildlife photographer, I\'ve been on dozens of safaris. This was different. Our guide Samuel anticipated every shot — light angles, subject positioning. I came home with images that hang in galleries now.',
      author: 'Hans Mueller',
      title: 'Wildlife Photographer',
      company: 'National Geographic Contributor',
      location: 'Berlin, Germany',
      rating: 5,
      expedition: 'Amboseli & Maasai Mara: The Photography Masterclass',
      duration: '12 Days',
      date: 'February 2026',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80'
      ],
      videoThumbnail: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      type: 'video',
      verified: true,
      highlights: ['Elephant portrait session', 'Leopard in acacia', 'Night game drive']
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsPlaying(false);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsPlaying(false);
  };

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#E8DCC8]">
      
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8DCC8] via-[#F4E8D5] to-[#E8DCC8]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C89A4B]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#4F6848]/10 rounded-full blur-3xl" />
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
            <Quote className="w-6 h-6 text-[#C89A4B]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C89A4B]" />
          </div>
          
          <h2 className="font-cormorant text-4xl lg:text-5xl text-[#2A1E17] font-light mb-4">
            Traveler Stories
          </h2>
          <p className="text-[#5A4738] max-w-2xl mx-auto">
            Real experiences from discerning travelers who have experienced East Africa with us
          </p>

          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#C89A4B] fill-current" />
                ))}
              </div>
              <span className="text-[#2A1E17] font-medium">4.97</span>
            </div>
            <div className="text-[#5A4738] text-sm">from 2,847 verified reviews</div>
          </div>
        </motion.div>

        {/* Main Testimonial */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid lg:grid-cols-5 gap-8 mb-12"
        >
          {/* Video/Image Section */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#2D2621]">
              <img 
                src={currentTestimonial.videoThumbnail}
                alt="Expedition highlight"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008] via-transparent to-transparent" />
              
              {/* Play Button */}
              {currentTestimonial.type === 'video' && (
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-[#C89A4B]/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                    <Play className={`w-8 h-8 text-[#1a1008] ml-1 ${isPlaying ? 'hidden' : ''}`} />
                    <div className={`w-8 h-8 flex items-center justify-center ${isPlaying ? '' : 'hidden'}`}>
                      <div className="w-6 h-6 border-2 border-[#1a1008] border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                </button>
              )}

              {/* Photos Strip */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2">
                  {currentTestimonial.photos.map((photo, idx) => (
                    <img 
                      key={idx}
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-16 h-12 rounded-lg object-cover border-2 border-[#F4E8D5]/20 hover:border-[#C89A4B] transition-colors cursor-pointer"
                    />
                  ))}
                </div>
              </div>

              {/* Video Badge */}
              {currentTestimonial.type === 'video' && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-[#0a0806]/70 rounded-full">
                  <Play className="w-4 h-4 text-[#C89A4B]" />
                  <span className="text-[#F4E8D5] text-xs">Watch Story</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#C89A4B] fill-current" />
              ))}
              {currentTestimonial.verified && (
                <span className="flex items-center gap-1 ml-2 px-2 py-1 bg-[#4F6848]/20 rounded-full">
                  <CheckCircle className="w-3 h-3 text-[#4F6848]" />
                  <span className="text-[#4F6848] text-xs">Verified</span>
                </span>
              )}
            </div>

            {/* Quote */}
            <blockquote className="flex-1">
              <Quote className="w-10 h-10 text-[#C89A4B]/20 mb-4" />
              <p className="text-xl lg:text-2xl text-[#2A1E17] leading-relaxed font-light italic mb-8">
                "{currentTestimonial.quote}"
              </p>
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={currentTestimonial.avatar}
                alt={currentTestimonial.author}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#C89A4B]/30"
              />
              <div>
                <h4 className="font-serif text-lg text-[#2A1E17] font-bold">{currentTestimonial.author}</h4>
                <p className="text-[#5A4738] text-sm">{currentTestimonial.title}, {currentTestimonial.company}</p>
                <p className="text-[#C89A4B] text-xs flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {currentTestimonial.location}
                </p>
              </div>
            </div>

            {/* Expedition Details */}
            <div className="bg-[#FFF8EC] rounded-xl p-6 border border-[#C89A4B]/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-cinzel text-[#5A4738] uppercase tracking-wider">Expedition</span>
                  <h5 className="font-serif text-[#2A1E17]">{currentTestimonial.expedition}</h5>
                </div>
              </div>
              
              <div className="flex gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C89A4B]" />
                  <span className="text-sm text-[#5A4738]">{currentTestimonial.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C89A4B]" />
                  <span className="text-sm text-[#5A4738]">{currentTestimonial.duration}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {currentTestimonial.highlights.map((highlight, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#E8DCC8] rounded-full text-xs text-[#5A4738]">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-8">
          <button 
            onClick={prevTestimonial}
            className="w-12 h-12 rounded-full border border-[#C89A4B]/30 flex items-center justify-center text-[#5A4738] hover:border-[#C89A4B] hover:text-[#C89A4B] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-3">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTestimonial(idx);
                  setIsPlaying(false);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === activeTestimonial 
                    ? 'w-8 bg-[#C89A4B]' 
                    : 'bg-[#C89A4B]/30 hover:bg-[#C89A4B]/50'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={nextTestimonial}
            className="w-12 h-12 rounded-full border border-[#C89A4B]/30 flex items-center justify-center text-[#5A4738] hover:border-[#C89A4B] hover:text-[#C89A4B] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* More Reviews CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-[#5A4738] mb-4">
            Join thousands of travelers who have created unforgettable memories
          </p>
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#2D2621] text-[#F4E8D5] rounded-xl font-cinzel text-xs tracking-wider hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all">
            Start Your Journey
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default RichTestimonials;
