/**
 * IDENT AFRICA - Web Vitals Monitoring
 * Tracks Core Web Vitals metrics for Lighthouse and UX optimization
 */

import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

// Web Vitals metrics interface
interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

// Metric thresholds (P75)
const METRIC_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Send metric to analytics
function sendToAnalytics(metric: WebVitalMetric) {
  const { name, value, rating, delta, id } = metric;
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(value),
      rating,
      delta: Math.round(delta),
      id,
    });
  }

  // Send to Vercel Analytics (if available)
  if (typeof window !== 'undefined' && 'va' in window) {
    const va = (window as unknown as { va: (cmd: string, data: object) => void }).va;
    va('event', {
      name: `web_vital_${name.toLowerCase()}`,
      value: Math.round(value),
      rating,
    });
  }

  // Send to custom analytics endpoint (optional)
  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (analyticsEndpoint) {
    fetch(analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: `web_vital_${name.toLowerCase()}`,
        value: Math.round(value),
        rating,
        delta: Math.round(delta),
        id,
        url: window.location.href,
        timestamp: Date.now(),
      }),
      keepalive: true, // Ensure delivery even if page unloads
    }).catch(() => {
      // Silently fail - analytics should not break UX
    });
  }

  // Report to console in production if poor rating
  if (rating === 'poor') {
    console.warn(`[Web Vitals] Poor ${name}: ${Math.round(value)}ms`);
  }
}

// Get rating based on thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = METRIC_THRESHOLDS[name as keyof typeof METRIC_THRESHOLDS];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Main reportWebVitals function
export function reportWebVitals() {
  // Largest Contentful Paint (LCP)
  onLCP((metric) => {
    const rating = getRating('LCP', metric.value);
    sendToAnalytics({ ...metric, rating });
  });

  // Cumulative Layout Shift (CLS)
  onCLS((metric) => {
    const rating = getRating('CLS', metric.value * 1000); // Convert to ms for consistency
    sendToAnalytics({ ...metric, rating });
  });

  // First Contentful Paint (FCP)
  onFCP((metric) => {
    const rating = getRating('FCP', metric.value);
    sendToAnalytics({ ...metric, rating });
  });

  // Time to First Byte (TTFB)
  onTTFB((metric) => {
    const rating = getRating('TTFB', metric.value);
    sendToAnalytics({ ...metric, rating });
  });

  // Interaction to Next Paint (INP) - new Core Web Vital (replaces FID)
  onINP((metric) => {
    const rating = getRating('INP', metric.value);
    sendToAnalytics({ ...metric, rating });
  });
}

// Hook version for React components
export function useWebVitals() {
  if (typeof window !== 'undefined') {
    reportWebVitals();
  }
}

export default reportWebVitals;
