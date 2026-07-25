export type Country = 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';

export type LuxuryTier = 'Ultra-Luxe Canvas' | 'Eco Luxury Lodge' | 'Classic Safari Camp' | 'Bespoke Private Villa';

export type WildlifeFocus = 'The Big Five' | 'Great Wildebeest Migration' | 'Mountain Gorillas & Primates' | 'Flamingos & Birding' | 'Marine & Coral Reefs' | 'Predator Tracking';

export type NavigationPage = 
  | 'home' 
  | 'destinations' 
  | 'destination-detail' 
  | 'itineraries' 
  | 'itinerary-detail'
  | 'itinerary-builder'
  | 'hotels'
  | 'hotel-detail'
  | 'compare-hotels'
  | 'compare' 
  | 'ai-planner' 
  | 'user-dashboard' 
  | 'admin-dashboard'
  | 'supplier-portal'
  | 'supplier-register'
  | 'my-bookings';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'KES';

export type HotelCategory = 
  | 'Safari Lodge' 
  | 'Luxury Tented Camp' 
  | 'Bespoke Private Villa' 
  | 'Heritage Manor' 
  | 'Eco Beach Resort' 
  | 'Mountain Treehouse';

export interface RoomType {
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
}

export interface SeasonalRate {
  seasonName: string;
  monthRange: string;
  multiplier: number;
}

export interface LuxuryLodge {
  id: string;
  name: string;
  location: string;
  country: Country;
  tier: LuxuryTier;
  category: HotelCategory;
  rating: number;
  reviewsCount: number;
  pricePerNight: number; // Base rate per night USD
  ecoScore: number;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  roomTypes: RoomType[];
  seasonalRates?: SeasonalRate[];
  coordinates?: { lat: number; lng: number };
  checkInTime?: string;
  checkOutTime?: string;
  contactEmail?: string;
  contactPhone?: string;
  featured?: boolean;
}

export interface NearbyAttraction {
  id: string;
  name: string;
  type: 'River Crossing Point' | 'Cultural Village' | 'Volcanic Crater' | 'Waterfalls' | 'Marine Reef' | 'Airstrip / Heliport';
  distanceKm: number;
  description: string;
  image?: string;
}

export interface TravelTip {
  id: string;
  category: 'Packing' | 'Health & Visas' | 'Etiquette' | 'Best Photography' | 'Safety';
  title: string;
  content: string;
}

export interface DestinationWeather {
  currentTempC: number;
  condition: string;
  lowTempC: number;
  highTempC: number;
  humidity: number;
  rainfallMm: number;
  bestVisitingCondition: string;
  monthly: { month: string; tempC: number; rainfall: 'Low' | 'Moderate' | 'High' }[];
}

export interface ParkInfo {
  entryFeeUSD: number;
  vehicleFeeUSD: number;
  operatingHours: string;
  conservationStatus: string;
  totalAreaSqKm: number;
  rules: string[];
  rangerContact: string;
  emergencyHelpline: string;
  officialWebsite?: string;
}

export interface WildlifeInfoItem {
  id: string;
  species: string;
  sightingProbability: 'Guaranteed' | 'High' | 'Moderate' | 'Seasonal' | 'Rare';
  probabilityPercentage: number;
  description: string;
  bestSpottingTime: string;
}

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  country: Country;
  region: string;
  category: 'Savanna & Plains' | 'Crater & Highlands' | 'Impenetrable Forest' | 'Tropical Coast & Beach' | 'Alpine Mountain';
  image: string;
  heroImage?: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  startingPrice: number; // in USD per person
  durationDays: number;
  bestMonths: string[];
  wildlifeHighlights: WildlifeFocus[];
  bigFiveProbability: {
    lion: number;
    leopard: number;
    elephant: number;
    rhino: number;
    buffalo: number;
  };
  description: string;
  highlights: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  featured: boolean;
  ecoScore: number; // e.g. 9.8/10

  // Expanded Destination Management System attributes
  nearbyAttractions?: NearbyAttraction[];
  travelTips?: TravelTip[];
  weather?: DestinationWeather;
  parkInfo?: ParkInfo;
  wildlifeInfo?: WildlifeInfoItem[];
}

export interface SafariItinerary {
  id: string;
  title: string;
  subtitle: string;
  destinations: string[]; // Destination IDs or Names
  countries: Country[];
  durationDays: number;
  durationNights: number;
  priceUSD: number;
  luxuryTier: LuxuryTier;
  rating: number;
  reviewsCount: number;
  heroImage: string;
  wildlifeTags: WildlifeFocus[];
  includedInPrice: string[];
  excludedInPrice: string[];
  dayByDay: {
    day: number;
    title: string;
    location: string;
    description: string;
    accommodation: string;
    meals: string;
    activities: string[];
  }[];
  migrationSeasonMatch?: boolean;
  gameDrivesPerDay: number;
  transferType: 'Private 4x4 Land Cruiser' | 'Bush Charter Flight + 4x4' | 'Helicopter Transfer';
  cancellationPolicy: string;
  featured?: boolean;
}

