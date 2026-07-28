import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Compass,
  Sparkles,
  Calendar,
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const savedCount = savedDestinationIds.length + savedItineraryIds.length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
    { id: 'destinations', label: 'Explore', icon: <Compass className="w-6 h-6" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-6 h-6" /> },
    { id: 'ai-planner', label: 'AI Plan', icon: <Sparkles className="w-6 h-6" />, isPrimary: true },
    { id: 'itineraries', label: 'Trips', icon: <Calendar className="w-6 h-6" /> },
    { id: 'user-dashboard', label: 'Saved', icon: <Layers className="w-6 h-6" />, badge: savedCount || undefined },
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

  const handleNavClick = (id: NavItem['id'], index: number) => {
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 200);
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
      
      {/* Mobile Bottom Navigation - Premium Animated */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30,
          opacity: { duration: 0.2 }
        }}
        className={`
          md:hidden
          fixed bottom-0 left-0 right-0 z-[70]
          bg-[#1a1510]/95 backdrop-blur-2xl
          border-t border-[#C89A4B]/30
          safe-area-inset-bottom
        `}
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        }}
      >
        {/* Top accent line with shimmer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-[#C89A4B] to-transparent" />
        
        <div className="flex items-center justify-around h-[72px] px-1">
          {navItems.map((item, index) => {
            const active = isActive(item.id);
            const isPressed = activeIndex === index;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id, index)}
                whileTap={{ scale: 0.9 }}
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[64px] min-h-[56px] px-3 py-2
                  rounded-2xl transition-colors duration-200
                  ${item.isPrimary ? 'mx-1' : ''}
                  ${active 
                    ? 'text-[#C89A4B]' 
                    : 'text-[#D3C5AE]'
                  }
                  touch-manipulation
                  select-none
                `}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Primary button special styling */}
                {item.isPrimary ? (
                  <motion.div 
                    className={`
                      relative flex items-center justify-center
                      w-16 h-16 rounded-full
                      ${active 
                        ? 'bg-[#C89A4B] shadow-[0_0_24px_rgba(200,154,75,0.6)]' 
                        : 'bg-gradient-to-br from-[#C89A4B] to-[#B08235] shadow-lg shadow-[#C89A4B]/40'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div 
                      className="text-[#1a1008]"
                      animate={{ rotate: isPressed ? 360 : 0 }}
                      transition={{ duration: 0.5, type: 'spring' }}
                    >
                      {item.icon}
                    </motion.div>
                    {/* Premium pulse ring */}
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-[#C89A4B]/40"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  </motion.div>
                ) : (
                  <>
                    <motion.div 
                      className="relative"
                      animate={{ 
                        scale: active ? 1.15 : 1,
                        y: active ? -2 : 0
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {item.icon}
                      
                      {/* Active indicator dot with glow */}
                      <AnimatePresence>
                        {active && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C89A4B] shadow-[0_0_8px_rgba(200,154,75,0.8)]"
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    {/* Badge with bounce animation */}
                    <AnimatePresence>
                      {item.badge && item.badge > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          whileHover={{ scale: 1.2 }}
                          className="
                            absolute -top-1 -right-1
                            min-w-[18px] h-[18px] px-1
                            flex items-center justify-center
                            text-[10px] font-bold
                            bg-[#C89A4B] text-[#1a1008]
                            rounded-full
                            shadow-sm
                          "
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
                
                {/* Label with smooth transition */}
                <motion.span 
                  className={`
                    text-[11px] font-semibold mt-1.5
                    ${active ? 'text-[#C89A4B]' : 'text-[#D3C5AE]'}
                  `}
                  animate={{ 
                    opacity: active ? 1 : 0.7,
                    y: active ? 0 : 0
                  }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* WhatsApp Floating Button with Premium Animation */}
      <WhatsAppFloatingButton />

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && isVisible && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="
              md:hidden
              fixed right-4 bottom-28 z-[65]
              w-12 h-12
              rounded-full
              bg-[#2D2621]/90 backdrop-blur-lg
              border border-[#C89A4B]/40
              flex items-center justify-center
              shadow-lg
            "
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6 text-[#C89A4B]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Extra bottom padding for content above nav */}
      <div className="md:hidden h-20 md:h-0" />
    </>
  );
};

// WhatsApp Concierge Floating Button with Premium Animation
const WhatsAppFloatingButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const whatsappNumber = '2542080072734';
  const message = encodeURIComponent('Hello! I\'m interested in planning a luxury safari experience with IDENT AFRICA. Can you help?');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        md:hidden
        fixed right-4 bottom-28 z-[65]
        w-16 h-16
        rounded-full
        bg-[#25D366]
        flex items-center justify-center
        shadow-[0_8px_32px_rgba(37,211,102,0.45)]
      `}
      aria-label="Chat on WhatsApp"
    >
      {/* Premium pulse rings */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{ 
          scale: [1, 1.4, 1.8],
          opacity: [0.5, 0.2, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
      <motion.div 
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{ 
          scale: [1, 1.3, 1.6],
          opacity: [0.4, 0.1, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          delay: 0.5,
          ease: 'easeOut'
        }}
      />
      
      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-3 px-3 py-1.5 bg-[#1a1510] text-[#F4E8D5] text-xs font-medium rounded-lg whitespace-nowrap shadow-lg border border-[#C89A4B]/30"
          >
            Chat with Concierge
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[#1a1510]" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* WhatsApp Icon */}
      <motion.svg 
        viewBox="0 0 24 24" 
        className="w-8 h-8 text-white relative z-10"
        fill="currentColor"
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.3 }}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </motion.svg>
    </motion.a>
  );
};

export default MobileBottomNav;
