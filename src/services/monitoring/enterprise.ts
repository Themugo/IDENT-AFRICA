/**
 * IDENT AFRICA - Enterprise Monitoring & Security Service
 * Comprehensive observability, alerting, and security monitoring
 */

import { logger, LogLevel, LogCategory } from './logger';

// ==================== METRICS COLLECTOR ====================
interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-flush metrics every 60 seconds
    if (typeof setInterval !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), 60000);
    }
  }

  // Counter - increments by 1 or specified value
  increment(name: string, tags: Record<string, string> = {}): void {
    const key = this.makeKey(name, tags);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  // Gauge - set absolute value
  gauge(name: string, value: number, tags: Record<string, string> = {}): void {
    const key = this.makeKey(name, tags);
    this.gauges.set(key, value);
  }

  // Histogram - record timing/value
  histogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const key = this.makeKey(name, tags);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    const values = this.histograms.get(key)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }

  // Timer - returns function to call when done
  timer(name: string, tags: Record<string, string> = {}): () => void {
    const start = Date.now();
    return () => {
      this.histogram(name, Date.now() - start, tags);
    };
  }

  private makeKey(name: string, tags: Record<string, string>): string {
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return tagStr ? `${name}{${tagStr}}` : name;
  }

  // Get aggregated metrics
  getMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, { count: number; min: number; max: number; avg: number; p50: number; p95: number; p99: number }>;
  } {
    const counters: Record<string, number> = {};
    const gauges: Record<string, number> = {};
    const histograms: Record<string, any> = {};

    this.counters.forEach((value, key) => {
      counters[key] = value;
    });

    this.gauges.forEach((value, key) => {
      gauges[key] = value;
    });

    this.histograms.forEach((values, key) => {
      if (values.length === 0) return;
      
      const sorted = [...values].sort((a, b) => a - b);
      const count = values.length;
      const sum = values.reduce((a, b) => a + b, 0);
      
      histograms[key] = {
        count,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: sum / count,
        p50: sorted[Math.floor(count * 0.5)],
        p95: sorted[Math.floor(count * 0.95)],
        p99: sorted[Math.floor(count * 0.99)],
      };
    });

    return { counters, gauges, histograms };
  }

  // Flush metrics to external service
  private flush(): void {
    const metrics = this.getMetrics();
    
    // Log metrics summary
    logger.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: LogCategory.PERFORMANCE,
      message: 'Metrics flush',
      metadata: metrics,
    });

    // Send to external monitoring (Sentry, Datadog, etc.)
    this.sendToExternalMonitoring(metrics);
  }

  private sendToExternalMonitoring(metrics: any): void {
    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && 'va' in window) {
      const va = (window as any).va;
      // Custom metrics can be sent to analytics
    }

    // Send to custom metrics endpoint
    const metricsEndpoint = import.meta.env.VITE_METRICS_ENDPOINT;
    if (metricsEndpoint) {
      fetch(metricsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metrics,
          service: 'ident-africa',
          environment: import.meta.env.MODE,
          timestamp: Date.now(),
        }),
        keepalive: true,
      }).catch(() => {});
    }
  }
}

export const metrics = new MetricsCollector();

