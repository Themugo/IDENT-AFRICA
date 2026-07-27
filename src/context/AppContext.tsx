import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationPage,
  Currency,
  UserProfile,
  Destination,
  SafariItinerary,
  Booking,
  BookingStatus,
  PaymentStatus,
  PaymentGateway,
  RefundWorkflow,
  LuxuryLodge,
  CustomBuilderItinerary,
  SupplierProfile,
  SupplierPricingRule,
  SupplierAvailabilitySlot,
  SupplierBooking,
  SupplierApprovalStatus,
} from '../types';
import {
  MOCK_DESTINATIONS,
  MOCK_ITINERARIES,
  MOCK_USER_BOOKINGS,
  MOCK_LODGES,
} from '../data/mockData';
import { DEFAULT_SAMPLE_BUILDER_ITINERARY } from '../data/builderData';
import {
  MOCK_SUPPLIERS,
  MOCK_SUPPLIER_PRICING_RULES,
  MOCK_SUPPLIER_AVAILABILITY,
  MOCK_SUPPLIER_BOOKINGS,
} from '../data/supplierData';

interface AppContextType {
  currentPage: NavigationPage;
  selectedDestinationId: string | null;
  selectedItineraryId: string | null;
  selectedHotelId: string | null;
  currency: Currency;
  exchangeRates: Record<Currency, { rate: number; symbol: string; prefix: boolean }>;
  isFetchingRates: boolean;
  ratesSource: 'live' | 'default';
  lastRatesUpdate: string | null;
  refreshExchangeRates: () => Promise<void>;
  theme: 'dark' | 'light';
  user: UserProfile | null;
  savedDestinationIds: string[];
  savedItineraryIds: string[];
  savedHotelIds: string[];
  comparedItineraryIds: string[];
  comparedHotelIds: string[];
  bookings: Booking[];
  destinations: Destination[];
  itineraries: SafariItinerary[];
  hotels: LuxuryLodge[];
  authModalOpen: boolean;
  bookingModalOpen: boolean;
  bookingModalTarget: { type: 'itinerary' | 'destination' | 'hotel'; id: string } | null;
  
  // Actions
  navigateTo: (page: NavigationPage, targetId?: string) => void;
  goBack: () => void;
  previousPageContext: { label: string; page: NavigationPage } | null;
  navigationHistory: { label: string; page: NavigationPage }[];
  setCurrency: (c: Currency) => void;
  toggleTheme: () => void;
  toggleSaveDestination: (id: string) => void;
  toggleSaveItinerary: (id: string) => void;
  toggleSaveHotel: (id: string) => void;
  toggleCompareItinerary: (id: string) => void;
  toggleCompareHotel: (id: string) => void;
  clearComparisons: () => void;
  clearHotelComparisons: () => void;
  addBooking: (b: Omit<Booking, 'id' | 'createdAt' | 'bookingRef'>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus, paymentStatus?: PaymentStatus) => void;
  submitRefundRequest: (
    bookingId: string,
    reason: RefundWorkflow['reason'],
    reasonDetails: string,
    requestedAmountUSD: number,
    payoutAccount: string
  ) => void;
  processRefundAdmin: (
    bookingId: string,
    approved: boolean,
    approvedAmountUSD?: number,
    adminNotes?: string
  ) => void;
  completeBalancePayment: (bookingId: string, paymentGateway: PaymentGateway, paymentRef: string) => void;
  setAuthModalOpen: (open: boolean) => void;
  openBookingModal: (type: 'itinerary' | 'destination' | 'hotel', id: string) => void;
  closeBookingModal: () => void;
  formatPrice: (usdAmount: number) => string;
  loginAs: (role: 'traveler' | 'admin' | 'ranger_partner') => void;
  logout: () => void;

  // Destination CRUD Actions
  addDestination: (dest: Destination) => void;
  updateDestination: (dest: Destination) => void;
  deleteDestination: (id: string) => void;
  addGalleryPhoto: (destinationId: string, photoUrl: string) => void;

  // Hotel CRUD & Ecosystem Actions
  addHotel: (hotel: LuxuryLodge) => void;
  updateHotel: (hotel: LuxuryLodge) => void;
  deleteHotel: (id: string) => void;
  addHotelGalleryPhoto: (hotelId: string, photoUrl: string) => void;
  addHotelToItinerary: (hotelId: string, itineraryId: string, dayNumber: number) => void;

