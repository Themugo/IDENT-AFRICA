import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, ChevronRight, Play, PawPrint } from 'lucide-react';

interface MigrationMonth {
  month: string;
  title: string;
  description: string;
  location: string;
  image: string;
  highlights: string[];
}

export const MigrationRoutes: React.FC = () => {
  const [activeMonth, setActiveMonth] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const migrationMonths: MigrationMonth[] = [
    {
      month: 'JAN — FEB',
      title: 'Calving Season',
      description: 'Over 500,000 calves are born on the short grass plains of the southern Serengeti. Predators follow the vulnerable herds.',
      location: 'Ndutu, Southern Serengeti',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Wildebeest Births', 'Predator Action', 'Photographic Safaris']
    },
    {
      month: 'MAR — APR',
      title: 'The Green Plains',
      description: 'As the rains begin, millions of wildebeest spread across the golden grasslands, creating one of nature\'s most spectacular displays.',
      location: 'Central Serengeti',
      image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Herds in Motion', 'Zebra Integration', 'Lush Landscapes']
    },
    {
      month: 'MAY',
      title: 'The Great Trek North',
      description: 'The largest movement of land animals on Earth begins. Over 1.5 million wildebeest march toward the western corridor.',
      location: 'Western Serengeti',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      highlights: ['River Crossings Begin', 'Western Corridor', 'Tsetse Fly Free Zones']
    },
    {
      month: 'JUL — AUG',
      title: 'The Dramatic Crossings',
      description: 'Witness the heart-pounding Mara River crossings where crocodiles wait and thousands perish in nature\'s most dramatic spectacle.',
      location: 'Mara River, Northern Serengeti',
      image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      highlights: ['River Crossings', 'Crocodile Encounters', 'Predator Concentrations']
    },
    {
      month: 'SEP — OCT',
      title: 'Masai Mara Plains',
      description: 'The herds reach the lush grasslands of Kenya\'s Masai Mara, grazing until the short rains signal their return south.',
      location: 'Masai Mara, Kenya',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Masai Mara Luxury Camps', 'Big Cat Territory', 'Private Conservancies']
    },
    {
      month: 'NOV — DEC',
      title: 'The Return Journey',
      description: 'Following the rains, the great circle completes as herds begin their southern migration back to the Serengeti.',
      location: 'Eastern Serengeti',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Short Grass Plains', 'Elephant Season', 'Quiet Wildlife Viewing']
    }
  ];

  // Generate wildebeest particles
  useEffect(() => {
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 30 + Math.random() * 40,
      delay: Math.random() * 5,
      size: 2 + Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  // Canvas animation for wildebeest trail
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw migration path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(200, 154, 75, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const centerX = canvas.width / 2;
      const waveOffset = Math.sin(time * 0.02) * 20;
      
      ctx.moveTo(0, canvas.height * 0.6);
      ctx.bezierCurveTo(
        canvas.width * 0.3, canvas.height * 0.4 + waveOffset,
        canvas.width * 0.5, canvas.height * 0.8 - waveOffset,
        canvas.width, canvas.height * 0.3
      );
      ctx.stroke();

      // Draw animated wildebeest dots
      particles.forEach((particle, i) => {
        const progress = ((time * 0.5 + particle.delay * 20) % 100) / 100;
        const x = progress * canvas.width;
        const baseY = canvas.height * 0.6 - progress * canvas.height * 0.3;
        const y = baseY + Math.sin(time * 0.05 + i * 0.5) * 5;
        
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 104, 72, ${0.4 + Math.sin(time * 0.03 + i) * 0.2})`;
        ctx.fill();
      });

      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles]);

  const handleMonthChange = (index: number) => {
    setIsAnimating(true);
    setActiveMonth(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <section className="relative py-32 overflow-hidden bg-[#1a1510]">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${migrationMonths[activeMonth].image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#1a1510]/95 to-[#1a1510]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1510] via-transparent to-[#1a1510]/80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 mb-6">
            <PawPrint className="w-5 h-5 text-[#C89A4B]" />
            <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.4em] uppercase">
              The Greatest Show on Earth
            </span>
            <PawPrint className="w-5 h-5 text-[#C89A4B]" />
          </div>
          
          <h2 className="font-cormorant text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-6">
            The Great Wildebeest <span className="italic text-[#C89A4B]">Migration</span>
          </h2>
          
          <p className="text-base text-[#D3C5AE] max-w-3xl mx-auto font-light leading-relaxed">
            Each year, over 1.5 million wildebeest make the circular journey across the Serengeti-Mara ecosystem 
            in search of rain-ripened grass — a spectacle that has remained unchanged for millions of years.
          </p>
        </div>

        {/* Migration Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Timeline Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-32 space-y-2">
              <div className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.3em] uppercase mb-6">
                Annual Cycle
              </div>
              {migrationMonths.map((month, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMonthChange(idx)}
                  className={`
                    w-full text-left p-4 rounded-xl transition-all duration-500 group relative overflow-hidden
                    ${activeMonth === idx 
                      ? 'bg-[#C89A4B] text-[#1a1008]' 
                      : 'bg-[#2D2621]/60 text-[#F4E8D5] hover:bg-[#2D2621]'
                    }
                  `}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-cinzel tracking-wider block ${activeMonth === idx ? 'text-[#1a1008]/70' : 'text-[#C89A4B]'}`}>
                        {month.month}
                      </span>
                      <span className="text-sm font-medium mt-1 block">{month.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeMonth === idx ? 'rotate-90' : ''}`} />
                  </div>
                  {activeMonth === idx && (
                    <div className="absolute inset-0 bg-[#D6B06A]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className={`transition-all duration-700 ${isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
              
              {/* Hero Image */}
              <div className="relative h-[500px] rounded-3xl overflow-hidden mb-8">
                <img 
                  src={migrationMonths[activeMonth].image}
                  alt={migrationMonths[activeMonth].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-[#1a1510]/30 to-transparent" />
                
                {/* Month Badge */}
                <div className="absolute top-6 left-6">
                  <div className="bg-[#C89A4B] text-[#1a1008] px-4 py-2 rounded-full">
                    <span className="text-[11px] font-cinzel tracking-[0.2em] font-bold">
                      {migrationMonths[activeMonth].month}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C89A4B] animate-pulse" />
                  <span className="text-sm text-[#F4E8D5] font-light">
                    {migrationMonths[activeMonth].location}
                  </span>
                </div>

                {/* Play Button */}
                <button className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-[#F4E8D5]/10 backdrop-blur-md border border-[#F4E8D5]/30 flex items-center justify-center hover:bg-[#C89A4B] hover:border-[#C89A4B] transition-all group">
                  <Play className="w-6 h-6 text-[#F4E8D5] group-hover:text-[#1a1008] ml-1" />
                </button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="font-cormorant text-4xl sm:text-5xl font-light text-[#F4E8D5]">
                    {migrationMonths[activeMonth].title}
                  </h3>
                  <p className="text-[#D3C5AE] leading-relaxed text-base">
                    {migrationMonths[activeMonth].description}
                  </p>
                  
                  {/* Highlights */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    {migrationMonths[activeMonth].highlights.map((highlight, idx) => (
                      <span 
                        key={idx}
                        className="px-4 py-2 bg-[#2D2621]/60 border border-[#C89A4B]/30 rounded-full text-[11px] font-cinzel text-[#C89A4B] tracking-wider"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                  <div className="bg-[#2D2621]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#C89A4B]/20">
                    <div className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.3em] uppercase mb-4">
                      Migration Stats
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[#D3C5AE] text-sm">Wildebeest</span>
                        <span className="text-[#F4E8D5] font-cormorant text-2xl">1.5M+</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#D3C5AE] text-sm">Zebra</span>
                        <span className="text-[#F4E8D5] font-cormorant text-2xl">200K+</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#D3C5AE] text-sm">Distance</span>
                        <span className="text-[#F4E8D5] font-cormorant text-2xl">800km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#D3C5AE] text-sm">Duration</span>
                        <span className="text-[#F4E8D5] font-cormorant text-2xl">12mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#C89A4B]/10 rounded-2xl p-6 border border-[#C89A4B]/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-[#C89A4B]" />
                      <span className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.2em] uppercase">
                        Best Viewing
                      </span>
                    </div>
                    <p className="text-sm text-[#D3C5AE]">
                      Plan your expedition 6-12 months in advance for optimal availability at premium camps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Migration Path */}
        <div className="relative mt-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C89A4B]/40 to-transparent" />
          </div>
          <canvas 
            ref={canvasRef} 
            className="w-full h-48 relative z-10"
            width={1200}
            height={200}
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-8 text-[10px] font-cinzel text-[#C89A4B]/60 tracking-wider">
            <span>SERENGETI</span>
            <span>MARA RIVER</span>
            <span>MASAI MARA</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-[#D3C5AE] text-sm mb-6">
            Experience the migration from the finest camps in East Africa
          </p>
          <button className="px-10 py-4 bg-[#C89A4B] text-[#1a1008] font-cinzel text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-[#D6B06A] transition-colors">
            Plan Your Migration Safari
          </button>
        </div>

      </div>
    </section>
  );
};
