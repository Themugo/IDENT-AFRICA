import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Compass, Eye, ShieldCheck, Flame, ArrowRight, Sun, Droplets } from 'lucide-react';

export const InteractiveMap: React.FC = () => {
  const { destinations, navigateTo } = useApp();
  const [selectedParkId, setSelectedParkId] = useState<string>('dest-masai-mara');

  const selectedPark = destinations.find(d => d.id === selectedParkId) || destinations[0];

  const hotspots = [
    { id: 'dest-masai-mara', name: 'Masai Mara', country: 'Kenya', x: '58%', y: '45%' },
    { id: 'dest-serengeti', name: 'Serengeti', country: 'Tanzania', x: '50%', y: '52%' },
    { id: 'dest-ngorongoro', name: 'Ngorongoro', country: 'Tanzania', x: '55%', y: '62%' },
    { id: 'dest-bwindi', name: 'Bwindi Forest', country: 'Uganda', x: '25%', y: '40%' },
    { id: 'dest-volcanoes', name: 'Volcanoes Park', country: 'Rwanda', x: '22%', y: '48%' },
    { id: 'dest-zanzibar', name: 'Zanzibar Island', country: 'Tanzania', x: '82%', y: '72%' },
    { id: 'dest-amboseli', name: 'Amboseli', country: 'Kenya', x: '68%', y: '52%' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0] border-y border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12241A] text-[#D4AF37] text-xs font-mono font-bold tracking-wider uppercase border border-[#D4AF37]/30">
            <Compass className="w-3.5 h-3.5" /> Interactive Eco-Map
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5EBE0]">
            Explore East African Sanctuaries
          </h2>
          <p className="text-sm text-[#F5EBE0]/80">
            Click on any national reserve or park hotspot on the East Africa map to view real-time Big 5 sighting probabilities and seasonal highlights.
          </p>
        </div>

        {/* Map Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Interactive Map Visual (7 cols) */}
          <div className="lg:col-span-7 relative bg-[#12241A] border border-[#D4AF37]/30 rounded-3xl p-6 h-[480px] flex items-center justify-center overflow-hidden shadow-2xl">
            
            {/* Background Map Graphic Lines */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_2px,transparent_2px)] [background-size:24px_24px]" />
            
            {/* Stylized East Africa Region Outline labels */}
            <div className="absolute top-6 left-6 text-xs font-mono text-[#D4AF37]/60 tracking-widest uppercase">
              EAST AFRICA CONSERVATION ECOSYSTEM
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[11px] font-mono text-[#F5EBE0]/60">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#D4AF37] inline-block animate-ping" /> Selected Park
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#1E3A2B] border border-[#D4AF37] inline-block" /> Game Reserve
              </span>
            </div>

            {/* Hotspot Pins */}
            {hotspots.map((spot) => {
              const isSelected = spot.id === selectedParkId;
              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedParkId(spot.id)}
                  style={{ left: spot.x, top: spot.y }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-transform duration-300"
                >
                  <div className="relative flex items-center justify-center">
                    {isSelected && (
                      <span className="absolute w-10 h-10 rounded-full bg-[#D4AF37]/30 animate-ping" />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37] text-[#0F1210] border-white scale-125 shadow-lg shadow-[#D4AF37]/50'
                          : 'bg-[#12241A] text-[#D4AF37] border-[#D4AF37]/60 hover:scale-110 hover:border-[#D4AF37]'
                      }`}
                    >
                      <MapPin className="w-4 h-4 fill-current" />
                    </div>
                  </div>

                  {/* Tooltip Label */}
                  <div className="mt-1 px-2 py-0.5 rounded bg-[#0A120D] text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/40 shadow-lg opacity-90 group-hover:opacity-100 whitespace-nowrap">
                    {spot.name}
                  </div>
                </button>
              );
            })}

          </div>

          {/* Selected Park Detail Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-[#181E1A] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <img
                src={selectedPark.image}
                alt={selectedPark.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181E1A] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#12241A]/90 text-[#D4AF37] text-xs font-mono border border-[#D4AF37]/40">
                {selectedPark.country}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-[#F5EBE0]">
                {selectedPark.name}
              </h3>
              <p className="text-xs text-[#D4AF37] font-mono mt-1 font-semibold">
                {selectedPark.tagline}
              </p>
              <p className="text-xs text-[#F5EBE0]/80 mt-3 leading-relaxed">
                {selectedPark.description}
              </p>
            </div>

            {/* Big 5 Probability Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#D4AF37] font-bold">Big 5 Sighting Probability</span>
                <span className="text-emerald-400 font-bold">
                  {selectedPark.bigFiveProbability.lion}% Big Cats
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-center">
                <div className="bg-[#12241A] p-2 rounded border border-[#D4AF37]/20">
                  <span className="block text-[#F5EBE0]/60">Lion</span>
                  <span className="font-bold text-[#D4AF37]">{selectedPark.bigFiveProbability.lion}%</span>
                </div>
                <div className="bg-[#12241A] p-2 rounded border border-[#D4AF37]/20">
                  <span className="block text-[#F5EBE0]/60">Leopard</span>
                  <span className="font-bold text-[#D4AF37]">{selectedPark.bigFiveProbability.leopard}%</span>
                </div>
                <div className="bg-[#12241A] p-2 rounded border border-[#D4AF37]/20">
                  <span className="block text-[#F5EBE0]/60">Elephant</span>
                  <span className="font-bold text-[#D4AF37]">{selectedPark.bigFiveProbability.elephant}%</span>
                </div>
                <div className="bg-[#12241A] p-2 rounded border border-[#D4AF37]/20">
                  <span className="block text-[#F5EBE0]/60">Rhino</span>
                  <span className="font-bold text-[#D4AF37]">{selectedPark.bigFiveProbability.rhino}%</span>
                </div>
                <div className="bg-[#12241A] p-2 rounded border border-[#D4AF37]/20">
                  <span className="block text-[#F5EBE0]/60">Buffalo</span>
                  <span className="font-bold text-[#D4AF37]">{selectedPark.bigFiveProbability.buffalo}%</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigateTo('destination-detail', selectedPark.id)}
              className="w-full btn-gold py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              Explore {selectedPark.name} Reserve
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
