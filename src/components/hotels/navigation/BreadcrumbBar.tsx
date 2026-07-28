import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import { ChevronRight, ArrowLeft, Home, Compass, MapPin, Building2, Calendar, Scale, Sparkles, Bookmark, Search, Shield } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  page?: NavigationPage;
  targetId?: string;
  isCurrent?: boolean;
  icon?: React.ReactNode;
}

const PAGE_LABELS: Record<NavigationPage, { label: string; icon: React.ReactNode }> = {
  'home': { label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
  'search': { label: 'Explore', icon: <Search className="w-3.5 h-3.5" /> },
  'destinations': { label: 'Sanctuaries', icon: <MapPin className="w-3.5 h-3.5" /> },
  'destination-detail': { label: 'Destination', icon: <MapPin className="w-3.5 h-3.5" /> },
  'hotels': { label: 'Lodges & Camps', icon: <Building2 className="w-3.5 h-3.5" /> },
  'hotel-detail': { label: 'Lodge', icon: <Building2 className="w-3.5 h-3.5" /> },
  'compare-hotels': { label: 'Compare Lodges', icon: <Scale className="w-3.5 h-3.5" /> },
  'itineraries': { label: 'Expeditions', icon: <Calendar className="w-3.5 h-3.5" /> },
  'itinerary-detail': { label: 'Expedition', icon: <Calendar className="w-3.5 h-3.5" /> },
  'itinerary-builder': { label: 'Itinerary Builder', icon: <Sparkles className="w-3.5 h-3.5" /> },
  'compare': { label: 'Compare', icon: <Scale className="w-3.5 h-3.5" /> },
  'ai-planner': { label: 'AI Concierge', icon: <Sparkles className="w-3.5 h-3.5" /> },
  'user-dashboard': { label: 'My Portfolio', icon: <Bookmark className="w-3.5 h-3.5" /> },
  'admin-dashboard': { label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
  'supplier-portal': { label: 'Partner Hub', icon: <Building2 className="w-3.5 h-3.5" /> },
  'supplier-register': { label: 'Register', icon: <Shield className="w-3.5 h-3.5" /> },
  'my-bookings': { label: 'Bookings', icon: <Calendar className="w-3.5 h-3.5" /> },
};

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
    { label: 'Home', page: 'home', icon: <Home className="w-3.5 h-3.5" /> }
  ];

  const currentDest = destinations.find(d => d.id === selectedDestinationId) || destinations[0];
  const currentItin = itineraries.find(i => i.id === selectedItineraryId) || itineraries[0];
  const currentHotel = hotels.find(h => h.id === selectedHotelId) || hotels[0];

  switch (currentPage) {
    case 'search':
      breadcrumbs.push({ label: 'Explore', page: 'search', isCurrent: true, icon: <Search className="w-3.5 h-3.5" /> });
      break;

    case 'destinations':
      breadcrumbs.push({ label: 'East Africa Sanctuaries', isCurrent: true, icon: <MapPin className="w-3.5 h-3.5" /> });
      break;

    case 'destination-detail':
      breadcrumbs.push({ label: 'Sanctuaries', page: 'destinations', icon: <MapPin className="w-3.5 h-3.5" /> });
      if (currentDest) {
        breadcrumbs.push({ label: currentDest.name, isCurrent: true, icon: <Compass className="w-3.5 h-3.5" /> });
      }
      break;

    case 'itineraries':
      breadcrumbs.push({ label: 'Expeditions', isCurrent: true, icon: <Calendar className="w-3.5 h-3.5" /> });
      break;

    case 'itinerary-detail':
      breadcrumbs.push({ label: 'Expeditions', page: 'itineraries', icon: <Calendar className="w-3.5 h-3.5" /> });
      if (currentItin) {
        breadcrumbs.push({ label: currentItin.title, isCurrent: true, icon: <Compass className="w-3.5 h-3.5" /> });
      }
      break;

    case 'hotels':
      breadcrumbs.push({ label: 'Luxury Lodges & Camps', isCurrent: true, icon: <Building2 className="w-3.5 h-3.5" /> });
      break;

    case 'hotel-detail':
      breadcrumbs.push({ label: 'Lodges & Camps', page: 'hotels', icon: <Building2 className="w-3.5 h-3.5" /> });
      if (currentHotel) {
        breadcrumbs.push({ label: currentHotel.name, isCurrent: true, icon: <Compass className="w-3.5 h-3.5" /> });
      }
      break;

    case 'compare-hotels':
      breadcrumbs.push({ label: 'Lodges & Camps', page: 'hotels', icon: <Building2 className="w-3.5 h-3.5" /> });
      breadcrumbs.push({ label: 'Compare', isCurrent: true, icon: <Scale className="w-3.5 h-3.5" /> });
      break;

    case 'compare':
      breadcrumbs.push({ label: 'Expeditions', page: 'itineraries', icon: <Calendar className="w-3.5 h-3.5" /> });
      breadcrumbs.push({ label: 'Compare', isCurrent: true, icon: <Scale className="w-3.5 h-3.5" /> });
      break;

    case 'ai-planner':
      breadcrumbs.push({ label: 'AI Concierge', isCurrent: true, icon: <Sparkles className="w-3.5 h-3.5" /> });
      break;

    case 'itinerary-builder':
      breadcrumbs.push({ label: 'Expeditions', page: 'itineraries', icon: <Calendar className="w-3.5 h-3.5" /> });
      breadcrumbs.push({ label: 'Build Your Journey', isCurrent: true, icon: <Sparkles className="w-3.5 h-3.5" /> });
      break;

    case 'user-dashboard':
      breadcrumbs.push({ label: 'My Portfolio', isCurrent: true, icon: <Bookmark className="w-3.5 h-3.5" /> });
      break;

    case 'my-bookings':
      breadcrumbs.push({ label: 'My Portfolio', page: 'user-dashboard', icon: <Bookmark className="w-3.5 h-3.5" /> });
      breadcrumbs.push({ label: 'My Bookings', isCurrent: true, icon: <Calendar className="w-3.5 h-3.5" /> });
      break;

    case 'admin-dashboard':
      breadcrumbs.push({ label: 'Platform Admin', isCurrent: true, icon: <Shield className="w-3.5 h-3.5" /> });
      break;

    case 'supplier-portal':
      breadcrumbs.push({ label: 'Partner Hub', isCurrent: true, icon: <Building2 className="w-3.5 h-3.5" /> });
      break;

    case 'supplier-register':
      breadcrumbs.push({ label: 'Partner Hub', page: 'supplier-portal', icon: <Building2 className="w-3.5 h-3.5" /> });
      breadcrumbs.push({ label: 'Register', isCurrent: true, icon: <Shield className="w-3.5 h-3.5" /> });
      break;

    default: {
      const pageConfig = PAGE_LABELS[currentPage as NavigationPage];
      if (pageConfig) {
        breadcrumbs.push({ label: pageConfig.label, isCurrent: true, icon: pageConfig.icon });
      } else {
        breadcrumbs.push({ label: 'Safari Flow', isCurrent: true, icon: <Compass className="w-3.5 h-3.5" /> });
      }
      break;
    }
  }

  // Contextual back button text based on previous page
  const getBackLabel = () => {
    if (previousPageContext?.label) {
      return `Back to ${previousPageContext.label}`;
    }
    
    switch (currentPage) {
      case 'destination-detail':
        return 'Back to Sanctuaries';
      case 'hotel-detail':
        return 'Back to Lodges';
      case 'itinerary-detail':
        return 'Back to Expeditions';
      case 'my-bookings':
        return 'Back to Portfolio';
      case 'compare-hotels':
        return 'Back to Lodges';
      case 'compare':
        return 'Back to Expeditions';
      case 'ai-planner':
        return 'Back to Planning';
      case 'itinerary-builder':
        return 'Back to Expeditions';
      case 'search':
        return 'Back to Home';
      default:
        return 'Go Back';
    }
  };

  return (
    <nav
      aria-label="Breadcrumb and quick navigation"
      className="sticky top-16 lg:top-20 z-40 w-full bg-[#2D2621]/95 backdrop-blur-xl border-b border-[#C89A4B]/30 text-[#F4E8D5] px-4 sm:px-6 lg:px-8 py-3 transition-all shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Smart Back Button */}
        <button
          onClick={goBack}
          aria-label={getBackLabel()}
          className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#463D34] border border-[#C89A4B]/40 text-[#C89A4B] hover:text-[#F4E8D5] hover:bg-[#C89A4B] hover:border-[#C89A4B] transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C89A4B]"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-cinzel text-[10px] font-semibold uppercase tracking-wider">{getBackLabel()}</span>
        </button>

        {/* Breadcrumb Trail */}
        <ol className="flex flex-wrap items-center gap-1.5" role="list">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            return (
              <li key={idx} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#C89A4B]/50 shrink-0" aria-hidden="true" />
                )}

                {crumb.isCurrent ? (
                  <span
                    className="inline-flex items-center gap-2 font-cinzel text-[10px] font-bold text-[#F4E8D5] bg-[#C89A4B]/20 px-3 py-1.5 rounded-full border border-[#C89A4B]/40"
                    aria-current="page"
                  >
                    <span className="text-[#C89A4B]">{crumb.icon}</span>
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{crumb.label}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => crumb.page && navigateTo(crumb.page, crumb.targetId)}
                    className="group inline-flex items-center gap-1.5 text-[11px] text-[#D3C5AE] hover:text-[#C89A4B] transition-colors px-2 py-1 rounded-lg hover:bg-[#463D34]/50"
                  >
                    <span className="text-[#D3C5AE] group-hover:text-[#C89A4B]">{crumb.icon}</span>
                    <span>{crumb.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigateTo('home')}
            className="text-[10px] font-cinzel text-[#D3C5AE] hover:text-[#C89A4B] uppercase tracking-wider transition-colors"
          >
            Home
          </button>
          <span className="text-[#C89A4B]/30">|</span>
          <button
            onClick={() => navigateTo('ai-planner')}
            className="text-[10px] font-cinzel text-[#D3C5AE] hover:text-[#C89A4B] uppercase tracking-wider transition-colors"
          >
            Need Help?
          </button>
        </div>
      </div>
    </nav>
  );
};
