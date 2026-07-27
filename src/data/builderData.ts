import { BuilderActivity, BuilderTransport, CustomBuilderItinerary } from '../types';

export const BUILDER_ACTIVITIES: BuilderActivity[] = [
  {
    id: 'act-balloon-mara',
    name: 'Hot Air Balloon Sunrise Safari & Champagne Bush Breakfast',
    category: 'Aerial Flight',
    durationHours: 3.5,
    costUSD: 480,
    description: 'Float silently above the Mara river plains at dawn as herds awaken, followed by a champagne breakfast cooked live in the bush.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-masai-mara'
  },
  {
    id: 'act-gorilla-habituation',
    name: 'Full-Day Gorilla Habituation & Ranger Tracking Experience',
    category: 'Primate Trek',
    durationHours: 7,
    costUSD: 1500,
    description: 'Accompany official mountain gorilla researchers and tracker rangers into Bwindi forest for 4 unforgettable hours with a wild gorilla family.',
    image: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-bwindi'
  },
  {
    id: 'act-private-game-drive',
    name: 'Private 4x4 Off-Road Great Migration Predator Drive',
    category: 'Game Drive',
    durationHours: 4,
    costUSD: 250,
    description: 'Custom open-sided 4x4 game drive tailored by an expert silver-level guide to track lion prides, cheetah hunts, and river crossings.',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-serengeti'
  },
  {
    id: 'act-crater-floor-picnic',
    name: 'Ngorongoro Crater Floor Safari & Private Hippo Pool Lunch',
    category: 'Bush Dining',
    durationHours: 6,
    costUSD: 320,
    description: 'Descend 600 meters into the volcanic caldera for black rhino sightings and an artisanal silver-service picnic at Lerai Forest.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-ngorongoro'
  },
  {
    id: 'act-maasai-cultural',
    name: 'Maasai Warrior Cultural Immersion & Manyatta Eco-Visit',
    category: 'Cultural',
    durationHours: 2.5,
    costUSD: 120,
    description: 'Authentic interaction with Maasai elders and warriors, learning ancient herbal medicine, fire-making, and beadwork traditions.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-masai-mara'
  },
  {
    id: 'act-sunset-dhow-cruise',
    name: 'Zanzibar Private Swahili Dhow Sunset Cruise & Seafood Grill',
    category: 'Water & Beach',
    durationHours: 3,
    costUSD: 210,
    description: 'Glide along Stone Town and Nungwi coastal waters on a handcrafted wooden dhow accompanied by fresh lobster, kingfish, and live Taarab music.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-zanzibar'
  }
];

export const MOCK_ACTIVITIES = BUILDER_ACTIVITIES;

export const BUILDER_TRANSPORTS: BuilderTransport[] = [
  {
    id: 'trans-bush-flight',
    name: 'Executive Bush Aircraft (Cessna 208 Grand Caravan)',
    type: 'Private Bush Flight',
    speedKmh: 310,
    baseCostUSD: 450,
    costPerKmUSD: 1.8,
    description: 'Direct airstrip-to-airstrip bush flight bypassing long overland road bumps with breathtaking aerial views.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'trans-land-cruiser',
    name: 'VIP Customized 4x4 Safari Land Cruiser (Pop-up Roof)',
    type: '4x4 Executive Land Cruiser',
    speedKmh: 65,
    baseCostUSD: 220,
    costPerKmUSD: 0.9,
    description: 'Heavy-duty 4x4 with fridge, inverter charging, binocular racks, and 360-degree pop-up photography hatch.',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'trans-helicopter',
    name: 'Airkenya Scenic Charter Helicopter (Eurocopter AS350)',
    type: 'Scenic Helicopter',
    speedKmh: 240,
    baseCostUSD: 1200,
    costPerKmUSD: 3.5,
    description: 'Ultra-luxury point-to-point door-airstrip transport for exclusive lodge helipads.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_TRANSPORTS = BUILDER_TRANSPORTS;

export const DESTINATION_DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  'dest-masai-mara': {
    'dest-serengeti': 280,
    'dest-ngorongoro': 390,
    'dest-amboseli': 340,
    'dest-bwindi': 860,
    'dest-zanzibar': 720,
  },
  'dest-serengeti': {
    'dest-masai-mara': 280,
    'dest-ngorongoro': 140,
    'dest-amboseli': 310,
    'dest-bwindi': 920,
  },
};

export const DEFAULT_SAMPLE_BUILDER_ITINERARY: CustomBuilderItinerary = {
  id: 'custom-itin-001',
  title: 'My Custom East Africa Grand Expedition',
  description: 'Tailored for peak Great Migration river crossings and luxury private canvas bush stays.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  travelersCount: 2,
  paxCount: 2,
  travelerName: 'Makena Kamau',
  startDate: new Date().toISOString().split('T')[0],
  totalDays: 4,
  totalCostUSD: 5430,
  totalDistanceKm: 520,
  totalTravelMinutes: 180,
  shareCode: 'IDENT-SAFARI-9821',
  items: [
    {
      id: 'item-1',
      type: 'destination',
      itemId: 'dest-masai-mara',
      title: 'Masai Mara National Reserve',
      subtitle: 'Kenya • Savanna & Plains',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      costUSD: 200,
      dayNumber: 1,
      order: 1,
      notes: 'Arrival at Keekorok Airstrip at 10:30 AM.'
    },
    {
      id: 'item-2',
      type: 'hotel',
      itemId: 'lodge-angama-mara',
      title: 'Angama Mara Luxury Lodge',
      subtitle: 'Luxury Tented Suite • Mara Triangle',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      costUSD: 2900,
      dayNumber: 1,
      order: 2,
      notes: 'Includes full board dining, private butler, and infinity pool access.'
    },
    {
      id: 'item-3',
      type: 'activity',
      itemId: 'act-balloon-mara',
      title: 'Dawn Hot Air Balloon & Champagne Bush Breakfast',
      subtitle: '3.5 Hours • Mara River Flight',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      costUSD: 960,
      durationHours: 3.5,
      dayNumber: 2,
      order: 1,
      notes: 'Pickup at 05:00 AM from lodge lobby.'
    },
    {
      id: 'item-4',
      type: 'transport',
      itemId: 'trans-bush-flight',
      title: 'Executive Bush Aircraft Flight',
      subtitle: 'Cessna Grand Caravan Flight',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      costUSD: 450,
      distanceKm: 240,
      estimatedTimeMin: 45,
      dayNumber: 3,
      order: 1
    }
  ]
};

export const INITIAL_CUSTOM_BUILDER_ITINERARY = DEFAULT_SAMPLE_BUILDER_ITINERARY;
