/**
 * IDENT AFRICA - Performance Monitoring Service
 * Track page speed, API response times, and database performance
 */

import { logger } from './logger.js';

export interface PerformanceMetrics {
  pageLoadTime?: number;
  apiResponseTime?: number;
  databaseQueryTime?: number;
  timestamp: string;
  endpoint?: string;
  userId?: string;
}

export interface APIPerformance {
  method: string;
  path: string;
  avgResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalRequests: number;
  errorRate: number;
  lastUpdated: string;
}

export interface DatabaseMetrics {
  avgQueryTime: number;
  slowQueries: QueryRecord[];
  totalQueries: number;
  connectionPool: {
    used: number;
    available: number;
    waiting: number;
  };
}

export interface QueryRecord {
  query: string;
  duration: number;
  timestamp: string;
  success: boolean;
}

// In-memory performance tracking
class PerformanceMonitor {
  private apiMetrics: Map<string, number[]> = new Map();
  private databaseMetrics: number[] = [];
  private slowQueries: QueryRecord[] = [];
  private maxSlowQueries = 100;
  private slowQueryThreshold = 1000; // 1 second

  constructor() {
    this.startPeriodicCleanup();
  }

  // Track API performance
  trackApiPerformance(endpoint: string, responseTime: number, statusCode: number): void {
    const key = endpoint;
    const times = this.apiMetrics.get(key) || [];
    times.push(responseTime);
    
    // Keep last 1000 measurements per endpoint
    if (times.length > 1000) {
      times.shift();
    }
    
    this.apiMetrics.set(key, times);

    // Log slow API calls
    if (responseTime > 2000) {
      logger.logPerformance(`API: ${endpoint}`, responseTime, {
        statusCode,
        slow: true,
      });
    }
  }

  // Track database performance
  trackDatabasePerformance(query: string, duration: number, success: boolean): void {
    this.databaseMetrics.push(duration);
    
    // Keep last 1000 measurements
    if (this.databaseMetrics.length > 1000) {
      this.databaseMetrics.shift();
    }

    // Track slow queries
    if (duration > this.slowQueryThreshold) {
      this.slowQueries.push({
        query: this.truncateQuery(query),
        duration,
        timestamp: new Date().toISOString(),
        success,
      });

      // Keep only recent slow queries
      if (this.slowQueries.length > this.maxSlowQueries) {
        this.slowQueries.shift();
      }

      logger.logPerformance(`DB Query: ${this.truncateQuery(query)}`, duration, {
        slow: true,
      });
    }
  }

  // Track page performance (from frontend)
  trackPagePerformance(pageName: string, loadTime: number, metadata?: Record<string, unknown>): void {
    logger.logPerformance(`Page: ${pageName}`, loadTime, {
      type: 'page_load',
      ...metadata,
    });
  }

  // Get API performance stats
  getApiPerformance(): APIPerformance[] {
    const results: APIPerformance[] = [];

    this.apiMetrics.forEach((times, path) => {
      if (times.length === 0) return;

      const sorted = [...times].sort((a, b) => a - b);
      const sum = times.reduce((a, b) => a + b, 0);

      results.push({
        method: 'GET', // Would need to track method separately
        path,
        avgResponseTime: Math.round(sum / times.length),
        p50ResponseTime: this.percentile(sorted, 50),
        p95ResponseTime: this.percentile(sorted, 95),
        p99ResponseTime: this.percentile(sorted, 99),
        totalRequests: times.length,
        errorRate: 0, // Would track errors separately
        lastUpdated: new Date().toISOString(),
      });
    });

    return results;
  }

  // Get database metrics
  getDatabaseMetrics(): DatabaseMetrics {
    const avgQueryTime = this.databaseMetrics.length > 0
      ? Math.round(this.databaseMetrics.reduce((a, b) => a + b, 0) / this.databaseMetrics.length)
      : 0;

    return {
      avgQueryTime,
      slowQueries: this.slowQueries.slice(-10), // Last 10 slow queries
      totalQueries: this.databaseMetrics.length,
      connectionPool: {
        used: 0,
        available: 0,
        waiting: 0,
      },
    };
  }

  // Calculate percentile
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return Math.round(sorted[Math.max(0, index)]);
  }

  // Truncate query for logging
  private truncateQuery(query: string, maxLength = 100): string {
    const trimmed = query.trim().replace(/\s+/g, ' ');
    return trimmed.length > maxLength ? trimmed.substring(0, maxLength) + '...' : trimmed;
  }

  // Periodic cleanup of old metrics
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.apiMetrics.forEach((times) => {
        if (times.length > 500) {
          times.splice(0, times.length - 500);
        }
      });

      if (this.databaseMetrics.length > 500) {
        this.databaseMetrics.splice(0, this.databaseMetrics.length - 500);
      }

      // Keep only last hour of slow queries
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      this.slowQueries = this.slowQueries.filter(
        (q) => new Date(q.timestamp).getTime() > oneHourAgo
      );
    }, 15 * 60 * 1000); // Every 15 minutes
  }

  // Get performance summary
  getPerformanceSummary(): {
    api: { endpoints: number; avgResponseTime: number };
    database: { totalQueries: number; avgQueryTime: number; slowQueries: number };
    memory: { usedMB: number; totalMB: number };
  } {
    const memUsage = process.memoryUsage();
    const apiMetrics = this.getApiPerformance();
    const dbMetrics = this.getDatabaseMetrics();

    return {
      api: {
        endpoints: apiMetrics.length,
        avgResponseTime: apiMetrics.length > 0
          ? Math.round(apiMetrics.reduce((a, b) => a + b.avgResponseTime, 0) / apiMetrics.length)
          : 0,
      },
      database: {
        totalQueries: dbMetrics.totalQueries,
        avgQueryTime: dbMetrics.avgQueryTime,
        slowQueries: dbMetrics.slowQueries.length,
      },
      memory: {
        usedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        totalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
    };
  }

  // Reset metrics (for testing)
  reset(): void {
    this.apiMetrics.clear();
    this.databaseMetrics = [];
    this.slowQueries = [];
  }
}

// Export singleton
export const performanceMonitor = new PerformanceMonitor();

// Middleware for tracking API performance
export function performanceTracker() {
  return (req: { method: string; path: string }, res: { on: (event: string, fn: () => void) => void; statusCode: number }, next: () => void) => {
    const start = Date.now();

    res.on('finish', () => {
      performanceMonitor.trackApiPerformance(
        `${req.method} ${req.path}`,
        Date.now() - start,
        res.statusCode
      );
    });

    next();
  };
}

// Database query wrapper for tracking
export function trackQuery<T>(query: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  
  return fn()
    .then((result) => {
      performanceMonitor.trackDatabasePerformance(query, Date.now() - start, true);
      return result;
    })
    .catch((error) => {
      performanceMonitor.trackDatabasePerformance(query, Date.now() - start, false);
      throw error;
    });
}

export default performanceMonitor;
