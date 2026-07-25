import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Country, WildlifeFocus, LuxuryTier, AIPlanResponse } from '../../types';
import {
  Sparkles,
  Calendar,
  Compass,
  DollarSign,
  Users,
  MapPin,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Download,
  Award,
  Hotel,
  Plane,
  Camera,
  Layers,
  Clock,
  Briefcase,
  HelpCircle,
  FileText,
  Printer,
  ChevronRight,
  Tag
} from 'lucide-react';

export const AISafariPlanner: React.FC = () => {
  const { formatPrice, openBookingModal, navigateTo, currency } = useApp();

  // Input states required by user prompt
  const [budgetPerPersonUSD, setBudgetPerPersonUSD] = useState<number>(5500);
  const [startDate, setStartDate] = useState<string>('2026-09-10');
  const [endDate, setEndDate] = useState<string>('2026-09-17');
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Big Five Game Viewing',
    'Great Wildebeest Migration',
    'Hot Air Balloon Safari',
    'Luxury Tented Camps'
  ]);
  const [specialNotes, setSpecialNotes] = useState<string>('Honeymoon setup & private photography vehicle requested');
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(['Kenya', 'Tanzania']);
  const [luxuryLevel, setLuxuryLevel] = useState<LuxuryTier>('Ultra-Luxe Canvas');

  // Result state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIPlanResponse | null>(null);
  const [activeTab, setActiveTab] = useState<
    'itinerary' | 'destinations' | 'hotels' | 'activities' | 'transport' | 'cost'
  >('itinerary');

  // Calculated duration
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  const calculatedDays = Math.max(1, Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24)));
  const totalTravelers = adults + childrenCount;
  const totalBudgetUSD = budgetPerPersonUSD * totalTravelers;

  // Month string derivation
  const travelMonth = startObj.toLocaleString('en-US', { month: 'long' }) || 'September';

  // Interest options
  const AVAILABLE_INTERESTS = [
    'Big Five Game Viewing',
    'Great Wildebeest Migration',
    'Hot Air Balloon Safari',
    'Mountain Gorilla Trekking',
    'Maasai & Samburu Cultural Visits',
    'Zanzibar White Sand Beaches',
    'Private Wildlife Photography',
    'Luxury Bush Spa & Wellness',
    'Helicopter Scenic Flight',
    'Walking Safaris & Bush Dinners',
    'Family Friendly Activities',
    'Romantic Honeymoon Setup'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleCountry = (country: Country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  // Loading animation simulation steps
  useEffect(() => {
    if (!loading) return;
    const steps = [
      'Querying East African Wildlife Ranger Logs...',
      'Matching luxury eco-lodges & private conservancies...',
      'Mapping bush flight hopper routes & airstrip transfers...',
      'Curating morning, afternoon, and sundowner activities...',
      'Assembling itemized cost breakdown & park permit escrow...'
    ];
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetPerPersonUSD,
          startDate,
          endDate,
          durationDays: calculatedDays,
          travelersCount: totalTravelers,
          travelMonth,
          countries: selectedCountries.length > 0 ? selectedCountries : ['Kenya', 'Tanzania'],
          wildlifePriorities: selectedInterests.slice(0, 3) as WildlifeFocus[],
          luxuryLevel,
          interests: selectedInterests,
          specialInterests: specialNotes
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate itinerary with Gemini AI Concierge');
      }

      const planData: AIPlanResponse = await response.json();
      setAiResult(planData);
      setActiveTab('itinerary');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while generating your AI Safari Concierge plan.');
    } finally {
      setLoading(false);
    }
  };

  // Stock images for AI generated cards
  const DESTINATION_IMAGES = [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
  ];

  const HOTEL_IMAGES = [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#0F1210] text-[#F5EBE0]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12241A] text-[#D4AF37] text-xs font-mono font-bold uppercase border border-[#D4AF37]/40 shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            SafariFlow AI Concierge & Trip Builder
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[#F5EBE0]">
            Curate Your Bespoke Expedition
          </h1>
          <p className="text-sm sm:text-base font-mono text-[#F5EBE0]/70 max-w-2xl mx-auto">
            Specify your budget, travel dates, guests, and interests. Our Gemini AI Concierge generates destinations, luxury lodges, activities, bush flight transport, and itemized cost breakdowns.
          </p>
        </div>

        {/* Input Form & Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Panel (5 cols) */}
          <div className="lg:col-span-5 bg-[#12241A] border border-[#D4AF37]/30 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <h2 className="text-xl font-serif font-bold text-[#F5EBE0] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#D4AF37]" />
                Trip Requirements
              </h2>
              <span className="text-xs font-mono text-[#D4AF37] font-bold">
                {calculatedDays} Days / {totalTravelers} Guest{totalTravelers > 1 ? 's' : ''}
              </span>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-5 text-xs font-mono">
              
              {/* Budget Range & Total */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/20">
                <div className="flex items-center justify-between">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Target Budget / Person
                  </label>
                  <span className="text-sm font-bold text-[#F5EBE0]">{formatPrice(budgetPerPersonUSD)}</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={20000}
                  step={500}
                  value={budgetPerPersonUSD}
                  onChange={(e) => setBudgetPerPersonUSD(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
                <div className="flex justify-between text-[11px] text-[#F5EBE0]/60 pt-1 border-t border-[#D4AF37]/10">
                  <span>Total Group Budget:</span>
                  <span className="font-bold text-[#D4AF37]">{formatPrice(totalBudgetUSD)}</span>
                </div>
              </div>

              {/* Travel Dates Picker */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/20">
                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-2 rounded-xl border border-[#D4AF37]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-2 rounded-xl border border-[#D4AF37]/30"
                  />
                </div>
              </div>

              {/* Travelers Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Adults
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-[#181E1A] text-[#F5EBE0] p-2.5 rounded-xl border border-[#D4AF37]/30"
                  >
                    {[1, 2, 3, 4, 6, 8, 10, 12].map(n => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Children
                  </label>
                  <select
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full bg-[#181E1A] text-[#F5EBE0] p-2.5 rounded-xl border border-[#D4AF37]/30"
                  >
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Children</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests Multi-Select Pills */}
              <div className="space-y-2">
                <label className="text-[#D4AF37] font-bold uppercase block">Traveler Interests & Focus</label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/20">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`py-1.5 px-3 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-1 ${
                          active
                            ? 'bg-[#1E3A2B] text-[#D4AF37] border-[#D4AF37] font-bold shadow-md'
                            : 'bg-[#12241A] text-[#F5EBE0]/70 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {active && <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Countries & Luxury Tier */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase block">Target Countries</label>
                  <div className="space-y-1">
                    {(['Kenya', 'Tanzania', 'Uganda', 'Rwanda'] as Country[]).map((c) => {
                      const active = selectedCountries.includes(c);
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => toggleCountry(c)}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-left text-[11px] transition-all flex justify-between items-center ${
                            active
                              ? 'bg-[#1E3A2B] text-[#D4AF37] border-[#D4AF37]'
                              : 'bg-[#181E1A] text-[#F5EBE0]/60 border-[#D4AF37]/20'
                          }`}
                        >
                          <span>{c}</span>
                          {active && <span className="text-[9px] font-bold text-[#D4AF37]">Selected</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase block">Lodge Tier</label>
                  <select
                    value={luxuryLevel}
                    onChange={(e) => setLuxuryLevel(e.target.value as LuxuryTier)}
                    className="w-full bg-[#181E1A] text-[#F5EBE0] p-2.5 rounded-xl border border-[#D4AF37]/30 text-[11px]"
                  >
                    <option value="Ultra-Luxe Canvas">Ultra-Luxe Canvas Tented Camp</option>
                    <option value="Eco Luxury Lodge">Eco Luxury Lodge & Villas</option>
                    <option value="Classic Safari Camp">Classic Safari Camp</option>
                    <option value="Bespoke Private Villa">Bespoke Private Estate</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase block">Special Notes & Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. Honeymoon setup, dietary restrictions, private vehicle..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-[#181E1A] text-[#F5EBE0] p-2.5 rounded-xl border border-[#D4AF37]/30 text-xs"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#2E2015]" />
                    <span>Analyzing Wildlife Routes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#2E2015]" />
                    <span>Generate AI Concierge Plan</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right AI Plan Display (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500 text-red-300 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Empty State */}
            {!aiResult && !loading && (
              <div className="h-full min-h-[520px] border-2 border-dashed border-[#D4AF37]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-[#12241A]/50">
                <div className="w-16 h-16 rounded-full bg-[#1E3A2B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#F5EBE0]">
                  Your AI Safari Concierge Awaits
                </h3>
                <p className="text-xs font-mono text-[#F5EBE0]/70 max-w-md">
                  Adjust your budget, dates, traveler count, and interests on the left, then click <strong className="text-[#D4AF37]">"Generate AI Concierge Plan"</strong> to instantly generate destinations, lodges, activities, transport, and itemized costs.
                </p>
              </div>
            )}

            {/* Loading State with simulated naturalistic steps */}
            {loading && (
              <div className="h-full min-h-[520px] bg-[#12241A] border border-[#D4AF37]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 font-mono">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin flex items-center justify-center" />
                  <Sparkles className="w-8 h-8 text-[#D4AF37] absolute inset-0 m-auto" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-[#D4AF37] uppercase font-bold tracking-widest">
                    Gemini AI Naturalist Active
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#F5EBE0]">
                    Crafting Bespoke {calculatedDays}-Day Safari
                  </h3>
                  <p className="text-xs text-[#4ADE80] font-bold animate-pulse">
                    {[
                      'Querying East African Wildlife Ranger Logs...',
                      'Matching luxury eco-lodges & private conservancies...',
                      'Mapping bush flight hopper routes & airstrip transfers...',
                      'Curating morning, afternoon, and sundowner activities...',
                      'Assembling itemized cost breakdown & park permit escrow...'
                    ][loadingStep]}
                  </p>
                </div>
              </div>
            )}

            {/* AI Generated Result Display */}
            {aiResult && !loading && (
              <div className="bg-[#12241A] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in font-mono">
                
                {/* Result Header */}
                <div className="space-y-3 pb-6 border-b border-[#D4AF37]/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-bold border border-[#D4AF37]/30">
                        {aiResult.countriesVisited?.join(' & ')}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#2A2418] text-[#F5EBE0] text-xs font-bold border border-[#D4AF37]/30">
                        {calculatedDays} Days / {totalTravelers} Guests
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#F5EBE0]/60 uppercase block">Total Package Value</span>
                      <span className="text-xl font-serif font-bold text-[#D4AF37]">
                        {formatPrice(aiResult.costBreakdown?.totalCostUSD || (aiResult.estimatedCostPerPerson * totalTravelers))}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EBE0]">
                    {aiResult.tripTitle}
                  </h2>

                  <p className="text-xs text-[#F5EBE0]/80 leading-relaxed">
                    {aiResult.overview}
                  </p>
                </div>

                {/* Navigation Tabs for Generated Sections */}
                <div className="flex gap-2 border-b border-[#D4AF37]/20 pb-3 overflow-x-auto text-xs font-mono">
                  {[
                    { id: 'itinerary', label: '📅 Itinerary', count: aiResult.itineraryDays?.length },
                    { id: 'destinations', label: '🌍 Destinations', count: aiResult.destinations?.length },
                    { id: 'hotels', label: '🏨 Lodges & Stay', count: aiResult.hotels?.length },
                    { id: 'activities', label: '🦁 Activities', count: aiResult.activities?.length },
                    { id: 'transport', label: '🛩️ Transport', count: aiResult.transport?.length },
                    { id: 'cost', label: '💰 Cost Breakdown', count: undefined }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? 'bg-[#C89A4B] text-[#2E2015] font-bold shadow-lg'
                          : 'bg-[#181E1A] text-[#F5EBE0]/70 hover:text-[#D4AF37] border border-[#D4AF37]/20'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px]">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* TAB 1: FULL DAY-BY-DAY ITINERARY */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#D4AF37] uppercase">Day-by-Day Experience Schedule</span>
                      <span className="text-[#F5EBE0]/60">{startDate} → {endDate}</span>
                    </div>

                    <div className="space-y-4">
                      {aiResult.itineraryDays?.map((day) => (
                        <div
                          key={day.day}
                          className="p-5 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-2">
                            <span className="font-bold text-[#D4AF37] text-xs">
                              DAY {day.day} • {day.destinationName} ({day.country})
                            </span>
                            <span className="text-[11px] text-[#4ADE80] font-bold flex items-center gap-1">
                              <Hotel className="w-3.5 h-3.5" /> Stay: {day.suggestedLodge}
                            </span>
                          </div>

                          <p className="text-xs text-[#F5EBE0]/90 leading-relaxed">
                            {day.activitySummary}
                          </p>

                          {/* Morning / Afternoon / Evening Breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                            {day.morningActivity && (
                              <div className="p-2.5 rounded-xl bg-[#12241A] border border-[#D4AF37]/20 space-y-0.5">
                                <span className="text-[#D4AF37] font-bold block">🌅 Morning:</span>
                                <span className="text-[#F5EBE0]/80">{day.morningActivity}</span>
                              </div>
                            )}
                            {day.afternoonActivity && (
                              <div className="p-2.5 rounded-xl bg-[#12241A] border border-[#D4AF37]/20 space-y-0.5">
                                <span className="text-[#D4AF37] font-bold block">☀️ Afternoon:</span>
                                <span className="text-[#F5EBE0]/80">{day.afternoonActivity}</span>
                              </div>
                            )}
                            {day.eveningActivity && (
                              <div className="p-2.5 rounded-xl bg-[#12241A] border border-[#D4AF37]/20 space-y-0.5">
                                <span className="text-[#D4AF37] font-bold block">🌙 Evening:</span>
                                <span className="text-[#F5EBE0]/80">{day.eveningActivity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: DESTINATIONS */}
                {activeTab === 'destinations' && (
                  <div className="space-y-4">
                    <span className="font-bold text-[#D4AF37] uppercase text-xs block">Featured Parks & Ecosystems</span>
                    <div className="grid grid-cols-1 gap-4">
                      {aiResult.destinations?.map((dest, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 flex flex-col sm:flex-row gap-4 items-start">
                          <img
                            src={dest.image || DESTINATION_IMAGES[idx % DESTINATION_IMAGES.length]}
                            alt={dest.name}
                            className="w-full sm:w-32 h-28 object-cover rounded-xl border border-[#D4AF37]/30 shrink-0"
                          />
                          <div className="space-y-2 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-base font-serif font-bold text-[#F5EBE0]">{dest.name}</h4>
                                <span className="text-[10px] text-[#D4AF37] font-bold uppercase">{dest.country}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-[#1E3A2B] text-[#4ADE80] text-[10px]">
                                Best: {dest.bestTime || travelMonth}
                              </span>
                            </div>
                            <p className="text-xs text-[#F5EBE0]/80 leading-relaxed">{dest.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {dest.highlights?.map((hl, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-[#12241A] text-[#D4AF37] text-[10px] border border-[#D4AF37]/20">
                                  ✓ {hl}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: HOTELS & LODGES */}
                {activeTab === 'hotels' && (
                  <div className="space-y-4">
                    <span className="font-bold text-[#D4AF37] uppercase text-xs block">Recommended Luxury Lodges & Tented Camps</span>
                    <div className="grid grid-cols-1 gap-4">
                      {aiResult.hotels?.map((hotel, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 flex flex-col sm:flex-row gap-4 items-start">
                          <img
                            src={hotel.image || HOTEL_IMAGES[idx % HOTEL_IMAGES.length]}
                            alt={hotel.name}
                            className="w-full sm:w-32 h-28 object-cover rounded-xl border border-[#D4AF37]/30 shrink-0"
                          />
                          <div className="space-y-2 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-base font-serif font-bold text-[#F5EBE0]">{hotel.name}</h4>
                                <span className="text-[10px] text-[#D4AF37] font-bold">{hotel.location} • {hotel.tier}</span>
                              </div>
                              <span className="text-sm font-serif font-bold text-[#D4AF37]">
                                {formatPrice(hotel.nightlyRateUSD)} / night
                              </span>
                            </div>
                            <p className="text-xs text-[#F5EBE0]/80">Room Type: <strong className="text-[#F5EBE0]">{hotel.roomType}</strong></p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {hotel.amenities?.map((amen, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-[#1E3A2B] text-[#F5EBE0] text-[10px] border border-[#D4AF37]/20">
                                  • {amen}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: ACTIVITIES */}
                {activeTab === 'activities' && (
                  <div className="space-y-4">
                    <span className="font-bold text-[#D4AF37] uppercase text-xs block">Included Wildlife & Cultural Activities</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aiResult.activities?.map((act, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="px-2 py-0.5 rounded bg-[#1E3A2B] text-[#4ADE80] text-[10px] font-bold">
                              {act.category}
                            </span>
                            <span className="text-xs font-bold text-[#D4AF37]">{formatPrice(act.estCostUSD)}</span>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-[#F5EBE0]">{act.title}</h4>
                          <p className="text-xs text-[#F5EBE0]/70">{act.description}</p>
                          <span className="block text-[10px] text-[#D4AF37]/80">Duration: {act.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: TRANSPORT */}
                {activeTab === 'transport' && (
                  <div className="space-y-4">
                    <span className="font-bold text-[#D4AF37] uppercase text-xs block">Bush Flights & Ground Transport Logistics</span>
                    <div className="space-y-3">
                      {aiResult.transport?.map((trans, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-[#D4AF37]" />
                              <span className="font-bold text-xs text-[#F5EBE0]">{trans.type}</span>
                            </div>
                            <p className="text-xs text-[#D4AF37]">{trans.routeSegment}</p>
                            <p className="text-[11px] text-[#F5EBE0]/70">{trans.details}</p>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-[#12241A] border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] shrink-0">
                            {trans.estimatedHours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: COST BREAKDOWN */}
                {activeTab === 'cost' && (
                  <div className="space-y-4">
                    <span className="font-bold text-[#D4AF37] uppercase text-xs block">Transparent Itemized Financial Breakdown</span>
                    
                    {aiResult.costBreakdown && (
                      <div className="p-5 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-3 text-xs">
                        <div className="flex justify-between pb-2 border-b border-[#D4AF37]/20">
                          <span className="text-[#F5EBE0]/70">Luxury Lodging & All-Inclusive Meals:</span>
                          <span className="font-bold text-[#F5EBE0]">{formatPrice(aiResult.costBreakdown.lodgingAndMealsUSD)}</span>
                        </div>

                        <div className="flex justify-between pb-2 border-b border-[#D4AF37]/20">
                          <span className="text-[#F5EBE0]/70">National Park Permits & Conservation Trust:</span>
                          <span className="font-bold text-[#F5EBE0]">{formatPrice(aiResult.costBreakdown.parkPermitsAndConservationUSD)}</span>
                        </div>

                        <div className="flex justify-between pb-2 border-b border-[#D4AF37]/20">
                          <span className="text-[#F5EBE0]/70">Bush Charter Flights & Private 4x4 Land Cruisers:</span>
                          <span className="font-bold text-[#F5EBE0]">{formatPrice(aiResult.costBreakdown.transportAndBushFlightsUSD)}</span>
                        </div>

                        <div className="flex justify-between pb-2 border-b border-[#D4AF37]/20">
                          <span className="text-[#F5EBE0]/70">Guided Game Drives & Specialized Activities:</span>
                          <span className="font-bold text-[#F5EBE0]">{formatPrice(aiResult.costBreakdown.guidedActivitiesUSD)}</span>
                        </div>

                        <div className="flex justify-between pb-2 border-b border-[#D4AF37]/20">
                          <span className="text-[#F5EBE0]/70">Regional VAT, Tourism Levy & Escrow Security:</span>
                          <span className="font-bold text-[#F5EBE0]">{formatPrice(aiResult.costBreakdown.taxesAndEscrowUSD)}</span>
                        </div>

                        <div className="flex justify-between text-base font-serif font-bold text-[#D4AF37] pt-2">
                          <span>Total Expedition Price ({totalTravelers} Guests):</span>
                          <span>{formatPrice(aiResult.costBreakdown.totalCostUSD)}</span>
                        </div>

                        <div className="flex justify-between text-xs text-[#4ADE80] font-bold">
                          <span>Equivalent Cost per Traveler:</span>
                          <span>{formatPrice(aiResult.costBreakdown.costPerPersonUSD)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ranger Eco Tip */}
                {aiResult.insiderConservationTip && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                    <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Ranger Eco Insight
                    </span>
                    <p className="text-[#F5EBE0]/90">{aiResult.insiderConservationTip}</p>
                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => openBookingModal('itinerary', 'itin-great-migration-spectacle')}
                    className="w-full sm:w-auto flex-1 btn-gold py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#2E2015]" />
                    <span>Book This AI Plan Now ({formatPrice(aiResult.costBreakdown?.totalCostUSD || (aiResult.estimatedCostPerPerson * totalTravelers))})</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-[#181E1A] text-[#F5EBE0] hover:text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
