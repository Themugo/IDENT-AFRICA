import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import { ChevronRight, ArrowLeft, Home, Compass, MapPin, Sparkles } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  page?: NavigationPage;
  targetId?: string;
  isCurrent?: boolean;
}

export const BreadcrumbBar: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    goBack,
    selectedDestinationId,
    selectedItineraryId,
    selectedHotelId,
    destinations,
    itineraries,
    hotels,
    previousPageContext,
  } = useApp();

  if (currentPage === 'home') return null;

  // Build breadcrumb items array
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', page: 'home' }
  ];

  const currentDest = destinations.find(d => d.id === selectedDestinationId) || destinations[0];
  const currentItin = itineraries.find(i => i.id === selectedItineraryId) || itineraries[0];
  const currentHotel = hotels.find(h => h.id === selectedHotelId) || hotels[0];

  switch (currentPage) {
    case 'destinations':
      breadcrumbs.push({ label: 'East Africa Sanctuaries', isCurrent: true });
      break;

    case 'destination-detail':
      breadcrumbs.push({ label: 'Sanctuaries', page: 'destinations' });
      if (currentDest) {
        breadcrumbs.push({ label: currentDest.country, page: 'destinations' });
        breadcrumbs.push({ label: currentDest.name, isCurrent: true });
      }
      break;

    case 'itineraries':
    case 'itinerary-detail':
      breadcrumbs.push({ label: 'Safari Circuits', page: 'itineraries' });
      if (currentPage === 'itinerary-detail' && currentItin) {
        breadcrumbs.push({ label: currentItin.countries?.[0] || 'East Africa', page: 'itineraries' });
        breadcrumbs.push({ label: currentItin.title, isCurrent: true });
      } else {
        breadcrumbs.push({ label: 'Expedition Collection', isCurrent: true });
      }
      break;

    case 'hotels':
      breadcrumbs.push({ label: 'Luxury Lodges & Camps', isCurrent: true });
      break;

    case 'hotel-detail':
      breadcrumbs.push({ label: 'Lodges & Camps', page: 'hotels' });
      if (currentHotel) {
        breadcrumbs.push({ label: currentHotel.country, page: 'hotels' });
        breadcrumbs.push({ label: currentHotel.name, isCurrent: true });
      }
      break;

    case 'compare-hotels':
      breadcrumbs.push({ label: 'Lodges & Camps', page: 'hotels' });
      breadcrumbs.push({ label: 'Lodge Comparator', isCurrent: true });
      break;

    case 'compare':
      breadcrumbs.push({ label: 'Safari Circuits', page: 'itineraries' });
      breadcrumbs.push({ label: 'Circuit Comparator', isCurrent: true });
      break;

    case 'ai-planner':
      breadcrumbs.push({ label: 'Concierge', page: 'user-dashboard' });
      breadcrumbs.push({ label: 'AI Safari Planner', isCurrent: true });
      break;

    case 'itinerary-builder':
      breadcrumbs.push({ label: 'Safari Circuits', page: 'itineraries' });
      breadcrumbs.push({ label: 'Visual Itinerary Builder', isCurrent: true });
      break;

    case 'search':
      breadcrumbs.push({ label: 'Ecosystem Explorer', isCurrent: true });
      break;

    case 'user-dashboard':
      breadcrumbs.push({ label: 'Traveler Portal & Concierge', isCurrent: true });
      break;

    case 'my-bookings':
      breadcrumbs.push({ label: 'Traveler Portal', page: 'user-dashboard' });
      breadcrumbs.push({ label: 'My Safari Expeditions', isCurrent: true });
      break;

    case 'admin-dashboard':
      breadcrumbs.push({ label: 'Platform Management', isCurrent: true });
      break;

    case 'supplier-portal':
      breadcrumbs.push({ label: 'Ranger & Lodge Partner Hub', isCurrent: true });
      break;

    default:
      breadcrumbs.push({ label: 'Safari Flow', isCurrent: true });
      break;
  }

  // Contextual back button text
  const backLabel = previousPageContext?.label
    ? `Back to ${previousPageContext.label}`
    : currentPage === 'destination-detail'
    ? 'Back to Sanctuaries'
    : currentPage === 'hotel-detail'
    ? 'Back to Lodges & Camps'
    : currentPage === 'itinerary-detail'
    ? 'Back to Safari Circuits'
    : currentPage === 'my-bookings'
    ? 'Back to Traveler Portal'
    : 'Back to Previous Page';

  return (
    <nav
      aria-label="Breadcrumb and quick navigation"
      className="sticky top-[72px] z-40 w-full bg-[#1B2620]/95 backdrop-blur-md border-b border-[#D4A94D]/30 text-[#F7F1E7] px-4 sm:px-6 lg:px-8 py-2.5 transition-all shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        
        {/* UNIVERSAL CONTEXTUAL BACK BUTTON */}
        <button
          onClick={goBack}
          aria-label={backLabel}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#25362B] border border-[#D4A94D]/40 text-[#D4A94D] hover:text-[#FFFBF4] hover:bg-[#2F4F3E] hover:border-[#D4A94D] transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4A94D]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-semibold text-[11px] uppercase tracking-wider">{backLabel}</span>
        </button>

        {/* BREADCRUMB TRAIL */}
        <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#D3C5AE]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            return (
              <li key={idx} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight className="w-3 h-3 text-[#D4A94D]/60 shrink-0" aria-hidden="true" />
                )}

                {crumb.isCurrent ? (
                  <span
                    className="font-bold text-[#D4A94D] bg-[#25362B] px-2.5 py-1 rounded-lg border border-[#D4A94D]/30 shadow-sm flex items-center gap-1"
                    aria-current="page"
                  >
                    {idx === 0 && <Home className="w-3 h-3 text-[#D4A94D]" />}
                    <span className="truncate max-w-[160px] sm:max-w-[240px]">{crumb.label}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => crumb.page && navigateTo(crumb.page, crumb.targetId)}
                    className="hover:text-[#FFFBF4] hover:underline focus:outline-none focus:text-[#D4A94D] transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded"
                  >
                    {idx === 0 && <Home className="w-3 h-3 text-[#D3C5AE] hover:text-[#D4A94D]" />}
                    <span>{crumb.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>

      </div>
    </nav>
  );
};
