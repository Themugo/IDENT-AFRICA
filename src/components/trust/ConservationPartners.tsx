import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Leaf, Heart, Users, TreeDeciduous, PawPrint, 
  Globe, ArrowUpRight, ChevronRight, Award, Building2
} from 'lucide-react';

interface ConservationPartner {
  id: string;
  name: string;
  type: string;
  focus: string;
  impact: {
    animalsProtected: string;
    acresPreserved: string;
    communitiesImpacted: string;
  };
  description: string;
  logo: string;
  since: number;
  contribution: string;
  featured: boolean;
}

export const ConservationPartners: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
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

  const partners: ConservationPartner[] = [
    {
      id: 'partner-1',
      name: 'Serengeti Wildlife Trust',
      type: 'Wildlife Conservation',
      focus: 'Lion & Leopard Research',
      impact: {
        animalsProtected: '2,400+',
        acresPreserved: '5.2M',
        communitiesImpacted: '28'
      },
      description: 'Leading big cat research and anti-poaching initiatives across the Serengeti ecosystem for over 40 years.',
      logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=200&q=80',
      since: 2018,
      contribution: '$180,000',
      featured: true
    },
    {
      id: 'partner-2',
      name: 'Mountain Gorilla Conservation Fund',
      type: 'Primate Protection',
      focus: 'Gorilla Preservation',
      impact: {
        animalsProtected: '1,063',
        acresPreserved: '320K',
        communitiesImpacted: '45'
      },
      description: 'Dedicated to protecting the endangered mountain gorilla population through habitat preservation and community engagement.',
      logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=80',
      since: 2019,
      contribution: '$220,000',
      featured: true
    },
    {
      id: 'partner-3',
      name: 'Maasai Mara Wildlife Trust',
      type: 'Community Conservation',
      focus: 'Human-Wildlife Coexistence',
      impact: {
        animalsProtected: '3,100+',
        acresPreserved: '1.8M',
        communitiesImpacted: '62'
      },
      description: 'Empowering Maasai communities to become stewards of wildlife through education and sustainable tourism.',
      logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=200&q=80',
      since: 2017,
      contribution: '$145,000',
      featured: true
    },
    {
      id: 'partner-4',
      name: 'African Elephant Research Institute',
      type: 'Elephant Conservation',
      focus: 'Elephant Corridor Protection',
      impact: {
        animalsProtected: '18,000+',
        acresPreserved: '2.1M',
        communitiesImpacted: '34'
      },
      description: 'Protecting elephant migration corridors and studying elephant social structures to inform conservation strategies.',
      logo: 'https://images.unsplash.com/photo-1575496131869-1e3d1f1b9b6f?auto=format&fit=crop&w=200&q=80',
      since: 2020,
      contribution: '$195,000',
      featured: false
    },
    {
      id: 'partner-5',
      name: 'Rwanda Eco-Fund',
      type: 'Reforestation',
      focus: 'Forest Restoration',
      impact: {
        animalsProtected: '500+',
        acresPreserved: '45K',
        communitiesImpacted: '28'
      },
      description: 'Restoring degraded forest areas in Rwanda while creating sustainable livelihoods for local communities.',
      logo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80',
      since: 2021,
      contribution: '$85,000',
      featured: false
    },
    {
      id: 'partner-6',
      name: 'East African Coastal Conservation',
      type: 'Marine Conservation',
      focus: 'Coral Reef Protection',
      impact: {
        animalsProtected: '2,800+',
        acresPreserved: '120K',
        communitiesImpacted: '19'
      },
      description: 'Protecting marine ecosystems along the East African coast, including sea turtles and coral reef restoration.',
      logo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80',
      since: 2022,
      contribution: '$110,000',
      featured: false
    }
  ];

  const featuredPartners = partners.filter(p => p.featured);

  const totalImpact = {
    contribution: partners.reduce((sum, p) => sum + parseInt(p.contribution.replace(/[$,]/g, '')), 0),
    animalsProtected: partners.reduce((sum, p) => sum + parseInt(p.impact.animalsProtected.replace(/[+,]/g, '')), 0),
    acresPreserved: partners.reduce((sum, p) => sum + parseInt(p.impact.acresPreserved.replace(/[K,M,]/g, '').replace('K', '000').replace('M', '000000')), 0)
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#1A1008]">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-29 66c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23C89A4B' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Leaf Decoration */}
      <div className="absolute top-20 right-20 text-[#4F6848]/10">
        <Leaf className="w-64 h-64" />
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
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#4F6848]" />
            <Globe className="w-6 h-6 text-[#4F6848]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#4F6848]" />
          </div>
          
          <h2 className="font-cormorant text-4xl lg:text-5xl text-[#F4E8D5] font-light mb-4">
            Conservation Partners
          </h2>
          <p className="text-[#D3C5AE] max-w-2xl mx-auto">
            Every safari directly contributes to protecting East Africa's irreplaceable wildlife and supporting local communities
          </p>
        </motion.div>

        {/* Impact Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="bg-[#2D2621]/50 rounded-2xl p-6 text-center border border-[#4F6848]/30">
            <TreeDeciduous className="w-8 h-8 text-[#4F6848] mx-auto mb-3" />
            <div className="font-cormorant text-3xl text-[#4F6848] mb-1">18M+</div>
            <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Acres Protected</div>
          </div>
          <div className="bg-[#2D2621]/50 rounded-2xl p-6 text-center border border-[#4F6848]/30">
            <PawPrint className="w-8 h-8 text-[#4F6848] mx-auto mb-3" />
            <div className="font-cormorant text-3xl text-[#4F6848] mb-1">27,000+</div>
            <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Animals Protected</div>
          </div>
          <div className="bg-[#2D2621]/50 rounded-2xl p-6 text-center border border-[#4F6848]/30">
            <Users className="w-8 h-8 text-[#4F6848] mx-auto mb-3" />
            <div className="font-cormorant text-3xl text-[#4F6848] mb-1">216</div>
            <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Communities</div>
          </div>
          <div className="bg-[#2D2621]/50 rounded-2xl p-6 text-center border border-[#4F6848]/30">
            <Heart className="w-8 h-8 text-[#4F6848] mx-auto mb-3" />
            <div className="font-cormorant text-3xl text-[#4F6848] mb-1">$4.2M+</div>
            <div className="text-[10px] font-cinzel text-[#D3C5AE]/60 uppercase tracking-wider">Total Donated</div>
          </div>
        </motion.div>

        {/* Featured Partners */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredPartners.map((partner, idx) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
              className="bg-gradient-to-br from-[#2D2621]/80 to-[#1A1008] rounded-2xl overflow-hidden border border-[#4F6848]/30 hover:border-[#4F6848]/50 transition-all group"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-xl bg-[#4F6848]/20 flex items-center justify-center">
                    <Leaf className="w-8 h-8 text-[#4F6848]" />
                  </div>
                  <span className="px-3 py-1 bg-[#4F6848]/20 text-[#4F6848] text-xs rounded-full">
                    Since {partner.since}
                  </span>
                </div>

                <h3 className="font-cormorant text-2xl text-[#F4E8D5] mb-2">{partner.name}</h3>
                <p className="text-[#C89A4B] text-sm mb-4">{partner.type}</p>
                <p className="text-[#D3C5AE]/70 text-sm leading-relaxed mb-6">
                  {partner.description}
                </p>

                {/* Focus Area */}
                <div className="flex items-center gap-2 mb-6">
                  <ArrowUpRight className="w-4 h-4 text-[#4F6848]" />
                  <span className="text-[#D3C5AE] text-sm">{partner.focus}</span>
                </div>

                {/* Impact Grid */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#4F6848]/20">
                  <div className="text-center">
                    <div className="font-cormorant text-xl text-[#4F6848]">{partner.impact.animalsProtected}</div>
                    <div className="text-[9px] font-cinzel text-[#D3C5AE]/50 uppercase tracking-wider">Protected</div>
                  </div>
                  <div className="text-center">
                    <div className="font-cormorant text-xl text-[#4F6848]">{partner.impact.acresPreserved}</div>
                    <div className="text-[9px] font-cinzel text-[#D3C5AE]/50 uppercase tracking-wider">Acres</div>
                  </div>
                  <div className="text-center">
                    <div className="font-cormorant text-xl text-[#4F6848]">{partner.impact.communitiesImpacted}</div>
                    <div className="text-[9px] font-cinzel text-[#D3C5AE]/50 uppercase tracking-wider">Villages</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-[#2D2621]/50 flex items-center justify-between">
                <span className="text-[#D3C5AE]/60 text-xs">Our Contribution</span>
                <span className="font-cormorant text-xl text-[#C89A4B]">{partner.contribution}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* More Partners */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-[#2D2621]/30 rounded-2xl p-8 border border-[#4F6848]/20">
            <div className="flex flex-wrap justify-center gap-8">
              {partners.filter(p => !p.featured).map((partner) => (
                <div key={partner.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#4F6848]/20 flex items-center justify-center group-hover:bg-[#4F6848]/30 transition-colors">
                    <Building2 className="w-5 h-5 text-[#4F6848]" />
                  </div>
                  <div>
                    <h4 className="text-[#F4E8D5] font-serif text-sm group-hover:text-[#C89A4B] transition-colors">{partner.name}</h4>
                    <p className="text-[#D3C5AE]/60 text-xs">{partner.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-[#D3C5AE]/60 mb-4 text-sm">
            Every booking includes a minimum 5% contribution to conservation
          </p>
          <button className="inline-flex items-center gap-3 px-6 py-3 border border-[#4F6848] text-[#4F6848] rounded-xl font-cinzel text-xs tracking-wider hover:bg-[#4F6848]/10 transition-colors">
            <Award className="w-4 h-4" />
            Learn About Our Impact
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ConservationPartners;
