import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Lord Arthur & Lady Evelyn Vance',
      location: 'London, United Kingdom',
      itinerary: 'The Great Migration & Big Cat Grand Expedition',
      quote: 'Watching hundreds of thousands of wildebeest cross the Mara River from our Singita tent, paired with seamless private bush charter flights arranged via SafariFlow, was the trip of a lifetime.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Dr. Sarah Jenkins & Family',
      location: 'San Francisco, USA',
      itinerary: 'Primate & Plains Odyssey: Gorillas & Serengeti',
      quote: 'The interactive comparison tool helped us weigh gorilla trekking vs serengeti migration options. Sitting 10 feet from a Silverback in Bwindi left us speechless.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Kenji & Aoi Takahashi',
      location: 'Tokyo, Japan',
      itinerary: 'Kenya Bush & Beach: Mara & Zanzibar',
      quote: 'The AI Safari Planner generated our exact dream itinerary in seconds. From balloon safaris in Masai Mara to private dhow sailing in Zanzibar, everything ran like clockwork.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#12241A] text-[#F5EBE0]">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
            Traveler Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5EBE0]">
            Stories from the East African Bush
          </h2>
          <p className="text-sm text-[#F5EBE0]/70">
            Hear from discerning global travelers who planned and booked through SafariFlow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 flex flex-col justify-between space-y-6 shadow-xl relative"
            >
              <Quote className="w-10 h-10 text-[#D4AF37]/20 absolute top-6 right-6" />

              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-[#D4AF37] font-mono italic">
                  "{rev.itinerary}"
                </p>

                <p className="text-sm text-[#F5EBE0]/90 leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/20">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#F5EBE0]">
                    {rev.name}
                  </h4>
                  <span className="text-[11px] text-[#F5EBE0]/60 font-mono">
                    {rev.location}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
