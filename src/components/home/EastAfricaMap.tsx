import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, ArrowRight, Navigation } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  country: string;
  description: string;
  wildlife: string[];
  coordinates: { x: number; y: number };
  zoomImage: string;
  conservationStatus: 'Prime' | 'Protected' | 'UNESCO';
  exclusiveAccess: boolean;
}

export const EastAfricaMap: React.FC = () => {
  const { navigateTo } = useApp();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const regions: Region[] = [
    {
      id: 'masai-mara',
      name: 'Masai Mara National Reserve',
      country: 'Kenya',
      description: 'Where the great wildebeest migration reaches its dramatic crescendo. Private conservancies offer exclusive access to pristine wilderness.',
      wildlife: ['Lion', 'Cheetah', 'Elephant', 'Rhino', 'Buffalo'],
      coordinates: { x: 52, y: 42 },
      zoomImage: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'Prime',
      exclusiveAccess: true
    },
    {
      id: 'serengeti',
      name: 'Serengeti National Park',
      country: 'Tanzania',
      description: 'Endless golden plains stretching to the horizon. Home to the world\'s largest terrestrial mammal migration.',
      wildlife: ['Cheetah', 'Leopard', 'Wildebeest', 'Zebra', 'Lion'],
      coordinates: { x: 48, y: 52 },
      zoomImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'UNESCO',
      exclusiveAccess: false
    },
    {
      id: 'ngorongoro',
      name: 'Ngorongoro Crater',
      country: 'Tanzania',
      description: 'The world\'s largest intact caldera, a self-contained Eden teeming with wildlife.',
      wildlife: ['Black Rhino', 'Elephant', 'Lion', 'Buffalo', 'Hippo'],
      coordinates: { x: 54, y: 58 },
      zoomImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'UNESCO',
      exclusiveAccess: false
    },
    {
      id: 'bwindi',
      name: 'Bwindi Impenetrable Forest',
      country: 'Uganda',
      description: 'Ancient rainforest sanctuary. Mountain gorillas have inhabited these misty heights for millennia.',
      wildlife: ['Mountain Gorilla', 'Chimpanzee', 'Colobus Monkey', 'Forest Elephant'],
      coordinates: { x: 24, y: 48 },
      zoomImage: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'UNESCO',
      exclusiveAccess: true
    },
    {
      id: 'volcanoes',
      name: 'Volcanoes National Park',
      country: 'Rwanda',
      description: 'The dramatic volcanic slopes where Dian Fossey conducted her groundbreaking research.',
      wildlife: ['Golden Monkey', 'Mountain Gorilla', 'Buffalo', 'Bushbuck'],
      coordinates: { x: 20, y: 54 },
      zoomImage: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'Protected',
      exclusiveAccess: true
    },
    {
      id: 'amboseli',
      name: 'Amboseli National Park',
      country: 'Kenya',
      description: 'Iconic views of Mount Kilimanjaro\'s snow-capped peak frame vast elephant herds.',
      wildlife: ['Elephant', 'Lion', 'Cheetah', 'Giraffe', 'Zebra'],
      coordinates: { x: 62, y: 48 },
      zoomImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'Prime',
      exclusiveAccess: false
    },
    {
      id: 'zanzibar',
      name: 'Zanzibar Archipelago',
      country: 'Tanzania',
      description: 'Spice islands and turquoise lagoons. Swahili culture meets world-class diving.',
      wildlife: ['Whale Shark', 'Dolphin', 'Sea Turtle', 'Nile Crocodile'],
      coordinates: { x: 78, y: 72 },
      zoomImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'Protected',
      exclusiveAccess: true
    },
    {
      id: 'tarangire',
      name: 'Tarangire National Park',
      country: 'Tanzania',
      description: 'Ancient baobab trees stand sentinel over elephant highways and predator prides.',
      wildlife: ['Elephant', 'Lion', 'Leopard', 'Aardwolf', 'Kudu'],
      coordinates: { x: 58, y: 62 },
      zoomImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
      conservationStatus: 'Prime',
      exclusiveAccess: false
    }
  ];

  const getStatusColor = (status: Region['conservationStatus']) => {
    switch (status) {
      case 'UNESCO': return 'bg-emerald-900/80 text-emerald-300 border-emerald-600';
      case 'Protected': return 'bg-blue-900/80 text-blue-300 border-blue-600';
      case 'Prime': return 'bg-amber-900/80 text-amber-300 border-amber-600';
    }
  };

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-[#0f0d0a] text-[#F4E8D5] overflow-hidden">
      
      {/* Atmospheric Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 50%, rgba(79, 104, 72, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 30%, rgba(200, 154, 75, 0.15) 0%, transparent 40%)
            `
          }}
        />
        {/* Subtle Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C89A4B" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header - Editorial Style */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C89A4B]" />
            <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.4em] uppercase">
              The East African Wilderness
            </span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C89A4B]" />
          </div>
          
          <h2 className="font-cormorant text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-6">
            Four Nations, <span className="italic text-[#C89A4B]">One Ecosystem</span>
          </h2>
          
          <p className="text-base text-[#D3C5AE] max-w-2xl mx-auto font-light leading-relaxed">
            From the golden savannahs of Kenya to the misty mountain forests of Rwanda, 
            explore East Africa's most prestigious wildlife sanctuaries.
          </p>
        </div>

        {/* Main Map Visualization */}
        <div className={`relative transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          
          {/* Map Container */}
          <div className="relative aspect-[21/9] bg-gradient-to-br from-[#1a1510] to-[#2D2621] rounded-3xl overflow-hidden border border-[#C89A4B]/20">
            
            {/* Satellite Texture Overlay */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay'
              }}
            />

            {/* Geographic Regions - Stylized Landmass */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Kenya */}
              <path 
                d="M45 25 Q60 20 70 30 Q75 40 72 55 Q68 65 55 70 Q45 72 40 65 Q35 55 38 40 Q42 28 45 25"
                fill="rgba(79, 104, 72, 0.15)"
                stroke="rgba(200, 154, 75, 0.3)"
                strokeWidth="0.3"
              />
              {/* Tanzania */}
              <path 
                d="M35 45 Q50 40 60 48 Q65 58 62 75 Q58 88 45 90 Q35 88 30 75 Q28 60 35 45"
                fill="rgba(79, 104, 72, 0.12)"
                stroke="rgba(200, 154, 75, 0.3)"
                strokeWidth="0.3"
              />
              {/* Uganda */}
              <path 
                d="M18 35 Q28 30 32 40 Q34 50 28 58 Q22 60 18 52 Q14 42 18 35"
                fill="rgba(79, 104, 72, 0.1)"
                stroke="rgba(200, 154, 75, 0.25)"
                strokeWidth="0.3"
              />
              {/* Rwanda */}
              <path 
                d="M12 48 Q20 45 24 52 Q26 60 20 65 Q14 64 12 56 Q10 50 12 48"
                fill="rgba(79, 104, 72, 0.08)"
                stroke="rgba(200, 154, 75, 0.2)"
                strokeWidth="0.3"
              />
              
              {/* Migration Route Lines */}
              <path
                d="M50 40 Q60 50 52 55 Q45 60 48 65"
                fill="none"
                stroke="rgba(200, 154, 75, 0.4)"
                strokeWidth="0.5"
                strokeDasharray="1,2"
                className="animate-dash"
              />
            </svg>

            {/* Region Markers */}
            {regions.map((region) => (
              <div
                key={region.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${region.coordinates.x}%`, top: `${region.coordinates.y}%` }}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion(region)}
              >
                {/* Pulse Ring */}
                <div className="absolute inset-0 -m-4 rounded-full border border-[#C89A4B]/40 animate-ping opacity-50" />
                
                {/* Main Marker */}
                <div className={`
                  relative w-4 h-4 rounded-full transition-all duration-500
                  ${hoveredRegion === region.id || selectedRegion?.id === region.id
                    ? 'bg-[#C89A4B] scale-150 shadow-lg shadow-[#C89A4B]/50' 
                    : 'bg-[#4F6848] border-2 border-[#C89A4B]/60'
                  }
                `}>
                  <MapPin className={`absolute inset-0 m-auto w-3 h-3 ${hoveredRegion === region.id ? 'text-[#1a1008]' : 'text-[#C89A4B]'}`} />
                </div>

                {/* Hover Label */}
                <div className={`
                  absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap
                  transition-all duration-300 pointer-events-none
                  ${hoveredRegion === region.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                `}>
                  <div className="bg-[#2D2621]/95 backdrop-blur-sm px-3 py-1.5 rounded border border-[#C89A4B]/40">
                    <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-wider">
                      {region.country}
                    </span>
                    <p className="text-xs text-[#F4E8D5] font-medium">{region.name}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Compass Rose */}
            <div className="absolute top-6 right-6 w-16 h-16 opacity-40">
              <Navigation className="w-full h-full text-[#C89A4B]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-cinzel text-[#C89A4B] mt-1">N</span>
              </div>
            </div>

            {/* Scale Bar */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2">
              <div className="h-px w-20 bg-[#C89A4B]/60" />
              <span className="text-[9px] font-cinzel text-[#C89A4B]/60 tracking-wider">100 KM</span>
            </div>
          </div>

          {/* Region Detail Panel */}
          <div className={`
            mt-8 bg-[#1a1510]/80 backdrop-blur-xl rounded-2xl border border-[#C89A4B]/30 overflow-hidden
            transition-all duration-700
            ${selectedRegion ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-0'}
          `}>
            {selectedRegion && (
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <div className="relative h-64 lg:h-auto rounded-xl overflow-hidden">
                  <img 
                    src={selectedRegion.zoomImage}
                    alt={selectedRegion.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-transparent to-transparent" />
                  {selectedRegion.exclusiveAccess && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#C89A4B] text-[#1a1008] text-[9px] font-cinzel tracking-[0.2em] uppercase">
                      Exclusive Access
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[9px] font-cinzel tracking-[0.2em] uppercase border rounded ${getStatusColor(selectedRegion.conservationStatus)}`}>
                      {selectedRegion.conservationStatus}
                    </span>
                    <span className="text-[#D3C5AE] text-sm">{selectedRegion.country}</span>
                  </div>
                  
                  <h3 className="font-cormorant text-3xl font-light text-[#F4E8D5]">
                    {selectedRegion.name}
                  </h3>
                  
                  <p className="text-sm text-[#D3C5AE] leading-relaxed">
                    {selectedRegion.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedRegion.wildlife.map((animal) => (
                      <span key={animal} className="px-3 py-1 text-[10px] bg-[#2D2621] border border-[#C89A4B]/30 text-[#D3C5AE] rounded-full font-cinzel tracking-wider">
                        {animal}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => navigateTo('destination-detail', `dest-${selectedRegion.id}`)}
                    className="self-start flex items-center gap-2 text-[#C89A4B] hover:text-[#D6B06A] transition-colors group mt-4"
                  >
                    <span className="text-[10px] font-cinzel tracking-[0.2em] uppercase">
                      Explore Sanctuary
                    </span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {[
            { value: '4', label: 'Countries' },
            { value: '18M', label: 'Acres Protected' },
            { value: '12', label: 'UNESCO Sites' },
            { value: '3,200+', label: 'Species Catalogued' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 border border-[#C89A4B]/20 rounded-xl hover:border-[#C89A4B]/50 transition-colors">
              <div className="font-cormorant text-4xl text-[#C89A4B] font-light mb-1">{stat.value}</div>
              <div className="text-[10px] font-cinzel text-[#D3C5AE] tracking-[0.2em] uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -10; }
        }
        .animate-dash {
          animation: dash 20s linear infinite;
        }
      `}</style>
    </section>
  );
};
