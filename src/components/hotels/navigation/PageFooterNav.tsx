import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

interface NavCardItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'destination' | 'itinerary' | 'hotel' | 'page';
  page: NavigationPage;
  targetId?: string;
}

interface PageFooterNavProps {
  customPrev?: NavCardItem;
  customNext?: NavCardItem;
}

export const PageFooterNav: React.FC<PageFooterNavProps> = ({ customPrev, customNext }) => {
  const {
    currentPage,
    navigateTo,
    selectedDestinationId,
    selectedItineraryId,
    selectedHotelId,
    destinations,
    itineraries,
    hotels,
  } = useApp();

  let prevCard: NavCardItem | null = customPrev || null;
  let nextCard: NavCardItem | null = customNext || null;

  // Auto compute previous and next if not provided
  if (!prevCard && !nextCard) {
    if (currentPage === 'destination-detail') {
      const idx = destinations.findIndex(d => d.id === selectedDestinationId);
      const prevDest = destinations[(idx - 1 + destinations.length) % destinations.length];
      const nextDest = destinations[(idx + 1) % destinations.length];

      if (prevDest) {
        prevCard = {
          id: prevDest.id,
          title: prevDest.name,
          subtitle: `${prevDest.country} • Sanctuary`,
          image: prevDest.heroImage || prevDest.image,
          type: 'destination',
          page: 'destination-detail',
          targetId: prevDest.id,
        };
      }
      if (nextDest) {
        nextCard = {
          id: nextDest.id,
          title: nextDest.name,
          subtitle: `${nextDest.country} • Sanctuary`,
          image: nextDest.heroImage || nextDest.image,
          type: 'destination',
          page: 'destination-detail',
          targetId: nextDest.id,
        };
      }
    } else if (currentPage === 'itinerary-detail' || currentPage === 'itineraries') {
      const idx = itineraries.findIndex(i => i.id === selectedItineraryId);
      const prevItin = itineraries[(idx - 1 + itineraries.length) % itineraries.length];
      const nextItin = itineraries[(idx + 1) % itineraries.length];

      if (prevItin) {
        prevCard = {
          id: prevItin.id,
          title: prevItin.title,
          subtitle: `${prevItin.durationDays} Days • ${prevItin.countries?.[0] || 'East Africa'}`,
          image: prevItin.heroImage,
          type: 'itinerary',
          page: 'itinerary-detail',
          targetId: prevItin.id,
        };
      }
      if (nextItin) {
        nextCard = {
          id: nextItin.id,
          title: nextItin.title,
          subtitle: `${nextItin.durationDays} Days • ${nextItin.countries?.[0] || 'East Africa'}`,
          image: nextItin.heroImage,
          type: 'itinerary',
          page: 'itinerary-detail',
          targetId: nextItin.id,
        };
      }
    } else if (currentPage === 'hotel-detail' || currentPage === 'hotels') {
      const idx = hotels.findIndex(h => h.id === selectedHotelId);
      const prevHotel = hotels[(idx - 1 + hotels.length) % hotels.length];
      const nextHotel = hotels[(idx + 1) % hotels.length];

      if (prevHotel) {
        prevCard = {
          id: prevHotel.id,
          title: prevHotel.name,
          subtitle: `${prevHotel.country} • ${prevHotel.tier}`,
          image: prevHotel.image,
          type: 'hotel',
          page: 'hotel-detail',
          targetId: prevHotel.id,
        };
      }
      if (nextHotel) {
        nextCard = {
          id: nextHotel.id,
          title: nextHotel.name,
          subtitle: `${nextHotel.country} • ${nextHotel.tier}`,
          image: nextHotel.image,
          type: 'hotel',
          page: 'hotel-detail',
          targetId: nextHotel.id,
        };
      }
    } else if (currentPage === 'destinations') {
      prevCard = {
        id: 'nav-home',
        title: 'Safari Flow Homepage',
        subtitle: 'Curated Expeditions',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
        type: 'page',
        page: 'home',
      };
      nextCard = {
        id: 'nav-itineraries',
        title: 'Safari Circuits & Expeditions',
        subtitle: 'Multi-Destination Itineraries',
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
        type: 'page',
        page: 'itineraries',
      };
    } else if (currentPage === 'ai-planner') {
      prevCard = {
        id: 'nav-itineraries',
        title: 'Safari Circuits',
        subtitle: 'Pre-curated Circuits',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
        type: 'page',
        page: 'itineraries',
      };
      nextCard = {
        id: 'nav-builder',
        title: 'Visual Itinerary Builder',
        subtitle: 'Bespoke Route Customizer',
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
        type: 'page',
        page: 'itinerary-builder',
      };
    }
  }

  if (!prevCard && !nextCard) return null;

  return (
    <nav
      aria-label="Previous and Next Navigation"
      className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-[#1B2620] border-t border-[#D4A94D]/30 text-[#F7F1E7]"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4A94D] uppercase tracking-widest font-bold">
            <Compass className="w-4 h-4 text-[#D4A94D] animate-spin-slow" />
            <span>Continue Your Expedition Journey</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PREVIOUS CARD */}
          {prevCard ? (
            <div
              onClick={() => navigateTo(prevCard!.page, prevCard!.targetId)}
              className="group cursor-pointer bg-[#25362B] border-2 border-[#D4A94D]/30 hover:border-[#D4A94D] rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-[#101913]">
                <img
                  src={prevCard.image}
                  alt={prevCard.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4A94D] flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous</span>
                </span>
                <h4 className="text-base font-serif font-bold text-[#F7F1E7] group-hover:text-[#D4A94D] transition-colors truncate mt-0.5">
                  {prevCard.title}
                </h4>
                <p className="text-xs text-[#D3C5AE] font-mono mt-0.5 truncate">
                  {prevCard.subtitle}
                </p>
              </div>
            </div>
          ) : <div />}

          {/* NEXT CARD */}
          {nextCard ? (
            <div
              onClick={() => navigateTo(nextCard!.page, nextCard!.targetId)}
              className="group cursor-pointer bg-[#25362B] border-2 border-[#D4A94D]/30 hover:border-[#D4A94D] rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden text-right"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4A94D] flex items-center justify-end gap-1">
                  <span>Next</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
                <h4 className="text-base font-serif font-bold text-[#F7F1E7] group-hover:text-[#D4A94D] transition-colors truncate mt-0.5">
                  {nextCard.title}
                </h4>
                <p className="text-xs text-[#D3C5AE] font-mono mt-0.5 truncate">
                  {nextCard.subtitle}
                </p>
              </div>

              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-[#101913]">
                <img
                  src={nextCard.image}
                  alt={nextCard.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          ) : <div />}

        </div>
      </div>
    </nav>
  );
};
