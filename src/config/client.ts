/**
 * IDENT AFRICA - Client Configuration
 * Frontend-specific configuration for Next.js
 */

export type Environment = 'development' | 'production' | 'test';

// =============================================================================
// ENVIRONMENT
// =============================================================================

export const env: Environment = (process.env.NEXT_PUBLIC_APP_ENV as Environment) || 
  (process.env.NODE_ENV as Environment) || 'development';

export const isDevelopment = env === 'development';
export const isProduction = env === 'production';
export const isTest = env === 'test';

// =============================================================================
// APP URLS
// =============================================================================

export const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000/admin';

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const endpoints = {
  // Auth
  login: `${apiUrl}/auth/login`,
  register: `${apiUrl}/auth/register`,
  logout: `${apiUrl}/auth/logout`,
  refresh: `${apiUrl}/auth/refresh`,
  forgotPassword: `${apiUrl}/auth/forgot-password`,
  resetPassword: `${apiUrl}/auth/reset-password`,
  verifyEmail: `${apiUrl}/auth/verify-email`,

  // Destinations
  destinations: `${apiUrl}/destinations`,
  destinationById: (id: string) => `${apiUrl}/destinations/${id}`,

  // Packages
  packages: `${apiUrl}/packages`,
  packageById: (id: string) => `${apiUrl}/packages/${id}`,
  packageSearch: `${apiUrl}/packages/search`,

  // Bookings
  bookings: `${apiUrl}/bookings`,
  bookingById: (id: string) => `${apiUrl}/bookings/${id}`,
  myBookings: `${apiUrl}/bookings/my`,

  // Payments
  payments: `${apiUrl}/payments`,
  paymentInitiate: `${apiUrl}/payments/initiate`,
  paymentCallback: `${apiUrl}/payments/callback`,
  mpesaCallback: `${apiUrl}/payments/mpesa/callback`,

  // AI Planner
  aiPlanner: `${apiUrl}/ai/planner`,
  aiSuggest: `${apiUrl}/ai/suggest`,

  // Suppliers
  suppliers: `${apiUrl}/suppliers`,
  supplierRegister: `${apiUrl}/suppliers/register`,
  supplierLogin: `${apiUrl}/suppliers/login`,

  // User Profile
  profile: `${apiUrl}/profile`,
  profileUpdate: `${apiUrl}/profile/update`,

  // Reviews
  reviews: `${apiUrl}/reviews`,
  packageReviews: (packageId: string) => `${apiUrl}/reviews/package/${packageId}`,

  // Loyalty
  loyalty: `${apiUrl}/loyalty`,
  loyaltyPoints: `${apiUrl}/loyalty/points`,
  loyaltyRewards: `${apiUrl}/loyalty/rewards`,

  // Sustainability
  sustainability: `${apiUrl}/sustainability`,
  carbonFootprint: `${apiUrl}/sustainability/carbon-footprint`,

  // Exchange Rates
  exchangeRates: `${apiUrl}/exchange-rates`,

  // Admin (for admin panel)
  admin: {
    dashboard: `${apiUrl}/admin/dashboard`,
    users: `${apiUrl}/admin/users`,
    suppliers: `${apiUrl}/admin/suppliers`,
    content: `${apiUrl}/admin/content`,
    bookings: `${apiUrl}/admin/bookings`,
    payments: `${apiUrl}/admin/payments`,
    reports: `${apiUrl}/admin/reports`,
    settings: `${apiUrl}/admin/settings`,
  },

  // Migration
  migration: {
    overview: `${apiUrl}/migration/overview`,
    bulkPublish: `${apiUrl}/migration/bulk-publish`,
    bulkUnpublish: `${apiUrl}/migration/bulk-unpublish`,
    bulkArchive: `${apiUrl}/migration/bulk-archive`,
    replaceImages: `${apiUrl}/migration/replace-images`,
    import: `${apiUrl}/migration/import`,
    history: `${apiUrl}/migration/history`,
  },

  // Monetization
  monetization: {
    commissions: `${apiUrl}/monetization/commissions`,
    subscriptions: `${apiUrl}/monetization/subscriptions`,
    plans: `${apiUrl}/monetization/subscriptions/plans`,
    promotions: `${apiUrl}/monetization/promotions`,
    placements: `${apiUrl}/monetization/promotions/placements`,
    revenue: `${apiUrl}/monetization/revenue`,
    revenueDashboard: `${apiUrl}/monetization/revenue/dashboard`,
    revenueAnalytics: `${apiUrl}/monetization/revenue/analytics`,
    revenueBreakdown: `${apiUrl}/monetization/revenue/breakdown`,
  },
};

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const features = {
  aiPlanner: process.env.NEXT_PUBLIC_FEATURE_AI_PLANNER !== 'false',
  mobilePayments: process.env.NEXT_PUBLIC_FEATURE_MOBILE_PAYMENTS !== 'false',
  referrals: process.env.NEXT_PUBLIC_FEATURE_REFERRALS !== 'false',
  loyalty: process.env.NEXT_PUBLIC_FEATURE_LOYALTY !== 'false',
  multiCurrency: process.env.NEXT_PUBLIC_FEATURE_MULTI_CURRENCY === 'true',
};