export interface BookingAddon {
  id: string;
  name: string;
  priceUSD: number;
  perPerson: boolean;
  description: string;
  icon: string;
}

export type BookingType = 'Instant Booking' | 'Booking Request';

export type PaymentGateway = 'Stripe' | 'Flutterwave' | 'M-Pesa' | 'Bank Wire';

export type BookingStatus = 
  | 'Pending Approval' 
  | 'Confirmed' 
  | 'In Progress' 
  | 'Completed' 
  | 'Declined' 
  | 'Cancelled' 
  | 'Refund Requested' 
  | 'Refunded';

export type PaymentStatus = 
  | 'Unpaid' 
  | 'Deposit Paid (30%)' 
  | 'Paid in Full' 
  | 'Escrow Secured' 
  | 'Refund Pending' 
  | 'Refunded';

export interface RefundWorkflow {
  id: string;
  requestedAt: string;
  reason: 'Schedule Change' | 'Medical Emergency' | 'Weather & Geopolitical' | 'Service Issue' | 'Other';
  reasonDetails: string;
  requestedAmountUSD: number;
  approvedAmountUSD?: number;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  adminNotes?: string;
  processedAt?: string;
  refundMethod?: PaymentGateway;
  payoutAccount?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  bookingType: BookingType;
  itineraryId?: string;
  destinationId?: string;
  hotelId?: string;
  supplierId?: string;
  title: string;
  heroImage: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
  };
  totalPriceUSD: number;
  depositAmountUSD?: number;
  balanceDueUSD?: number;
  currency: Currency;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentGateway?: PaymentGateway;
  paymentReference?: string;
  mpesaPhoneNumber?: string;
  addonsSelected: string[];
  specialRequests?: string;
  createdAt: string;
  guideRangerName?: string;
  guideContact?: string;
  refundWorkflow?: RefundWorkflow;
  qrCodeUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'traveler' | 'admin' | 'ranger_partner' | 'supplier';
  avatar?: string;
  preferredCurrency: Currency;
  dietaryPreferences?: string;
  savedDestinationIds: string[];
  savedItineraryIds: string[];
  savedHotelIds: string[];
  comparedItineraryIds: string[];
  comparedHotelIds: string[];
  phone?: string;
  passportCountry?: string;
}

export interface AIPlanRequest {
  durationDays: number;
  budgetPerPersonUSD: number;
  travelersCount: number;
  startDate?: string;
  endDate?: string;
  travelMonth: string;
  countries: Country[];
  wildlifePriorities: WildlifeFocus[];
  luxuryLevel: LuxuryTier;
  interests?: string[];
  specialInterests: string;
}

export interface AIPlanResponse {
  tripTitle: string;
  overview: string;
  estimatedCostPerPerson: number;
  totalGroupCostUSD?: number;
  recommendedSeasonReasoning: string;
  countriesVisited: Country[];
  keyParks: string[];
  destinations?: {
    name: string;
    country: string;
    description: string;
    highlights: string[];
    bestTime: string;
    image?: string;
  }[];
  hotels?: {
    name: string;
    location: string;
    tier: string;
    roomType: string;
    amenities: string[];
    nightlyRateUSD: number;
    image?: string;
  }[];
  activities?: {
    title: string;
    category: string;
    duration: string;
    description: string;
    estCostUSD: number;
  }[];
  transport?: {
    type: string;
    routeSegment: string;
    details: string;
    estimatedHours: string;
  }[];
  costBreakdown?: {
    lodgingAndMealsUSD: number;
    parkPermitsAndConservationUSD: number;
    transportAndBushFlightsUSD: number;
    guidedActivitiesUSD: number;
    taxesAndEscrowUSD: number;
    totalCostUSD: number;
    costPerPersonUSD: number;
  };
  itineraryDays: {
    day: number;
    destinationName: string;
    country: Country;
    highlights: string[];
    suggestedLodge: string;
    activitySummary: string;
    morningActivity?: string;
    afternoonActivity?: string;
    eveningActivity?: string;
  }[];
  insiderConservationTip: string;
}

export interface AdminStats {
  totalRevenueUSD: number;
  activeExpeditionsCount: number;
  totalTravelersCount: number;
  verifiedRangersCount: number;
  popularParksCount: number;
  monthlyBookings: { month: string; bookings: number; revenueUSD: number }[];
}

export type TransportMode = 'Private 4x4 Land Cruiser' | 'Bush Charter Flight' | 'Helicopter Express' | 'Luxury Safari Van' | 'Private Sunset Dhow';

export interface TransportOption {
  id: string;
  name: string;
  mode: TransportMode;
  speedKmh: number;
  costPerKmUSD: number;
  baseFeeUSD: number;
  capacity: number;
  icon: string;
  image: string;
  description: string;
}

