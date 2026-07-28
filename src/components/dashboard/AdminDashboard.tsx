import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_ADMIN_STATS } from '../../data/mockData';
import { Booking, Destination, LuxuryLodge, RoomType, HotelCategory, Country } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  MapPin,
  Save,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    bookings,
    formatPrice,
    navigateTo,
    destinations,
    addDestination,
    updateDestination,
    deleteDestination,
    hotels,
    addHotel,
    updateHotel,
    deleteHotel,
    suppliers,
    updateSupplierApprovalStatus,
  } = useApp();

  const [bookingList, setBookingList] = useState<Booking[]>(bookings);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [supplierFilter, setSupplierFilter] = useState<string>('All');

  // Tab State
  const [activeTab, setActiveTab] = useState<'destinations' | 'hotels' | 'bookings' | 'suppliers'>('suppliers');

  // Destination Management Modal States
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [destFormData, setDestFormData] = useState<Partial<Destination>>({});
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  // Hotel Management Modal States
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<LuxuryLodge | null>(null);
  const [hotelFormData, setHotelFormData] = useState<Partial<LuxuryLodge>>({});
  const [amenityInput, setAmenityInput] = useState('');
  const [hotelPhotoInput, setHotelPhotoInput] = useState('');
  
  // Room Type Form State for Hotel Modal
  const [newRoomData, setNewRoomData] = useState<Partial<RoomType>>({
    name: 'Executive Savannah Suite',
    description: 'Private terrace with infinity dip pool',
    sizeSqFt: 900,
    bedType: 'King Four-Poster',
    maxOccupancy: 2,
    pricePerNight: 1200,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Outdoor Bath', 'Butler Desk'],
    availableRooms: 4,
  });

  const handleUpdateStatus = (id: string, newStatus: Booking['status']) => {
    setBookingList(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const filteredBookings = filterStatus === 'All'
    ? bookingList
    : bookingList.filter(b => b.status === filterStatus);

  // Destination Handlers
  const handleOpenAddDest = () => {
    setEditingDest(null);
    setDestFormData({
      id: `dest-${Date.now()}`,
      name: '',
      tagline: '',
      country: 'Kenya',
      region: '',
      category: 'Savanna & Plains',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      gallery: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'],
      startingPrice: 3500,
      durationDays: 5,
      rating: 4.9,
      reviewsCount: 1,
      ecoScore: 9.8,
      description: '',
      highlights: ['Hot air balloon safari', 'Private 4x4 game drives'],
      bestMonths: ['July', 'August', 'September', 'October'],
      wildlifeHighlights: ['The Big Five'],
      coordinates: { lat: -1.4061, lng: 35.1328 },
    });
    setIsDestModalOpen(true);
  };

  const handleOpenEditDest = (dest: Destination) => {
    setEditingDest(dest);
    setDestFormData({ ...dest });
    setIsDestModalOpen(true);
  };

  const handleSaveDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destFormData.name || !destFormData.country) return;

    if (editingDest) {
      updateDestination(destFormData as Destination);
    } else {
      addDestination(destFormData as Destination);
    }
    setIsDestModalOpen(false);
  };

  const handleDeleteDest = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteDestination(id);
    }
  };

  // Hotel Handlers
  const handleOpenAddHotel = () => {
    setEditingHotel(null);
    setHotelFormData({
      id: `lodge-${Date.now()}`,
      name: '',
      tagline: '',
      category: 'Safari Lodge',
      tier: 'Ultra-Luxe Canvas',
      country: 'Kenya',
      region: 'Masai Mara National Reserve',
      location: 'Oloololo Escarpment, Mara Triangle',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      ],
      pricePerNight: 1450,
      rating: 4.9,
      reviewsCount: 1,
      ecoScore: 9.8,
      description: 'Bespoke luxury sanctuary with infinity bush pool, private helipad, and 24/7 dedicated butler service.',
      amenities: [
        'Private Heliport',
        'Infinity Bush Pool',
        '24/7 Dedicated Butler Service',
        'Bush Spa & Hydrotherapy',
        '100% Solar Off-Grid Power',
      ],
      roomTypes: [
        {
          id: `room-${Date.now()}-1`,
          name: 'Master Escarpment Suite',
          description: 'Panoramic glass pavilion overlooking the savanna plains.',
          sizeSqFt: 1100,
          bedType: 'Super King Four-Poster',
          maxOccupancy: 2,
          pricePerNight: 1450,
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          amenities: ['Private Plunge Pool', 'Outdoor Starbed', 'En-suite Stone Bath'],
          availableRooms: 3,
        }
      ],
      coordinates: { lat: -1.2721, lng: 34.9621 },
      checkInTime: '12:00 PM',
      checkOutTime: '10:00 AM',
      contactEmail: 'concierge@safariflow.com',
      contactPhone: '+254 20 251 3166',
      featured: true,
    });
    setIsHotelModalOpen(true);
  };

  const handleOpenEditHotel = (lodge: LuxuryLodge) => {
    setEditingHotel(lodge);
    setHotelFormData({ ...lodge });
    setIsHotelModalOpen(true);
  };

  const handleSaveHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelFormData.name || !hotelFormData.country) return;

    if (editingHotel) {
      updateHotel(hotelFormData as LuxuryLodge);
    } else {
      addHotel(hotelFormData as LuxuryLodge);
    }
    setIsHotelModalOpen(false);
  };

  const handleDeleteHotel = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteHotel(id);
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setHotelFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenityInput.trim()],
      }));
      setAmenityInput('');
    }
  };

  const handleAddHotelPhoto = () => {
    if (hotelPhotoInput.trim()) {
      setHotelFormData(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), hotelPhotoInput.trim()],
      }));
      setHotelPhotoInput('');
    }
  };

  const handleAddRoomType = () => {
    if (!newRoomData.name) return;
    const createdRoom: RoomType = {
      id: `room-${Date.now()}`,
      name: newRoomData.name || 'Safari Suite',
      description: newRoomData.description || 'Luxury accommodation',
      sizeSqFt: newRoomData.sizeSqFt || 800,
      bedType: newRoomData.bedType || 'King Bed',
      maxOccupancy: newRoomData.maxOccupancy || 2,
      pricePerNight: newRoomData.pricePerNight || 1000,
      image: newRoomData.image || hotelFormData.image || '',
      amenities: newRoomData.amenities || ['Private Deck'],
      availableRooms: newRoomData.availableRooms || 4,
    };

    setHotelFormData(prev => ({
      ...prev,
      roomTypes: [...(prev.roomTypes || []), createdRoom],
    }));
  };

  const handleRemoveRoomType = (roomId: string) => {
    setHotelFormData(prev => ({
      ...prev,
      roomTypes: (prev.roomTypes || []).filter(r => r.id !== roomId),
    }));
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold uppercase mb-2 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> SafariFlow Executive Control Suite
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#F5EBE0]">
              Ecosystem Administration
            </h1>
            <p className="text-xs font-mono text-[#F5EBE0]/70 mt-1">
              Live booking verification, park ranger dispatch, lodge ecosystem CRUD, and destination management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('user-dashboard')}
              className="px-4 py-2 rounded-xl bg-[#1E3A2B] border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0F1210] transition-colors"
            >
              Switch to Traveler View
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-2 shadow-xl">
            <span className="text-xs font-mono text-[#F5EBE0]/60 uppercase">Gross Platform Revenue</span>
            <div className="text-3xl font-serif font-bold text-[#D4AF37]">
              {formatPrice(MOCK_ADMIN_STATS.totalRevenueUSD)}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">↑ 18.4% vs last quarter</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-2 shadow-xl">
            <span className="text-xs font-mono text-[#F5EBE0]/60 uppercase">Lodges & Sanctuaries</span>
            <div className="text-3xl font-serif font-bold text-[#F5EBE0]">
              {hotels.length}
            </div>
            <span className="text-[10px] text-[#D4AF37] font-mono block">Active Partner Lodges</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-2 shadow-xl">
            <span className="text-xs font-mono text-[#F5EBE0]/60 uppercase">Destination Reserves</span>
            <div className="text-3xl font-serif font-bold text-emerald-400">
              {destinations.length}
            </div>
            <span className="text-[10px] text-[#F5EBE0]/60 font-mono block">Kenya, Tanzania, Uganda, Rwanda</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-2 shadow-xl">
            <span className="text-xs font-mono text-[#F5EBE0]/60 uppercase">Total Travelers Hosted</span>
            <div className="text-3xl font-serif font-bold text-[#F5EBE0]">
              {MOCK_ADMIN_STATS.totalTravelersCount}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">Zero Incident Record</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-[#2A362E] pb-2 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'suppliers'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            <span>Supplier Partners & Approvals ({suppliers.length})</span>
            {suppliers.some((s) => s.approvalStatus === 'pending_approval') && (
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('hotels')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'hotels'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            Sanctuary Lodges Ecosystem ({hotels.length})
          </button>

          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'destinations'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            Destination Reserves ({destinations.length})
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-[#D4AF37] text-[#0F1210] shadow-lg'
                : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-white'
            }`}
          >
            Reservations Portal ({bookings.length})
          </button>
        </div>

        {/* TAB 0: SUPPLIER PARTNERS & APPROVAL WORKFLOW */}
        {activeTab === 'suppliers' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A362E] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">
                    Supplier Partner Verification & Approvals
                  </h2>
                  <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500 text-amber-300 text-[10px] font-mono font-bold uppercase rounded">
                    Admin Approval Required
                  </span>
                </div>
                <p className="text-xs font-mono text-[#F5EBE0]/70 mt-1">
                  Inspect licensing compliance (KTB/TALA, KPSGA Badge, Air AOC), verify tax PINs, and approve/reject partner listings.
                </p>
              </div>

              <button
                onClick={() => navigateTo('supplier-portal')}
                className="px-4 py-2 bg-[#1E3A2B] border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0F1210] transition-colors rounded-xl"
              >
                Open Supplier Portal View
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {['All', 'pending_approval', 'approved', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSupplierFilter(st)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                    supplierFilter === st
                      ? 'bg-[#D4AF37] text-[#0F1210]'
                      : 'bg-[#0F1210] text-[#F5EBE0]/70 border border-[#2A362E] hover:text-white'
                  }`}
                >
                  {st === 'All'
                    ? 'All Suppliers'
                    : st === 'pending_approval'
                    ? 'Pending Approval'
                    : st === 'approved'
                    ? 'Approved Partners'
                    : 'Rejected Applications'}
                </button>
              ))}
            </div>

            {/* Suppliers Cards */}
            <div className="space-y-4">
              {suppliers
                .filter((s) => supplierFilter === 'All' || s.approvalStatus === supplierFilter)
                .map((supp) => (
                  <div
                    key={supp.id}
                    className="p-5 rounded-2xl bg-[#0F1210] border border-[#2A362E] hover:border-[#D4AF37]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={supp.logoOrAvatar}
                        alt={supp.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]/40 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-bold text-lg text-[#F5EBE0]">
                            {supp.name}
                          </span>
                          <span className="px-2 py-0.5 bg-[#1E3A2B] text-[#D4AF37] text-[10px] font-mono font-bold uppercase rounded">
                            {supp.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                              supp.approvalStatus === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                                : supp.approvalStatus === 'pending_approval'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500'
                                : 'bg-red-950 text-red-300 border border-red-500'
                            }`}
                          >
                            {supp.approvalStatus}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-[#F5EBE0]/70 mt-1">
                          Location: {supp.region}, {supp.country} • Email: {supp.email} • Phone: {supp.phone}
                        </p>

                        <div className="mt-2 flex items-center gap-4 text-xs font-mono text-[#D4AF37] flex-wrap">
                          <span>Tax PIN: <strong>{supp.taxPinNumber}</strong></span>
                          <span>License: <strong>{supp.licenseNumber}</strong></span>
                          <span>Doc: <strong>{supp.licenseDocumentName || 'Verified_Permit.pdf'}</strong></span>
                          <span>Bank: <strong>{supp.bankName} ({supp.accountNumber})</strong></span>
                        </div>

                        {supp.adminNotes && (
                          <p className="text-xs font-mono text-amber-300/80 italic mt-1 bg-[#181E1A] p-2 rounded border border-amber-500/20">
                            Warden Note: "{supp.adminNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                      {supp.approvalStatus !== 'approved' && (
                        <button
                          onClick={() =>
                            updateSupplierApprovalStatus(
                              supp.id,
                              'approved',
                              'Approved by Ident Africa Warden Council. Listing activated.'
                            )
                          }
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl uppercase flex items-center gap-1 shadow-lg"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve Supplier
                        </button>
                      )}

                      {supp.approvalStatus !== 'rejected' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection or revision reason for supplier:');
                            if (reason !== null) {
                              updateSupplierApprovalStatus(supp.id, 'rejected', reason || 'License verification unconfirmed.');
                            }
                          }}
                          className="px-3 py-2 bg-red-950 border border-red-600 hover:bg-red-900 text-red-300 font-mono text-xs font-bold rounded-xl uppercase flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject / Revise
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 1: HOTEL & LODGE ECOSYSTEM MANAGEMENT */}
        {activeTab === 'hotels' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">Hotel & Sanctuary Lodges Management</h2>
                <p className="text-xs font-mono text-[#F5EBE0]/70">Add, edit, manage suites, update pricing, and modify gallery photos.</p>
              </div>

              <button
                onClick={handleOpenAddHotel}
                className="inline-flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-xs font-bold font-mono shadow-lg"
              >
                <Plus className="w-4 h-4" /> Add Sanctuary Lodge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(h => (
                <div
                  key={h.id}
                  className="rounded-2xl bg-[#12241A] border border-[#2A362E] hover:border-[#D4AF37]/40 overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={h.image}
                        alt={h.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-[#D4AF37] text-[10px] font-mono font-bold backdrop-blur-md border border-[#D4AF37]/30">
                        {h.country} • {h.category}
                      </span>
                      <span className="absolute bottom-3 left-3 text-xs font-mono text-emerald-400 font-bold">
                        Eco Score: {h.ecoScore}/10
                      </span>
                      <span className="absolute bottom-3 right-3 text-xs font-mono text-amber-400 font-bold">
                        ★ {h.rating}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-serif font-bold text-[#F5EBE0] leading-tight">{h.name}</h3>
                      <p className="text-xs font-mono text-[#D4AF37] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {h.location}
                      </p>
                      <p className="text-xs text-[#F5EBE0]/70 line-clamp-2">{h.description}</p>

                      <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#F5EBE0]/80 border-t border-[#2A362E]">
                        <span>Price: <strong className="text-[#D4AF37]">{formatPrice(h.pricePerNight)}</strong>/nt</span>
                        <span>Suites: <strong className="text-white">{h.roomTypes.length}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F1210] border-t border-[#2A362E] flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigateTo('hotel-detail', h.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F5EBE0]"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" /> Preview
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditHotel(h)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A2B] hover:bg-[#D4AF37] hover:text-[#0F1210] text-xs font-mono text-[#D4AF37] transition-colors font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteHotel(h.id, h.name)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Delete Lodge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DESTINATION CRUD MANAGEMENT */}
        {activeTab === 'destinations' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">Destination Reserves System</h2>
                <p className="text-xs font-mono text-[#F5EBE0]/70">Add, edit, upload photos, and modify park telemetry.</p>
              </div>

              <button
                onClick={handleOpenAddDest}
                className="inline-flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-xs font-bold font-mono shadow-lg"
              >
                <Plus className="w-4 h-4" /> Add New Reserve
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map(d => (
                <div
                  key={d.id}
                  className="rounded-2xl bg-[#12241A] border border-[#2A362E] hover:border-[#D4AF37]/40 overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-[#D4AF37] text-[10px] font-mono font-bold backdrop-blur-md border border-[#D4AF37]/30">
                        {d.country} • {d.category}
                      </span>
                      <span className="absolute bottom-3 left-3 text-xs font-mono text-emerald-400 font-bold">
                        Eco Score: {d.ecoScore}/10
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-serif font-bold text-[#F5EBE0] leading-tight">{d.name}</h3>
                      <p className="text-xs font-mono text-[#D4AF37] line-clamp-1">{d.tagline}</p>
                      <p className="text-xs text-[#F5EBE0]/70 line-clamp-2">{d.description}</p>

                      <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#F5EBE0]/80">
                        <span>Price: <strong className="text-[#D4AF37]">{formatPrice(d.startingPrice)}</strong></span>
                        <span>Duration: {d.durationDays} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F1210] border-t border-[#2A362E] flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigateTo('destination-detail', d.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F5EBE0]"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" /> Preview
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditDest(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A2B] hover:bg-[#D4AF37] hover:text-[#0F1210] text-xs font-mono text-[#D4AF37] transition-colors font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteDest(d.id, d.name)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Delete Destination"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKING RESERVATIONS TABLE */}
        {activeTab === 'bookings' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">Traveler Reservations Portal</h2>
                <p className="text-xs font-mono text-[#F5EBE0]/70">Review and dispatch ranger verification for incoming bookings.</p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#F5EBE0]/60">Filter Status:</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-[#12241A] border border-[#2A362E] text-[#D4AF37] px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending Ranger Dispatch">Pending Ranger Dispatch</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#2A362E]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#12241A] border-b border-[#2A362E] text-[#D4AF37] uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Ref & Traveler</th>
                    <th className="p-4">Expedition</th>
                    <th className="p-4">Travel Dates</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A362E] bg-[#181E1A]">
                  {filteredBookings.map(bk => (
                    <tr key={bk.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-[#D4AF37] block">{bk.bookingRef}</span>
                        <span className="text-[10px] text-[#F5EBE0]/70">{bk.travelerName} ({bk.travelerEmail})</span>
                      </td>
                      <td className="p-4 font-serif font-bold text-[#F5EBE0]">{bk.title}</td>
                      <td className="p-4 text-[#F5EBE0]/80">{bk.startDate} to {bk.endDate}</td>
                      <td className="p-4 font-serif font-bold text-[#D4AF37]">{formatPrice(bk.totalPriceUSD)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bk.status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : bk.status === 'Pending Ranger Dispatch'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {bk.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleUpdateStatus(bk.id, 'Confirmed')}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                        >
                          Approve & Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* HOTEL EDIT / ADD FORM MODAL */}
      {isHotelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8 bg-[#181E1A] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-6 text-[#F5EBE0] shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#2A362E] pb-4">
              <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">
                {editingHotel ? `Edit ${editingHotel.name}` : 'Create New Sanctuary Lodge'}
              </h3>
              <button
                onClick={() => setIsHotelModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-6 font-mono text-xs">
              
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Lodge Name *</label>
                  <input
                    type="text"
                    required
                    value={hotelFormData.name || ''}
                    onChange={e => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                    placeholder="e.g. Mara Plains Tented Sanctuary"
                  />
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Category Architecture</label>
                  <select
                    value={hotelFormData.category || 'Safari Lodge'}
                    onChange={e => setHotelFormData({ ...hotelFormData, category: e.target.value as HotelCategory })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  >
                    <option value="Safari Lodge">Safari Lodge</option>
                    <option value="Luxury Tented Camp">Luxury Tented Camp</option>
                    <option value="Bespoke Private Villa">Bespoke Private Villa</option>
                    <option value="Heritage Manor">Heritage Manor</option>
                    <option value="Eco Beach Resort">Eco Beach Resort</option>
                    <option value="Mountain Treehouse">Mountain Treehouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Country</label>
                  <select
                    value={hotelFormData.country || 'Kenya'}
                    onChange={e => setHotelFormData({ ...hotelFormData, country: e.target.value as Country as Country })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Rwanda">Rwanda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Location / Reserve Area</label>
                  <input
                    type="text"
                    value={hotelFormData.location || ''}
                    onChange={e => setHotelFormData({ ...hotelFormData, location: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                    placeholder="e.g. Mara North Conservancy"
                  />
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Base Nightly Price (USD) *</label>
                  <input
                    type="number"
                    required
                    value={hotelFormData.pricePerNight || 1200}
                    onChange={e => setHotelFormData({ ...hotelFormData, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Eco Score (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hotelFormData.ecoScore || 9.8}
                    onChange={e => setHotelFormData({ ...hotelFormData, ecoScore: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#D4AF37] uppercase mb-1">Full Lodge Atmosphere Description</label>
                <textarea
                  rows={3}
                  value={hotelFormData.description || ''}
                  onChange={e => setHotelFormData({ ...hotelFormData, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-[#D4AF37] uppercase mb-1">Primary Cover Image URL</label>
                <input
                  type="url"
                  value={hotelFormData.image || ''}
                  onChange={e => setHotelFormData({ ...hotelFormData, image: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              {/* Amenities Tags Manager */}
              <div className="space-y-2">
                <label className="block text-[#D4AF37] uppercase mb-1">Lodge Amenities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={e => setAmenityInput(e.target.value)}
                    placeholder="e.g. Private Heliport, Bush Spa"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#12241A] border border-[#2A362E] text-white"
                  />
                  <button type="button" onClick={handleAddAmenity} className="btn-gold px-4 rounded-xl font-bold">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(hotelFormData.amenities || []).map((am, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#12241A] border border-[#2A362E] text-[#D4AF37]">
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Room Types Manager */}
              <div className="p-4 rounded-2xl bg-[#12241A] border border-[#2A362E] space-y-4">
                <span className="text-[#D4AF37] font-bold block uppercase">Suites & Room Types Manager ({hotelFormData.roomTypes?.length || 0})</span>
                
                {/* List existing room suites */}
                <div className="space-y-2">
                  {(hotelFormData.roomTypes || []).map(rt => (
                    <div key={rt.id} className="p-3 rounded-xl bg-[#181E1A] border border-[#2A362E] flex items-center justify-between">
                      <div>
                        <strong className="text-white block">{rt.name}</strong>
                        <span className="text-[10px] text-[#F5EBE0]/60">{rt.sizeSqFt} sq ft • {rt.bedType} • {formatPrice(rt.pricePerNight)}/night</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoomType(rt.id)}
                        className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add Room Form */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#2A362E]">
                  <input
                    type="text"
                    placeholder="Suite Name"
                    value={newRoomData.name || ''}
                    onChange={e => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg bg-[#181E1A] border border-[#2A362E] text-white"
                  />
                  <input
                    type="number"
                    placeholder="Night Price $"
                    value={newRoomData.pricePerNight || 1200}
                    onChange={e => setNewRoomData({ ...newRoomData, pricePerNight: Number(e.target.value) })}
                    className="px-2.5 py-1.5 rounded-lg bg-[#181E1A] border border-[#2A362E] text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddRoomType}
                    className="btn-gold px-3 py-1.5 rounded-lg font-bold"
                  >
                    + Add Suite
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A362E]">
                <button
                  type="button"
                  onClick={() => setIsHotelModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#2A362E] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" /> Save Sanctuary Lodge
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DESTINATION EDIT / ADD FORM MODAL */}
      {isDestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8 bg-[#181E1A] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-6 text-[#F5EBE0] shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#2A362E] pb-4">
              <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">
                {editingDest ? `Edit ${editingDest.name}` : 'Create New Reserve Sanctuary'}
              </h3>
              <button
                onClick={() => setIsDestModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="space-y-6 font-mono text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Sanctuary Name *</label>
                  <input
                    type="text"
                    required
                    value={destFormData.name || ''}
                    onChange={e => setDestFormData({ ...destFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Country</label>
                  <select
                    value={destFormData.country || 'Kenya'}
                    onChange={e => setDestFormData({ ...destFormData, country: e.target.value as Country })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Rwanda">Rwanda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Starting Price (USD)</label>
                  <input
                    type="number"
                    value={destFormData.startingPrice || 3000}
                    onChange={e => setDestFormData({ ...destFormData, startingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#D4AF37] uppercase mb-1">Main Cover Photo URL</label>
                  <input
                    type="url"
                    value={destFormData.image || ''}
                    onChange={e => setDestFormData({ ...destFormData, image: e.target.value, heroImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#D4AF37] uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={destFormData.description || ''}
                  onChange={e => setDestFormData({ ...destFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A362E]">
                <button
                  type="button"
                  onClick={() => setIsDestModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#2A362E] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" /> Save Reserve
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