// =============================================================================
// MAP CONFIGURATION
// =============================================================================

export const maps = {
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
};

// =============================================================================
// CDN & MEDIA
// =============================================================================

export const cdn = {
  url: process.env.NEXT_PUBLIC_CDN_URL || appUrl,
  enabled: process.env.NEXT_PUBLIC_CDN_ENABLED === 'true',
};

// =============================================================================
// PAYMENT PUBLISHABLE KEYS
// =============================================================================

export const paymentKeys = {
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    enabled: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  flutterwave: {
    publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
    enabled: !!process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
  },
};

// =============================================================================
// DEFAULT CURRENCY
// =============================================================================

export const currency = {
  default: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
  supported: (process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES || 'USD,EUR,GBP,KES,TZS').split(','),
};

// =============================================================================
// APP INFO
// =============================================================================

export const appInfo = {
  name: 'IDENT AFRICA',
  tagline: 'Discover Africa\'s Finest Safari Experiences',
  description: 'Your premier platform for booking authentic African safari experiences',
  supportEmail: 'support@identafrical.com',
  supportPhone: '+254 700 123 456',
  website: 'www.identafrical.com',
  social: {
    facebook: 'https://facebook.com/identafrical',
    twitter: 'https://twitter.com/identafrical',
    instagram: 'https://instagram.com/identafrical',
  },
};

// =============================================================================
// ASSET URLS
// =============================================================================

export const assets = {
  logo: `${cdn.url}/images/logo.svg`,
  logoDark: `${cdn.url}/images/logo-dark.svg`,
  favicon: `${cdn.url}/images/favicon.ico`,
  placeholder: `${cdn.url}/images/placeholder.svg`,
  heroDefault: `${cdn.url}/images/hero-default.jpg`,
};

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

export const theme = {
  primaryColor: '#C89A4B', // Gold
  secondaryColor: '#3D2B1F', // Dark brown
  accentColor: '#D6B06A', // Light gold
  backgroundColor: '#F4E8D5', // Cream
  textColor: '#2E2015', // Dark text
  errorColor: '#DC2626',
  successColor: '#16A34A',
  warningColor: '#F59E0B',
};

// =============================================================================
// ANALYTICS
// =============================================================================

export const analytics = {
  googleAnalytics: {
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  },
  metaPixel: {
    enabled: !!process.env.NEXT_PUBLIC_META_PIXEL_ID,
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  },
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export const clientConfig = {
  env,
  isDevelopment,
  isProduction,
  isTest,
  appUrl,
  apiUrl,
  adminUrl,
  endpoints,
  features,
  maps,
  cdn,
  paymentKeys,
  currency,
  appInfo,
  assets,
  theme,
  analytics,
};

export default clientConfig;