export interface ActivityOption {
  id: string;
  name: string;
  destinationId?: string;
  category: 'Game Drive' | 'Air & Aerial' | 'Cultural & Community' | 'Trekking & Primates' | 'Water & Coastal' | 'Bush Dining & Wellness';
  durationHours: number;
  costUSD: number;
  image: string;
  description: string;
  wildlifeTags?: WildlifeFocus[];
}

export type BuilderItemType = 'destination' | 'hotel' | 'activity' | 'transport';

export interface BuilderActivity {
  id: string;
  name: string;
  category: 'Game Drive' | 'Primate Trek' | 'Aerial Flight' | 'Cultural' | 'Water & Beach' | 'Bush Dining';
  durationHours: number;
  costUSD: number;
  description: string;
  image: string;
  destinationId?: string;
}

export interface BuilderTransport {
  id: string;
  name: string;
  type: 'Private Bush Flight' | '4x4 Executive Land Cruiser' | 'Scenic Helicopter' | 'Luxury Coastal Dhow';
  speedKmh: number;
  baseCostUSD: number;
  costPerKmUSD: number;
  description: string;
  image: string;
}

export interface BuilderItem {
  id: string;
  type: 'destination' | 'hotel' | 'activity' | 'transport';
  itemId: string;
  title: string;
  subtitle?: string;
  image?: string;
  costUSD: number;
  durationHours?: number;
  distanceKm?: number;
  estimatedTimeMin?: number;
  notes?: string;
  dayNumber: number;
  order: number;
}

export interface CustomBuilderItinerary {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  travelersCount: number;
  startDate: string;
  items: BuilderItem[];
  totalDays: number;
  totalCostUSD: number;
  totalDistanceKm: number;
  totalTravelMinutes: number;
  shareCode?: string;
  travelerName?: string;
  paxCount?: number;
}

// Supplier Portal Types
export type SupplierType = 'Hotel' | 'Tour Operator' | 'Transport Company' | 'Guide';

export type SupplierApprovalStatus = 'pending_approval' | 'approved' | 'rejected' | 'revisions_requested';

export interface SupplierFleetItem {
  id: string;
  name: string;
  mode: string;
  capacity: number;
  dailyRateUSD: number;
  availableCount: number;
  image: string;
}

export interface SupplierTourPackage {
  id: string;
  title: string;
  durationDays: number;
  pricePerPersonUSD: number;
  description: string;
}

export interface SupplierGuideProfile {
  kpsgaLevel: 'Bronze' | 'Silver' | 'Gold' | 'Master Tracker';
  languages: string[];
  dailyRateUSD: number;
  specialties: string[];
  yearsExperience: number;
}

export interface SupplierProfile {
  id: string;
  name: string; // Company Name or Guide Name
  type: SupplierType;
  email: string;
  phone: string;
  country: Country;
  region: string;
  address: string;
  logoOrAvatar: string;
  bannerImage: string;
  tagline: string;
  description: string;
  approvalStatus: SupplierApprovalStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;

  // Licenses & Compliance
  taxPinNumber: string;
  licenseNumber: string; // e.g. KTB/TALA License, KPSGA Badge Number, Air Operator Cert
  licenseDocumentName?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;

  // Rating & Performance Stats
  rating: number;
  reviewsCount: number;
  completedBookingsCount: number;
  commissionPercentage: number; // e.g., 15%

  // Bank & Payout Info
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
  mPesaTillNumber?: string;

  // Type-specific references
  linkedHotelId?: string;
  fleet?: SupplierFleetItem[];
  offeredTours?: SupplierTourPackage[];
  guideDetails?: SupplierGuideProfile;
}

export interface SupplierAvailabilitySlot {
  id: string;
  supplierId: string;
  date: string; // YYYY-MM-DD
  status: 'available' | 'blocked' | 'booked';
  overridePriceUSD?: number;
  availableCapacity: number;
  maxCapacity: number;
  notes?: string;
}

export interface SupplierPricingRule {
  id: string;
  supplierId: string;
  title: string;
  seasonType: 'High Season' | 'Peak Migration' | 'Green Season' | 'Standard';
  startDate: string;
  endDate: string;
  multiplier: number; // e.g., 1.25 (+25%)
  flatRateUSD?: number;
  minStayNights?: number;
}

export interface SupplierBooking {
  id: string;
  bookingRef: string;
  supplierId: string;
  supplierType: SupplierType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string; // e.g. "Angama Luxury Suite", "4x4 Land Cruiser Charter", "Private Guide Day"
  startDate: string;
  endDate: string;
  paxCount: number;
  totalGrossUSD: number;
  commissionUSD: number;
  netPayoutUSD: number;
  status: 'Pending Acceptance' | 'Confirmed' | 'In Progress' | 'Completed' | 'Declined' | 'Cancelled';
  paymentStatus: 'Escrow Secured' | 'Paid Out' | 'Pending';
  specialRequirements?: string;
  voucherCode: string;
  createdAt: string;
}


