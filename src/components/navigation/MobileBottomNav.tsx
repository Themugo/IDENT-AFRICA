import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import { Home, MapPin, Binoculars, Calendar, PhoneCall, Sparkles } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentPage, navigateTo, setAuthModalOpen, user } = useApp();

  const items = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      page: 'home' as NavigationPage,
    },
    {
      id: 'safaris',
      label: 'Safaris',
      icon: <Binoculars className="w-5 h-5" />,
      page: 'itineraries' as NavigationPage,
    },
    {
      id: 'destinations',
      label: 'Sanctuaries',
      icon: <MapPin className="w-5 h-5" />,
      page: 'destinations' as NavigationPage,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <Calendar className="w-5 h-5" />,
      page: 'my-bookings' as NavigationPage,
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: <PhoneCall className="w-5 h-5" />,
      action: () => {
        if (!user) {
          setAuthModalOpen(true);
        } else {
          navigateTo('user-dashboard');
        }
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1B2620]/95 backdrop-blur-lg border-t border-[#D4A94D]/40 text-[#F7F1E7] px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive =
            item.page &&
            (currentPage === item.page ||
              (item.page === 'destinations' && currentPage === 'destination-detail') ||
              (item.page === 'itineraries' && currentPage === 'itinerary-detail') ||
              (item.page === 'my-bookings' && currentPage === 'my-bookings'));

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.page) {
                  navigateTo(item.page);
                }
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#D4A94D] font-bold scale-105'
                  : 'text-[#D3C5AE] hover:text-[#F7F1E7] opacity-80'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-[#D4A94D]/20 border border-[#D4A94D]/40' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
