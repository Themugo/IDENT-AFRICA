/**
 * CMS Types for IDENT AFRICA
 * Defines all content types for the visual CMS
 */

// ============ HOMEPAGE CMS ============

export interface CMSHeroContent {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  overlayOpacity: number;
  isActive: boolean;
}

export interface CMSSectionConfig {
  id: string;
  component: string;
  title: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
  // Component-specific settings
  settings?: Record<string, unknown>;
}

export interface CMSFooterConfig {
  companyName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  socialLinks: {
    platform: string;
    url: string;
    icon?: string;
  }[];
}

export interface CMSHomepageConfig {
  id: string;
  hero: CMSHeroContent;
  sections: CMSSectionConfig[];
  footer: CMSFooterConfig;
  updatedAt: string;
  updatedBy: string;
}

// ============ THEME CMS ============

export interface CMSTypography {
  headingFont: string;
  bodyFont: string;
  fontWeights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface CMSColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface CMSButtonStyle {
  borderRadius: string;
  paddingX: string;
  paddingY: string;
  fontSize: string;
  fontWeight: string;
  transition: string;
  shadow: string;
  shadowHover: string;
}

export interface CMSSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface CMSThemeConfig {
  id: string;
  logo: {
    url: string;
    alt: string;
    width: string;
    height: string;
  };
  favicon: string;
  colors: CMSColors;
  typography: CMSTypography;
  button: CMSButtonStyle;
  spacing: CMSSpacing;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  updatedAt: string;
  updatedBy: string;
}

// ============ MEDIA CMS ============

export interface CMSMediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  tags: string[];
  folder?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface CMSMediaFolder {
  id: string;
  name: string;
  path: string;
  itemCount: number;
  createdAt: string;
}

export interface CMSMediaUpload {
  file: File;
  folder?: string;
  alt?: string;
  tags?: string[];
}

// ============ DESTINATION CMS ============

export interface CMSDestinationMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface CMSDestination {
  id: string;
  // Basic Info
  name: string;
  tagline: string;
  country: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';
  region: string;
  category: 'Savanna & Plains' | 'Crater & Highlands' | 'Impenetrable Forest' | 'Tropical Coast & Beach' | 'Alpine Mountain';
  
  // Media
  image: string;
  heroImage: string;
  gallery: string[];
  
  // Content
  description: string;
  highlights: string[];
  
  // Stats
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  durationDays: number;
  
  // Metadata
  wildlifeHighlights: string[];
  bestMonths: string[];
  coordinates: { lat: number; lng: number };
  featured: boolean;
  ecoScore: number;
  isActive: boolean;
  
  // SEO
  seo: CMSDestinationMeta;
  
  // System
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ ACCOMMODATION CMS ============

export interface CMSRoomType {
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
  isActive: boolean;
}

export interface CMSSaisonRate {
  id: string;
  seasonName: string;
  monthRange: string;
  multiplier: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CMSAccommodation {
  id: string;
  // Basic Info
  name: string;
  location: string;
  country: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';
  tier: 'Ultra-Luxe Canvas' | 'Eco Luxury Lodge' | 'Classic Safari Camp' | 'Bespoke Private Villa';
  category: 'Safari Lodge' | 'Luxury Tented Camp' | 'Bespoke Private Villa' | 'Heritage Manor' | 'Eco Beach Resort' | 'Mountain Treehouse';
  
  // Media
  image: string;
  heroImage?: string;
  gallery: string[];
  
  // Content
  description: string;
  amenities: string[];
  
  // Pricing
  basePricePerNight: number;
  seasonalRates: CMSSaisonRate[];
  
  // Rooms
  roomTypes: CMSRoomType[];
  
  // Stats
  rating: number;
  reviewsCount: number;
  ecoScore: number;
  
  // Details
  coordinates?: { lat: number; lng: number };
  checkInTime?: string;
  checkOutTime?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Status
  featured: boolean;
  isActive: boolean;
  
  // System
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ EXPERIENCE CMS ============

export interface CMSExperience {
  id: string;
  // Basic Info
  name: string;
  category: 'Game Drive' | 'Air & Aerial' | 'Cultural & Community' | 'Trekking & Primates' | 'Water & Coastal' | 'Bush Dining & Wellness';
  
  // Media
  image: string;
  
  // Content
  description: string;
  highlights?: string[];
  
  // Details
  durationHours: number;
  costUSD: number;
  
  // Links
  destinationId?: string;
  destinationName?: string;
  
  // Status
  featured: boolean;
  available: boolean;
  isActive: boolean;
  
  // System
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ PACKAGE CMS ============

export interface CMSPackageDay {
  day: number;
  title: string;
  location: string;
  description: string;
  accommodation: string;
  meals: string;
  activities: string[];
}

export interface CMSPackage {
  id: string;
  // Basic Info
  title: string;
  subtitle: string;
  destinations: string[];
  countries: ('Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda')[];
  
  // Media
  heroImage: string;
  
  // Content
  description: string;
  dayByDay: CMSPackageDay[];
  
  // Pricing
  priceUSD: number;
  includedInPrice: string[];
  excludedInPrice: string[];
  
  // Details
  durationDays: number;
  durationNights: number;
  luxuryTier: 'Ultra-Luxe Canvas' | 'Eco Luxury Lodge' | 'Classic Safari Camp' | 'Bespoke Private Villa';
  wildlifeTags: string[];
  gameDrivesPerDay: number;
  transferType: 'Private 4x4 Land Cruiser' | 'Bush Charter Flight + 4x4' | 'Helicopter Transfer';
  cancellationPolicy: string;
  migrationSeasonMatch?: boolean;
  
  // Stats
  rating: number;
  reviewsCount: number;
  
  // Status
  featured: boolean;
  isActive: boolean;
  
  // System
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ TESTIMONIAL CMS ============

export interface CMSTestimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  safariPackage?: string;
  travelDate?: string;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ PARTNER CMS ============

export interface CMSPartner {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  type: 'airline' | 'hotel_chain' | 'tour_operator' | 'conservation' | 'government' | 'media';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ ADDON CMS ============

export interface CMSAddon {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  perPerson: boolean;
  icon: string;
  category: string;
  available: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ CMS API RESPONSE ============

export interface CMSApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface CMSPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ CMS EDITOR STATE ============

export interface CMSEditorState {
  activeTab: 'homepage' | 'destinations' | 'accommodation' | 'experiences' | 'packages' | 'testimonials' | 'partners' | 'media' | 'theme';
  selectedItemId?: string;
  isEditing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  previewMode: boolean;
}
