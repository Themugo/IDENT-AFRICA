import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import { 
  X, Home, ArrowLeft, ArrowRight, Compass, MapPin, 
  Building2, Calendar, Scale, Sparkles, Bookmark, Settings, Clock, Globe
} from 'lucide-react';

interface RecentPage {
  page: NavigationPage;
  label: string;
  timestamp: number;
}

interface PageConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
}

const PAGE_CONFIGS: Record<NavigationPage, PageConfig> = {
  'home': { icon: <Home className="w-5 h-5" />, label: 'Home', description: 'Welcome to IDENT AFRICA' },
  'search': { icon: <Compass className="w-5 h-5" />, label: 'Explore', description: 'Search destinations & lodges' },
  'destinations': { icon: <MapPin className="w-5 h-5" />, label: 'Sanctuaries', description: 'East African wildlife reserves' },
  'destination-detail': { icon: <MapPin className="w-5 h-5" />, label: 'Destination', description: 'Reserve details' },
  'hotels': { icon: <Building2 className="w-5 h-5" />, label: 'Lodges & Camps', description: 'Luxury accommodations' },
  'hotel-detail': { icon: <Building2 className="w-5 h-5" />, label: 'Lodge', description: 'Property details' },
  'compare-hotels': { icon: <Scale className="w-5 h-5" />, label: 'Compare Lodges', description: 'Compare accommodations' },
  'itineraries': { icon: <Calendar className="w-5 h-5" />, label: 'Expeditions', description: 'Curated safari journeys' },
  'itinerary-detail': { icon: <Calendar className="w-5 h-5" />, label: 'Expedition', description: 'Itinerary details' },
  'itinerary-builder': { icon: <Sparkles className="w-5 h-5" />, label: 'Builder', description: 'Create custom itinerary' },
  'compare': { icon: <Scale className="w-5 h-5" />, label: 'Compare', description: 'Compare expeditions' },
  'ai-planner': { icon: <Sparkles className="w-5 h-5" />, label: 'AI Concierge', description: 'Plan with AI assistant' },
  'user-dashboard': { icon: <Bookmark className="w-5 h-5" />, label: 'My Portfolio', description: 'Saved & booked trips' },
  'admin-dashboard': { icon: <Settings className="w-5 h-5" />, label: 'Admin', description: 'Platform management' },
  'supplier-portal': { icon: <Building2 className="w-5 h-5" />, label: 'Partner Hub', description: 'Supplier portal' },
  'supplier-register': { icon: <Building2 className="w-5 h-5" />, label: 'Register', description: 'Become a partner' },
  'my-bookings': { icon: <Calendar className="w-5 h-5" />, label: 'Bookings', description: 'My reservations' },
};

