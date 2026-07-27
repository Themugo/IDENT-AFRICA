import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Country, WildlifeFocus, LuxuryTier, AIPlanResponse } from '../../types';
import {
  Sparkles, Calendar, Users, MapPin, Building2, Plane, Compass, 
  Phone, Mail, MessageCircle, ChevronRight, ChevronLeft, CheckCircle,
  Award, Star, Sun, Moon, Mountain, TreePine, Palmtree, Camera,
  Download, Printer, ArrowRight, Loader2, Shield, Heart, PawPrint,
  Clock, Globe, Leaf, Coffee, Wine, Camera as CamIcon
} from 'lucide-react';

// ==================== CONCIERGE TYPES ====================
interface ConciergeMessage {
  id: string;
  type: 'concierge' | 'user' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

interface TravelerProfile {
  name: string;
  type: 'honeymoon' | 'family' | 'solo' | 'group' | 'photographer';
  icon: React.ReactNode;
}

interface LuxuryConciergeProps {
  onGenerateProposal?: (data: any) => void;
}

// ==================== TRAVELER TYPE SELECTOR ====================
const TravelerTypeSelector: React.FC<{
  selected: TravelerProfile['type'] | null;
  onSelect: (type: TravelerProfile['type']) => void;
}> = ({ selected, onSelect }) => {
  const types: TravelerProfile[] = [
    { name: 'honeymoon', type: 'honeymoon', icon: <Heart className="w-6 h-6" /> },
    { name: 'family', type: 'family', icon: <Users className="w-6 h-6" /> },
    { name: 'solo', type: 'solo', icon: <Compass className="w-6 h-6" /> },
    { name: 'group', type: 'group', icon: <Users className="w-6 h-6" /> },
    { name: 'photographer', type: 'photographer', icon: <Camera className="w-6 h-6" /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {types.map((t) => (
        <button
          key={t.type}
          onClick={() => onSelect(t.type)}
          className={`
            p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2
            ${selected === t.type
              ? 'border-[#C89A4B] bg-[#C89A4B]/10 text-[#C89A4B]'
              : 'border-[#C89A4B]/30 text-[#D3C5AE] hover:border-[#C89A4B]/60'
            }
          `}
        >
          <div className={selected === t.type ? 'text-[#C89A4B]' : 'text-[#D3C5AE]/60'}>
            {t.icon}
          </div>
          <span className="text-xs font-cinzel capitalize tracking-wider">{t.name}</span>
        </button>
      ))}
    </div>
  );
};

// ==================== COUNTRY SELECTOR ====================
const CountrySelector: React.FC<{
  selected: Country[];
  onToggle: (country: Country) => void;
}> = ({ selected, onToggle }) => {
  const countries = [
    { code: 'Kenya' as Country, flag: '🇰🇪', name: 'Kenya', highlights: ['Masai Mara', 'Amboseli', 'Samburu'] },
    { code: 'Tanzania' as Country, flag: '🇹🇿', name: 'Tanzania', highlights: ['Serengeti', 'Ngorongoro', 'Zanzibar'] },
    { code: 'Uganda' as Country, flag: '🇺🇬', name: 'Uganda', highlights: ['Bwindi Gorillas', 'Murchison Falls'] },
    { code: 'Rwanda' as Country, flag: '🇷🇼', name: 'Rwanda', highlights: ['Volcanoes Park', 'Lake Kivu'] },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {countries.map((c) => (
        <button
          key={c.code}
          onClick={() => onToggle(c.code)}
          className={`
            p-5 rounded-2xl border-2 transition-all duration-300 text-left
            ${selected.includes(c.code)
              ? 'border-[#C89A4B] bg-[#C89A4B]/10'
              : 'border-[#C89A4B]/30 hover:border-[#C89A4B]/60'
            }
          `}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{c.flag}</span>
            <span className="font-cinzel text-sm text-[#F4E8D5] tracking-wider">{c.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {c.highlights.map((h) => (
              <span
                key={h}
                className={`
                  text-[10px] px-2 py-0.5 rounded-full font-mono
                  ${selected.includes(c.code)
                    ? 'bg-[#C89A4B]/20 text-[#C89A4B]'
                    : 'bg-[#2D2621]/50 text-[#D3C5AE]/60'
                  }
                `}
              >
                {h}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};

// ==================== WILDLIFE PRIORITY SELECTOR ====================
const WildlifeSelector: React.FC<{
  selected: WildlifeFocus[];
  onToggle: (focus: WildlifeFocus) => void;
}> = ({ selected, onToggle }) => {
  const wildlife: { focus: WildlifeFocus; icon: React.ReactNode; description: string }[] = [
    { focus: 'The Big Five', icon: <PawPrint className="w-5 h-5" />, description: 'Lion, Leopard, Elephant, Rhino, Buffalo' },
    { focus: 'Great Wildebeest Migration', icon: <Mountain className="w-5 h-5" />, description: 'River crossings & calving season' },
    { focus: 'Mountain Gorillas & Primates', icon: <Heart className="w-5 h-5" />, description: 'Intimate forest encounters' },
    { focus: 'Flamingos & Birding', icon: <Sparkles className="w-5 h-5" />, description: '500+ species' },
    { focus: 'Marine & Coral Reefs', icon: <Palmtree className="w-5 h-5" />, description: 'Zanzibar & Watamu' },
    { focus: 'Predator Tracking', icon: <Compass className="w-5 h-5" />, description: 'Cheetah & Leopard' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {wildlife.map((w) => (
        <button
          key={w.focus}
          onClick={() => onToggle(w.focus)}
          className={`
            p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-start gap-3
            ${selected.includes(w.focus)
              ? 'border-[#C89A4B] bg-[#C89A4B]/10'
              : 'border-[#C89A4B]/30 hover:border-[#C89A4B]/60'
            }
          `}
        >
          <div className={`shrink-0 ${selected.includes(w.focus) ? 'text-[#C89A4B]' : 'text-[#D3C5AE]/60'}`}>
            {w.icon}
          </div>
          <div>
            <span className={`text-sm font-cinzel tracking-wider block mb-0.5 ${selected.includes(w.focus) ? 'text-[#C89A4B]' : 'text-[#F4E8D5]'}`}>
              {w.focus}
            </span>
            <span className="text-[11px] text-[#D3C5AE]/60 font-mono">{w.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

// ==================== SEASON ADVISOR ====================
const SeasonAdvisor: React.FC<{ selectedMonth: string; onSelect: (month: string) => void }> = ({ selectedMonth, onSelect }) => {
  const seasons = [
    { 
      month: 'JAN-MAR', 
      name: 'Calving Season', 
      icon: <Sun className="w-5 h-5" />,
      description: 'Southern Serengeti & Ndutu',
      highlights: ['Wildebeest births', 'Predator action', 'Green landscapes'],
      rating: 4
    },
    { 
      month: 'APR-MAY', 
      name: 'Green Season', 
      icon: <TreePine className="w-5 h-5" />,
      description: 'Quiet & lush',
      highlights: ['Fewer crowds', ' Photography light', 'Lower rates'],
      rating: 3
    },
    { 
      month: 'JUN-OCT', 
      name: 'Peak Migration', 
      icon: <PawPrint className="w-5 h-5" />,
      description: 'River crossings',
      highlights: ['Best wildlife viewing', 'Mara River', 'Peak season'],
      rating: 5
    },
    { 
      month: 'NOV-DEC', 
      name: 'Short Rains', 
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Return migration',
      highlights: ['Green start', 'Calving begins', 'Mixed rates'],
      rating: 4
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {seasons.map((s) => (
        <button
          key={s.month}
          onClick={() => onSelect(s.month)}
          className={`
            p-5 rounded-2xl border-2 transition-all duration-300 text-left
            ${selectedMonth === s.month
              ? 'border-[#C89A4B] bg-[#C89A4B]/10 ring-2 ring-[#C89A4B]/30'
              : 'border-[#C89A4B]/30 hover:border-[#C89A4B]/60'
            }
          `}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${selectedMonth === s.month ? 'text-[#C89A4B]' : 'text-[#D3C5AE]/60'}`}>
              {s.icon}
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < s.rating ? 'text-[#C89A4B] fill-current' : 'text-[#D3C5AE]/30'}`} />
              ))}
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#D3C5AE]/60 block mb-1">{s.month}</span>
          <span className={`text-sm font-cinzel tracking-wider block mb-1 ${selectedMonth === s.month ? 'text-[#C89A4B]' : 'text-[#F4E8D5]'}`}>
            {s.name}
          </span>
          <span className="text-[11px] text-[#D3C5AE]/60 block mb-3">{s.description}</span>
          <div className="flex flex-wrap gap-1">
            {s.highlights.map((h) => (
              <span key={h} className="text-[9px] px-2 py-0.5 bg-[#2D2621]/50 text-[#D3C5AE]/80 rounded-full font-mono">
                {h}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};

// ==================== LODGE TIER SELECTOR ====================
const LodgeTierSelector: React.FC<{
  selected: LuxuryTier;
  onSelect: (tier: LuxuryTier) => void;
}> = ({ selected, onSelect }) => {
  const tiers: { tier: LuxuryTier; icon: React.ReactNode; description: string }[] = [
    { tier: 'Ultra-Luxe Canvas', icon: <Moon className="w-5 h-5" />, description: 'Tented luxury, plunge pools, private butler' },
    { tier: 'Eco Luxury Lodge', icon: <Leaf className="w-5 h-5" />, description: 'Sustainable design, excellent game viewing' },
    { tier: 'Classic Safari Camp', icon: <Compass className="w-5 h-5" />, description: 'Traditional experience, authentic atmosphere' },
    { tier: 'Bespoke Private Villa', icon: <Building2 className="w-5 h-5" />, description: 'Exclusive use, personal chef, full privacy' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiers.map((t) => (
        <button
          key={t.tier}
          onClick={() => onSelect(t.tier)}
          className={`
            p-5 rounded-2xl border-2 transition-all duration-300 text-left
            ${selected === t.tier
              ? 'border-[#C89A4B] bg-[#C89A4B]/10'
              : 'border-[#C89A4B]/30 hover:border-[#C89A4B]/60'
            }
          `}
        >
          <div className={`mb-3 ${selected === t.tier ? 'text-[#C89A4B]' : 'text-[#D3C5AE]/60'}`}>
            {t.icon}
          </div>
          <span className={`text-sm font-cinzel tracking-wider block mb-2 ${selected === t.tier ? 'text-[#C89A4B]' : 'text-[#F4E8D5]'}`}>
            {t.tier}
          </span>
          <span className="text-[11px] text-[#D3C5AE]/60 font-mono">{t.description}</span>
        </button>
      ))}
    </div>
  );
};

// ==================== PROGRESS INDICATOR ====================
const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const steps = ['Journey Type', 'Destinations', 'Wildlife', 'Season', 'Lodge Style', 'Budget'];
  const labels = ['Traveler', 'Countries', 'Wildlife', 'Season', 'Lodge', 'Budget'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {labels.map((label, idx) => (
          <div key={idx} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-cinzel font-bold transition-all
              ${idx < currentStep 
                ? 'bg-[#C89A4B] text-[#1a1008]' 
                : idx === currentStep
                ? 'bg-[#2D2621] border-2 border-[#C89A4B] text-[#C89A4B]'
                : 'bg-[#2D2621]/50 border border-[#D3C5AE]/30 text-[#D3C5AE]/50'
              }
            `}>
              {idx < currentStep ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            {idx < labels.length - 1 && (
              <div className={`hidden lg:block w-12 h-0.5 mx-1 ${idx < currentStep ? 'bg-[#C89A4B]' : 'bg-[#D3C5AE]/30'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {steps.map((step, idx) => (
          <span key={idx} className={`text-[9px] font-mono hidden lg:block ${idx === currentStep ? 'text-[#C89A4B]' : 'text-[#D3C5AE]/50'}`}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
};

// ==================== CONSERVATION INSIGHT ====================
const ConservationInsight: React.FC<{ countries: Country[]; interests: WildlifeFocus[] }> = ({ countries, interests }) => {
  const insights = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Anti-Poaching Support',
      description: 'Your booking funds ranger patrols protecting rhino populations in the Serengeti ecosystem.',
      impact: '~$150 per booking'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Community Empowerment',
      description: '40% of lodge fees support local Maasai villages with schools and healthcare.',
      impact: '~$80 per night'
    },
    {
      icon: <TreePine className="w-5 h-5" />,
      title: 'Reforestation Trust',
      description: 'Contributing to mountain gorilla habitat restoration in Bwindi Forest.',
      impact: '~$50 per booking'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'Wildlife Corridors',
      description: 'Supporting wildlife migration corridors between protected areas.',
      impact: 'Conservation land lease'
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#2D2621] to-[#1a1510] rounded-2xl p-6 border border-[#4F6848]/30">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-[#4F6848]/20 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-[#4F6848]" />
        </div>
        <div>
          <h4 className="font-cinzel text-sm text-[#F4E8D5] tracking-wider">Your Conservation Impact</h4>
          <p className="text-[11px] text-[#D3C5AE]/60">Every booking makes a difference</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-4 bg-[#0f0d0a]/50 rounded-xl border border-[#4F6848]/20">
            <div className="flex items-start gap-3">
              <div className="text-[#4F6848]">{insight.icon}</div>
              <div>
                <h5 className="text-sm font-cinzel text-[#F4E8D5] tracking-wider mb-1">{insight.title}</h5>
                <p className="text-[11px] text-[#D3C5AE]/60 leading-relaxed mb-2">{insight.description}</p>
                <span className="text-[10px] font-mono text-[#4F6848] bg-[#4F6848]/20 px-2 py-0.5 rounded">
                  {insight.impact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== PDF PROPOSAL GENERATOR ====================
const ProposalGenerator: React.FC<{
  profile: any;
  onGenerate: () => void;
  onDownload: () => void;
}> = ({ profile, onGenerate, onDownload }) => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    setGenerated(true);
    onGenerate();
  };

  return (
    <div className="bg-[#FFF8EC] rounded-2xl p-6 text-[#2A1E17]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#C89A4B]/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#C89A4B]" />
        </div>
        <div>
          <h4 className="font-cormorant text-xl text-[#2A1E17] font-light">Your Personalized Proposal</h4>
          <p className="text-[12px] text-[#5A4738]">Luxury safari itinerary & investment summary</p>
        </div>
      </div>

      {generated ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#4F6848]">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Proposal ready for download</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-sm tracking-wider hover:bg-[#D6B06A] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-[#C89A4B]/30 text-[#2A1E17] rounded-xl font-cinzel text-sm tracking-wider hover:bg-[#C89A4B]/10 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#5A4738] text-center">
            Proposal includes day-by-day itinerary, lodge details, cost breakdown & conservation impact
          </p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#2A1E17] text-[#F4E8D5] rounded-xl font-cinzel text-sm tracking-wider hover:bg-[#463D34] transition-colors disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Crafting Your Proposal...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate My Proposal
            </>
          )}
        </button>
      )}
    </div>
  );
};

// ==================== MAIN CONCIERGE COMPONENT ====================
export const LuxurySafariConcierge: React.FC<LuxuryConciergeProps> = ({ onGenerateProposal }) => {
  const { formatPrice, openBookingModal, navigateTo, currency } = useApp();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [travelerType, setTravelerType] = useState<TravelerProfile['type'] | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(['Kenya', 'Tanzania']);
  const [selectedWildlife, setSelectedWildlife] = useState<WildlifeFocus[]>(['The Big Five']);
  const [selectedSeason, setSelectedSeason] = useState('JUN-OCT');
  const [selectedTier, setSelectedTier] = useState<LuxuryTier>('Ultra-Luxe Canvas');
  const [budget, setBudget] = useState(8500);
  const [travelers, setTravelers] = useState(2);
  const [travelDays, setTravelDays] = useState(7);
  const [specialRequests, setSpecialRequests] = useState('');

  // Result state
  const [showProposal, setShowProposal] = useState(false);
  const [proposalGenerated, setProposalGenerated] = useState(false);

  // Conversation state
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      id: '1',
      type: 'concierge',
      content: 'Welcome to your personal safari consultation. I\'m your dedicated East Africa concierge. Let\'s craft your perfect expedition together.\n\nTell me about your dream safari — who\'s traveling, what wildlife you\'d love to witness, and when you\'d like to go?',
      timestamp: new Date(),
      suggestions: ['Honeymoon for two', 'Family adventure', 'Photography expedition', 'First safari experience']
    }
  ]);

  const totalSteps = 6;
  
  const canProceed = () => {
    switch (currentStep) {
      case 0: return travelerType !== null;
      case 1: return selectedCountries.length > 0;
      case 2: return selectedWildlife.length > 0;
      case 3: return true; // Season is optional
      case 4: return true; // Lodge tier is optional
      case 5: return budget > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowProposal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleWildlife = (focus: WildlifeFocus) => {
    setSelectedWildlife(prev =>
      prev.includes(focus) ? prev.filter(f => f !== focus) : [...prev, focus]
    );
  };

  const toggleCountry = (country: Country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  // Generate PDF proposal
  const handleGenerateProposal = () => {
    setProposalGenerated(true);
    if (onGenerateProposal) {
      onGenerateProposal({
        travelerType,
        countries: selectedCountries,
        wildlife: selectedWildlife,
        season: selectedSeason,
        tier: selectedTier,
        budget,
        travelers,
        days: travelDays,
        specialRequests
      });
    }
  };

  // Render wizard step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-cormorant text-2xl text-[#F4E8D5] font-light mb-2">
                What type of safari experience are you seeking?
              </h3>
              <p className="text-sm text-[#D3C5AE]/70">Select the travel style that best matches your group</p>
            </div>
            <TravelerTypeSelector selected={travelerType} onSelect={setTravelerType} />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-cormorant text-2xl text-[#F4E8D5] font-light mb-2">
                Which East African destinations call to you?
              </h3>
              <p className="text-sm text-[#D3C5AE]/70">Select one or more countries for your expedition</p>
            </div>
            <CountrySelector selected={selectedCountries} onToggle={toggleCountry} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-cormorant text-2xl text-[#F4E8D5] font-light mb-2">
                What wildlife experiences are essential?
              </h3>
              <p className="text-sm text-[#D3C5AE]/70">Select your must-see wildlife encounters</p>
            </div>
            <WildlifeSelector selected={selectedWildlife} onToggle={toggleWildlife} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-cormorant text-2xl text-[#F4E8D5] font-light mb-2">
                When would you like to travel?
              </h3>
              <p className="text-sm text-[#D3C5AE]/70">Each season offers unique experiences</p>
            </div>
            <SeasonAdvisor selectedMonth={selectedSeason} onSelect={setSelectedSeason} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-cormorant text-2xl text-[#F4E8D5] font-light mb-2">
                What level of luxury do you prefer?
              </h3>
              <p className="text-sm text-[#D3C5AE]/70">Choose your accommodation style</p>
            </div>
            <LodgeTierSelector selected={selectedTier} onSelect={setSelectedTier} />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-cormorant text-2xl text-[#F4E8D5] font-light mb-2">
                Investment per person & party size
              </h3>
              <p className="text-sm text-[#D3C5AE]/70">Set your budget range and number of travelers</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Budget */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-[#D3C5AE]/60 uppercase tracking-wider">
                  Budget Per Person (USD)
                </label>
                <input
                  type="range"
                  min="3000"
                  max="25000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-[#2D2621] rounded-full appearance-none cursor-pointer accent-[#C89A4B]"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-[#D3C5AE]/50">$3,000</span>
                  <span className="text-[#C89A4B] font-cinzel text-lg">{formatPrice(budget)}</span>
                  <span className="text-[#D3C5AE]/50">$25,000</span>
                </div>
              </div>

              {/* Travelers */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-[#D3C5AE]/60 uppercase tracking-wider">
                  Number of Travelers
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-12 h-12 rounded-xl bg-[#2D2621] border border-[#C89A4B]/30 text-[#F4E8D5] hover:border-[#C89A4B] transition-colors"
                  >
                    -
                  </button>
                  <span className="text-3xl font-cormorant text-[#F4E8D5] w-12 text-center">{travelers}</span>
                  <button
                    onClick={() => setTravelers(Math.min(12, travelers + 1))}
                    className="w-12 h-12 rounded-xl bg-[#2D2621] border border-[#C89A4B]/30 text-[#F4E8D5] hover:border-[#C89A4B] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-[#D3C5AE]/60 uppercase tracking-wider">
                Duration (Days)
              </label>
              <div className="flex gap-2">
                {[5, 7, 10, 14].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTravelDays(days)}
                    className={`
                      flex-1 py-3 rounded-xl font-cinzel text-sm tracking-wider transition-all
                      ${travelDays === days
                        ? 'bg-[#C89A4B] text-[#1a1008]'
                        : 'bg-[#2D2621] border border-[#C89A4B]/30 text-[#F4E8D5] hover:border-[#C89A4B]'
                      }
                    `}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#D3C5AE]/60 uppercase tracking-wider">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Anniversary celebrations, dietary requirements, mobility needs, photography equipment..."
                className="w-full h-24 p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] placeholder-[#D3C5AE]/40 text-sm resize-none focus:outline-none focus:border-[#C89A4B]"
              />
            </div>

            {/* Total Estimate */}
            <div className="p-4 bg-[#C89A4B]/10 rounded-xl border border-[#C89A4B]/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#D3C5AE]">Estimated Total Investment</span>
                <span className="font-cormorant text-2xl text-[#C89A4B]">
                  {formatPrice(budget * travelers)}
                </span>
              </div>
              <p className="text-[11px] text-[#D3C5AE]/60 mt-1">Final pricing confirmed in your personalized proposal</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1510] via-[#2D2621] to-[#1a1510]">
      {/* Header */}
      <div className="bg-[#0f0d0a]/80 backdrop-blur-xl border-b border-[#C89A4B]/20 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C89A4B] to-[#B08235] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#1a1008]" />
            </div>
            <div>
              <h1 className="font-cormorant text-2xl text-[#F4E8D5] font-light">
                Your Personal Safari Concierge
              </h1>
              <p className="text-[11px] text-[#D3C5AE]/60 font-mono">
                Expert guidance for your East African journey
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button className="p-3 rounded-xl bg-[#2D2621] border border-[#C89A4B]/30 text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-xl bg-[#2D2621] border border-[#C89A4B]/30 text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-colors">
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showProposal ? (
          <>
            {/* Progress */}
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

            {/* Wizard Content */}
            <div className="bg-[#1a1510]/80 backdrop-blur-xl rounded-3xl border border-[#C89A4B]/20 p-8 mb-8">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-cinzel text-sm tracking-wider transition-all
                  ${currentStep === 0
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-[#2D2621] border border-[#C89A4B]/30 text-[#D3C5AE] hover:border-[#C89A4B]'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel text-sm tracking-wider transition-all
                  ${canProceed()
                    ? 'bg-[#C89A4B] text-[#1a1008] hover:bg-[#D6B06A]'
                    : 'bg-[#2D2621] border border-[#C89A4B]/30 text-[#D3C5AE]/50 cursor-not-allowed'
                  }
                `}
              >
                {currentStep === totalSteps - 1 ? 'View My Proposal' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* PROPOSAL VIEW */
          <div className="space-y-8">
            {/* Hero Summary */}
            <div className="bg-gradient-to-br from-[#2D2621] to-[#1a1510] rounded-3xl p-8 border border-[#C89A4B]/30 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C89A4B]/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-[#C89A4B]" />
              </div>
              <h2 className="font-cormorant text-4xl text-[#F4E8D5] font-light mb-3">
                Your Safari Consultation is Ready
              </h2>
              <p className="text-[#D3C5AE]/70 max-w-xl mx-auto mb-8">
                Based on your preferences, here's a summary of your personalized East African expedition
              </p>

              {/* Quick Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-[#0f0d0a]/50 rounded-xl">
                  <Compass className="w-5 h-5 text-[#C89A4B] mx-auto mb-2" />
                  <span className="text-xs text-[#D3C5AE]/60 block capitalize">{travelerType} Safari</span>
                  <span className="text-sm text-[#F4E8D5] font-medium">{selectedCountries.join(' & ')}</span>
                </div>
                <div className="p-4 bg-[#0f0d0a]/50 rounded-xl">
                  <Calendar className="w-5 h-5 text-[#C89A4B] mx-auto mb-2" />
                  <span className="text-xs text-[#D3C5AE]/60 block">{travelDays} Days</span>
                  <span className="text-sm text-[#F4E8D5] font-medium">{selectedSeason}</span>
                </div>
                <div className="p-4 bg-[#0f0d0a]/50 rounded-xl">
                  <Users className="w-5 h-5 text-[#C89A4B] mx-auto mb-2" />
                  <span className="text-xs text-[#D3C5AE]/60 block">{travelers} Travelers</span>
                  <span className="text-sm text-[#F4E8D5] font-medium">{formatPrice(budget)}/person</span>
                </div>
                <div className="p-4 bg-[#0f0d0a]/50 rounded-xl">
                  <Building2 className="w-5 h-5 text-[#C89A4B] mx-auto mb-2" />
                  <span className="text-xs text-[#D3C5AE]/60 block">Accommodation</span>
                  <span className="text-sm text-[#F4E8D5] font-medium">{selectedTier}</span>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-[#C89A4B]/10 rounded-xl border border-[#C89A4B]/30 mb-8">
                <span className="text-sm text-[#D3C5AE]/60 block mb-1">Estimated Total Investment</span>
                <span className="font-cormorant text-4xl text-[#C89A4B]">{formatPrice(budget * travelers)}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => openBookingModal('itinerary', 'custom')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-sm tracking-wider hover:bg-[#D6B06A] transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Book This Safari
                </button>
                <button
                  onClick={() => navigateTo('itinerary-builder')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-[#2D2621] border border-[#C89A4B]/30 text-[#F4E8D5] rounded-xl font-cinzel text-sm tracking-wider hover:border-[#C89A4B] transition-colors"
                >
                  <Compass className="w-5 h-5" />
                  Customize Further
                </button>
              </div>
            </div>

            {/* Conservation Impact */}
            <ConservationInsight countries={selectedCountries} interests={selectedWildlife} />

            {/* Proposal Generator */}
            <ProposalGenerator
              profile={{
                travelerType,
                countries: selectedCountries,
                wildlife: selectedWildlife,
                season: selectedSeason,
                tier: selectedTier,
                budget,
                travelers,
                days: travelDays
              }}
              onGenerate={handleGenerateProposal}
              onDownload={() => window.print()}
            />

            {/* Start Over */}
            <div className="text-center">
              <button
                onClick={() => {
                  setShowProposal(false);
                  setCurrentStep(0);
                }}
                className="text-[#D3C5AE]/60 hover:text-[#C89A4B] text-sm font-mono transition-colors"
              >
                Start New Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuxurySafariConcierge;