// ==================== SECURITY MONITOR ====================
interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'suspicious_activity' | 'cors_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  userId?: string;
  requestId?: string;
  details: Record<string, any>;
  timestamp: string;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;

  // Track authentication failures
  trackAuthFailure(ip: string, email: string, reason: string): void {
    this.recordEvent({
      type: 'auth_failure',
      severity: reason.includes('brute') ? 'high' : 'medium',
      ip,
      details: { email: this.maskEmail(email), reason },
      timestamp: new Date().toISOString(),
    });

    logger.logSecurityEvent('Auth failure', { ip, reason });
  }

  // Track rate limiting
  trackRateLimit(ip: string, endpoint: string, limit: number): void {
    this.recordEvent({
      type: 'rate_limit',
      severity: 'low',
      ip,
      details: { endpoint, limit },
      timestamp: new Date().toISOString(),
    });

    metrics.increment('security.rate_limit', { endpoint });
  }

  // Track invalid input
  trackInvalidInput(ip: string, field: string, reason: string): void {
    this.recordEvent({
      type: 'invalid_input',
      severity: 'low',
      ip,
      details: { field, reason },
      timestamp: new Date().toISOString(),
    });

    metrics.increment('security.invalid_input', { field });
  }

  // Track suspicious activity
  trackSuspiciousActivity(ip: string, description: string, metadata: any): void {
    this.recordEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip,
      details: { description, ...metadata },
      timestamp: new Date().toISOString(),
    });

    logger.logSecurityEvent('Suspicious activity', { ip, description });

    // Alert on suspicious activity
    this.alert('critical', 'Suspicious Activity Detected', { ip, description });
  }

  // Track CORS violations
  trackCorsViolation(origin: string, endpoint: string): void {
    this.recordEvent({
      type: 'cors_violation',
      severity: 'medium',
      ip: origin,
      details: { origin: this.maskOrigin(origin), endpoint },
      timestamp: new Date().toISOString(),
    });

    metrics.increment('security.cors_violation', { endpoint });
  }

  private recordEvent(event: SecurityEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Write to secure audit log
    logger.writeLog({
      timestamp: event.timestamp,
      level: event.severity === 'critical' ? LogLevel.FATAL : 
             event.severity === 'high' ? LogLevel.ERROR : LogLevel.WARN,
      category: LogCategory.SECURITY,
      message: `Security event: ${event.type}`,
      metadata: event.details,
    });
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    return `${local[0]}***${local[-1]}@${domain}`;
  }

  private maskOrigin(origin: string): string {
    try {
      const url = new URL(origin);
      return `${url.protocol}//${url.hostname.slice(0, 3)}***`;
    } catch {
      return '***';
    }
  }

  private alert(severity: string, message: string, metadata: any): void {
    // In production, this would send to alerting service
    if (import.meta.env.PROD) {
      console.error(`[ALERT:${severity.toUpperCase()}] ${message}`, metadata);
    }
  }

  // Get recent security events
  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  // Get security summary
  getSummary(): {
    last24h: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recent = this.events.filter(e => new Date(e.timestamp).getTime() > last24h);

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    recent.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    });

    return {
      last24h: recent.length,
      byType,
      bySeverity,
    };
  }
}

export const securityMonitor = new SecurityMonitor();

// ==================== PERFORMANCE MONITOR ====================
class PerformanceMonitor {
  private observations: Map<string, number[]> = new Map();

  // Observe Core Web Vitals
  observeVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor'): void {
    if (!this.observations.has(name)) {
      this.observations.set(name, []);
    }
    this.observations.get(name)!.push(value);

    // Keep last 100 observations
    const values = this.observations.get(name)!;
    if (values.length > 100) values.shift();

    // Log poor performance
    if (rating === 'poor') {
      logger.logPerformance(`${name}:${rating}`, value);
    }

    metrics.histogram(`vitals.${name}`, value, { rating });
  }

  // Get vital statistics
  getVitalStats(name: string): { p50: number; p90: number; p95: number; count: number } | null {
    const values = this.observations.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;

    return {
      p50: sorted[Math.floor(count * 0.5)],
      p90: sorted[Math.floor(count * 0.9)],
      p95: sorted[Math.floor(count * 0.95)],
      count,
    };
  }

  // Get all vitals summary
  getVitalsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    this.observations.forEach((_, name) => {
      summary[name] = this.getVitalStats(name);
    });

    return summary;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ==================== ENTERPRISE MONITORING ====================
export interface EnterpriseMonitor {
  metrics: typeof metrics;
  security: typeof securityMonitor;
  performance: typeof performanceMonitor;
  logger: typeof logger;
}

export const enterpriseMonitor: EnterpriseMonitor = {
  metrics,
  security: securityMonitor,
  performance: performanceMonitor,
  logger,
};

// Export individual components
export { metrics } from './enterprise';
export { securityMonitor } from './enterprise';
export { performanceMonitor } from './enterprise';
