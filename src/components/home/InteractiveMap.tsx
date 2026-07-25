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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E8DCC8] text-[#2A1E17] border-y border-[#C89A4B]/40 texture-map">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EC] text-[#4F6848] text-xs font-mono font-bold tracking-wider uppercase border border-[#C89A4B]/50 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#C89A4B]" /> Interactive Expedition Map
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2A1E17]">
            Explore East African Sanctuaries
          </h2>
          <p className="text-sm text-[#5A4738] font-normal">
            Click on any national reserve or park hotspot on the East Africa map to view real-time Big 5 sighting probabilities and seasonal highlights.
          </p>
        </div>

        {/* Map Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Interactive Map Visual (7 cols) */}
          <div className="lg:col-span-7 relative bg-[#F5E7D0] border-2 border-[#C89A4B]/60 rounded-3xl p-6 h-[480px] flex items-center justify-center overflow-hidden shadow-xl texture-parchment">
            
            {/* Background Map Graphic Lines */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C89A4B_2px,transparent_2px)] [background-size:24px_24px]" />
            
            {/* Stylized East Africa Region Outline labels */}
            <div className="absolute top-6 left-6 text-xs font-mono text-[#4F6848] font-bold tracking-widest uppercase">
              EAST AFRICA CONSERVATION ECOSYSTEM
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[11px] font-mono text-[#5A4738] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#4F6848] inline-block animate-ping" /> Selected Sanctuary
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FFF8EC] border border-[#C89A4B] inline-block" /> Game Reserve
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
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-transform duration-300 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    {isSelected && (
                      <span className="absolute w-10 h-10 rounded-full bg-[#4F6848]/30 animate-ping" />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'bg-[#4F6848] text-[#FFF8EC] border-[#C89A4B] scale-125 shadow-lg'
                          : 'bg-[#FFF8EC] text-[#4F6848] border-[#C89A4B]/60 hover:scale-110 hover:border-[#4F6848]'
                      }`}
                    >
                      <MapPin className="w-4 h-4 fill-current" />
                    </div>
                  </div>

                  {/* Tooltip Label */}
                  <div className="mt-1 px-2 py-0.5 rounded bg-[#FFF8EC] text-[10px] font-mono font-bold text-[#2A1E17] border border-[#C89A4B]/50 shadow-md opacity-90 group-hover:opacity-100 whitespace-nowrap">
                    {spot.name}
                  </div>
                </button>
              );
            })}

          </div>

          {/* Selected Park Detail Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-[#FFF8EC] border-2 border-[#C89A4B]/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl card-journal">
            
            <div className="relative h-48 rounded-2xl overflow-hidden bg-[#DCCCB0]">
              <img
                src={selectedPark.image}
                alt={selectedPark.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8EC] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#4F6848] text-[#FFF8EC] text-xs font-mono font-bold border border-[#C89A4B]/50 shadow">
                {selectedPark.country}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-[#2A1E17]">
                {selectedPark.name}
              </h3>
              <p className="text-xs text-[#4F6848] font-mono mt-1 font-bold">
                {selectedPark.tagline}
              </p>
              <p className="text-xs text-[#5A4738] mt-3 leading-relaxed font-normal">
                {selectedPark.description}
              </p>
            </div>

            {/* Big 5 Probability Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#4F6848] font-bold">Big 5 Sighting Probability</span>
                <span className="text-[#4F6848] font-bold">
                  {selectedPark.bigFiveProbability.lion}% Big Cats
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-center">
                <div className="bg-[#F5E7D0] p-2 rounded-lg border border-[#C89A4B]/40">
                  <span className="block text-[#5A4738] font-medium">Lion</span>
                  <span className="font-bold text-[#4F6848]">{selectedPark.bigFiveProbability.lion}%</span>
                </div>
                <div className="bg-[#F5E7D0] p-2 rounded-lg border border-[#C89A4B]/40">
                  <span className="block text-[#5A4738] font-medium">Leopard</span>
                  <span className="font-bold text-[#4F6848]">{selectedPark.bigFiveProbability.leopard}%</span>
                </div>
                <div className="bg-[#F5E7D0] p-2 rounded-lg border border-[#C89A4B]/40">
                  <span className="block text-[#5A4738] font-medium">Elephant</span>
                  <span className="font-bold text-[#4F6848]">{selectedPark.bigFiveProbability.elephant}%</span>
                </div>
                <div className="bg-[#F5E7D0] p-2 rounded-lg border border-[#C89A4B]/40">
                  <span className="block text-[#5A4738] font-medium">Rhino</span>
                  <span className="font-bold text-[#4F6848]">{selectedPark.bigFiveProbability.rhino}%</span>
                </div>
                <div className="bg-[#F5E7D0] p-2 rounded-lg border border-[#C89A4B]/40">
                  <span className="block text-[#5A4738] font-medium">Buffalo</span>
                  <span className="font-bold text-[#4F6848]">{selectedPark.bigFiveProbability.buffalo}%</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigateTo('destination-detail', selectedPark.id)}
              className="w-full btn-gold py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
