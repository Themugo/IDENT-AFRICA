import React, { useState } from 'react';
import {
  Calendar,
  Compass,
  Sparkles,
  MapPin,
  Sun,
  Camera,
  ArrowRight,
  Binoculars,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EventHighlight {
  id: string;
  title: string;
  region: string;
  country: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';
  category: 'Migration' | 'Wildlife' | 'Gorilla Trekking' | 'Cultural' | 'Coastal & Marine';
  months: number[]; // 1-12
  peakMonthsText: string;
  summary: string;
  description: string;
  weather: 'Dry & Clear' | 'Mild & Lush' | 'Green Season' | 'Warm & Tropical';
  wildlifeRating: number; // 1-5
  photographyRating: number; // 1-5
  keyAnimals: string[];
  image: string;
  destinationId?: string;
}

const MONTHS = [
  { num: 1, short: 'Jan', name: 'January', season: 'Calving Season' },
  { num: 2, short: 'Feb', name: 'February', season: 'Calving Season' },
  { num: 3, short: 'Mar', name: 'March', season: 'Green Season' },
  { num: 4, short: 'Apr', name: 'April', season: 'Long Rains' },
  { num: 5, short: 'May', name: 'May', season: 'Lush & Quiet' },
  { num: 6, short: 'Jun', name: 'June', season: 'Grumeti River' },
  { num: 7, short: 'Jul', name: 'July', season: 'Mara River Crossing' },
  { num: 8, short: 'Aug', name: 'August', season: 'Peak Migration' },
  { num: 9, short: 'Sep', name: 'September', season: 'Mara Crossing' },
  { num: 10, short: 'Oct', name: 'October', season: 'Dry Season Prime' },
  { num: 11, short: 'Nov', name: 'November', season: 'Short Rains' },
  { num: 12, short: 'Dec', name: 'December', season: 'Festive Wildlife' },
];

const MIGRATION_EVENTS: EventHighlight[] = [
  {
    id: 'calving-ndutu',
    title: 'The Great Calving Spectacle',
    region: 'Southern Serengeti & Ndutu Plains',
    country: 'Tanzania',
    category: 'Migration',
    months: [1, 2, 3],
    peakMonthsText: 'Jan – Mar',
    summary: 'Over 500,000 wildebeest calves are born in weeks, drawing intense big cat predator action on the short-grass plains.',
    description: 'The vast herds settle on the mineral-rich plains of Ndutu. Cheetahs, lions, and hyenas stalk the nursery grounds in high-stakes tactical hunts.',
    weather: 'Mild & Lush',
    wildlifeRating: 5,
    photographyRating: 5,
    keyAnimals: ['Wildebeest Calves', 'Cheetah', 'Lion Pride', 'Striped Hyena'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'serengeti-national-park'
  },
  {
    id: 'grumeti-crossing',
    title: 'Grumeti River Crocodile Crossings',
    region: 'Western Corridor, Serengeti',
    country: 'Tanzania',
    category: 'Migration',
    months: [5, 6],
    peakMonthsText: 'May – Jun',
    summary: 'Herds march northwest toward the treacherous Grumeti River, facing massive Nile crocodiles lying in wait.',
    description: 'A dramatic leg of the Great Migration as herds funnel into riverine forests. The Grumeti River harbors giant crocodiles ready for the annual gauntlet.',
    weather: 'Dry & Clear',
    wildlifeRating: 5,
    photographyRating: 4,
    keyAnimals: ['Giant Nile Crocodiles', 'Wildebeest', 'Colobus Monkeys', 'Leopards'],
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'serengeti-national-park'
  },
  {
    id: 'mara-river-crossing',
    title: 'Iconic Mara River River Crossings',
    region: 'Masai Mara & Northern Serengeti',
    country: 'Kenya',
    category: 'Migration',
    months: [7, 8, 9, 10],
    peakMonthsText: 'Jul – Oct',
    summary: 'The world-famous river crossings where millions of wildebeest plunge down steep banks across the Mara River.',
    description: 'The pinnacle of wildlife spectacles. Massive dust plumes, roaring rivers, and dramatic crocodile attacks attract wildlife enthusiasts from across the globe.',
    weather: 'Dry & Clear',
    wildlifeRating: 5,
    photographyRating: 5,
    keyAnimals: ['Wildebeest', 'Zebra', 'Nile Crocodile', 'Black-maned Lion'],
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'masai-mara'
  },
  {
    id: 'gorilla-trekking-bwindi',
    title: 'Mountain Gorilla Forest Treks',
    region: 'Bwindi Impenetrable Forest',
    country: 'Uganda',
    category: 'Gorilla Trekking',
    months: [1, 2, 6, 7, 8, 9, 12],
    peakMonthsText: 'Jun – Sep & Dec – Feb',
    summary: 'Optimal dry trail conditions for tracking endangered mountain gorilla families in ancient misty rainforests.',
    description: 'Clearer skies make hiking less arduous and mountain gorilla habituated families easier to locate along ridge trails beneath high forest canopies.',
    weather: 'Dry & Clear',
    wildlifeRating: 5,
    photographyRating: 5,
    keyAnimals: ['Mountain Gorilla', 'L\'Hoest\'s Monkey', 'African Broadbill'],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'bwindi-impenetrable'
  },
  {
    id: 'volcanoes-primate-trek',
    title: 'Golden Monkey & Gorilla Tracking',
    region: 'Volcanoes National Park',
    country: 'Rwanda',
    category: 'Gorilla Trekking',
    months: [1, 2, 6, 7, 8, 9, 10],
    peakMonthsText: 'Jun – Oct',
    summary: 'Lush bamboo slopes under clear mountain light, offering unparalleled intimate primate encounters.',
    description: 'Dry season trail conditions allow comfortable ascents up bamboo slopes for world-class photography of Silverback gorillas and bamboo-nesting Golden Monkeys.',
    weather: 'Dry & Clear',
    wildlifeRating: 5,
    photographyRating: 5,
    keyAnimals: ['Silverback Gorilla', 'Golden Monkey', 'Ruwenzori Turaco'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'volcanoes-national-park'
  },
  {
    id: 'lamu-cultural-festival',
    title: 'Lamu Swahili Dhow & Cultural Festival',
    region: 'Lamu Archipelago',
    country: 'Kenya',
    category: 'Cultural',
    months: [11],
    peakMonthsText: 'November',
    summary: 'Ancient UNESCO Swahili island celebration with dhow races, donkey races, henna art, and traditional Taarab music.',
    description: 'Immerse in centuries of East African Swahili maritime heritage along narrow coral-stone streets, wood carving demonstrations, and sunset dhow regattas.',
    weather: 'Warm & Tropical',
    wildlifeRating: 3,
    photographyRating: 5,
    keyAnimals: ['Dolphin Pods', 'Green Sea Turtles'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'lamu-archipelago'
  },
  {
    id: 'zanzibar-spice-marine',
    title: 'Coral Reef Diving & Whale Shark Season',
    region: 'Zanzibar & Mafia Island',
    country: 'Tanzania',
    category: 'Coastal & Marine',
    months: [10, 11, 12, 1, 2, 3],
    peakMonthsText: 'Oct – Mar',
    summary: 'Crystal clear 30m visibility for diving with whale sharks, green turtles, and humpback dolphins.',
    description: 'Calm ocean tides create optimal conditions for marine exploration around Mnemba Atoll and Mafia Island whale shark feeding grounds.',
    weather: 'Warm & Tropical',
    wildlifeRating: 5,
    photographyRating: 5,
    keyAnimals: ['Whale Sharks', 'Green Sea Turtles', 'Manta Rays', 'Spinner Dolphins'],
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'zanzibar-archipelago'
  },
  {
    id: 'flamingo-lake-nakuru',
    title: 'Rift Valley Flamingo & Rhino Gathering',
    region: 'Lake Nakuru & Naivasha',
    country: 'Kenya',
    category: 'Wildlife',
    months: [1, 2, 6, 7, 8, 9, 10, 11, 12],
    peakMonthsText: 'Year-Round',
    summary: 'Pink flamingo carpets along the Rift Valley soda lakes, framed by endangered white and black rhino sanctuaries.',
    description: 'A birdwatcher\'s paradise with over 400 species alongside heavily protected rhino breeding sanctuaries along acacia-lined shores.',
    weather: 'Mild & Lush',
    wildlifeRating: 4,
    photographyRating: 5,
    keyAnimals: ['Lesser Flamingo', 'Black Rhino', 'White Rhino', 'Rothschild Giraffe'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    destinationId: 'lake-nakuru'
  }
];

export const SeasonalCalendar: React.FC = () => {
  const { navigateTo } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Migration', 'Gorilla Trekking', 'Wildlife', 'Cultural', 'Coastal & Marine'];

  // Filter events by selected month & category
  const filteredEvents = MIGRATION_EVENTS.filter((evt) => {
    const monthMatches = evt.months.includes(selectedMonth);
    const categoryMatches = categoryFilter === 'All' || evt.category === categoryFilter;
    return monthMatches && categoryMatches;
  });

  const activeMonthInfo = MONTHS.find((m) => m.num === selectedMonth) || MONTHS[0];

  return (
    <section className="py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#463D34] text-[#F4E8D5] relative border-b border-[#C89A4B]/40 texture-leather overflow-hidden">
      
      {/* Background Topographic Accent Lines */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C89A4B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#C89A4B]/30 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D2621] border border-[#C89A4B]/60 text-[#D6B06A] text-[11px] font-mono font-bold uppercase tracking-[0.25em] mb-3 shadow-md">
              <Calendar className="w-3.5 h-3.5 text-[#D6B06A]" />
              <span>East African Expedition Journal</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F4E8D5] tracking-tight">
              Seasonal Migration & Wildlife Calendar
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#D3C5AE] max-w-2xl font-normal">
              Select any month to reveal peak wildlife movements, river crossings, gorilla trekking dry windows, and rich Swahili cultural celebrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('ai-planner')}
              className="px-4 py-2.5 bg-[#4F6848] text-[#FFF8EC] hover:bg-[#2D3E2B] border border-[#4F6848]/80 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D6B06A]" />
              <span>Ask AI Naturalist</span>
            </button>
            <button
              onClick={() => navigateTo('itineraries')}
              className="btn-gold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider shadow-md cursor-pointer"
            >
              <span>View All Itineraries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Month Selector Bar (Interactive Journal Timeline) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D6B06A] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#D6B06A]" /> Select Travel Month:
            </span>
            <span className="text-xs font-mono font-semibold text-[#D3C5AE]">
              Showing Highlights for <strong className="text-[#D6B06A]">{activeMonthInfo.name}</strong> ({activeMonthInfo.season})
            </span>
          </div>

          {/* Months Grid / Horizontal Scroll */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2 p-2 bg-[#1A1008]/90 rounded-2xl border-2 border-[#C89A4B]/60 shadow-2xl overflow-x-auto">
            {MONTHS.map((m) => {
              const isSelected = m.num === selectedMonth;
              const hasEvents = MIGRATION_EVENTS.some(e => e.months.includes(m.num));

              return (
                <button
                  key={m.num}
                  onClick={() => setSelectedMonth(m.num)}
                  className={`py-3 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#C89A4B] text-[#1A1008] font-bold shadow-lg scale-105 border border-[#D6B06A]'
                      : 'bg-[#2E2015]/80 text-[#D3C5AE] hover:bg-[#3D2B1D] hover:text-[#F4E8D5] border border-[#C89A4B]/20'
                  }`}
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider opacity-80">{m.short}</span>
                  <span className="text-sm font-serif font-black">{m.num}</span>
                  {hasEvents && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6B06A] mt-1" />
                  )}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A1008] mt-1 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          <span className="text-xs font-mono text-[#D3C5AE] uppercase font-bold mr-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#D6B06A]" /> Filter Realm:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#FFF8EC] text-[#2A1E17] border border-[#C89A4B] shadow-md font-extrabold'
                  : 'bg-[#1A1008]/80 text-[#D3C5AE] border border-[#C89A4B]/30 hover:border-[#C89A4B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Cards Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#FFF8EC] text-[#2A1E17] rounded-2xl overflow-hidden border-2 border-[#C89A4B]/60 shadow-2xl flex flex-col justify-between card-journal group hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Event Photo Header */}
                <div className="relative h-56 overflow-hidden bg-[#2E2015]">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008]/90 via-transparent to-transparent pointer-events-none" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#1A1008]/90 text-[#D6B06A] text-[11px] font-mono font-bold uppercase tracking-widest border border-[#C89A4B] rounded-md shadow-md z-10">
                    {event.category}
                  </div>

                  {/* Country Badge */}
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#FFF8EC]/90 text-[#2A1E17] text-[11px] font-mono font-extrabold uppercase tracking-wider rounded-md border border-[#C89A4B]/50 z-10 shadow">
                    {event.country}
                  </div>

                  {/* Region & Peak Season */}
                  <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
                    <span className="text-[11px] font-mono font-bold text-[#D6B06A] uppercase tracking-wider block">
                      Peak: {event.peakMonthsText}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#FFF8EC] group-hover:text-[#D6B06A] transition-colors leading-tight">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Event Details Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#C89A4B] font-mono font-bold mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C89A4B]" />
                      <span>{event.region}</span>
                    </div>

                    <p className="text-[13px] text-[#5A4738] leading-relaxed line-clamp-3">
                      {event.summary}
                    </p>
                  </div>

                  {/* Animals / Key Elements Chips */}
                  <div>
                    <span className="text-[11px] font-mono uppercase font-bold text-[#5A4738] block mb-1.5">
                      Key Sightings & Focus:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {event.keyAnimals.map((animal) => (
                        <span
                          key={animal}
                          className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#F5E7D0] text-[#2A1E17] border border-[#C89A4B]/40 rounded-md"
                        >
                          {animal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating / Conditions Footer */}
                  <div className="pt-3 border-t border-[#C89A4B]/30 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-[#4F6848] font-bold">
                      <Sun className="w-3.5 h-3.5 text-[#C89A4B]" />
                      <span>{event.weather}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#2A1E17] bg-[#E8DCC8] px-2 py-0.5 rounded border border-[#C89A4B]/30">
                        <Binoculars className="w-3 h-3 text-[#C89A4B]" />
                        <span>{event.wildlifeRating}/5</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#2A1E17] bg-[#E8DCC8] px-2 py-0.5 rounded border border-[#C89A4B]/30">
                        <Camera className="w-3 h-3 text-[#C89A4B]" />
                        <span>{event.photographyRating}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => {
                      if (event.destinationId) {
                        navigateTo('destination-detail', event.destinationId);
                      } else {
                        navigateTo('itineraries');
                      }
                    }}
                    className="w-full btn-gold py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                  >
                    <span>Plan for {activeMonthInfo.short} →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state if filter turns up nothing for that month */
          <div className="text-center py-16 bg-[#1A1008]/80 rounded-2xl border-2 border-[#C89A4B]/40 p-8 space-y-4">
            <Binoculars className="w-12 h-12 text-[#D6B06A] mx-auto opacity-80" />
            <h3 className="text-xl font-serif font-bold text-[#F4E8D5]">
              No direct {categoryFilter} events logged for {activeMonthInfo.name}
            </h3>
            <p className="text-xs text-[#D3C5AE] max-w-md mx-auto">
              Try selecting another month along the timeline or clearing category filters to explore year-round wildlife viewing in Kenya, Tanzania, Uganda & Rwanda.
            </p>
            <button
              onClick={() => setCategoryFilter('All')}
              className="btn-gold text-xs py-2 px-4 rounded-lg font-bold uppercase cursor-pointer"
            >
              Reset Category Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
