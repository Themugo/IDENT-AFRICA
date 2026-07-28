import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, 
  ChevronLeft, ChevronRight, Eye, Mic
} from 'lucide-react';

interface Guide {
  id: string;
  name: string;
  role: string;
  baseLocation: string;
  languages: string[];
  specialties: string[];
  yearsWithNetwork: number;
  totalGuests: number;
  bio: string;
  image: string;
  featured: boolean;
  rating: number;
}

export const SafariGuides: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const guides: Guide[] = [
    {
      id: 'guide-1',
      name: 'Samuel "Sam" Ole Kirimi',
      role: 'Master Field Guide',
      baseLocation: 'Masai Mara, Kenya',
      languages: ['English', 'Swahili', 'Maasai', 'Basic French'],
      specialties: ['Big Cat Tracking', 'Birding', 'Cultural Tours'],
      yearsWithNetwork: 16,
      totalGuests: 2847,
      bio: 'Born into a Maasai warrior family in the Mara, Sam\'s tracking skills are legendary. He can identify individual animals by their footprints and predict predator movements with uncanny accuracy.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
      featured: true,
      rating: 4.99
    },
    {
      id: 'guide-2',
      name: 'Grace Nyambura',
      role: 'Senior Ranger & Conservationist',
      baseLocation: 'Serengeti, Tanzania',
      languages: ['English', 'Swahili', 'German'],
      specialties: ['Wildebeest Migration', 'Photography Support', 'Conservation Talks'],
      yearsWithNetwork: 12,
      totalGuests: 1892,
      bio: 'Grace combines her deep knowledge of Serengeti ecosystems with exceptional storytelling abilities. Her evening bush dinners under the stars are the highlight of any safari.',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      featured: true,
      rating: 4.97
    },
    {
      id: 'guide-3',
      name: 'Moses Tumusiime',
      role: 'Mountain Gorilla Guide',
      baseLocation: 'Volcanoes National Park, Rwanda',
      languages: ['English', 'French', 'Kinyarwanda', 'Luganda'],
      specialties: ['Gorilla Trekking', 'Primate Behavior', 'Forest Walks'],
      yearsWithNetwork: 9,
      totalGuests: 687,
      bio: 'Moses is one of only 200 licensed gorilla guides in the world. His quiet demeanor and extensive training ensures peaceful encounters with these gentle giants.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      featured: true,
      rating: 5.0
    },
    {
      id: 'guide-4',
      name: 'Lilian Jepkosgei',
      role: 'Ornithological Specialist',
      baseLocation: 'Lake Nakuru, Kenya',
      languages: ['English', 'Swahili', 'Kikuyu'],
      specialties: ['Bird Watching', 'Flamingo Ecology', 'Wetland Tours'],
      yearsWithNetwork: 8,
      totalGuests: 1123,
      bio: 'With over 500 East African bird species memorized, Lilian transforms any safari into an avian adventure. She\'s discovered three previously undocumented breeding sites.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      featured: false,
      rating: 4.95
    },
    {
      id: 'guide-5',
      name: 'John Kamau',
      role: 'Sundowner Specialist',
      baseLocation: 'Amboseli, Kenya',
      languages: ['English', 'Swahili', 'Maasai'],
      specialties: ['Elephant Behavior', 'Photography', 'Sunset Safaris'],
      yearsWithNetwork: 14,
      totalGuests: 2341,
      bio: 'John\'s Amboseli safaris are renowned for the perfectly positioned sundowners with Kilimanjaro as backdrop. His knowledge of elephant families is unparalleled.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      featured: false,
      rating: 4.98
    }
  ];

  const featuredGuides = guides.filter(g => g.featured);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % featuredGuides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + featuredGuides.length) % featuredGuides.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#E8DCC8]">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#C89A4B]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-[#4F6848]/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#4F6848]" />
            <Eye className="w-6 h-6 text-[#4F6848]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#4F6848]" />
          </div>
          
          <h2 className="font-cormorant text-4xl lg:text-5xl text-[#2A1E17] font-light mb-4">
            Field Guides
          </h2>
          <p className="text-[#5A4738] max-w-2xl mx-auto">
            The eyes and voice of your safari. Our rangers average 12 years of field experience and speak multiple languages.
          </p>
        </motion.div>

        {/* Featured Guide Carousel */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-12 h-12 bg-[#2D2621] rounded-full flex items-center justify-center text-[#F4E8D5] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-12 h-12 bg-[#2D2621] rounded-full flex items-center justify-center text-[#F4E8D5] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all shadow-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="grid lg:grid-cols-2 gap-8 bg-[#FFF8EC] rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Image */}
                <div className="relative h-80 lg:h-auto">
                  <img 
                    src={featuredGuides[currentSlide].image}
                    alt={featuredGuides[currentSlide].name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8EC] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#FFF8EC]" />
                  
                  {/* Location Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-[#0a0806]/70 backdrop-blur-sm rounded-full">
                    <MapPin className="w-4 h-4 text-[#C89A4B]" />
                    <span className="text-[#F4E8D5] text-sm">{featuredGuides[currentSlide].baseLocation}</span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-2 bg-[#0a0806]/70 backdrop-blur-sm rounded-full">
                    <Star className="w-4 h-4 text-[#C89A4B] fill-current" />
                    <span className="text-[#F4E8D5] font-medium">{featuredGuides[currentSlide].rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-[#4F6848] text-[#F4E8D5] text-xs font-cinzel tracking-wider rounded-full mb-4">
                      {featuredGuides[currentSlide].role}
                    </span>
                    <h3 className="font-cormorant text-3xl lg:text-4xl text-[#2A1E17] font-light mb-2">
                      {featuredGuides[currentSlide].name}
                    </h3>
                  </div>

                  <p className="text-[#5A4738] leading-relaxed mb-6 italic">
                    "{featuredGuides[currentSlide].bio}"
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredGuides[currentSlide].specialties.map((spec, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-[#E8DCC8] rounded-full text-xs text-[#5A4738]">
                        <Mic className="w-3 h-3 text-[#4F6848]" />
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredGuides[currentSlide].languages.map((lang, idx) => (
                      <span key={idx} className="px-2 py-1 bg-[#2D2621] rounded text-xs text-[#F4E8D5]">
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#C89A4B]/30">
                    <div>
                      <div className="font-cormorant text-2xl text-[#4F6848]">{featuredGuides[currentSlide].yearsWithNetwork}</div>
                      <div className="text-[10px] font-cinzel text-[#5A4738] uppercase tracking-wider">Years in Network</div>
                    </div>
                    <div>
                      <div className="font-cormorant text-2xl text-[#4F6848]">{featuredGuides[currentSlide].totalGuests.toLocaleString()}</div>
                      <div className="text-[10px] font-cinzel text-[#5A4738] uppercase tracking-wider">Happy Guests</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {featuredGuides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlide ? 1 : -1);
                  setCurrentSlide(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'w-8 bg-[#4F6848]' : 'bg-[#C89A4B]/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* All Guides Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="font-cormorant text-2xl text-[#2A1E17]">More of Our Expert Rangers</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {guides.filter(g => !g.featured).map((guide) => (
              <div 
                key={guide.id}
                className="bg-[#FFF8EC] rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-[#C89A4B]/20"
              >
                <img 
                  src={guide.image}
                  alt={guide.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-[#C89A4B]/30"
                />
                <h4 className="font-serif text-sm text-[#2A1E17] mb-1">{guide.name}</h4>
                <p className="text-xs text-[#5A4738] mb-2">{guide.role}</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-[#C89A4B] fill-current" />
                  <span className="text-xs text-[#5A4738]">{guide.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SafariGuides;