  // Visual Itinerary Builder Actions
  customBuilderItineraries: CustomBuilderItinerary[];
  activeBuilderItinerary: CustomBuilderItinerary;
  setActiveBuilderItinerary: (itin: CustomBuilderItinerary) => void;
  saveBuilderItinerary: (itin: CustomBuilderItinerary) => void;
  duplicateBuilderItinerary: (id: string) => CustomBuilderItinerary;
  loadBuilderItinerary: (id: string) => void;
  deleteBuilderItinerary: (id: string) => void;
  createBlankBuilderItinerary: () => CustomBuilderItinerary;

  // Supplier Portal State & Actions
  suppliers: SupplierProfile[];
  activeSupplierId: string;
  activeSupplier: SupplierProfile | null;
  supplierPricingRules: SupplierPricingRule[];
  supplierAvailabilitySlots: SupplierAvailabilitySlot[];
  supplierBookings: SupplierBooking[];
  setActiveSupplierId: (id: string) => void;
  registerSupplier: (
    data: Omit<
      SupplierProfile,
      'id' | 'createdAt' | 'updatedAt' | 'approvalStatus' | 'rating' | 'reviewsCount' | 'completedBookingsCount' | 'commissionPercentage'
    >
  ) => SupplierProfile;
  updateSupplierProfile: (supplier: SupplierProfile) => void;
  updateSupplierApprovalStatus: (supplierId: string, status: SupplierApprovalStatus, adminNotes?: string) => void;
  addPricingRule: (rule: Omit<SupplierPricingRule, 'id'>) => void;
  deletePricingRule: (ruleId: string) => void;
  updateAvailabilitySlot: (slot: Omit<SupplierAvailabilitySlot, 'id'>) => void;
  updateSupplierBookingStatus: (bookingId: string, status: SupplierBooking['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_EXCHANGE_RATES: Record<Currency, { rate: number; symbol: string; prefix: boolean }> = {
  USD: { rate: 1, symbol: '$', prefix: true },
  EUR: { rate: 0.92, symbol: '€', prefix: true },
  GBP: { rate: 0.78, symbol: '£', prefix: true },
  KES: { rate: 129.5, symbol: 'KSh ', prefix: true },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>('dest-masai-mara');
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>('itin-great-migration-spectacle');
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>('lodge-angama-mara');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, { rate: number; symbol: string; prefix: boolean }>>(DEFAULT_EXCHANGE_RATES);
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);
  const [ratesSource, setRatesSource] = useState<'live' | 'default'>('default');
  const [lastRatesUpdate, setLastRatesUpdate] = useState<string | null>(null);

  const refreshExchangeRates = async () => {
    setIsFetchingRates(true);
    try {
      const res = await fetch('/api/exchange-rates');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setExchangeRates(data.rates);
          setRatesSource(data.source || 'live');
          setLastRatesUpdate(data.lastUpdated || new Date().toISOString());
        }
      }
    } catch (err) {
      console.warn('Failed to fetch exchange rates:', err);
    } finally {
      setIsFetchingRates(false);
    }
  };

  useEffect(() => {
    refreshExchangeRates();
  }, []);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(['dest-masai-mara', 'dest-serengeti', 'dest-bwindi']);
  const [savedItineraryIds, setSavedItineraryIds] = useState<string[]>(['itin-great-migration-spectacle', 'itin-gorilla-and-savanna']);
  const [savedHotelIds, setSavedHotelIds] = useState<string[]>(['lodge-angama-mara', 'lodge-singita-sasakwa']);
  
  const [comparedItineraryIds, setComparedItineraryIds] = useState<string[]>(['itin-great-migration-spectacle', 'itin-gorilla-and-savanna']);
  const [comparedHotelIds, setComparedHotelIds] = useState<string[]>(['lodge-angama-mara', 'lodge-singita-sasakwa']);

  const [user, setUser] = useState<UserProfile | null>({
    id: 'usr-101',
    name: 'Makena Kamau',
    email: 'kamauwamakena@gmail.com',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    preferredCurrency: 'USD',
    dietaryPreferences: 'Gluten-Free, Plant-based options',
    savedDestinationIds,
    savedItineraryIds,
    savedHotelIds,
    comparedItineraryIds,
    comparedHotelIds,
    phone: '+254 712 345 678',
    passportCountry: 'Kenya',
  });
  
  const [bookings, setBookings] = useState<Booking[]>(MOCK_USER_BOOKINGS);
  
  // Initialize with default data - localStorage sync happens in useEffect to prevent hydration mismatch
  const [destinations, setDestinations] = useState<Destination[]>(MOCK_DESTINATIONS);
  const [hotels, setHotels] = useState<LuxuryLodge[]>(MOCK_LODGES);
  const [itineraries, setItineraries] = useState<SafariItinerary[]>(MOCK_ITINERARIES);
  
  // Load from localStorage after hydration to prevent mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedDestinations = localStorage.getItem('safariflow_destinations');
      if (savedDestinations) {
        setDestinations(JSON.parse(savedDestinations));
      }
    } catch (e) {
      console.error('Failed to load destinations from localStorage:', e);
    }
    
    try {
      const savedHotels = localStorage.getItem('safariflow_hotels');
      if (savedHotels) {
        setHotels(JSON.parse(savedHotels));
      }
    } catch (e) {
      console.error('Failed to load hotels from localStorage:', e);
    }
    
    try {
      const savedItineraries = localStorage.getItem('safariflow_itineraries');
      if (savedItineraries) {
        setItineraries(JSON.parse(savedItineraries));
      }
    } catch (e) {
      console.error('Failed to load itineraries from localStorage:', e);
    }
  }, []);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingModalTarget, setBookingModalTarget] = useState<{ type: 'itinerary' | 'destination' | 'hotel'; id: string } | null>(null);

  // Sync hotels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('safariflow_hotels', JSON.stringify(hotels));
    } catch (e) {
      console.error('Failed to save hotels to localStorage:', e);
    }
  }, [hotels]);

  // Sync itineraries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('safariflow_itineraries', JSON.stringify(itineraries));
    } catch (e) {
      console.error('Failed to save itineraries to localStorage:', e);
    }
  }, [itineraries]);

  // Sync destinations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('safariflow_destinations', JSON.stringify(destinations));
    } catch (e) {
      console.error('Failed to save destinations to localStorage:', e);
    }
  }, [destinations]);

  // Destination CRUD Handlers
  const addDestination = (newDest: Destination) => {
    setDestinations(prev => [newDest, ...prev]);
  };

  const updateDestination = (updatedDest: Destination) => {
    setDestinations(prev => prev.map(d => (d.id === updatedDest.id ? updatedDest : d)));
  };

  const deleteDestination = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
    if (selectedDestinationId === id) {
      setSelectedDestinationId(null);
      setCurrentPage('destinations');
    }
  };

  const addGalleryPhoto = (destinationId: string, photoUrl: string) => {
    setDestinations(prev =>
      prev.map(d => {
        if (d.id === destinationId) {
          return {
            ...d,
            gallery: d.gallery.includes(photoUrl) ? d.gallery : [...d.gallery, photoUrl],
          };
        }
        return d;
      })
    );
  };

  // Hotel CRUD & Ecosystem Handlers
  const addHotel = (newHotel: LuxuryLodge) => {
    setHotels(prev => [newHotel, ...prev]);
  };

  const updateHotel = (updatedHotel: LuxuryLodge) => {
    setHotels(prev => prev.map(h => (h.id === updatedHotel.id ? updatedHotel : h)));
  };

  const deleteHotel = (id: string) => {
    setHotels(prev => prev.filter(h => h.id !== id));
    setSavedHotelIds(prev => prev.filter(hId => hId !== id));
    setComparedHotelIds(prev => prev.filter(hId => hId !== id));
    if (selectedHotelId === id) {
      setSelectedHotelId(null);
      setCurrentPage('hotels');
    }
  };

  const addHotelGalleryPhoto = (hotelId: string, photoUrl: string) => {
    setHotels(prev =>
      prev.map(h => {
        if (h.id === hotelId) {
          return {
            ...h,
            gallery: h.gallery.includes(photoUrl) ? h.gallery : [...h.gallery, photoUrl],
          };
        }
        return h;
      })
    );
  };

  const addHotelToItinerary = (hotelId: string, itineraryId: string, dayNumber: number) => {
    const targetHotel = hotels.find(h => h.id === hotelId);
    if (!targetHotel) return;

    setItineraries(prev =>
      prev.map(itin => {
        if (itin.id === itineraryId) {
          const updatedDays = itin.dayByDay.map(day => {
            if (day.day === dayNumber) {
              return {
                ...day,
                accommodation: targetHotel.name,
              };
            }
            return day;
          });
          return {
            ...itin,
            dayByDay: updatedDays,
          };
        }
        return itin;
      })
    );
  };

  const toggleSaveHotel = (id: string) => {
    setSavedHotelIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCompareHotel = (id: string) => {
    setComparedHotelIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const clearHotelComparisons = () => {
    setComparedHotelIds([]);
  };

  // Sync dark class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navigateTo = (page: NavigationPage, targetId?: string) => {
    setCurrentPage(page);
    if (page === 'destination-detail' && targetId) {
      setSelectedDestinationId(targetId);
    }
    if (page === 'itinerary-detail' && targetId) {
      setSelectedItineraryId(targetId);
    }
    if (page === 'hotel-detail' && targetId) {
      setSelectedHotelId(targetId);
    }
    // Safe scroll - only runs on client
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigation history for goBack functionality
  const [navigationHistory, setNavigationHistory] = useState<{ label: string; page: NavigationPage }[]>([]);
  const [previousPageContext, setPreviousPageContext] = useState<{ label: string; page: NavigationPage } | null>(null);

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const previous = navigationHistory[navigationHistory.length - 2];
      setPreviousPageContext(navigationHistory[navigationHistory.length - 1]);
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentPage(previous.page);
    }
  };
  
  // Export navigationHistory for QuickNavDrawer
  const contextNavigationHistory = navigationHistory;

  const toggleSaveDestination = (id: string) => {
    setSavedDestinationIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSaveItinerary = (id: string) => {
    setSavedItineraryIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCompareItinerary = (id: string) => {
    setComparedItineraryIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        // max 3 comparison
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const clearComparisons = () => {
    setComparedItineraryIds([]);
  };

  const addBooking = (newBookingData: Omit<Booking, 'id' | 'createdAt' | 'bookingRef'>): Booking => {
    const randomRefNum = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      ...newBookingData,
      id: `bk-${Date.now()}`,
      bookingRef: `SF-2026-${randomRefNum}`,
      createdAt: new Date().toISOString().split('T')[0],
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SF-2026-${randomRefNum}`,
    };
    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus, paymentStatus?: PaymentStatus) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status, ...(paymentStatus ? { paymentStatus } : {}) } : b))
    );
  };

  const submitRefundRequest = (
    bookingId: string,
    reason: RefundWorkflow['reason'],
    reasonDetails: string,
    requestedAmountUSD: number,
    payoutAccount: string
  ) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const refundObj: RefundWorkflow = {
            id: `ref-${Date.now().toString().slice(-4)}`,
            requestedAt: new Date().toISOString().split('T')[0],
            reason,
            reasonDetails,
            requestedAmountUSD,
            status: 'Submitted',
            payoutAccount,
            refundMethod: b.paymentGateway || 'Stripe',
          };
          return {
            ...b,
            status: 'Refund Requested',
            paymentStatus: 'Refund Pending',
            refundWorkflow: refundObj,
          };
        }
        return b;
      })
    );
  };

  const processRefundAdmin = (
    bookingId: string,
    approved: boolean,
    approvedAmountUSD?: number,
    adminNotes?: string
  ) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId && b.refundWorkflow) {
          const updatedWorkflow: RefundWorkflow = {
            ...b.refundWorkflow,
            status: approved ? 'Approved' : 'Rejected',
            approvedAmountUSD: approved ? (approvedAmountUSD || b.refundWorkflow.requestedAmountUSD) : 0,
            adminNotes: adminNotes || (approved ? 'Refund approved and disbursed via original gateway.' : 'Refund declined per lodge terms.'),
            processedAt: new Date().toISOString().split('T')[0],
          };
          return {
            ...b,
            status: approved ? 'Refunded' : 'Confirmed',
            paymentStatus: approved ? 'Refunded' : 'Paid in Full',
            refundWorkflow: updatedWorkflow,
          };
        }
        return b;
      })
    );
  };

  const completeBalancePayment = (bookingId: string, paymentGateway: PaymentGateway, paymentRef: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            paymentStatus: 'Paid in Full',
            status: 'Confirmed',
            balanceDueUSD: 0,
            paymentGateway,
            paymentReference: paymentRef,
          };
        }
        return b;
      })
    );
  };

  const openBookingModal = (type: 'itinerary' | 'destination' | 'hotel', id: string) => {
    setBookingModalTarget({ type, id });
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setBookingModalTarget(null);
  };

  const formatPrice = (usdAmount: number): string => {
    const config = exchangeRates[currency] || DEFAULT_EXCHANGE_RATES[currency] || DEFAULT_EXCHANGE_RATES.USD;
    const converted = Math.round(usdAmount * config.rate);
    const formattedStr = converted.toLocaleString();
    return `${config.symbol}${formattedStr}`;
  };

  const loginAs = (role: 'traveler' | 'admin' | 'ranger_partner') => {
    if (role === 'admin') {
      setUser({
        id: 'usr-admin-01',
        name: 'Alexander Sterling',
        email: 'admin@safariflow.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        preferredCurrency: 'USD',
        savedDestinationIds: [],
        savedItineraryIds: [],
        savedHotelIds: [],
        comparedItineraryIds: [],
        comparedHotelIds: [],
      });
      navigateTo('admin-dashboard');
    } else {
      setUser({
        id: 'usr-101',
        name: 'Makena Kamau',
        email: 'kamauwamakena@gmail.com',
        role: 'traveler',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        preferredCurrency: currency,
        dietaryPreferences: 'Gluten-Free, Plant-based options',
        savedDestinationIds,
        savedItineraryIds,
        savedHotelIds,
        comparedItineraryIds,
        comparedHotelIds,
        phone: '+254 712 345 678',
        passportCountry: 'Kenya',
      });
      navigateTo('user-dashboard');
    }
    setAuthModalOpen(false);
  };

  // Visual Itinerary Builder State
  const [customBuilderItineraries, setCustomBuilderItineraries] = useState<CustomBuilderItinerary[]>(() => {
    try {
      const saved = localStorage.getItem('ident_custom_builder_itineraries');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load saved builder itineraries:', err);
    }
    return [DEFAULT_SAMPLE_BUILDER_ITINERARY];
  });

  const [activeBuilderItinerary, setActiveBuilderItinerary] = useState<CustomBuilderItinerary>(
    DEFAULT_SAMPLE_BUILDER_ITINERARY
  );

  // Sync builder itineraries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ident_custom_builder_itineraries', JSON.stringify(customBuilderItineraries));
    } catch (err) {
      console.error('Failed to sync builder itineraries:', err);
    }
  }, [customBuilderItineraries]);

  const saveBuilderItinerary = (itinToSave: CustomBuilderItinerary) => {
    const updated: CustomBuilderItinerary = {
      ...itinToSave,
      updatedAt: new Date().toISOString(),
    };

    setCustomBuilderItineraries((prev) => {
      const existsIndex = prev.findIndex((i) => i.id === updated.id);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = updated;
        return next;
      }
      return [updated, ...prev];
    });

    setActiveBuilderItinerary(updated);
  };

  const duplicateBuilderItinerary = (id: string): CustomBuilderItinerary => {
    const original = customBuilderItineraries.find((i) => i.id === id) || activeBuilderItinerary;
    const duplicated: CustomBuilderItinerary = {
      ...original,
      id: `custom-itin-${Date.now()}`,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomBuilderItineraries((prev) => [duplicated, ...prev]);
    setActiveBuilderItinerary(duplicated);
    return duplicated;
  };

  const loadBuilderItinerary = (id: string) => {
    const found = customBuilderItineraries.find((i) => i.id === id);
    if (found) {
      setActiveBuilderItinerary(found);
    }
  };

  const deleteBuilderItinerary = (id: string) => {
    setCustomBuilderItineraries((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      if (filtered.length > 0 && activeBuilderItinerary.id === id) {
        setActiveBuilderItinerary(filtered[0]);
      }
      return filtered;
    });
  };

  const createBlankBuilderItinerary = (): CustomBuilderItinerary => {
    const blank: CustomBuilderItinerary = {
      id: `builder-custom-${Date.now()}`,
      title: 'New Custom East Africa Journey',
      description: 'A bespoke safari itinerary tailored for your luxury expedition.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      travelersCount: 2,
      startDate: new Date().toISOString().split('T')[0],
      totalDays: 3,
      totalCostUSD: 0,
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      shareCode: `IDENT-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [],
    };

    setActiveBuilderItinerary(blank);
    setCustomBuilderItineraries((prev) => [blank, ...prev]);
    return blank;
  };

  // Supplier Portal State
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>(MOCK_SUPPLIERS);
  const [activeSupplierId, setActiveSupplierId] = useState<string>('supp-angama-lodge');
  const [supplierPricingRules, setSupplierPricingRules] = useState<SupplierPricingRule[]>(MOCK_SUPPLIER_PRICING_RULES);
  const [supplierAvailabilitySlots, setSupplierAvailabilitySlots] = useState<SupplierAvailabilitySlot[]>(MOCK_SUPPLIER_AVAILABILITY);
  const [supplierBookings, setSupplierBookings] = useState<SupplierBooking[]>(MOCK_SUPPLIER_BOOKINGS);

  const activeSupplier = suppliers.find((s) => s.id === activeSupplierId) || suppliers[0] || null;

  const registerSupplier = (
    data: Omit<
      SupplierProfile,
      'id' | 'createdAt' | 'updatedAt' | 'approvalStatus' | 'rating' | 'reviewsCount' | 'completedBookingsCount' | 'commissionPercentage'
    >
  ): SupplierProfile => {
    const newSupplier: SupplierProfile = {
      ...data,
      id: `supp-reg-${Date.now()}`,
      approvalStatus: 'pending_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: 0,
      reviewsCount: 0,
      completedBookingsCount: 0,
      commissionPercentage: 15,
      adminNotes: 'Application submitted and awaiting Ident Africa Warden verification.',
    };

    setSuppliers((prev) => [newSupplier, ...prev]);
    setActiveSupplierId(newSupplier.id);
    return newSupplier;
  };

  const updateSupplierProfile = (updated: SupplierProfile) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : s))
    );
  };

  const updateSupplierApprovalStatus = (supplierId: string, status: SupplierApprovalStatus, adminNotes?: string) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId
          ? {
              ...s,
              approvalStatus: status,
              adminNotes: adminNotes ?? s.adminNotes,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  const addPricingRule = (ruleData: Omit<SupplierPricingRule, 'id'>) => {
    const newRule: SupplierPricingRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
    };
    setSupplierPricingRules((prev) => [...prev, newRule]);
  };

  const deletePricingRule = (ruleId: string) => {
    setSupplierPricingRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const updateAvailabilitySlot = (slotData: Omit<SupplierAvailabilitySlot, 'id'>) => {
    setSupplierAvailabilitySlots((prev) => {
      const existingIndex = prev.findIndex(
        (s) => s.supplierId === slotData.supplierId && s.date === slotData.date
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...slotData };
        return updated;
      } else {
        return [...prev, { ...slotData, id: `avail-${Date.now()}` }];
      }
    });
  };

  const updateSupplierBookingStatus = (bookingId: string, status: SupplierBooking['status']) => {
    setSupplierBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const logout = () => {
    setUser(null);
    navigateTo('home');
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        selectedDestinationId,
        selectedItineraryId,
        selectedHotelId,
        currency,
        setCurrency,
        exchangeRates,
        isFetchingRates,
        ratesSource,
        lastRatesUpdate,
        refreshExchangeRates,
        theme,
        user,
        savedDestinationIds,
        savedItineraryIds,
        savedHotelIds,
        comparedItineraryIds,
        comparedHotelIds,
        bookings,
        destinations,
        itineraries,
        hotels,
        authModalOpen,
        bookingModalOpen,
        bookingModalTarget,
        navigateTo,
        goBack,
        previousPageContext,
        navigationHistory: contextNavigationHistory,
        toggleTheme,
        toggleSaveDestination,
        toggleSaveItinerary,
        toggleSaveHotel,
        toggleCompareItinerary,
        toggleCompareHotel,
        clearComparisons,
        clearHotelComparisons,
        addBooking,
        updateBookingStatus,
        submitRefundRequest,
        processRefundAdmin,
        completeBalancePayment,
        setAuthModalOpen,
        openBookingModal,
        closeBookingModal,
        formatPrice,
        loginAs,
        logout,
        addDestination,
        updateDestination,
        deleteDestination,
        addGalleryPhoto,
        addHotel,
        updateHotel,
        deleteHotel,
        addHotelGalleryPhoto,
        addHotelToItinerary,
        customBuilderItineraries,
        activeBuilderItinerary,
        setActiveBuilderItinerary,
        saveBuilderItinerary,
        duplicateBuilderItinerary,
        loadBuilderItinerary,
        deleteBuilderItinerary,
        createBlankBuilderItinerary,
        suppliers,
        activeSupplierId,
        activeSupplier,
        supplierPricingRules,
        supplierAvailabilitySlots,
        supplierBookings,
        setActiveSupplierId,
        registerSupplier,
        updateSupplierProfile,
        updateSupplierApprovalStatus,
        addPricingRule,
        deletePricingRule,
        updateAvailabilitySlot,
        updateSupplierBookingStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
