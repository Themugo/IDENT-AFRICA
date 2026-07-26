/**
 * IDENT AFRICA - Configuration Service
 * Centralized configuration management for all environments
 */

import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv();

// =============================================================================
// ENVIRONMENT DETECTION
// =============================================================================

export type Environment = 'development' | 'production' | 'test';

export const env: Environment = (process.env.NODE_ENV as Environment) || 'development';

export const isDevelopment = env === 'development';
export const isProduction = env === 'production';
export const isTest = env === 'test';

// =============================================================================
// APP CONFIGURATION
// =============================================================================

export const app = {
  name: 'IDENT AFRICA',
  version: process.env.APP_VERSION || '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000/admin',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  environment: env,
};

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const api = {
  prefix: '/api',
  version: 'v1',
  timeout: 30000,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  },
};

// =============================================================================
// AUTHENTICATION CONFIGURATION
// =============================================================================

export const auth = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRY || '24h',
    refreshExpiresIn: '7d',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
    timeout: parseInt(process.env.SESSION_TIMEOUT || '86400', 10), // 24 hours
  },
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    historyCount: parseInt(process.env.PASSWORD_HISTORY_COUNT || '5', 10),
    resetExpiry: parseInt(process.env.PASSWORD_RESET_EXPIRY || '3600', 10), // 1 hour
  },
  bruteForce: {
    maxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOGIN_LOCKOUT_DURATION || '900', 10), // 15 minutes
    ipBlockThreshold: parseInt(process.env.IP_BLOCK_THRESHOLD || '20', 10),
  },
};

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

export const database = {
  url: process.env.DATABASE_URL || '',
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMs: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000', 10),
  },
  ssl: isProduction,
};

// =============================================================================
// STORAGE CONFIGURATION
// =============================================================================

export const storage = {
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'ident-africa',
  },
  cdn: {
    url: process.env.CDN_URL || '',
    enabled: process.env.CDN_ENABLED === 'true',
  },
};

// =============================================================================
// AI CONFIGURATION
// =============================================================================

export const ai = {
  provider: 'gemini' as const,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2000', 10),
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
  },
  planner: {
    enabled: process.env.AI_PLANNER_ENABLED !== 'false',
    maxDestinations: parseInt(process.env.AI_MAX_DESTINATIONS || '10', 10),
    timeout: parseInt(process.env.AI_PLANNING_TIMEOUT || '30000', 10), // 30 seconds
  },
};

// =============================================================================
// PAYMENT CONFIGURATION
// =============================================================================

export const payments = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.STRIPE_CURRENCY || 'USD',
    enabled: !!process.env.STRIPE_SECRET_KEY,
  },
  flutterwave: {
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET || '',
    enabled: !!process.env.FLUTTERWAVE_SECRET_KEY,
  },
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    shortcode: process.env.MPESA_SHORTCODE || '',
    passkey: process.env.MPESA_PASSKEY || '',
    callbackUrl: process.env.MPESA_CALLBACK_URL || '',
    env: (process.env.MPESA_ENV || 'sandbox') as 'sandbox' | 'live',
    enabled: !!process.env.MPESA_CONSUMER_KEY,
  },
};

// =============================================================================
// MONETIZATION CONFIGURATION
// =============================================================================

export const monetization = {
  commission: {
    defaultRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE || '15'),
    minAmount: parseFloat(process.env.COMMISSION_MIN_AMOUNT || '0'),
    maxAmount: parseFloat(process.env.COMMISSION_MAX_AMOUNT || '1000'),
  },
  subscription: {
    freePlanEnabled: process.env.FREE_PLAN_ENABLED !== 'false',
    trialDays: parseInt(process.env.TRIAL_DAYS || '14', 10),
  },
};

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const features = {
  aiPlanner: process.env.FEATURE_AI_PLANNER !== 'false',
  mobilePayments: process.env.FEATURE_MOBILE_PAYMENTS !== 'false',
  referrals: process.env.FEATURE_REFERRALS !== 'false',
  loyalty: process.env.FEATURE_LOYALTY !== 'false',
  advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS !== 'false',
  multiCurrency: process.env.BETA_MULTI_CURRENCY === 'true',
  subscriptionPlans: process.env.BETA_SUBSCRIPTION_PLANS === 'true',
};

// =============================================================================
// MONITORING CONFIGURATION
// =============================================================================

export const monitoring = {
  logLevel: process.env.LOG_LEVEL || 'info',
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: env,
  },
  errorTracking: !!process.env.SENTRY_DSN,
};

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

export const cache = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    tls: process.env.REDIS_TLS === 'true',
  },
  ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
};

// =============================================================================
// EMAIL CONFIGURATION
// =============================================================================

export const email = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@identafrical.com',
    fromName: process.env.EMAIL_FROM_NAME || 'IDENT AFRICA',
  },
  support: process.env.EMAIL_SUPPORT || 'support@identafrical.com',
};

// =============================================================================
// IMAGE OPTIMIZATION
// =============================================================================

export const images = {
  allowedTypes: (process.env.IMAGE_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || '2000', 10),
  quality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
};

// =============================================================================
// DEVELOPMENT CONFIGURATION
// =============================================================================

export const dev = {
  debug: process.env.ENABLE_DEBUG === 'true',
  swagger: process.env.ENABLE_SWAGGER !== 'false',
  seedData: process.env.ENABLE_SEED_DATA !== 'false',
};

// =============================================================================
// VALIDATION
// =============================================================================

export function validateConfig(): string[] {
  const errors: string[] = [];

  if (isProduction) {
    // Required in production
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change')) {
      errors.push('JWT_SECRET must be set in production');
    }
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('change')) {
      errors.push('SESSION_SECRET must be set in production');
    }
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL must be set in production');
    }
  }

  return errors;
}

// =============================================================================
// EXPORT ALL CONFIG
// =============================================================================

export const config = {
  env,
  isDevelopment,
  isProduction,
  isTest,
  app,
  api,
  auth,
  database,
  storage,
  ai,
  payments,
  monetization,
  features,
  monitoring,
  cache,
  email,
  images,
  dev,
};

export default config;
