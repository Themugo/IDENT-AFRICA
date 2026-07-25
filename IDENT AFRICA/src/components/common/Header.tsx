import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency, NavigationPage } from '../../types';
import {
  Compass,
  Sun,
  Moon,
  Bookmark,
  Scale,
  User,
  Menu,
  X,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    currency,
    setCurrency,
    theme,
    toggleTheme,
    user,
    setAuthModalOpen,
    savedDestinationIds,
    savedItineraryIds,
    savedHotelIds,
    comparedItineraryIds,
    comparedHotelIds,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const totalSaved = savedDestinationIds.length + savedItineraryIds.length + (savedHotelIds?.length || 0);

  const navItems: { label: string; page: NavigationPage; icon?: React.ReactNode; highlight?: boolean; count?: number }[] = [
    { label: 'Destinations', page: 'destinations' },
    { label: 'Lodges & Sanctuaries', page: 'hotels' },
    { label: 'Expeditions', page: 'itineraries' },
    {
      label: 'Itinerary Builder',
      page: 'itinerary-builder',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#D6B06A]" />,
      highlight: true,
    },
    {
      label: 'Supplier Portal',
      page: 'supplier-portal',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#C89A4B]" />,
    },
    {
      label: 'Compare',
      page: 'compare',
    },
    {
      label: 'AI Planner',
      page: 'ai-planner',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 bg-[#2E2015] border-b border-[#C89A4B]/30 text-[#F4E8D5] shadow-lg texture-earth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#C89A4B] to-[#4B321F] flex items-center justify-center text-[#2E2015] text-xs font-serif font-black shadow-md border border-[#D6B06A]/50 group-hover:scale-105 transition-all">
            IA
          </div>
          <div>
            <span className="text-2xl font-cinzel font-black tracking-tight text-[#C89A4B] group-hover:text-[#D6B06A] transition-colors">
              IDENT AFRICA
            </span>
            <span className="block text-[9px] tracking-[0.25em] text-[#D3C5AE] uppercase font-bold">
              Luxury Expeditions & Lodges
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#D3C5AE]">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => navigateTo(item.page)}
                className={`transition-all flex items-center gap-1.5 py-1 border-b-2 ${
                  item.highlight
                    ? 'text-[#D6B06A] border-[#D6B06A]'
                    : isActive
                    ? 'text-[#C89A4B] border-[#C89A4B]'
                    : 'border-transparent hover:text-[#D6B06A]'
                }`}
              >
                {item.icon}
                {item.label}
                {item.page === 'compare' && comparedItineraryIds.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-[#C89A4B] text-[#2E2015]">
                    {comparedItineraryIds.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="px-3 py-1.5 border border-[#C89A4B]/40 text-[10px] font-bold uppercase tracking-widest text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#2E2015] transition-all flex items-center gap-1 bg-[#4B321F]/60"
            >
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-[#4B321F] border border-[#C89A4B]/50 shadow-2xl py-1 z-50">
                {(['USD', 'EUR', 'GBP', 'KES'] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#C89A4B] hover:text-[#2E2015] transition-colors ${
                      currency === curr ? 'text-[#D6B06A] font-bold' : 'text-[#F4E8D5]'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-[#C89A4B]/40 text-[#C89A4B] hover:bg-[#C89A4B]/20 transition-colors bg-[#4B321F]/60"
            title="Toggle Visual Mode"
          >
            <Sun className="w-4 h-4 text-[#D6B06A]" />
          </button>

          {/* Saved Trips Counter */}
          <button
            onClick={() => navigateTo('user-dashboard')}
            className="relative p-2 border border-[#C89A4B]/40 text-[#C89A4B] hover:bg-[#C89A4B]/20 transition-colors bg-[#4B321F]/60 rounded-md"
            title="Saved Expeditions & Portfolios"
          >
            <Bookmark className="w-4 h-4" />
            {totalSaved > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C89A4B] text-[#2E2015] text-[9px] font-bold flex items-center justify-center rounded-full">
                {totalSaved}
              </span>
            )}
          </button>

          {/* Book Expedition Direct CTA */}
          <button
            onClick={() => navigateTo('itineraries')}
            className="btn-gold py-2 px-5 rounded-lg text-[11px] font-bold uppercase tracking-widest"
          >
            Book Expedition
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-[#C89A4B]"
          >
            <Sun className="w-4 h-4 text-[#D6B06A]" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#D6B06A]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2E2015] border-b border-[#C89A4B]/30 px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#C89A4B]/20">
            <span className="text-[10px] text-[#D6B06A] font-bold uppercase tracking-widest">Currency</span>
            <div className="flex gap-2">
              {(['USD', 'EUR', 'GBP', 'KES'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${
                    currency === curr
                      ? 'bg-[#C89A4B] text-[#2E2015]'
                      : 'border border-[#C89A4B]/30 text-[#F4E8D5]'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => {
                navigateTo(item.page);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-between rounded-lg ${
                currentPage === item.page
                  ? 'bg-[#C89A4B] text-[#2E2015]'
                  : 'text-[#F4E8D5] hover:bg-[#4B321F]'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.page === 'compare' && comparedItineraryIds.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C89A4B] text-[#2E2015] rounded">
                  {comparedItineraryIds.length}
                </span>
              )}
            </button>
          ))}

          <div className="pt-2">
            <button
              onClick={() => {
                navigateTo('itineraries');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#C89A4B] text-[#2E2015] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg"
            >
              Book Expedition
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
