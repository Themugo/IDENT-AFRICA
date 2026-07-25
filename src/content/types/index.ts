/**
 * Hybrid CMS Content Types
 * 
 * All content types include a source field indicating origin:
 * - "database" - Admin-created content from PostgreSQL
 * - "default" - Premium mock content as fallback
 */

export type ContentSource = 'database' | 'default';

/** Base content metadata */
export interface ContentMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isPublished: boolean;
}

/** Content item with source tracking */
export interface ContentItem<T> {
  id: string;
  source: ContentSource;
  data: T;
  metadata: ContentMetadata;
}

/** Hero section content */
export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  overlayOpacity: number;
}

export interface HeroContentItem extends ContentItem<HeroContent> {}

/** Homepage sections configuration */
export interface HomeSectionConfig {
  id: string;
  component: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface HomePageContent {
  hero: HeroContent;
  sections: HomeSectionConfig[];
  footer: {
    companyName: string;
    tagline: string;
    contactEmail: string;
    contactPhone: string;
    socialLinks: { platform: string; url: string }[];
  };
}

export interface HomePageContentItem extends ContentItem<HomePageContent> {}

/** Destination content */
export interface DestinationContent {
  id: string;
  name: string;
  tagline: string;
  country: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';
  region: string;
  category: 'Savanna & Plains' | 'Crater & Highlands' | 'Impenetrable Forest' | 'Tropical Coast & Beach' | 'Alpine Mountain';
  image: string;
  heroImage: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  durationDays: number;
  bestMonths: string[];
  wildlifeHighlights: string[];
  bigFiveProbability: {
    lion: number;
    leopard: number;
    elephant: number;
    rhino: number;
    buffalo: number;
  };
  description: string;
  highlights: string[];
  coordinates: { lat: number; lng: number };
  featured: boolean;
  ecoScore: number;
  weather?: {
    currentTempC: number;
    condition: string;
    lowTempC: number;
    highTempC: number;
    humidity: number;
    rainfallMm: number;
    bestVisitingCondition: string;
    monthly: { month: string; tempC: number; rainfall: 'Low' | 'Moderate' | 'High' }[];
  };
  parkInfo?: {
    entryFeeUSD: number;
    vehicleFeeUSD: number;
    operatingHours: string;
    conservationStatus: string;
    totalAreaSqKm: number;
    rules: string[];
    rangerContact: string;
    emergencyHelpline: string;
    officialWebsite?: string;
  };
  wildlifeInfo?: Array<{
    id: string;
    species: string;
    sightingProbability: 'Guaranteed' | 'High' | 'Moderate' | 'Seasonal' | 'Rare';
    probabilityPercentage: number;
    description: string;
    bestSpottingTime: string;
  }>;
  nearbyAttractions?: Array<{
    id: string;
    name: string;
    type: string;
    distanceKm: number;
    description: string;
    image?: string;
  }>;
  travelTips?: Array<{
    id: string;
    category: 'Packing' | 'Health & Visas' | 'Etiquette' | 'Best Photography' | 'Safety';
    title: string;
    content: string;
  }>;
}

export interface DestinationContentItem extends ContentItem<DestinationContent> {}

/** Hotel/Lodge content */
export interface HotelContent {
  id: string;
  name: string;
  location: string;
  country: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';
  tier: 'Ultra-Luxe Canvas' | 'Eco Luxury Lodge' | 'Classic Safari Camp' | 'Bespoke Private Villa';
  category: 'Safari Lodge' | 'Luxury Tented Camp' | 'Bespoke Private Villa' | 'Heritage Manor' | 'Eco Beach Resort' | 'Mountain Treehouse';
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  ecoScore: number;
  image: string;
  heroImage?: string;
  gallery: string[];
  description: string;
  amenities: string[];
  roomTypes: Array<{
    id: string;
    name: string;
    description: string;
    sizeSqFt: number;
    bedType: string;
    maxOccupancy: number;
    pricePerNight: number;
    image: string;
    amenities: string[];
    availableRooms: number;
  }>;
  seasonalRates?: Array<{
    seasonName: string;
    monthRange: string;
    multiplier: number;
  }>;
  coordinates?: { lat: number; lng: number };
  checkInTime?: string;
  checkOutTime?: string;
  contactEmail?: string;
  contactPhone?: string;
  featured?: boolean;
}

export interface HotelContentItem extends ContentItem<HotelContent> {}

/** Safari package/itinerary content */
export interface PackageContent {
  id: string;
  title: string;
  subtitle: string;
  destinations: string[];
  countries: ('Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda')[];
  durationDays: number;
  durationNights: number;
  priceUSD: number;
  luxuryTier: 'Ultra-Luxe Canvas' | 'Eco Luxury Lodge' | 'Classic Safari Camp' | 'Bespoke Private Villa';
  rating: number;
  reviewsCount: number;
  heroImage: string;
  wildlifeTags: string[];
  includedInPrice: string[];
  excludedInPrice: string[];
  dayByDay: Array<{
    day: number;
    title: string;
    location: string;
    description: string;
    accommodation: string;
    meals: string;
    activities: string[];
  }>;
  migrationSeasonMatch?: boolean;
  gameDrivesPerDay: number;
  transferType: 'Private 4x4 Land Cruiser' | 'Bush Charter Flight + 4x4' | 'Helicopter Transfer';
  cancellationPolicy: string;
  featured?: boolean;
}

export interface PackageContentItem extends ContentItem<PackageContent> {}

/** Experience/Activity content */
export interface ExperienceContent {
  id: string;
  name: string;
  category: 'Game Drive' | 'Air & Aerial' | 'Cultural & Community' | 'Trekking & Primates' | 'Water & Coastal' | 'Bush Dining & Wellness';
  durationHours: number;
  costUSD: number;
  description: string;
  image: string;
  destinationId?: string;
  destinationName?: string;
  highlights?: string[];
  available?: boolean;
}

export interface ExperienceContentItem extends ContentItem<ExperienceContent> {}

/** Testimonial/Review content */
export interface TestimonialContent {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  safariPackage: string;
  travelDate: string;
  featured: boolean;
}

export interface TestimonialContentItem extends ContentItem<TestimonialContent> {}

/** Partner/Affiliate content */
export interface PartnerContent {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  type: 'airline' | 'hotel_chain' | 'tour_operator' | 'conservation' | 'government' | 'media';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  featured: boolean;
}

export interface PartnerContentItem extends ContentItem<PartnerContent> {}

/** Gallery item content */
export interface GalleryContent {
  id: string;
  title: string;
  description: string;
  image: string;
  thumbnail: string;
  category: 'wildlife' | 'landscape' | 'accommodation' | 'experience' | 'culture' | 'aerial';
  location?: string;
  photographer?: string;
  featured: boolean;
}

export interface GalleryContentItem extends ContentItem<GalleryContent> {}

/** Blog/News post content */
export interface BlogContent {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  coverImage: string;
  category: 'conservation' | 'travel_guide' | 'wildlife' | 'culture' | 'news' | 'promotion';
  tags: string[];
  publishedAt: string;
  readTimeMinutes: number;
  featured: boolean;
}

export interface BlogContentItem extends ContentItem<BlogContent> {}

/** Addon/Extra content */
export interface AddonContent {
  id: string;
  name: string;
  priceUSD: number;
  perPerson: boolean;
  description: string;
  icon: string;
  category: string;
  available: boolean;
}

export interface AddonContentItem extends ContentItem<AddonContent> {}

/** Content resolution result */
export interface ContentResolution<T> {
  items: ContentItem<T>[];
  total: number;
  sources: {
    database: number;
    default: number;
  };
  hasDatabaseContent: boolean;
}

/** Single item resolution */
export interface SingleItemResolution<T> {
  item: ContentItem<T> | null;
  source: ContentSource;
  found: boolean;
}
