import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportElementToPdf } from '../../utils/pdfExporter';
import {
  Destination,
  LuxuryLodge,
  ActivityOption,
  TransportOption,
  BuilderItem,
  CustomBuilderItinerary,
} from '../../types';
import {
  MOCK_ACTIVITIES,
  MOCK_TRANSPORTS,
  DESTINATION_DISTANCE_MATRIX,
  BUILDER_ACTIVITIES,
  BUILDER_TRANSPORTS,
} from '../../data/builderData';
import {
  Compass,
  MapPin,
  Building2,
  Sparkles,
  Truck,
  Plus,
  Trash2,
  Copy,
  Share2,
  Download,
  Save,
  Clock,
  DollarSign,
  Navigation,
  Check,
  Calendar,
  Users,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  GripVertical,
  QrCode,
  Printer,
  X,
  Plane,
  Eye,
  Info,
  Layers,
  ArrowRight,
  Loader2,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const VisualItineraryBuilder: React.FC = () => {
  const {
    destinations,
    hotels,
    formatPrice,
    activeBuilderItinerary,
    saveBuilderItinerary,
    duplicateBuilderItinerary,
    customBuilderItineraries,
    loadBuilderItinerary,
    createBlankBuilderItinerary,
    openBookingModal,
  } = useApp();

  // Local editable itinerary state
  const [currentItin, setCurrentItin] = useState<CustomBuilderItinerary>(activeBuilderItinerary);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'destinations' | 'hotels' | 'activities' | 'transport'>('destinations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('All');

  // Modals & Popovers
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfPreviewOpen(true);
    setTimeout(async () => {
      try {
        const cleanTitle = (currentItin.title || 'Ident_Africa_Expedition')
          .replace(/[^a-zA-Z0-9_\-]/g, '_');
        await exportElementToPdf({
          elementId: 'itinerary-pdf-dossier',
          filename: `${cleanTitle}-Dossier.pdf`,
        });
      } catch (err) {
        console.error('Failed to export PDF:', err);
        alert('Could not generate PDF file automatically. You can use the "Print / Save PDF" option as fallback.');
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 350);
  };
  const [draggedItemData, setDraggedItemData] = useState<{
    type: 'destination' | 'hotel' | 'activity' | 'transport';
    item: Destination | LuxuryLodge | ActivityOption | TransportOption;
  } | null>(null);

  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // Sync when activeBuilderItinerary changes externally
  React.useEffect(() => {
    setCurrentItin(activeBuilderItinerary);
  }, [activeBuilderItinerary.id]);

  // Derived Catalog Filters
  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCountry = selectedCountryFilter === 'All' || d.country === selectedCountryFilter;
      return matchSearch && matchCountry;
    });
  }, [destinations, searchQuery, selectedCountryFilter]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCountry = selectedCountryFilter === 'All' || h.country === selectedCountryFilter;
      return matchSearch && matchCountry;
    });
  }, [hotels, searchQuery, selectedCountryFilter]);

  const filteredActivities = useMemo(() => {
    return MOCK_ACTIVITIES.filter((a) => {
      return a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const filteredTransports = useMemo(() => {
    return MOCK_TRANSPORTS.filter((t) => {
      return t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.type || '').toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  // Real-time Calculations Engine
  const calculationSummary = useMemo(() => {
    const items = currentItin.items || [];
    const travelers = currentItin.travelersCount || 2;

    // Days count
    const maxDayInItems = items.reduce((max, item) => Math.max(max, item.dayNumber), 1);
    const totalDays = Math.max(currentItin.totalDays, maxDayInItems);

    let costLodging = 0;
    let costActivities = 0;
    let costTransport = 0;
    let costParkFees = 0;
    let totalDistanceKm = 0;
    let totalTravelMin = 0;

    // Track sequence of destination IDs to compute inter-destination road/flight distance
    const dayDestinations: { day: number; destId?: string }[] = [];

    items.forEach((item) => {
      if (item.type === 'hotel') {
        costLodging += item.costUSD;
      } else if (item.type === 'activity') {
        costActivities += item.costUSD * travelers;
      } else if (item.type === 'transport') {
        costTransport += item.costUSD;
        if (item.distanceKm) totalDistanceKm += item.distanceKm;
        if (item.estimatedTimeMin) totalTravelMin += item.estimatedTimeMin;
      } else if (item.type === 'destination') {
        costParkFees += item.costUSD * travelers;
        dayDestinations.push({ day: item.dayNumber, destId: item.itemId });
      }
    });

    // Calculate distance between consecutive destinations if not explicitly set by transport
    for (let i = 0; i < dayDestinations.length - 1; i++) {
      const fromId = dayDestinations[i].destId;
      const toId = dayDestinations[i + 1].destId;
      if (fromId && toId && fromId !== toId) {
        const matrixDist = DESTINATION_DISTANCE_MATRIX[fromId]?.[toId] || 250;
        // add to distance total if transport didn't already capture
        totalDistanceKm += matrixDist;
        totalTravelMin += Math.round((matrixDist / 70) * 60); // approx 70 km/h average drive/charter mix
      }
    }

    const totalCost = costLodging + costActivities + costTransport + costParkFees;

    return {
      totalDays,
      totalCost,
      costLodging,
      costActivities,
      costTransport,
      costParkFees,
      totalDistanceKm,
      totalTravelMin,
      travelersCount: travelers,
    };
  }, [currentItin]);

  // Actions for Board Items
  const addItemToDay = (
    type: 'destination' | 'hotel' | 'activity' | 'transport',
    sourceItem: Destination | LuxuryLodge | ActivityOption | TransportOption,
    targetDayNumber: number
  ) => {
    let newItem: BuilderItem;

    if (type === 'destination') {
      const dest = sourceItem as Destination;
      newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'destination',
        itemId: dest.id,
        title: dest.name,
        subtitle: `${dest.country} • ${dest.category}`,
        image: dest.image,
        costUSD: dest.parkInfo?.entryFeeUSD || 100,
        dayNumber: targetDayNumber,
        order: currentItin.items.length + 1,
        notes: `Explore ${dest.name} ecosystem. Entry fee includes conservation trust tax.`,
      };
    } else if (type === 'hotel') {
      const lodge = sourceItem as LuxuryLodge;
      newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'hotel',
        itemId: lodge.id,
        title: lodge.name,
        subtitle: `${lodge.tier} • ${lodge.location}`,
        image: lodge.image,
        costUSD: lodge.pricePerNight,
        dayNumber: targetDayNumber,
        order: currentItin.items.length + 1,
        notes: `Overnight luxury suite at ${lodge.name}. Full board inclusive.`,
      };
    } else if (type === 'activity') {
      const act = sourceItem as ActivityOption;
      newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'activity',
        itemId: act.id,
        title: act.name,
        subtitle: `${act.category} • ${act.durationHours} Hours`,
        image: act.image,
        costUSD: act.costUSD,
        durationHours: act.durationHours,
        dayNumber: targetDayNumber,
        order: currentItin.items.length + 1,
        notes: act.description,
      };
    } else {
      const trans = sourceItem as TransportOption;
      newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'transport',
        itemId: trans.id,
        title: trans.name,
        subtitle: `${trans.mode} • Base ${formatPrice(trans.baseFeeUSD)}`,
        image: trans.image,
        costUSD: trans.baseFeeUSD + 150, // default distance calculation
        distanceKm: 280,
        estimatedTimeMin: Math.round((280 / trans.speedKmh) * 60),
        dayNumber: targetDayNumber,
        order: currentItin.items.length + 1,
        notes: `Private transfer via ${trans.name}.`,
      };
    }

    const updatedItems = [...currentItin.items, newItem];
    const updatedItin = {
      ...currentItin,
      items: updatedItems,
      totalCostUSD: calculationSummary.totalCost,
      totalDistanceKm: calculationSummary.totalDistanceKm,
      totalTravelMinutes: calculationSummary.totalTravelMin,
      updatedAt: new Date().toISOString(),
    };

    setCurrentItin(updatedItin);
    saveBuilderItinerary(updatedItin);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = currentItin.items.filter((i) => i.id !== itemId);
    const updatedItin = { ...currentItin, items: updatedItems };
    setCurrentItin(updatedItin);
    saveBuilderItinerary(updatedItin);
  };

  const moveItemInDay = (itemId: string, direction: 'up' | 'down') => {
    const itemIndex = currentItin.items.findIndex((i) => i.id === itemId);
    if (itemIndex < 0) return;

    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentItin.items.length) return;

    const itemsCopy = [...currentItin.items];
    const temp = itemsCopy[itemIndex];
    itemsCopy[itemIndex] = itemsCopy[targetIndex];
    itemsCopy[targetIndex] = temp;

    const updatedItin = { ...currentItin, items: itemsCopy };
    setCurrentItin(updatedItin);
    saveBuilderItinerary(updatedItin);
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    const updatedItems = currentItin.items.map((i) => (i.id === itemId ? { ...i, notes } : i));
    const updatedItin = { ...currentItin, items: updatedItems };
    setCurrentItin(updatedItin);
  };

  const addDayToBoard = () => {
    const newDays = currentItin.totalDays + 1;
    const updated = { ...currentItin, totalDays: newDays };
    setCurrentItin(updated);
    saveBuilderItinerary(updated);
  };

  const removeDayFromBoard = (dayNum: number) => {
    if (currentItin.totalDays <= 1) return;
    const updatedItems = currentItin.items.filter((i) => i.dayNumber !== dayNum);
    // Shift days > dayNum down by 1
    const shiftedItems = updatedItems.map((i) => (i.dayNumber > dayNum ? { ...i, dayNumber: i.dayNumber - 1 } : i));
    const updated = { ...currentItin, totalDays: currentItin.totalDays - 1, items: shiftedItems };
    setCurrentItin(updated);
    saveBuilderItinerary(updated);
  };

  const handleSaveClick = () => {
    saveBuilderItinerary(currentItin);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleDuplicateClick = () => {
    const copy = duplicateBuilderItinerary(currentItin.id);
    setCurrentItin(copy);
  };

  // Drag & Drop event handlers
  const handleDragStart = (
    e: React.DragEvent,
    type: 'destination' | 'hotel' | 'activity' | 'transport',
    item: Destination | LuxuryLodge | ActivityOption | TransportOption
  ) => {
    setDraggedItemData({ type, item });
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id: item.id }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverDay !== dayNum) {
      setDragOverDay(dayNum);
    }
  };

  const handleDrop = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault();
    setDragOverDay(null);
    if (draggedItemData) {
      addItemToDay(draggedItemData.type, draggedItemData.item, dayNum);
      setDraggedItemData(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#2E2015] text-[#F4E8D5] pb-24 texture-earth">
      {/* Top Builder Control Header Bar */}
      <div className="sticky top-20 z-30 bg-[#2E2015]/95 border-b border-[#C89A4B]/30 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Title & Metadata Inputs */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-[#C89A4B] text-[#2E2015] text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                Visual Builder
              </span>
              <span className="text-xs font-mono text-[#D6B06A]">
                Ref: {currentItin.shareCode || 'IDENT-CUSTOM'}
              </span>
            </div>
            
            <input
              type="text"
              value={currentItin.title}
              onChange={(e) => setCurrentItin({ ...currentItin, title: e.target.value })}
              className="mt-1 text-xl sm:text-2xl font-serif font-bold text-[#F4E8D5] bg-transparent border-b border-transparent hover:border-[#C89A4B]/50 focus:border-[#D6B06A] focus:outline-none w-full transition-all"
              placeholder="Name your custom expedition..."
            />
          </div>

          {/* Quick Stats & Action Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Traveler & Days Selector */}
            <div className="flex items-center gap-2 bg-[#4B321F] border border-[#C89A4B]/40 px-3 py-1.5 rounded-xl text-xs">
              <Users className="w-3.5 h-3.5 text-[#D6B06A]" />
              <span className="text-[#D3C5AE]">Guests:</span>
              <select
                value={currentItin.travelersCount}
                onChange={(e) => setCurrentItin({ ...currentItin, travelersCount: Number(e.target.value) })}
                className="bg-transparent text-[#D6B06A] font-mono font-bold focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                  <option key={n} value={n} className="bg-[#2E2015] text-[#F4E8D5]">
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            {/* Saved Itineraries Dropdown */}
            <div className="flex items-center gap-2 bg-[#4B321F] border border-[#C89A4B]/40 px-3 py-1.5 rounded-xl text-xs">
              <FolderOpen className="w-3.5 h-3.5 text-[#D6B06A]" />
              <select
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    createBlankBuilderItinerary();
                  } else {
                    loadBuilderItinerary(e.target.value);
                  }
                }}
                value={currentItin.id}
                className="bg-transparent text-[#F4E8D5] font-mono focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="new" className="bg-[#2E2015] text-[#D6B06A] font-bold">
                  + Create New Itinerary
                </option>
                {customBuilderItineraries.map((i) => (
                  <option key={i.id} value={i.id} className="bg-[#2E2015] text-[#F4E8D5]">
                    {i.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveClick}
                className="px-3.5 py-2 bg-[#4B321F] hover:bg-[#C89A4B] text-[#F4E8D5] hover:text-[#2E2015] border border-[#C89A4B]/50 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md"
                title="Save Itinerary"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={handleDuplicateClick}
                className="px-3.5 py-2 bg-[#4B321F] hover:bg-[#C89A4B] text-[#F4E8D5] hover:text-[#2E2015] border border-[#C89A4B]/50 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md"
                title="Duplicate Itinerary"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duplicate</span>
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="px-3.5 py-2 bg-[#4B321F] hover:bg-[#C89A4B] text-[#F4E8D5] hover:text-[#2E2015] border border-[#C89A4B]/50 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md"
                title="Share Itinerary"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] disabled:opacity-70 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Download Branded PDF Dossier"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'PDF Dossier'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Save Confirmation Banner */}
        {saveSuccessNotice && (
          <div className="max-w-7xl mx-auto mt-2 bg-emerald-900/90 text-emerald-100 border border-emerald-500/50 px-4 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Itinerary saved successfully to your profile & browser storage!
            </span>
            <span className="text-[10px] opacity-75">Auto-synced</span>
          </div>
        )}
      </div>

      {/* KPI Real-Time Summary Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#4B321F] border border-[#C89A4B]/40 p-4 sm:p-6 rounded-2xl shadow-2xl texture-wood">
          
          {/* Duration */}
          <div className="flex items-center gap-3 border-r border-[#C89A4B]/20 pr-4">
            <div className="p-3 rounded-xl bg-[#2E2015] text-[#D6B06A] border border-[#C89A4B]/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#D3C5AE] uppercase block">Trip Duration</span>
              <span className="text-xl font-serif font-bold text-[#F4E8D5]">
                {calculationSummary.totalDays} Days / {calculationSummary.totalDays - 1} Nights
              </span>
            </div>
          </div>

          {/* Total Cost */}
          <div className="flex items-center gap-3 border-r border-[#C89A4B]/20 pr-4">
            <div className="p-3 rounded-xl bg-[#2E2015] text-emerald-400 border border-[#C89A4B]/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#D3C5AE] uppercase block">
                Total Est. Cost ({calculationSummary.travelersCount} Guests)
              </span>
              <span className="text-xl font-serif font-bold text-[#D6B06A]">
                {formatPrice(calculationSummary.totalCost)}
              </span>
              <span className="text-[9px] font-mono text-[#D3C5AE]/80 block">
                ~{formatPrice(Math.round(calculationSummary.totalCost / calculationSummary.travelersCount))}/person
              </span>
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-3 border-r border-[#C89A4B]/20 pr-4">
            <div className="p-3 rounded-xl bg-[#2E2015] text-amber-400 border border-[#C89A4B]/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#D3C5AE] uppercase block">Est. Route Distance</span>
              <span className="text-xl font-serif font-bold text-[#F4E8D5]">
                {calculationSummary.totalDistanceKm} km
              </span>
              <span className="text-[9px] font-mono text-[#D3C5AE]/80 block">Inter-reserve transit</span>
            </div>
          </div>

          {/* Travel Time */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#2E2015] text-sky-400 border border-[#C89A4B]/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#D3C5AE] uppercase block">Est. Transit Time</span>
              <span className="text-xl font-serif font-bold text-[#F4E8D5]">
                {Math.floor(calculationSummary.totalTravelMin / 60)}h {calculationSummary.totalTravelMin % 60}m
              </span>
              <span className="text-[9px] font-mono text-[#D3C5AE]/80 block">Flight & Ground mix</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Drag-and-Drop Workspace Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Catalog Panel (4 Columns on LG) */}
          <div className="lg:col-span-4 bg-[#4B321F] border border-[#C89A4B]/40 rounded-2xl p-5 shadow-2xl sticky top-44 space-y-5">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#F4E8D5] flex items-center justify-between">
                <span>Expedition Palette</span>
                <span className="text-[10px] font-mono text-[#D6B06A] uppercase bg-[#2E2015] px-2 py-0.5 rounded border border-[#C89A4B]/30">
                  Drag items onto days
                </span>
              </h2>
              <p className="text-xs text-[#D3C5AE] mt-1 font-light">
                Select or drag destinations, lodges, activities, and transfers into your day columns.
              </p>
            </div>

            {/* Catalog Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-[#2E2015] p-1 rounded-xl border border-[#C89A4B]/30 text-[10px] font-mono font-bold uppercase">
              <button
                onClick={() => setActiveCatalogTab('destinations')}
                className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  activeCatalogTab === 'destinations'
                    ? 'bg-[#C89A4B] text-[#2E2015]'
                    : 'text-[#D3C5AE] hover:text-[#D6B06A]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Parks</span>
              </button>

              <button
                onClick={() => setActiveCatalogTab('hotels')}
                className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  activeCatalogTab === 'hotels'
                    ? 'bg-[#C89A4B] text-[#2E2015]'
                    : 'text-[#D3C5AE] hover:text-[#D6B06A]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lodges</span>
              </button>

              <button
                onClick={() => setActiveCatalogTab('activities')}
                className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  activeCatalogTab === 'activities'
                    ? 'bg-[#C89A4B] text-[#2E2015]'
                    : 'text-[#D3C5AE] hover:text-[#D6B06A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Activities</span>
              </button>

              <button
                onClick={() => setActiveCatalogTab('transport')}
                className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  activeCatalogTab === 'transport'
                    ? 'bg-[#C89A4B] text-[#2E2015]'
                    : 'text-[#D3C5AE] hover:text-[#D6B06A]'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Transit</span>
              </button>
            </div>

            {/* Catalog Search & Country Filter */}
            <div className="space-y-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter palette items..."
                className="w-full bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl px-3 py-2 text-xs text-[#F4E8D5] placeholder-[#D3C5AE]/50 focus:outline-none focus:border-[#D6B06A]"
              />

              {(activeCatalogTab === 'destinations' || activeCatalogTab === 'hotels') && (
                <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-mono">
                  {['All', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCountryFilter(c)}
                      className={`px-2 py-1 rounded-md border whitespace-nowrap transition-all ${
                        selectedCountryFilter === c
                          ? 'bg-[#D6B06A] text-[#2E2015] border-[#D6B06A] font-bold'
                          : 'bg-[#2E2015] text-[#D3C5AE] border-[#C89A4B]/30 hover:border-[#D6B06A]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Items Cards Container */}
            <div className="max-h-[520px] overflow-y-auto space-y-3 pr-1">
              
              {/* TAB 1: DESTINATIONS */}
              {activeCatalogTab === 'destinations' &&
                filteredDestinations.map((dest) => (
                  <div
                    key={dest.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'destination', dest)}
                    className="p-3 bg-[#2E2015] border border-[#C89A4B]/30 hover:border-[#D6B06A] rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing group transition-all"
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#C89A4B]/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#D6B06A]">
                          {dest.country}
                        </span>
                        <span className="text-[9px] font-mono text-[#D3C5AE]">
                          Park Fee: ${dest.parkInfo?.entryFeeUSD || 100}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#F4E8D5] truncate group-hover:text-[#D6B06A] transition-colors">
                        {dest.name}
                      </h4>
                      <p className="text-[10px] text-[#D3C5AE] line-clamp-1 font-light">
                        {dest.tagline}
                      </p>
                    </div>

                    <button
                      onClick={() => addItemToDay('destination', dest, 1)}
                      className="p-2 bg-[#4B321F] hover:bg-[#C89A4B] text-[#F4E8D5] hover:text-[#2E2015] border border-[#C89A4B]/40 rounded-lg text-xs font-bold transition-all shrink-0"
                      title="Add to Day 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

              {/* TAB 2: HOTELS */}
              {activeCatalogTab === 'hotels' &&
                filteredHotels.map((lodge) => (
                  <div
                    key={lodge.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'hotel', lodge)}
                    className="p-3 bg-[#2E2015] border border-[#C89A4B]/30 hover:border-[#D6B06A] rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing group transition-all"
                  >
                    <img
                      src={lodge.image}
                      alt={lodge.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#C89A4B]/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#D6B06A]">
                          {lodge.tier}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">
                          {formatPrice(lodge.pricePerNight)}/night
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#F4E8D5] truncate group-hover:text-[#D6B06A] transition-colors">
                        {lodge.name}
                      </h4>
                      <p className="text-[10px] text-[#D3C5AE] line-clamp-1 font-light">
                        {lodge.location}
                      </p>
                    </div>

                    <button
                      onClick={() => addItemToDay('hotel', lodge, 1)}
                      className="p-2 bg-[#4B321F] hover:bg-[#C89A4B] text-[#F4E8D5] hover:text-[#2E2015] border border-[#C89A4B]/40 rounded-lg text-xs font-bold transition-all shrink-0"
                      title="Add to Day 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

              {/* TAB 3: ACTIVITIES */}
              {activeCatalogTab === 'activities' &&
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'activity', act)}
                    className="p-3 bg-[#2E2015] border border-[#C89A4B]/30 hover:border-[#D6B06A] rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing group transition-all"
                  >
                    <img
                      src={act.image}
                      alt={act.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#C89A4B]/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#D6B06A]">
                          {act.category}
                        </span>
                        <span className="text-[9px] font-mono text-[#D6B06A] font-bold">
                          ${act.costUSD}/guest
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#F4E8D5] truncate group-hover:text-[#D6B06A] transition-colors">
                        {act.name}
                      </h4>
                      <p className="text-[10px] text-[#D3C5AE] line-clamp-1 font-light">
                        Duration: {act.durationHours} hrs
                      </p>
                    </div>

                    <button
                      onClick={() => addItemToDay('activity', act, 1)}
                      className="p-2 bg-[#4B321F] hover:bg-[#C89A4B] text-[#F4E8D5] hover:text-[#2E2015] border border-[#C89A4B]/40 rounded-lg text-xs font-bold transition-all shrink-0"
                      title="Add to Day 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

              {/* TAB 4: TRANSITS */}
              {activeCatalogTab === 'transport' &&
                filteredTransports.map((trans) => (
                  <div
                    key={trans.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'transport', trans)}
                    className="p-3 bg-[#2E2015] border border-[#C89A4B]/30 hover:border-[#D6B06A] rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing group transition-all"
                  >
                    <img
                      src={trans.image}
                      alt={trans.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#C89A4B]/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#D6B06A]">
                          {trans.mode}
                        </span>
                        <span className="text-[9px] font-mono text-sky-400 font-bold">
                          ${trans.baseFeeUSD} Base
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#F4E8D5] truncate group-hover:text-[#D6B06A] transition-colors">
                        {trans.name}
                      </h4>
                      <p className="text-[10px] text-[#D3C5AE] line-clamp-1 font-light">
                        Speed: {trans.speedKmh} km/h • Cap: {trans.capacity}
                      </p>
                    </div>

                    <button
                      onClick={() => addItemToDay('transport', trans, 1)}
                      className="p-2 bg-[#4B321F] hover:bg-[#C89A4B] text-[#F4E8D5] hover:text-[#2E2015] border border-[#C89A4B]/40 rounded-lg text-xs font-bold transition-all shrink-0"
                      title="Add to Day 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

            </div>
          </div>

          {/* Right Daily Timeline Board Panel (8 Columns on LG) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header & Add Day Button */}
            <div className="flex items-center justify-between bg-[#4B321F] border border-[#C89A4B]/40 p-4 rounded-2xl shadow-xl">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#F4E8D5]">
                  Daily Expedition Sequence
                </h3>
                <p className="text-xs text-[#D3C5AE] font-light">
                  Drop palette items directly into target days. Reorder or customize notes anytime.
                </p>
              </div>

              <button
                onClick={addDayToBoard}
                className="px-4 py-2.5 bg-[#C89A4B] hover:bg-[#D6B06A] text-[#2E2015] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Day {currentItin.totalDays + 1}</span>
              </button>
            </div>

            {/* Day Columns List */}
            {Array.from({ length: currentItin.totalDays }, (_, i) => i + 1).map((dayNum) => {
              const dayItems = (currentItin.items || []).filter((item) => item.dayNumber === dayNum);
              const isOver = dragOverDay === dayNum;

              return (
                <div
                  key={dayNum}
                  onDragOver={(e) => handleDragOver(e, dayNum)}
                  onDrop={(e) => handleDrop(e, dayNum)}
                  className={`bg-[#4B321F] border rounded-2xl p-5 shadow-2xl transition-all ${
                    isOver
                      ? 'border-[#D6B06A] ring-2 ring-[#D6B06A]/50 bg-[#4B321F]/90 scale-[1.01]'
                      : 'border-[#C89A4B]/40 hover:border-[#C89A4B]'
                  }`}
                >
                  {/* Day Header Bar */}
                  <div className="flex items-center justify-between border-b border-[#C89A4B]/20 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#2E2015] text-[#D6B06A] border border-[#C89A4B]/40 flex items-center justify-center font-mono font-bold text-sm">
                        {dayNum}
                      </span>
                      <div>
                        <h4 className="text-base font-serif font-bold text-[#F4E8D5]">
                          Day {dayNum} Program
                        </h4>
                        <span className="text-[10px] font-mono text-[#D3C5AE]">
                          {dayItems.length} {dayItems.length === 1 ? 'Scheduled Module' : 'Scheduled Modules'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentItin.totalDays > 1 && (
                        <button
                          onClick={() => removeDayFromBoard(dayNum)}
                          className="p-2 text-[#D3C5AE]/60 hover:text-rose-400 hover:bg-[#2E2015] rounded-lg transition-all"
                          title="Remove Day"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Day Droppable Items Container */}
                  {dayItems.length === 0 ? (
                    <div className="py-8 px-4 border-2 border-dashed border-[#C89A4B]/30 rounded-xl text-center bg-[#2E2015]/40 space-y-2">
                      <Compass className="w-8 h-8 text-[#D6B06A]/40 mx-auto" />
                      <p className="text-xs text-[#D3C5AE] font-mono">
                        Day {dayNum} is currently empty.
                      </p>
                      <p className="text-[10px] text-[#D3C5AE]/70 font-light">
                        Drag destinations, lodges, activities, or transfers from the left palette here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-4 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-[#D6B06A] transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            
                            {/* Reorder Handles */}
                            <div className="flex flex-col gap-1 text-[#D3C5AE]/50 group-hover:text-[#D6B06A] shrink-0">
                              <button
                                onClick={() => moveItemInDay(item.id, 'up')}
                                className="hover:text-white text-[10px]"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <GripVertical className="w-4 h-4" />
                              <button
                                onClick={() => moveItemInDay(item.id, 'down')}
                                className="hover:text-white text-[10px]"
                                title="Move Down"
                              >
                                ▼
                              </button>
                            </div>

                            {/* Item Thumbnail */}
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-16 h-16 rounded-lg object-cover shrink-0 border border-[#C89A4B]/20"
                                referrerPolicy="no-referrer"
                              />
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                    item.type === 'destination'
                                      ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                                      : item.type === 'hotel'
                                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                                      : item.type === 'activity'
                                      ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                                      : 'bg-sky-900/60 text-sky-300 border border-sky-500/40'
                                  }`}
                                >
                                  {item.type}
                                </span>
                                {item.subtitle && (
                                  <span className="text-[10px] font-mono text-[#D3C5AE] truncate">
                                    {item.subtitle}
                                  </span>
                                )}
                              </div>

                              <h5 className="text-sm font-bold text-[#F4E8D5] group-hover:text-[#D6B06A] transition-colors">
                                {item.title}
                              </h5>

                              {/* Editable Notes Input */}
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                placeholder="Add custom ranger note or briefing..."
                                className="w-full bg-[#4B321F]/60 border border-[#C89A4B]/20 rounded-md px-2 py-1 text-[11px] text-[#D3C5AE] placeholder-[#D3C5AE]/40 focus:outline-none focus:border-[#D6B06A]"
                              />
                            </div>
                          </div>

                          {/* Pricing & Remove */}
                          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#C89A4B]/20">
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-[#D6B06A] block">
                                {formatPrice(item.costUSD)}
                              </span>
                              <span className="text-[9px] text-[#D3C5AE]/70 font-mono block">
                                {item.type === 'activity' ? 'per guest' : 'module cost'}
                              </span>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-[#D3C5AE]/60 hover:text-rose-400 hover:bg-[#4B321F] rounded-lg transition-all"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}

            {/* Final Book Expedition CTA Banner */}
            <div className="p-6 bg-gradient-to-r from-[#4B321F] via-[#2E2015] to-[#4B321F] border border-[#C89A4B]/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
              <div>
                <h4 className="text-xl font-serif font-bold text-[#F4E8D5]">
                  Ready to Reserve This Custom Journey?
                </h4>
                <p className="text-xs text-[#D3C5AE] font-light mt-1">
                  Our chief safari wardens will verify ranger permits and private airstrip charter availability.
                </p>
              </div>

              <button
                onClick={() => openBookingModal('itinerary', currentItin.id)}
                className="btn-gold py-3 px-8 rounded-xl font-bold text-sm uppercase tracking-wider shrink-0 shadow-xl"
              >
                Request Ranger Verification
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* SHARE MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#4B321F] border border-[#C89A4B] rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl text-[#F4E8D5] relative">
            <button
              onClick={() => setShareModalOpen(false)}
              className="absolute top-4 right-4 text-[#D3C5AE] hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#2E2015] text-[#D6B06A] border border-[#C89A4B]/50 rounded-full flex items-center justify-center mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#F4E8D5]">
                Share Custom Itinerary
              </h3>
              <p className="text-xs text-[#D3C5AE]">
                Share this bespoke safari plan with travel companions or your private safari warden.
              </p>
            </div>

            {/* Share Link Box */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#D6B06A] uppercase font-bold">
                Unique Share URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://ident-africa.com/builder?share=${currentItin.shareCode || 'IDENT-9821'}`}
                  className="flex-1 bg-[#2E2015] border border-[#C89A4B]/40 rounded-xl px-3 py-2 text-xs font-mono text-[#F4E8D5] focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://ident-africa.com/builder?share=${currentItin.shareCode}`);
                    alert('Share link copied to clipboard!');
                  }}
                  className="p-2.5 bg-[#C89A4B] text-[#2E2015] font-bold rounded-xl text-xs hover:bg-[#D6B06A] transition-all"
                  title="Copy Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-[#2E2015] p-4 rounded-xl border border-[#C89A4B]/30 flex items-center justify-center gap-4">
              <QrCode className="w-16 h-16 text-[#D6B06A]" />
              <div className="text-left space-y-1">
                <span className="text-xs font-bold text-[#F4E8D5] block">Scan for Mobile View</span>
                <span className="text-[10px] font-mono text-[#D3C5AE] block">
                  Access live map routing & day-by-day weather directly on smartphones.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShareModalOpen(false)}
              className="w-full py-2.5 bg-[#2E2015] text-[#D6B06A] border border-[#C89A4B]/40 hover:bg-[#C89A4B] hover:text-[#2E2015] rounded-xl text-xs font-bold font-mono transition-all uppercase"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* PDF DOSSIER PREVIEW & PRINT DIALOG */}
      {pdfPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] text-[#2E2015] rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 print:p-0 print:m-0 print:shadow-none print:max-w-none">
            
            {/* Action Bar (Hidden in Print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2E2015]/20 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#2E2015] text-[#D6B06A] text-[10px] font-mono font-bold uppercase rounded flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#D6B06A]" />
                  Ident PDF Dossier Generator
                </span>
                <span className="text-xs font-mono text-[#2E2015]/70 hidden sm:inline">
                  Luxury Branded Expedition Briefing
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-4 py-2 bg-[#C89A4B] text-[#2E2015] hover:bg-[#D6B06A] disabled:opacity-70 font-mono font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Download PDF File'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-[#2E2015]/10 hover:bg-[#2E2015]/20 text-[#2E2015] font-mono font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print / Native PDF</span>
                </button>

                <button
                  onClick={() => setPdfPreviewOpen(false)}
                  className="p-2 text-[#2E2015]/60 hover:text-black hover:bg-black/10 rounded-lg transition-all"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable & Canvas Capture PDF Content Sheet */}
            <div id="itinerary-pdf-dossier" className="space-y-6 bg-[#FAF7F2] p-6 sm:p-8 rounded-xl border border-[#C89A4B]/20">
              
              {/* Luxury Header */}
              <div className="flex items-start justify-between border-b-2 border-[#C89A4B] pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2E2015] text-[#D6B06A] flex items-center justify-center font-serif font-black text-lg border border-[#C89A4B]">
                      I
                    </div>
                    <div>
                      <div className="text-2xl font-serif font-black tracking-widest text-[#2E2015]">
                        IDENT AFRICA
                      </div>
                      <div className="text-[10px] font-mono uppercase text-[#C89A4B] font-bold tracking-widest">
                        Luxury Expeditions & Conservation Reserves
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#2E2015]/60 font-mono pt-1">
                    Nairobi • Arusha • Kigali • Kampala • Zanzibar
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-2.5 py-0.5 bg-[#2E2015] text-[#D6B06A] font-mono font-bold text-[10px] uppercase rounded">
                    Bespoke Expedition Dossier
                  </div>
                  <div className="text-xs font-mono font-bold text-[#2E2015]">
                    Ref: {currentItin.shareCode || 'IDENT-CUSTOM'}
                  </div>
                  <div className="text-[10px] font-mono text-[#2E2015]/70">
                    Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Title & Overview Banner */}
              <div className="bg-[#F0EAE1] p-5 rounded-xl border border-[#C89A4B]/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase text-[#C89A4B] tracking-wider block">
                      Custom Crafted Itinerary
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-[#2E2015] mt-0.5">
                      {currentItin.title}
                    </h2>
                  </div>
                  <div className="px-3 py-1 bg-[#C89A4B]/20 text-[#2E2015] border border-[#C89A4B]/40 rounded-lg text-xs font-mono font-bold">
                    Official Itinerary
                  </div>
                </div>

                <p className="text-xs text-[#2E2015]/80 leading-relaxed font-light">
                  {currentItin.description}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#C89A4B]/20 text-[11px] font-mono">
                  <div className="bg-white/60 p-2.5 rounded-lg border border-[#C89A4B]/20">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 font-bold block">Expedition Duration</span>
                    <span className="font-bold text-[#2E2015]">{calculationSummary.totalDays} Days / {calculationSummary.totalDays - 1} Nights</span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-[#C89A4B]/20">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 font-bold block">Party Size</span>
                    <span className="font-bold text-[#2E2015]">{calculationSummary.travelersCount} Registered Guests</span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-[#C89A4B]/20">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 font-bold block">Route Transit</span>
                    <span className="font-bold text-[#2E2015]">{calculationSummary.totalDistanceKm} km Total Distance</span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-[#C89A4B]/20">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 font-bold block">Est. Cost ({calculationSummary.travelersCount} Guests)</span>
                    <span className="font-bold text-[#C89A4B]">{formatPrice(calculationSummary.totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Financial & Transit Allocation Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#2E2015] border-b border-[#2E2015]/20 pb-1 flex items-center justify-between">
                  <span>Investment Breakdown & Conservation Fees</span>
                  <span className="text-[10px] font-mono font-normal text-[#2E2015]/70">
                    Per Guest Avg: ~{formatPrice(Math.round(calculationSummary.totalCost / calculationSummary.travelersCount))}
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 bg-white/40 rounded-lg border border-[#2E2015]/10">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 block">Luxury Lodging</span>
                    <span className="font-bold text-[#2E2015]">{formatPrice(calculationSummary.costLodging)}</span>
                  </div>
                  <div className="p-2.5 bg-white/40 rounded-lg border border-[#2E2015]/10">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 block">Private Activities</span>
                    <span className="font-bold text-[#2E2015]">{formatPrice(calculationSummary.costActivities)}</span>
                  </div>
                  <div className="p-2.5 bg-white/40 rounded-lg border border-[#2E2015]/10">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 block">Flight & Ground Transit</span>
                    <span className="font-bold text-[#2E2015]">{formatPrice(calculationSummary.costTransport)}</span>
                  </div>
                  <div className="p-2.5 bg-white/40 rounded-lg border border-[#2E2015]/10">
                    <span className="text-[9px] uppercase text-[#2E2015]/60 block">Park Conservation Fees</span>
                    <span className="font-bold text-[#C89A4B]">{formatPrice(calculationSummary.costParkFees)}</span>
                  </div>
                </div>
              </div>

              {/* Day-by-day Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#2E2015] uppercase tracking-wider border-b border-[#2E2015]/20 pb-1">
                  Daily Expedition Program
                </h3>

                {Array.from({ length: calculationSummary.totalDays }, (_, i) => i + 1).map((dayNum) => {
                  const dayItems = (currentItin.items || []).filter((item) => item.dayNumber === dayNum);

                  return (
                    <div key={dayNum} className="border border-[#2E2015]/20 rounded-xl p-4 space-y-3 bg-white/40">
                      <div className="flex items-center justify-between border-b border-[#2E2015]/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[#2E2015] text-[#D6B06A] font-mono font-bold text-xs flex items-center justify-center">
                            D{dayNum}
                          </span>
                          <span className="font-serif font-bold text-sm text-[#2E2015]">
                            Day {dayNum} Schedule
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#2E2015]/70 font-bold">
                          {dayItems.length} Scheduled Modules
                        </span>
                      </div>

                      {dayItems.length === 0 ? (
                        <p className="text-xs text-[#2E2015]/50 italic">Leisure & Game Viewing at Lodge Discretion</p>
                      ) : (
                        <div className="space-y-2">
                          {dayItems.map((item) => (
                            <div key={item.id} className="p-2.5 bg-white rounded-lg border border-[#2E2015]/10 flex items-start justify-between text-xs gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                    item.type === 'destination'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : item.type === 'hotel'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : item.type === 'activity'
                                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                      : 'bg-sky-100 text-sky-900 border border-sky-300'
                                  }`}>
                                    {item.type}
                                  </span>
                                  {item.subtitle && (
                                    <span className="text-[10px] font-mono text-[#2E2015]/60">
                                      {item.subtitle}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="font-bold text-[#2E2015] text-sm">{item.title}</div>
                                
                                {item.notes && (
                                  <p className="text-[11px] text-[#2E2015]/75 italic font-light">
                                    Briefing: {item.notes}
                                  </p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-[#2E2015] text-xs block">
                                  {formatPrice(item.costUSD)}
                                </span>
                                <span className="text-[9px] font-mono text-[#2E2015]/50 block">
                                  {item.type === 'activity' ? 'per guest' : 'module'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ranger Certification Stamp & Conservation Trust Footer */}
              <div className="border-t-2 border-[#C89A4B] pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#F0EAE1] rounded-xl border border-[#C89A4B]/30 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2E2015] text-[#D6B06A] border-2 border-[#C89A4B] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#D6B06A]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-serif font-bold text-[#2E2015] uppercase tracking-wider">
                        Official Ranger & Permit Certification
                      </h5>
                      <p className="text-[10px] text-[#2E2015]/80 font-mono">
                        Verification Status: <span className="text-emerald-700 font-bold">APPROVED & SANCTIONED</span>
                      </p>
                      <p className="text-[9px] text-[#2E2015]/60 font-mono">
                        All private air charters and park entries are regulated by East African Wildlife Conservation Authorities.
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right font-mono text-[9px] text-[#2E2015]/70 shrink-0">
                    <div className="border border-[#C89A4B] px-3 py-1 bg-white/80 rounded uppercase font-bold text-[#2E2015]">
                      Warden Stamp #AF-9982
                    </div>
                    <div className="text-[8px] pt-1">Ident Africa Trust</div>
                  </div>
                </div>

                <div className="text-center space-y-1 text-[9px] font-mono text-[#2E2015]/60">
                  <p className="font-bold text-[#2E2015]">Ident Africa Luxury Conservation Network • Nairobi / Arusha / Kigali</p>
                  <p>100% of conservation entry fees directly support anti-poaching rangers, wildlife corridors, and local communities.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
