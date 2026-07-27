import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import {
  Home,
  Compass,
  Sparkles,
  Calendar,
  MapPin,
  Layers,
  Search,
  ChevronUp
} from 'lucide-react';

interface NavItem {
  id: NavigationPage | 'search';
  label: string;
  icon: React.ReactNode;
  badge?: number;
  isPrimary?: boolean;
}

export const MobileBottomNav: React.FC = () => {
  const { currentPage, navigateTo, savedDestinationIds, savedItineraryIds } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const savedCount = savedDestinationIds.length + savedItineraryIds.length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'destinations', label: 'Explore', icon: <Compass className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'ai-planner', label: 'AI Plan', icon: <Sparkles className="w-5 h-5" />, isPrimary: true },
    { id: 'itineraries', label: 'Trips', icon: <Calendar className="w-5 h-5" /> },
    { id: 'user-dashboard', label: 'Saved', icon: <Layers className="w-5 h-5" />, badge: savedCount || undefined },
  ];

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowScrollTop(currentScrollY > 400);
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (id: NavItem['id']) => {
    if (id === 'search') {
      navigateTo('search');
    } else {
      navigateTo(id as NavigationPage);
    }
  };

  const isActive = (id: NavItem['id']) => {
    if (id === 'home') return currentPage === 'home';
    return currentPage === id;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop spacer */}
      <div className="hidden md:block h-20" />
      
      {/* Mobile Bottom Navigation */}
      <nav
        className={`
          md:hidden
          fixed bottom-0 left-0 right-0 z-[70]
          bg-[#1a1510]/95 backdrop-blur-xl
          border-t border-[#C89A4B]/30
          transition-transform duration-500 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#C89A4B] to-transparent" />
        
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[56px] min-h-[48px] px-2 py-1
                  rounded-xl transition-all duration-300
                  ${item.isPrimary ? 'mx-2' : ''}
                  ${active 
                    ? 'text-[#C89A4B]' 
                    : 'text-[#D3C5AE] hover:text-[#F4E8D5]'
                  }
                  active:scale-95
                  touch-manipulation
                `}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Primary button special styling */}
                {item.isPrimary ? (
                  <div className={`
                    relative flex items-center justify-center
                    w-14 h-14 rounded-full
                    transition-all duration-300
                    ${active 
                      ? 'bg-[#C89A4B] shadow-[0_0_20px_rgba(200,154,75,0.5)]' 
                      : 'bg-gradient-to-br from-[#C89A4B] to-[#B08235] shadow-lg shadow-[#C89A4B]/30'
                    }
                  `}>
                    <div className={`
                      text-[#1a1008] transition-transform duration-300
                      ${active ? 'scale-110' : ''}
                    `}>
                      {item.icon}
                    </div>
                    {/* Pulse ring for primary */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#C89A4B]/50 animate-ping" />
                  </div>
                ) : (
                  <>
                    <div className={`
                      relative transition-all duration-300
                      ${active ? 'scale-110' : ''}
                    `}>
                      {item.icon}
                      
                      {/* Active indicator dot */}
                      {active && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C89A4B]" />
                      )}
                    </div>
                    
                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <span className="
                        absolute -top-0.5 -right-0.5
                        min-w-[16px] h-4 px-1
                        flex items-center justify-center
                        text-[10px] font-bold
                        bg-[#C89A4B] text-[#1a1008]
                        rounded-full
                        shadow-sm
                      ">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {/* Label */}
                <span className={`
                  text-[10px] font-medium mt-1
                  transition-all duration-200
                  ${active ? 'font-bold' : ''}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton />

      {/* Scroll to top button */}
      {showScrollTop && isVisible && (
        <button
          onClick={scrollToTop}
          className="
            md:hidden
            fixed right-4 bottom-28 z-[65]
            w-10 h-10
            rounded-full
            bg-[#2D2621]/90 backdrop-blur
            border border-[#C89A4B]/40
            flex items-center justify-center
            transition-all duration-300 ease-out
            hover:bg-[#C89A4B] hover:text-[#1a1008]
            active:scale-90
            shadow-lg
          "
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 text-[#C89A4B]" />
        </button>
      )}

      {/* Extra bottom padding for content above nav */}
      <div className="md:hidden h-20 md:h-0" />
    </>
  );
};

// WhatsApp Concierge Floating Button
const WhatsAppFloatingButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const whatsappNumber = '2542080072734';
  const message = encodeURIComponent('Hello! I\'m interested in planning a luxury safari experience with IDENT AFRICA. Can you help?');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        md:hidden
        fixed right-4 bottom-28 z-[65]
        w-14 h-14
        rounded-full
        bg-[#25D366]
        shadow-lg shadow-[#25D366]/40
        flex items-center justify-center
        transition-all duration-500 ease-out
        hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/50
        active:scale-95
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      
      {/* WhatsApp Icon */}
      <svg 
        viewBox="0 0 24 24" 
        className="w-7 h-7 text-white"
        fill="currentColor"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
};

export default MobileBottomNav;
