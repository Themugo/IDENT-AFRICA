/**
 * IDENT AFRICA - API Rate Limiting Middleware
 * Protects against abuse, DDoS, and ensures fair resource usage
 */

import rateLimit from 'express-rate-limit';

// Response helper
const rateLimitResponse = (retryAfter?: number) => ({
  success: false,
  error: 'Too many requests, please try again later',
  retryAfter,
});

// ==================== GENERAL API LIMITER ====================
// Standard rate limit for most API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: rateLimitResponse(),
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/api/health/';
  },
});

// ==================== AUTH LIMITER ====================
// Stricter rate limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(900), // 15 minutes in seconds
});

// ==================== SEARCH LIMITER ====================
// Rate limit for search operations
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(60),
});

// ==================== AI PLANNER LIMITER ====================
// Stricter limit for expensive AI operations
export const aiPlannerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 AI requests per minute (expensive operation)
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(60),
});

// ==================== BOOKING LIMITER ====================
// Rate limit for booking operations
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 booking attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(60),
});

// ==================== PAYMENT LIMITER ====================
// Rate limit for payment operations
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 payment attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(60),
});

// ==================== GENERAL UPLOAD LIMITER ====================
// Rate limit for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(60),
});

// ==================== CUSTOM LIMITER FACTORY ====================
interface CustomLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function createCustomLimiter(options: CustomLimiterOptions) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(Math.ceil(options.windowMs / 1000)),
  });
}

export default {
  apiLimiter,
  authLimiter,
  searchLimiter,
  aiPlannerLimiter,
  bookingLimiter,
  paymentLimiter,
  uploadLimiter,
  createCustomLimiter,
};