export const QuickNavDrawer: React.FC = () => {
  const { currentPage, navigateTo, goBack, navigationHistory } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  // Track navigation history
  useEffect(() => {
    if (currentPage !== 'home') {
      setRecentPages(prev => {
        const filtered = prev.filter(p => p.page !== currentPage);
        return [
          { page: currentPage, label: PAGE_CONFIGS[currentPage]?.label || currentPage, timestamp: Date.now() },
          ...filtered.slice(0, 4)
        ];
      });
    }
  }, [currentPage]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Navigation sections for the drawer
  const mainNav: NavigationPage[] = [
    'home', 'destinations', 'hotels', 'itineraries'
  ];
  
  const toolsNav: NavigationPage[] = [
    'search', 'ai-planner', 'itinerary-builder', 'compare'
  ];
  
  const accountNav: NavigationPage[] = [
    'user-dashboard', 'my-bookings'
  ];

  const renderNavItem = (page: NavigationPage, isRecent: boolean = false) => {
    const config = PAGE_CONFIGS[page];
    if (!config) return null;
    
    const isActive = currentPage === page;
    
    return (
      <button
        key={page}
        onClick={() => {
          navigateTo(page);
          setIsOpen(false);
        }}
        className={`
          w-full flex items-center gap-4 p-4 rounded-xl transition-all group
          ${isActive 
            ? 'bg-[#C89A4B] text-[#1a1008]' 
            : 'hover:bg-[#2D2621]/60 text-[#F4E8D5]'
          }
        `}
      >
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center transition-colors
          ${isActive ? 'bg-[#1a1008]/20' : 'bg-[#C89A4B]/20 group-hover:bg-[#C89A4B]/30'}
        `}>
          {config.icon}
        </div>
        <div className="flex-1 text-left">
          <span className="font-bold text-sm block">{config.label}</span>
          <span className="text-[11px] opacity-70">{config.description}</span>
        </div>
        {isRecent && (
          <Clock className="w-4 h-4 opacity-50" />
        )}
        <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity ${isActive ? 'rotate-90' : ''}`} />
      </button>
    );
  };

  if (currentPage === 'home') return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-6 z-[60] p-4 rounded-full bg-[#2D2621] text-[#C89A4B] shadow-2xl border border-[#C89A4B]/40 hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all"
        title="Quick Navigation"
      >
        <Compass className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-[#0a0806]/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed left-0 top-0 bottom-0 z-[80] w-full max-w-md bg-[#1a1510] border-r border-[#C89A4B]/30 shadow-2xl
          transform transition-transform duration-500 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#C89A4B]/20">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-[#C89A4B]" />
            <div>
              <span className="font-cinzel font-bold text-[#F4E8D5] tracking-wider">IDENT AFRICA</span>
              <span className="block text-[10px] text-[#D3C5AE]">Quick Navigation</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-[#2D2621] text-[#D3C5AE] hover:text-[#F4E8D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Back Navigation */}
          <div>
            <button
              onClick={() => {
                goBack();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#2D2621]/60 border border-[#C89A4B]/30 hover:border-[#C89A4B] transition-all text-[#F4E8D5]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#C89A4B]/20 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-[#C89A4B]" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-bold text-sm block">Go Back</span>
                <span className="text-[11px] text-[#D3C5AE]">Return to previous page</span>
              </div>
            </button>
          </div>

          {/* Recently Visited */}
          {recentPages.length > 0 && (
            <div>
              <h3 className="text-[10px] font-cinzel text-[#C89A4B] tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recently Visited
              </h3>
              <div className="space-y-2">
                {recentPages.slice(0, 3).map((item) => renderNavItem(item.page, true))}
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div>
            <h3 className="text-[10px] font-cinzel text-[#D3C5AE] tracking-[0.2em] uppercase mb-4">
              Explore
            </h3>
            <div className="space-y-2">
              {mainNav.map((page) => renderNavItem(page))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-[10px] font-cinzel text-[#D3C5AE] tracking-[0.2em] uppercase mb-4">
              Planning Tools
            </h3>
            <div className="space-y-2">
              {toolsNav.map((page) => renderNavItem(page))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-[10px] font-cinzel text-[#D3C5AE] tracking-[0.2em] uppercase mb-4">
              My Account
            </h3>
            <div className="space-y-2">
              {accountNav.map((page) => renderNavItem(page))}
            </div>
          </div>

          {/* Home Link */}
          <div className="pt-4 border-t border-[#C89A4B]/20">
            <button
              onClick={() => {
                navigateTo('home');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all text-[#F4E8D5] group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#C89A4B]/20 group-hover:bg-[#1a1008]/20 flex items-center justify-center">
                <Home className="w-5 h-5 text-[#C89A4B] group-hover:text-[#1a1008]" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-bold text-sm block">Return Home</span>
                <span className="text-[11px] text-[#D3C5AE] group-hover:text-[#1a1008]/70">Back to homepage</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#C89A4B]/20 bg-[#1a1510]">
          <p className="text-[10px] text-[#D3C5AE] text-center">
            Need help? Contact our Safari Concierge
          </p>
          <p className="text-[11px] text-[#C89A4B] text-center font-mono mt-1">
            lounge@identafrica.com
          </p>
        </div>
      </div>
    </>
  );
};
