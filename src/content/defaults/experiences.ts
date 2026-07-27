/**
 * Default Experiences/Activities Content
 * Premium safari experiences for East Africa
 */

import safariHeroImg from '../../assets/images/safari_hero_1784973880507.jpg';

export const DEFAULT_EXPERIENCES = [
  {
    id: 'exp-balloon-mara',
    name: 'Hot Air Balloon Sunrise Safari & Champagne Bush Breakfast',
    category: 'Air & Aerial' as const,
    durationHours: 3.5,
    costUSD: 520,
    description: 'Float silently above the Mara river plains at dawn as herds awaken, followed by a champagne breakfast cooked live in the bush.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-masai-mara',
    destinationName: 'Masai Mara, Kenya',
    highlights: ['Sunrise aerial game viewing', 'Live bush breakfast', 'Certificate of flight'],
    available: true,
  },
  {
    id: 'exp-gorilla-habituation',
    name: 'Full-Day Gorilla Habituation & Ranger Tracking Experience',
    category: 'Trekking & Primates' as const,
    durationHours: 7,
    costUSD: 1500,
    description: 'Accompany official mountain gorilla researchers and tracker rangers into Bwindi forest for 4 unforgettable hours with a wild gorilla family.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-bwindi',
    destinationName: 'Bwindi Forest, Uganda',
    highlights: ['4 hours with gorilla family', 'Research team access', 'Habituation experience'],
    available: true,
  },
  {
    id: 'exp-private-game-drive',
    name: 'Private 4x4 Off-Road Great Migration Predator Drive',
    category: 'Game Drive' as const,
    durationHours: 4,
    costUSD: 250,
    description: 'Custom open-sided 4x4 game drive tailored by an expert silver-level guide to track lion prides, cheetah hunts, and river crossings.',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-serengeti',
    destinationName: 'Serengeti, Tanzania',
    highlights: ['Expert guide', 'Off-road tracking', 'Customized route'],
    available: true,
  },
  {
    id: 'exp-crater-floor-picnic',
    name: 'Ngorongoro Crater Floor Safari & Private Hippo Pool Lunch',
    category: 'Bush Dining & Wellness' as const,
    durationHours: 6,
    costUSD: 320,
    description: 'Descend 600 meters into the volcanic caldera for black rhino sightings and an artisanal silver-service picnic at Lerai Forest.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-ngorongoro',
    destinationName: 'Ngorongoro Crater, Tanzania',
    highlights: ['UNESCO site', 'Rhino tracking', 'Private picnic'],
    available: true,
  },
  {
    id: 'exp-maasai-cultural',
    name: 'Maasai Warrior Cultural Immersion & Manyatta Eco-Visit',
    category: 'Cultural & Community' as const,
    durationHours: 2.5,
    costUSD: 120,
    description: 'Authentic interaction with Maasai elders and warriors, learning ancient herbal medicine, fire-making, and beadwork traditions.',
    image: safariHeroImg as unknown as string,
    destinationId: 'dest-masai-mara',
    destinationName: 'Masai Mara, Kenya',
    highlights: ['Traditional warrior dance', 'Beadwork workshop', 'Manyatta visit'],
    available: true,
  },
  {
    id: 'exp-sunset-dhow-cruise',
    name: 'Zanzibar Private Swahili Dhow Sunset Cruise & Seafood Grill',
    category: 'Water & Coastal' as const,
    durationHours: 3,
    costUSD: 210,
    description: 'Glide along Stone Town and Nungwi coastal waters on a handcrafted wooden dhow accompanied by fresh lobster, kingfish, and live Taarab music.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    destinationId: 'dest-zanzibar',
    destinationName: 'Zanzibar, Tanzania',
    highlights: ['Sunset views', 'Fresh seafood', 'Live music'],
    available: true,
  },
];

export const DEFAULT_ACTIVITIES = DEFAULT_EXPERIENCES;

export type DefaultExperience = typeof DEFAULT_EXPERIENCES[number];
