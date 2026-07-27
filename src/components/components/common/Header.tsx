import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency, NavigationPage } from '../../types';
import { AcaciaTreeIcon } from './AcaciaTreeIcon';
import {
  Compass,
  Sun,
  Bookmark,
  Scale,
  Menu,
  X,
  Sparkles,
  Calendar,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Globe,
  Check,
  MoreHorizontal,
  Layers
} from 'lucide-react';

const CURRENCY_INFO: Record<Currency, { name: string; symbol: string }> = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh' },
};

export const Header: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    currency,
    setCurrency,
    exchangeRates,
    isFetchingRates,
    ratesSource,
    refreshExchangeRates,
    toggleTheme,
    savedDestinationIds,
    savedItineraryIds,
    savedHotelIds,
    comparedItineraryIds,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);

  // Accordion state for mobile menu
  const [expandedSection, setExpandedSection] = useState<string | null>('explore');

  const totalSaved = savedDestinationIds.length + savedItineraryIds.length + (savedHotelIds?.length || 0);

  // Primary 6 Desktop Nav Links
  const primaryNavItems: { label: string; page: NavigationPage; icon?: React.ReactNode; highlight?: boolean; isAI?: boolean }[] = [
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
      label: 'Compare',
      page: 'compare',
      icon: <Scale className="w-3.5 h-3.5 text-[#C89A4B]" />,
    },
    {
      label: 'AI Concierge',
      page: 'ai-planner',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#D6B06A]" />,
      isAI: true,
    },
  ];

  // Overflow Items for Desktop dropdown
  const overflowNavItems: { label: string; page: NavigationPage; icon: React.ReactNode; description: string }[] = [
    {
      label: 'My Bookings',
      page: 'my-bookings',
      icon: <Calendar className="w-4 h-4 text-[#C89A4B]" />,
      description: 'Manage active itineraries & reservations'
    },
    {
      label: 'Supplier Portal',
      page: 'supplier-portal',
      icon: <ShieldCheck className="w-4 h-4 text-[#C89A4B]" />,
      description: 'Lodge partners & ranger credentials'
    },
    {
      label: 'Saved Portfolio',
      page: 'user-dashboard',
      icon: <Bookmark className="w-4 h-4 text-[#C89A4B]" />,
      description: 'View bookmarked reserves & trips'
    }
  ];

  const toggleAccordion = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-[#2D2621]/95 backdrop-blur-md border-b border-[#C89A4B]/50 text-[#F4E8D5] shadow-2xl texture-leather">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 grid grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-6">
        
        {/* Brand Logo - Luxury Safari Lodge Identity */}
        <div
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#FFF8EC] border-2 border-[#4F6848] flex items-center justify-center p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0">
            <AcaciaTreeIcon className="w-6 h-6 sm:w-7 sm:h-7" leafColor="#4F6848" trunkColor="#2D3E2B" />
          </div>
          <div className="leading-tight">
            <span className="text-sm sm:text-base lg:text-lg font-cinzel font-black tracking-wide text-[#F4E8D5] group-hover:text-[#D6B06A] transition-colors block">
              IDENT AFRICA
            </span>
            <span className="hidden sm:block text-[10px] tracking-[0.18em] text-[#D6B06A] uppercase font-bold whitespace-nowrap mt-0.5">
              Africa's Travel Ecosystem
            </span>
          </div>
        </div>

        {/* Desktop Navigation - Clean Proportional Links, centered in the middle column */}
        <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 text-xs font-bold uppercase tracking-wide text-[#D3C5AE]">
          {primaryNavItems.map((item) => {
            const isActive = currentPage === item.page;
            
            if (item.isAI) {
              return (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className="transition-all flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#4F6848] text-[#FFF8EC] border border-[#C89A4B]/60 hover:bg-[#2D3E2B] shadow-md font-bold cursor-pointer whitespace-nowrap ml-1 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D6B06A] group-hover:rotate-12 transition-transform shrink-0" />
                  <span>AI Concierge</span>
                </button>
              );
            }

            return (
              <button
                key={item.page}
                onClick={() => navigateTo(item.page)}
                className={`transition-all flex items-center gap-1.5 h-9 px-3 rounded-lg whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'text-[#2D2621] bg-[#C89A4B] border-[#D6B06A] font-black shadow-sm'
                    : item.highlight
                    ? 'text-[#D6B06A] bg-[#463D34] border-[#C89A4B]/50 hover:border-[#D6B06A]'
                    : 'text-[#F4E8D5] border-transparent hover:text-[#D6B06A] hover:bg-[#463D34]/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.page === 'compare' && comparedItineraryIds.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#2D2621] text-[#D6B06A] rounded-full border border-[#C89A4B]">
                    {comparedItineraryIds.length}
                  </span>
                )}
              </button>
            );
          })}

          {/* Desktop Overflow Dropdown Menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setOverflowMenuOpen(!overflowMenuOpen)}
              className="h-9 px-2.5 rounded-lg border border-[#C89A4B]/40 hover:border-[#D6B06A] hover:bg-[#463D34] text-[#D3C5AE] hover:text-[#D6B06A] transition-all flex items-center gap-1 cursor-pointer"
              title="More Ecosystem Portals"
            >
              <MoreHorizontal className="w-4 h-4 text-[#D6B06A]" />
              <ChevronDown className="w-3 h-3 text-[#D6B06A]" />
            </button>

            {overflowMenuOpen && (
              <div
                onMouseLeave={() => setOverflowMenuOpen(false)}
                className="absolute right-0 mt-2 w-72 bg-[#2D2621] border-2 border-[#C89A4B]/70 shadow-2xl rounded-2xl p-2.5 z-50 text-left texture-leather space-y-1"
              >
                <div className="px-3 py-2 border-b border-[#C89A4B]/30 mb-1 text-[11px] font-mono font-bold uppercase tracking-widest text-[#D6B06A]">
                  Ecosystem Extensions
                </div>
                {overflowNavItems.map((sub) => (
                  <button
                    key={sub.page}
                    onClick={() => {
                      navigateTo(sub.page);
                      setOverflowMenuOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                      currentPage === sub.page
                        ? 'bg-[#C89A4B] text-[#2D2621] font-bold'
                        : 'hover:bg-[#463D34] text-[#F4E8D5]'
                    }`}
                  >
                    <div className="p-1.5 bg-[#463D34] rounded-lg border border-[#C89A4B]/30 shrink-0">
                      {sub.icon}
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{sub.label}</span>
                      <span className="text-[11px] text-[#D3C5AE] block font-normal leading-snug mt-0.5">
                        {sub.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Desktop Utility Controls */}
        <div className="hidden lg:flex items-center gap-2 justify-self-end shrink-0">
          
          {/* Currency Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="h-9 px-3 border border-[#C89A4B]/60 text-xs font-bold uppercase tracking-wide text-[#F4E8D5] hover:bg-[#C89A4B] hover:text-[#2D2621] transition-all flex items-center gap-1.5 bg-[#463D34] rounded-lg cursor-pointer"
              title="Global Currency Switcher"
            >
              <span className="font-mono font-black text-xs text-[#D6B06A]">{CURRENCY_INFO[currency].symbol}</span>
              <span>{currency}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F6848] ring-1 ring-[#4F6848]/40 animate-pulse" title="Live Exchange Rates Active" />
              <ChevronDown className="w-3 h-3 text-[#D6B06A]" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#2D2621] border-2 border-[#C89A4B] shadow-2xl rounded-2xl p-3.5 z-50 overflow-hidden font-mono text-xs text-[#F4E8D5]">
                
                <div className="flex items-center justify-between border-b border-[#C89A4B]/30 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-1.5 text-[#D6B06A] text-[11px] font-bold uppercase tracking-wide">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live FX Exchange Rates</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshExchangeRates();
                    }}
                    disabled={isFetchingRates}
                    className="p-1 hover:bg-[#C89A4B]/20 text-[#D6B06A] rounded transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Refresh Live Exchange Rates"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingRates ? 'animate-spin text-[#D6B06A]' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(['USD', 'EUR', 'GBP', 'KES'] as Currency[]).map((curr) => {
                    const info = CURRENCY_INFO[curr];
                    const rateObj = exchangeRates[curr];
                    const isSelected = currency === curr;
                    const rateDisplay = curr === 'USD' ? '1.00 USD' : `1 USD = ${rateObj?.rate?.toFixed(curr === 'KES' ? 1 : 2)} ${curr}`;

                    return (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border cursor-pointer ${
                          isSelected
                            ? 'bg-[#C89A4B] text-[#2D2621] border-[#D6B06A] font-bold'
                            : 'bg-[#463D34]/80 border-transparent text-[#F4E8D5] hover:bg-[#54483E]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#2D2621] border border-[#C89A4B]/40 flex items-center justify-center font-bold text-[#D6B06A] text-[11px]">
                            {info.symbol}
                          </span>
                          <div>
                            <div className="flex items-center gap-1 font-bold text-xs">
                              <span>{curr}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#2D2621]" />}
                            </div>
                            <span className="text-[11px] opacity-80 block">{info.name}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold bg-[#2D2621] text-[#D6B06A] px-2 py-0.5 rounded-md border border-[#C89A4B]/30">
                          {rateDisplay}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-[#C89A4B]/20 flex items-center justify-between text-[11px] text-[#D3C5AE]">
                  <span>Source: {ratesSource === 'live' ? 'Open FX Engine' : 'Standard Baseline'}</span>
                  <span className="text-[#D6B06A] font-bold">● Auto Convert</span>
                </div>

              </div>
            )}
          </div>

          {/* Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 border border-[#C89A4B]/50 text-[#D6B06A] hover:bg-[#C89A4B]/20 transition-colors bg-[#463D34] rounded-lg cursor-pointer flex items-center justify-center"
            title="Toggle Visual Mode"
          >
            <Sun className="w-3.5 h-3.5 text-[#D6B06A]" />
          </button>

          {/* Saved Expeditions Portfolio Button */}
          <button
            onClick={() => navigateTo('user-dashboard')}
            className="relative w-9 h-9 border border-[#C89A4B]/50 text-[#F4E8D5] hover:bg-[#C89A4B]/20 transition-colors bg-[#463D34] rounded-lg cursor-pointer flex items-center justify-center"
            title="Saved Expeditions & Portfolios"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#D6B06A]" />
            {totalSaved > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C89A4B] text-[#2D2621] text-[10px] font-mono font-black flex items-center justify-center rounded-full border border-[#2D2621]">
                {totalSaved}
              </span>
            )}
          </button>

          {/* Direct CTA */}
          <button
            onClick={() => navigateTo('itineraries')}
            className="btn-gold h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap cursor-pointer shadow-lg flex items-center justify-center ml-1"
          >
            Book Expedition
          </button>
        </div>

        {/* Mobile & Tablet Controls */}
        <div className="lg:hidden flex items-center gap-2 col-start-3 justify-self-end">
          <button
            onClick={() => navigateTo('user-dashboard')}
            className="relative w-9 h-9 border border-[#C89A4B]/50 text-[#D6B06A] bg-[#463D34] rounded-lg flex items-center justify-center"
          >
            <Bookmark className="w-4 h-4 text-[#D6B06A]" />
            {totalSaved > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C89A4B] text-[#2D2621] text-[10px] font-mono font-black flex items-center justify-center rounded-full">
                {totalSaved}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 text-[#D6B06A] border border-[#C89A4B] bg-[#463D34] rounded-lg cursor-pointer flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Full-Screen Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 sm:top-20 z-50 bg-[#2D2621] text-[#F4E8D5] texture-leather flex flex-col justify-between overflow-y-auto pb-12 animate-in slide-in-from-top duration-300">
          <div className="p-6 space-y-6">
            
            {/* AI Concierge Direct Highlight Card on Mobile */}
            <div
              onClick={() => {
                navigateTo('ai-planner');
                setMobileMenuOpen(false);
              }}
              className="bg-[#4F6848] text-[#FFF8EC] border-2 border-[#C89A4B] p-4 rounded-2xl flex items-center justify-between cursor-pointer shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D3E2B] border border-[#C89A4B] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#D6B06A]" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-[#D6B06A] block">Personal Journey Architect</span>
                  <span className="text-base font-serif font-bold block">Launch AI Concierge →</span>
                </div>
              </div>
            </div>

            {/* Accordion Group 1: Explore Africa */}
            <div className="border border-[#C89A4B]/40 rounded-2xl overflow-hidden bg-[#463D34]">
              <button
                onClick={() => toggleAccordion('explore')}
                className="w-full p-4 flex items-center justify-between text-left font-serif font-bold text-lg text-[#F4E8D5] border-b border-[#C89A4B]/30 bg-[#2D2621]/50"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#D6B06A]" />
                  <span>Explore Ecosystem</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-[#D6B06A] transition-transform ${expandedSection === 'explore' ? 'rotate-180' : ''}`} />
              </button>

              {expandedSection === 'explore' && (
                <div className="p-3 space-y-2">
                  {[
                    { label: 'Destinations & Sanctuaries', page: 'destinations' as NavigationPage },
                    { label: 'Lodges & Private Camps', page: 'hotels' as NavigationPage },
                    { label: 'Flagship Expeditions', page: 'itineraries' as NavigationPage },
                  ].map((sub) => (
                    <button
                      key={sub.page}
                      onClick={() => {
                        navigateTo(sub.page);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-[#2D2621]/80 text-sm font-bold text-[#F4E8D5] hover:text-[#D6B06A] flex items-center justify-between border border-[#C89A4B]/20"
                    >
                      <span>{sub.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#D6B06A]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion Group 2: Planning & Tools */}
            <div className="border border-[#C89A4B]/40 rounded-2xl overflow-hidden bg-[#463D34]">
              <button
                onClick={() => toggleAccordion('tools')}
                className="w-full p-4 flex items-center justify-between text-left font-serif font-bold text-lg text-[#F4E8D5] border-b border-[#C89A4B]/30 bg-[#2D2621]/50"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D6B06A]" />
                  <span>Interactive Planning Tools</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-[#D6B06A] transition-transform ${expandedSection === 'tools' ? 'rotate-180' : ''}`} />
              </button>

              {expandedSection === 'tools' && (
                <div className="p-3 space-y-2">
                  {[
                    { label: 'Visual Itinerary Builder', page: 'itinerary-builder' as NavigationPage },
                    { label: 'Expedition Comparator', page: 'compare' as NavigationPage },
                    { label: 'My Saved Portfolio', page: 'user-dashboard' as NavigationPage },
                  ].map((sub) => (
                    <button
                      key={sub.page}
                      onClick={() => {
                        navigateTo(sub.page);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-[#2D2621]/80 text-sm font-bold text-[#F4E8D5] hover:text-[#D6B06A] flex items-center justify-between border border-[#C89A4B]/20"
                    >
                      <span>{sub.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#D6B06A]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion Group 3: Currency & FX Switcher */}
            <div className="border border-[#C89A4B]/40 rounded-2xl overflow-hidden bg-[#463D34] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#D6B06A] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>Currency Selector</span>
                </div>
                <button
                  onClick={() => refreshExchangeRates()}
                  disabled={isFetchingRates}
                  className="px-2.5 py-1 rounded bg-[#2D2621] border border-[#C89A4B]/50 text-[10px] flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingRates ? 'animate-spin' : ''}`} />
                  <span>Sync Rates</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['USD', 'EUR', 'GBP', 'KES'] as Currency[]).map((curr) => {
                  const info = CURRENCY_INFO[curr];
                  const isSelected = currency === curr;

                  return (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`p-3 rounded-xl text-left border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#C89A4B] text-[#2D2621] border-[#D6B06A] font-bold'
                          : 'bg-[#2D2621] border-[#C89A4B]/30 text-[#F4E8D5]'
                      }`}
                    >
                      <span className="text-xs font-bold">{info.symbol} {curr}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct CTA */}
            <button
              onClick={() => {
                navigateTo('itineraries');
                setMobileMenuOpen(false);
              }}
              className="w-full py-4 btn-gold text-xs font-bold uppercase tracking-widest rounded-2xl shadow-2xl"
            >
              Book Expedition Now
            </button>

          </div>
        </div>
      )}
    </header>
  );
};


