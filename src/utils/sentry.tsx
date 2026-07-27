/**
 * IDENT AFRICA - Sentry Error Tracking Configuration
 * Comprehensive error monitoring and performance tracking
 */

import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';

// Sentry DSN - Replace with actual Sentry DSN from environment
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || 'https://example@sentry.io/example';

export const SENTRY_CONFIG = {
  dsn: SENTRY_DSN,
  environment: import.meta.env.MODE,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  
  // Sample rate for profiling - only capture 10% in production
  profilesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  
  // Enable session replay on 10% of sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Enable debug mode in development
  debug: !import.meta.env.PROD,
  
  // Ignore errors from these paths
  ignoreErrors: [
    // Browser extensions
    /Extension context invalidated/,
    /ResizeObserver loop/,
    /Non-Error promise rejection captured/,
    // Third-party scripts
    /fbevents/,
    /gtag/,
    /analytics/,
  ],
  
  // Allowlist for tracing
  allowUrls: [
    'localhost',
    'identafrica.com',
    /\.vercel\.app$/,
  ],
  
  // BeforeSend hook for filtering sensitive data
  beforeSend(event, hint) {
    // Don't send errors in development
    if (!import.meta.env.PROD) {
      console.log('[Sentry] Event captured:', event);
      return null;
    }
    
    // Filter out errors from third-party scripts
    const error = hint?.originalException;
    if (error instanceof Error && error.stack) {
      // Skip third-party script errors
      if (error.stack.includes('extension') || error.stack.includes('chrome-extension')) {
        return null;
      }
    }
    
    // Sanitize sensitive data
    if (event.user) {
      // Don't send PII
      delete event.user.email;
      delete event.user.username;
    }
    
    // Remove query params from URLs
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        url.search = '';
        event.request.url = url.toString();
      } catch {
        // Invalid URL, leave as-is
      }
    }
    
    return event;
  },
  
  // Enrich context with additional data
  initialScope: {
    tags: { version: import.meta.env.VITE_APP_VERSION || 'unknown' },
    user: {
      id: 'anonymous',
    },
    context: {
      app: {
        name: 'IDENT AFRICA',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      },
    },
  },
};

// Initialize Sentry with configuration
export function initializeSentry() {
  if (!SENTRY_CONFIG.dsn || SENTRY_CONFIG.dsn === 'https://example@sentry.io/example') {
    console.warn('[Sentry] DSN not configured. Error tracking disabled.');
    return;
  }
  
  Sentry.init({
    ...SENTRY_CONFIG,
    
    // Integrate React
    integrations: [
      browserTracingIntegration(),
      // Enable Session Replay for better debugging
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
      }),
    ],
  });
  
  console.log('[Sentry] Error tracking initialized');
}

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary(Sentry.ErrorBoundary, {
  fallback: ({ error, eventId, resetError }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1008] text-[#F4E8D5] p-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif mb-4">Something went wrong</h2>
        <p className="text-[#D3C5AE]/70 mb-6">
          We're sorry for the inconvenience. Our team has been notified.
        </p>
        {eventId && (
          <p className="text-xs text-[#D3C5AE]/50 mb-4">
            Reference: {eventId}
          </p>
        )}
        <button
          onClick={resetError}
          className="px-6 py-3 bg-[#C89A4B] text-[#1a1008] rounded-lg font-cinzel text-xs tracking-wider uppercase hover:bg-[#D6B06A] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  ),
});

// Helper function to capture custom errors
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper to capture custom messages
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

// Track user actions for better debugging
export function trackUserAction(action: string, properties?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    data: properties,
    level: 'info',
  });
}

// Set user context
export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email,
  });
}

// Clear user context (on logout)
export function clearUserContext() {
  Sentry.setUser(null);
}

// Export React imports needed for routing instrumentation
import React from 'react';
