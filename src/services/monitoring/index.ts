/**
 * IDENT AFRICA - Monitoring Services
 * Export all monitoring functionality
 */

export { logger, LogLevel, LogCategory, createLogger } from './logger.js';
export { default as healthService } from './health.js';
export { 
  performanceMonitor, 
  performanceTracker, 
  trackQuery,
  type PerformanceMetrics,
  type APIPerformance,
  type DatabaseMetrics,
  type QueryRecord,
} from './performance.js';
export {
  getHealthStatus,
  getSystemStatus,
  getReadinessStatus,
  getLivenessStatus,
  trackRequest,
  type HealthStatus,
  type ComponentHealth,
  type SystemStatus,
  type ServiceStatus,
  type SystemMetrics,
} from './health.js';
