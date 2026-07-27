import React, { useState, useEffect, useRef } from 'react';
import { Star, Award, Shield, Crown, CheckCircle, ChevronRight, Quote, Building2, Users, Globe } from 'lucide-react';

interface LodgePartner {
  name: string;
  tier: 'Signature' | 'Exclusive' | 'Preferred';
  location: string;
  description: string;
  image: string;
}

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  location: string;
  rating: number;
  expedition: string;
  avatar: string;
}

export const AuthoritySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trust' | 'partners' | 'testimonials'>('trust');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const lodgePartners: LodgePartner[] = [
    {
      name: 'Singita Sasakwa Lodge',
      tier: 'Signature',
      location: 'Serengeti, Tanzania',
      description: 'Colonial manor house elegance overlooking the Mara River crossing points. Private concessions ensure exclusive wildlife encounters.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Angama Mara',
      tier: 'Signature',
      location: 'Masai Mara, Kenya',
      description: 'Perched on the Great Rift Valley escarpment, offering sweeping views of the Mara Triangle. Cinema-quality storytelling meets safari luxury.',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: '&Beyond Bateleur Camp',
      tier: 'Exclusive',
      location: 'Masai Mara, Kenya',
      description: 'Intimate tented camp in the private Mara Triangle. The ultimate combination of classic safari romance and contemporary luxury.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'One&Only Nyungwe House',
      tier: 'Exclusive',
      location: 'Rwanda',
      description: 'Chimpanzee trekking base camp surrounded by ancient rainforest. Pristine suites with floor-to-ceiling forest views.',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Four Seasons Serengeti',
      tier: 'Preferred',
      location: 'Serengeti, Tanzania',
      description: 'World-class service meets the African bush. Infinity pools overlooking watering holes frequented by elephants.',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'The Residence Zanzibar',
      tier: 'Preferred',
      location: 'Zanzibar, Tanzania',
      description: 'Private beachfront villas on the spice island. Arabic-inspired architecture meets Swahili coastal charm.',
      image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const testimonials: Testimonial[] = [
    {
      quote: 'Watching the great migration from our private terrace at Singita, with every detail orchestrated flawlessly — this was not a vacation, it was a transformation.',
      author: 'Victoria & James Worthington',
      title: 'Founders, Meridian Capital',
      location: 'London, United Kingdom',
      rating: 5,
      expedition: 'Serengeti & Masai Mara: The Great Migration',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    {
      quote: 'The gorilla trekking experience organized through Ident Africa was profoundly moving. To be with Dianne Fossey\'s descendants in their natural habitat, guided by passionate rangers — priceless.',
      author: 'Dr. Michael Tanaka',
      title: 'Professor of Primatology, Stanford',
      location: 'San Francisco, USA',
      rating: 5,
      expedition: 'Rwanda Gorilla Discovery: Intimate Encounters',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    {
      quote: 'From the moment our seaplane landed on Lake Victoria to our final sunset dhow cruise in Zanzibar, every element exceeded our highest expectations. True luxury travel.',
      author: 'Charlotte & Edouard Beaumont',
      title: 'Art Patrons',
      location: 'Paris, France',
      rating: 5,
      expedition: 'Kenya & Zanzibar: Bush & Beach Odyssey',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }
  ];

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

  const trustMetrics = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Ranger Verified Network',
      description: 'Every operator and guide in our network holds valid licenses from local wildlife authorities, with a minimum of 10 years field experience.',
      stat: '100%'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Certified Sustainable',
      description: 'All properties hold Gold or Platinum Eco Tourism Kenya certification and contribute minimum 5% of revenue to conservation trusts.',
      stat: '$4.2M+'
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: 'Preferred Partner Status',
      description: 'As an authorized booking partner for Singita, Angama, &Beyond, and others, we offer exclusive rates and guaranteed suite allocations.',
      stat: '42'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Satisfaction Guarantee',
      description: 'Full refund policy plus complimentary rebooking if wildlife sightings fall below expectations. Our safari specialists monitor conditions daily.',
      stat: '99.4%'
    }
  ];

  const getTierBadge = (tier: LodgePartner['tier']) => {
    const styles = {
      'Signature': 'bg-[#C89A4B] text-[#1a1008]',
      'Exclusive': 'bg-[#4F6848] text-[#F4E8D5]',
      'Preferred': 'bg-[#2D2621] text-[#D3C5AE] border border-[#C89A4B]/30'
    };
    return styles[tier];
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#E8DCC8]">
      
      {/* Textured Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-29 66c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23C89A4B' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C89A4B]" />
            <Crown className="w-6 h-6 text-[#C89A4B]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C89A4B]" />
          </div>
          
          <h2 className="font-cormorant text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-6 text-[#2A1E17]">
            A Legacy of <span className="italic text-[#C89A4B]">Excellence</span>
          </h2>
          
          <p className="text-base text-[#5A4738] max-w-2xl mx-auto font-light leading-relaxed">
            Trusted by discerning travelers, royalty, and conservationists alike. 
            Our commitment to authenticity, luxury, and impact defines every expedition.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex justify-center mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex bg-[#2D2621] rounded-full p-1.5">
            {(['trust', 'partners', 'testimonials'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-8 py-3 rounded-full text-[11px] font-cinzel tracking-[0.2em] uppercase transition-all duration-500
                  ${activeTab === tab
                    ? 'bg-[#C89A4B] text-[#1a1008]'
                    : 'text-[#F4E8D5] hover:text-[#C89A4B]'
                  }
                `}
              >
                {tab === 'trust' ? 'Trust & Credentials' : tab === 'partners' ? 'Lodge Partners' : 'Client Stories'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Trust & Credentials */}
          {activeTab === 'trust' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trustMetrics.map((metric, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#FFF8EC] rounded-2xl p-8 border border-[#C89A4B]/40 shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#2D2621] flex items-center justify-center text-[#C89A4B] mb-6">
                      {metric.icon}
                    </div>
                    <div className="font-cormorant text-4xl text-[#C89A4B] font-light mb-2">
                      {metric.stat}
                    </div>
                    <h4 className="font-serif text-lg text-[#2A1E17] mb-3">
                      {metric.title}
                    </h4>
                    <p className="text-sm text-[#5A4738] leading-relaxed">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Press & Recognition */}
              <div className="bg-[#2D2621] rounded-3xl p-12">
                <div className="text-center mb-10">
                  <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.3em] uppercase">
                    As Featured In
                  </span>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
                  {['Condé Nast Traveller', 'National Geographic', 'Travel + Leisure', 'AFAR', ' Robb Report'].map((pub, idx) => (
                    <span key={idx} className="font-cormorant text-2xl text-[#F4E8D5] italic tracking-wide">
                      {pub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lodge Partners */}
          {activeTab === 'partners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lodgePartners.map((partner, idx) => (
                <div 
                  key={idx}
                  className="group bg-[#FFF8EC] rounded-2xl overflow-hidden border border-[#C89A4B]/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={partner.image}
                      alt={partner.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8EC] via-transparent to-transparent" />
                    <span className={`absolute top-4 right-4 px-3 py-1 text-[9px] font-cinzel tracking-[0.15em] uppercase rounded-full ${getTierBadge(partner.tier)}`}>
                      {partner.tier} Partner
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-3.5 h-3.5 text-[#C89A4B]" />
                      <span className="text-[11px] text-[#5A4738] font-mono">{partner.location}</span>
                    </div>
                    <h4 className="font-serif text-xl text-[#2A1E17] mb-3 group-hover:text-[#C89A4B] transition-colors">
                      {partner.name}
                    </h4>
                    <p className="text-sm text-[#5A4738] leading-relaxed mb-4">
                      {partner.description}
                    </p>
                    <button className="flex items-center gap-2 text-[#C89A4B] text-[11px] font-cinzel tracking-wider uppercase group-hover:gap-3 transition-all">
                      View Property <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Testimonials */}
          {activeTab === 'testimonials' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <div 
                  key={idx}
                  className="bg-[#FFF8EC] rounded-2xl p-8 border border-[#C89A4B]/40 shadow-xl relative"
                >
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-[#C89A4B]/20" />
                  
                  <div className="flex gap-1 text-[#C89A4B] mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-[15px] text-[#2A1E17] leading-relaxed italic mb-8 font-light">
                    "{testimonial.quote}"
                  </p>

                  <div className="pt-6 border-t border-[#C89A4B]/30">
                    <div className="flex items-center gap-4">
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#C89A4B]/30"
                      />
                      <div>
                        <h5 className="font-serif text-[#2A1E17] font-bold">
                          {testimonial.author}
                        </h5>
                        <p className="text-[11px] text-[#5A4738] font-mono">
                          {testimonial.title}
                        </p>
                        <p className="text-[11px] text-[#C89A4B] font-mono mt-1">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#F5E7D0] rounded-xl">
                    <span className="text-[10px] font-cinzel text-[#5A4738] tracking-[0.2em] uppercase block mb-1">
                      Expedition
                    </span>
                    <span className="text-sm text-[#2A1E17] font-medium">
                      {testimonial.expedition}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-20 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <p className="text-[#5A4738] mb-6">
            Join thousands of discerning travelers who have experienced East Africa with Ident Africa
          </p>
          <button className="px-12 py-4 bg-[#2D2621] text-[#F4E8D5] font-cinzel text-[11px] tracking-[0.2em] uppercase hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all duration-500 border border-[#C89A4B]/40 hover:border-[#C89A4B]">
            Begin Your Journey
          </button>
        </div>

      </div>
    </section>
  );
};
