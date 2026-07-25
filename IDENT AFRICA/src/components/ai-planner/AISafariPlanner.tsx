import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Country, WildlifeFocus, LuxuryTier, AIPlanResponse } from '../../types';
import { Sparkles, Calendar, Compass, DollarSign, Users, MapPin, Loader2, ArrowRight, CheckCircle2, ShieldCheck, Download, Award } from 'lucide-react';

export const AISafariPlanner: React.FC = () => {
  const { formatPrice, openBookingModal, navigateTo } = useApp();

  const [durationDays, setDurationDays] = useState<number>(7);
  const [budgetPerPersonUSD, setBudgetPerPersonUSD] = useState<number>(5500);
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [travelMonth, setTravelMonth] = useState<string>('August');
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(['Kenya', 'Tanzania']);
  const [selectedWildlife, setSelectedWildlife] = useState<WildlifeFocus[]>(['The Big Five', 'Great Wildebeest Migration']);
  const [luxuryLevel, setLuxuryLevel] = useState<LuxuryTier>('Ultra-Luxe Canvas');
  const [specialInterests, setSpecialInterests] = useState<string>('Hot air balloon safari & private photography guide');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIPlanResponse | null>(null);

  const toggleCountry = (country: Country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const toggleWildlife = (w: WildlifeFocus) => {
    setSelectedWildlife(prev =>
      prev.includes(w) ? prev.filter(item => item !== w) : [...prev, w]
    );
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai-planner', {
        method: 'POST',
        headers: { 'Content-[#1A1A1A]': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationDays,
          budgetPerPersonUSD,
          travelersCount,
          travelMonth,
          countries: selectedCountries.length > 0 ? selectedCountries : ['Kenya', 'Tanzania'],
          wildlifePriorities: selectedWildlife.length > 0 ? selectedWildlife : ['The Big Five'],
          luxuryLevel,
          specialInterests,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to contact Gemini AI Naturalist API');
      }

      const planData: AIPlanResponse = await response.json();
      setAiResult(planData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while generating your AI itinerary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] dark:bg-[#0F1210] text-[#1A1A1A] dark:text-[#F5EBE0] transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12241A] text-[#D4AF37] text-xs font-mono font-bold uppercase border border-[#D4AF37]/40 shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            Gemini AI Wildlife Naturalist & Trip Designer
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
            Design Your Bespoke Safari
          </h1>
          <p className="text-sm sm:text-base text-[#665E55] dark:text-[#A8A096]">
            Tell our Gemini-powered East African naturalist your timing, budget, and wildlife priorities. We will generate a bookable day-by-day expedition tailored to your preferences.
          </p>
        </div>

        {/* Wizard Form & Output Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#D4AF37]/30 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#1A1A1A] dark:text-[#F5EBE0] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#D4AF37]" />
              Expedition Parameters
            </h2>

            <form onSubmit={handleGeneratePlan} className="space-y-5 text-xs font-mono">
              
              {/* Duration Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#D4AF37] font-bold uppercase">Duration</label>
                  <span className="text-sm font-bold">{durationDays} Days</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={14}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>

              {/* Target Budget Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#D4AF37] font-bold uppercase">Budget / Person</label>
                  <span className="text-sm font-bold">{formatPrice(budgetPerPersonUSD)}</span>
                </div>
                <input
                  type="range"
                  min={2500}
                  max={15000}
                  step={500}
                  value={budgetPerPersonUSD}
                  onChange={(e) => setBudgetPerPersonUSD(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>

              {/* Group Size & Travel Month */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase">Travelers</label>
                  <select
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] dark:bg-[#12241A] p-2.5 rounded-xl border border-[#E6D5C3] dark:border-[#D4AF37]/30"
                  >
                    {[1, 2, 3, 4, 6, 8, 10].map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] font-bold uppercase">Travel Month</label>
                  <select
                    value={travelMonth}
                    onChange={(e) => setTravelMonth(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#12241A] p-2.5 rounded-xl border border-[#E6D5C3] dark:border-[#D4AF37]/30"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Countries */}
              <div className="space-y-2">
                <label className="text-[#D4AF37] font-bold uppercase block">Target Countries</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Kenya', 'Tanzania', 'Uganda', 'Rwanda'] as Country[]).map((c) => {
                    const active = selectedCountries.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => toggleCountry(c)}
                        className={`py-2 px-3 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-[#1E3A2B] text-[#D4AF37] border-[#D4AF37]'
                            : 'bg-[#FAF7F2] dark:bg-[#12241A] text-[#665E55] dark:text-[#A8A096] border-[#E6D5C3] dark:border-[#2A362E]'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wildlife Focus */}
              <div className="space-y-2">
                <label className="text-[#D4AF37] font-bold uppercase block">Wildlife Priorities</label>
                <div className="space-y-1.5">
                  {(['The Big Five', 'Great Wildebeest Migration', 'Mountain Gorillas & Primates', 'Marine & Coral Reefs'] as WildlifeFocus[]).map((w) => {
                    const active = selectedWildlife.includes(w);
                    return (
                      <button
                        type="button"
                        key={w}
                        onClick={() => toggleWildlife(w)}
                        className={`w-full py-2 px-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          active
                            ? 'bg-[#1E3A2B] text-[#D4AF37] border-[#D4AF37]'
                            : 'bg-[#FAF7F2] dark:bg-[#12241A] text-[#665E55] dark:text-[#A8A096] border-[#E6D5C3] dark:border-[#2A362E]'
                        }`}
                      >
                        <span>{w}</span>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Luxury Accommodation Tier */}
              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase">Accommodation Tier</label>
                <select
                  value={luxuryLevel}
                  onChange={(e) => setLuxuryLevel(e.target.value as LuxuryTier)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#12241A] p-2.5 rounded-xl border border-[#E6D5C3] dark:border-[#D4AF37]/30"
                >
                  <option value="Ultra-Luxe Canvas">Ultra-Luxe Canvas Tented Camp</option>
                  <option value="Eco Luxury Lodge">Eco Luxury Lodge & Villas</option>
                  <option value="Classic Safari Camp">Classic Safari Camp</option>
                  <option value="Bespoke Private Villa">Bespoke Private Estate</option>
                </select>
              </div>

              {/* Special Notes */}
              <div className="space-y-1">
                <label className="text-[#D4AF37] font-bold uppercase">Special Notes / Add-ons</label>
                <input
                  type="text"
                  placeholder="e.g. Hot air balloon, private photo guide, honeymoon..."
                  value={specialInterests}
                  onChange={(e) => setSpecialInterests(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-[#12241A] p-2.5 rounded-xl border border-[#E6D5C3] dark:border-[#D4AF37]/30"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F1210]" />
                    <span>Gemini AI Crafting Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#0F1210]" />
                    <span>Generate AI Safari Plan</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Results Display (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500 text-rose-500 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {!aiResult && !loading && (
              <div className="h-full min-h-[500px] border-2 border-dashed border-[#D4AF37]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-[#181E1A]">
                <Sparkles className="w-16 h-16 text-[#D4AF37] opacity-50 animate-bounce" />
                <h3 className="text-2xl font-serif font-bold">Your Custom AI Expedition</h3>
                <p className="text-xs sm:text-sm text-[#665E55] dark:text-[#A8A096] max-w-md">
                  Select your preferences on the left and click "Generate AI Safari Plan" to receive a full day-by-day itinerary designed by Gemini AI.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[500px] bg-white dark:bg-[#181E1A] border border-[#D4AF37]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
                <h3 className="text-xl font-serif font-bold">Analyzing East African Ranger Logs & Migration Routes</h3>
                <p className="text-xs text-[#665E55] dark:text-[#A8A096]">
                  Gemini is assembling your bespoke {durationDays}-day itinerary across {selectedCountries.join(', ')}...
                </p>
              </div>
            )}

            {aiResult && !loading && (
              <div className="bg-white dark:bg-[#181E1A] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in">
                
                {/* Result Title & Badges */}
                <div className="space-y-3 pb-6 border-b border-[#E6D5C3] dark:border-[#2A362E]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#1E3A2B] text-[#D4AF37] text-xs font-mono font-bold">
                      {aiResult.countriesVisited?.join(' & ')}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#0F1210] text-xs font-mono font-bold">
                      Est. {formatPrice(aiResult.estimatedCostPerPerson)} / person
                    </span>
                  </div>

                  <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] dark:text-[#F5EBE0]">
                    {aiResult.tripTitle}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#665E55] dark:text-[#A8A096] leading-relaxed">
                    {aiResult.overview}
                  </p>
                </div>

                {/* Seasonality Reasoning */}
                <div className="p-4 rounded-2xl bg-[#1E3A2B]/10 dark:bg-[#12241A] border border-[#D4AF37]/30 space-y-1 text-xs">
                  <span className="font-mono font-bold text-[#D4AF37] uppercase block">
                    Seasonal Wildlife Insight ({travelMonth})
                  </span>
                  <p className="text-[#665E55] dark:text-[#F5EBE0]/90">
                    {aiResult.recommendedSeasonReasoning}
                  </p>
                </div>

                {/* Day-by-day List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-[#D4AF37]">
                    Day-by-Day Expedition Itinerary
                  </h3>

                  <div className="space-y-4">
                    {aiResult.itineraryDays?.map((day) => (
                      <div
                        key={day.day}
                        className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#12241A] border border-[#E6D5C3] dark:border-[#2A362E] space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-[#D4AF37]">DAY {day.day} • {day.destinationName}</span>
                          <span className="text-[#665E55] dark:text-[#A8A096]">{day.country}</span>
                        </div>

                        <p className="text-xs text-[#1A1A1A] dark:text-[#F5EBE0] font-medium leading-relaxed">
                          {day.activitySummary}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#665E55] dark:text-[#A8A096] border-t border-[#E6D5C3]/50 dark:border-[#2A362E]">
                          <span>Lodge: <strong className="text-[#D4AF37]">{day.suggestedLodge}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ranger Tip */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Ranger Eco-Tip
                  </span>
                  <p className="text-[#665E55] dark:text-[#F5EBE0]/90">
                    {aiResult.insiderConservationTip}
                  </p>
                </div>

                {/* CTA */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => openBookingModal('itinerary', 'itin-great-migration-spectacle')}
                    className="w-full sm:w-auto flex-1 btn-gold py-3.5 px-6 rounded-xl text-xs font-bold shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Book This AI Designed Itinerary</span>
                    <ArrowRight className="w-4 h-4" />
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
