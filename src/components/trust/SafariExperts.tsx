import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Award, Star, MapPin, Calendar, Languages, 
  ChevronRight, Quote, Shield, Zap, Heart
} from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialty: string;
  yearsExperience: number;
  location: string;
  languages: string[];
  bio: string;
  highlights: string[];
  rating: number;
  expeditionsLed: number;
  image: string;
  certifications: string[];
  featured: boolean;
}

export const SafariExperts: React.FC = () => {
  const [activeExpert, setActiveExpert] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const experts: Expert[] = [
    {
      id: 'expert-1',
      name: 'James Kioko',
      title: 'Senior Safari Curator',
      specialty: 'Great Migration Specialist',
      yearsExperience: 22,
      location: 'Nairobi, Kenya',
      languages: ['English', 'Swahili', 'Maasai'],
      bio: 'With over two decades tracking the great migration across the Serengeti-Mara ecosystem, James has developed an unparalleled understanding of predator-prey dynamics and seasonal wildlife movements.',
      highlights: [
        'First documented record of double river crossing in 2019',
        'Personal relationships with local Maasai communities',
        'Published researcher in African Wildlife Journal'
      ],
      rating: 4.98,
      expeditionsLed: 847,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      certifications: ['Lead Safari Guide Level 5', 'Kenya Wildlife Service Licensed', 'Eco-Tourism Certified'],
      featured: true
    },
    {
      id: 'expert-2',
      name: 'Dr. Amina Mwende',
      title: 'Primate Conservation Specialist',
      specialty: 'Mountain Gorilla & Chimpanzee Expert',
      yearsExperience: 15,
      location: 'Kigali, Rwanda',
      languages: ['English', 'French', 'Kinyarwanda', 'Swahili'],
      bio: 'A primatologist by training and conservationist by heart, Dr. Mwende has spent 15 years studying mountain gorilla social structures in Rwanda and the DRC, contributing to their population recovery.',
      highlights: [
        'PhD in Primatology from University of Cape Town',
        'Key contributor to Rwanda gorilla population recovery',
        ' TED speaker on human-wildlife coexistence'
      ],
      rating: 4.99,
      expeditionsLed: 423,
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
      certifications: ['PhD Primatology', 'Volcanoes National Park Licensed Guide', 'Conservation Fellow'],
      featured: true
    },
    {
      id: 'expert-3',
      name: 'Thabo Molefe',
      title: 'Big Five Safari Specialist',
      specialty: 'Predator & Elephant Expert',
      yearsExperience: 18,
      location: 'Johannesburg, South Africa',
      languages: ['English', 'Zulu', 'Afrikaans'],
      bio: 'Born in the bush, Thabo\'s intimate knowledge of South African game reserves has guided celebrities, heads of state, and wildlife photographers to once-in-a-lifetime encounters.',
      highlights: [
        'Hosted National Geographic filming expeditions',
        'Specialist in leopard tracking and lion behavior',
        'Champion of anti-poaching initiatives'
      ],
      rating: 4.96,
      expeditionsLed: 612,
      image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4b7de?auto=format&fit=crop&w=800&q=80',
      certifications: [' FGASA Level 4', 'Wildlife Photography Award 2022', 'SABI Accredited'],
      featured: false
    },
    {
      id: 'expert-4',
      name: 'Fatima Al-Rashid',
      title: 'Birding & Botanical Expert',
      specialty: 'Ornithology & Safari Specialist',
      yearsExperience: 12,
      location: 'Arusha, Tanzania',
      languages: ['English', 'Arabic', 'Swahili', 'German'],
      bio: 'Fatima\'s keen eye for detail and extensive knowledge of East African flora and fauna makes her the ideal guide for photographers and naturalists seeking the region\'s hidden biodiversity.',
      highlights: [
        'Identified 3 new species in Serengeti wetlands',
        'Published photographer in BBC Wildlife',
        'Specialist in migratory bird corridors'
      ],
      rating: 4.97,
      expeditionsLed: 389,
      image: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?auto=format&fit=crop&w=800&q=80',
      certifications: ['Birding Guide Specialist', 'Photography Excellence Award', 'Eco-Tourism Kenya'],
      featured: false
    }
  ];

  const featuredExpert = experts.find(e => e.featured) || experts[0];

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#0a0806]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C89A4B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
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
            <Shield className="w-6 h-6 text-[#C89A4B]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C89A4B]" />
          </div>
          
          <h2 className="font-cormorant text-4xl lg:text-5xl text-[#F4E8D5] font-light mb-4">
            Safari Experts
          </h2>
          <p className="text-[#D3C5AE] max-w-2xl mx-auto">
            Our curated network of wildlife specialists brings decades of field experience to every expedition
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Expert Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {experts.map((expert, idx) => (
              <button
                key={expert.id}
                onClick={() => setActiveExpert(idx)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-500 group ${
                  activeExpert === idx 
                    ? 'bg-[#C89A4B]/20 border border-[#C89A4B]/50' 
                    : 'bg-[#1A1008]/50 border border-[#2D2621] hover:border-[#C89A4B]/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={expert.image}
                    alt={expert.name}
                    className={`w-14 h-14 rounded-full object-cover border-2 transition-colors ${
                      activeExpert === idx ? 'border-[#C89A4B]' : 'border-[#2D2621]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-serif transition-colors ${activeExpert === idx ? 'text-[#C89A4B]' : 'text-[#F4E8D5]'}`}>
                      {expert.name}
                    </h4>
                    <p className="text-xs text-[#D3C5AE]/70 truncate">{expert.title}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-all ${activeExpert === idx ? 'text-[#C89A4B] rotate-90' : 'text-[#5A4738]'}`} />
                </div>
              </button>
            ))}
          </motion.div>

          {/* Expert Detail Card */}
          <motion.div 
            key={experts[activeExpert].id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 bg-[#1A1008] rounded-3xl overflow-hidden border border-[#C89A4B]/20"
          >
            {/* Hero Image */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={experts[activeExpert].image}
                alt={experts[activeExpert].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008] via-[#1A1008]/50 to-transparent" />
              
              {/* Rating Badge */}
              <div className="absolute top-4 right-4 bg-[#0a0806]/80 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
                <Star className="w-4 h-4 text-[#C89A4B] fill-current" />
                <span className="text-[#F4E8D5] font-medium">{experts[activeExpert].rating}</span>
              </div>

              {/* Specialty Badge */}
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-[#C89A4B] text-[#1a1008] text-xs font-cinzel tracking-wider rounded-full">
                  {experts[activeExpert].specialty}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-cormorant text-3xl text-[#F4E8D5] font-light mb-2">
                    {experts[activeExpert].name}
                  </h3>
                  <p className="text-[#C89A4B] text-sm">{experts[activeExpert].title}</p>
                </div>
                <div className="text-right">
                  <div className="font-cormorant text-2xl text-[#C89A4B]">{experts[activeExpert].yearsExperience}</div>
                  <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Years</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {experts[activeExpert].languages.map((lang, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-[#2D2621] rounded-full text-xs text-[#D3C5AE]">
                    <Languages className="w-3 h-3 text-[#C89A4B]" />
                    {lang}
                  </span>
                ))}
              </div>

              <p className="text-[#D3C5AE]/80 leading-relaxed mb-6 italic">
                "{experts[activeExpert].bio}"
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#2D2621]/50 rounded-xl p-4 text-center">
                  <div className="font-cormorant text-2xl text-[#C89A4B]">{experts[activeExpert].expeditionsLed}</div>
                  <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Expeditions Led</div>
                </div>
                <div className="bg-[#2D2621]/50 rounded-xl p-4 text-center">
                  <MapPin className="w-5 h-5 text-[#C89A4B] mx-auto mb-1" />
                  <div className="text-xs text-[#D3C5AE]">{experts[activeExpert].location}</div>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <div className="text-[10px] font-cinzel text-[#C89A4B] uppercase tracking-wider mb-2">
                  Certifications
                </div>
                <div className="flex flex-wrap gap-2">
                  {experts[activeExpert].certifications.map((cert, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-[#C89A4B]/10 border border-[#C89A4B]/30 rounded text-xs text-[#D3C5AE]">
                      <Award className="w-3 h-3 text-[#C89A4B]" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-xs tracking-wider hover:bg-[#D6B06A] transition-colors">
            Meet All Our Experts
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default SafariExperts;
